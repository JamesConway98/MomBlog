import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'

const linkPattern = /(https?:\/\/|www\.)/i

const commentSchema = z.object({
  postId: z.string().uuid(),
  name: z.string().trim().min(1, 'Name is required').max(80, 'Name is too long'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email')
    .max(120, 'Email is too long')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  content: z.string().trim().min(1, 'Comment is required').max(2000, 'Comment is too long'),
})

export async function POST(req: Request) {
  const supabase = getSupabaseClient()
  const payload = await req.json().catch(() => null)
  const result = commentSchema.safeParse(payload)
  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid comment data', issues: result.error.flatten() },
      { status: 400 },
    )
  }

  const { postId, name, email, content } = result.data
  if (linkPattern.test(content)) {
    return NextResponse.json(
      { error: 'Links are not allowed in comments. Please share plain text instead.' },
      { status: 400 },
    )
  }

  const cleanContent = content.replace(/<[^>]*>/g, '')
  const nowIso = new Date().toISOString()
  const { data: post } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .maybeSingle()

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_name: name,
      author_email: email ?? null,
      content: cleanContent,
      status: 'approved',
    })
    .select('id, post_id, author_name, content, created_at, status, upvote_count, downvote_count')
    .single()

  if (error) {
    console.error('Failed to create comment', error)
    return NextResponse.json({ error: 'Unable to save comment' }, { status: 500 })
  }

  return NextResponse.json({ comment }, { status: 201 })
}
