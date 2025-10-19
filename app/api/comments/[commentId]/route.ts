import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { getSupabaseClient } from '@/lib/supabase'

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

  const { userId } = auth()
  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const supabase = getSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) {
    console.error('Failed to delete comment', error)
    return NextResponse.json({ error: 'Unable to delete comment' }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
