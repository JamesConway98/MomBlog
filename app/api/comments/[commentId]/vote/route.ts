import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'

type RouteContext = {
  params: Promise<{ commentId: string }>
}

const voteSchema = z.object({
  voterId: z.string().uuid(),
  vote: z.enum(['up', 'down']),
})

export async function POST(req: Request, context: RouteContext) {
  const { commentId } = await context.params
  const commentIdResult = z.string().uuid().safeParse(commentId)
  if (!commentIdResult.success) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
  }

  const payload = await req.json().catch(() => null)
  const parsed = voteSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid vote payload', issues: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('vote_on_comment', {
    p_comment_id: commentId,
    p_voter_id: parsed.data.voterId,
    p_vote: parsed.data.vote,
  })

  if (error) {
    console.error('Failed to vote on comment', error)
    return NextResponse.json({ error: 'Unable to register vote' }, { status: 500 })
  }

  const result = Array.isArray(data) ? data[0] : data

  if (!result) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
  }

  return NextResponse.json({
    comment: {
      id: result.comment_id,
      upvoteCount: result.upvote_count,
      downvoteCount: result.downvote_count,
      userVote: result.user_vote as 'up' | 'down' | null,
    },
  })
}
