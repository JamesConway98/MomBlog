import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'

const requestSchema = z.object({
  voterId: z.string().uuid(),
  commentIds: z.array(z.string().uuid()).min(1),
})

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('comment_votes')
    .select('comment_id, vote')
    .eq('voter_id', parsed.data.voterId)
    .in('comment_id', parsed.data.commentIds)

  if (error) {
    console.error('Failed to fetch comment votes', error)
    return NextResponse.json({ error: 'Unable to load votes' }, { status: 500 })
  }

  return NextResponse.json({
    votes: (data ?? []).map((row) => ({
      commentId: row.comment_id,
      vote: row.vote as 'up' | 'down',
    })),
  })
}
