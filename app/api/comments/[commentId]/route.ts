import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ commentId: string }>
}

const commentIdSchema = z.object({
  commentId: z.string().uuid(),
})

export async function DELETE(_: Request, context: RouteContext) {
  const { commentId } = await context.params
  const parsed = commentIdSchema.safeParse({ commentId })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid comment id' }, { status: 400 })
  }

  try {
    await requireAdmin()
  } catch (error) {
    if ((error as Error).message === 'Not authenticated') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const supabase = getSupabaseClient()
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) {
    console.error('Failed to delete comment', error)
    return NextResponse.json({ error: 'Unable to delete comment' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
