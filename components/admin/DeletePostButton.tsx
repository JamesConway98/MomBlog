"use client"
import { useTransition } from 'react'
import { deletePost } from '@/lib/actions/posts'

export function DeletePostButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <form
      action={(fd) => {
        if (!confirm('Delete this post? This cannot be undone.')) return
        startTransition(() => deletePost(fd))
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-outline px-3 py-1.5 rounded-lg" type="submit" disabled={pending}>
        {pending ? 'Deleting…' : 'Delete'}
      </button>
    </form>
  )
}

