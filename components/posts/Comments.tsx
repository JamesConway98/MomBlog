// Client-side comment list + submission form with voting & moderation
'use client'

import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { FormEvent, useEffect, useMemo, useState } from 'react'

type Comment = {
  id: string
  authorName: string
  content: string
  createdAt: string
  upvoteCount: number
  downvoteCount: number
}

type UserVote = 'up' | 'down' | null

type SortMode = 'top' | 'recent'

type Props = {
  postId: string
  initialComments?: Comment[]
  canModerate?: boolean
}

const linkPattern = /(https?:\/\/|www\.)/i
const voterStorageKey = 'angelise-comment-voter-id'

function formatRelative(dateString: string) {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'just now'
  return formatDistanceToNow(date, { addSuffix: true })
}

function sortComments(comments: Comment[], mode: SortMode) {
  const sorted = [...comments]
  if (mode === 'recent') {
    return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return sorted.sort((a, b) => {
    const scoreA = a.upvoteCount - a.downvoteCount
    const scoreB = b.upvoteCount - b.downvoteCount
    if (scoreA !== scoreB) return scoreB - scoreA
    if (a.upvoteCount !== b.upvoteCount) return b.upvoteCount - a.upvoteCount
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function Comments({ postId, initialComments = [], canModerate = false }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('top')
  const [voterId, setVoterId] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({})

  const sortedComments = useMemo(() => sortComments(comments, sortMode), [comments, sortMode])
  const commentIdsKey = useMemo(
    () => (comments.length ? comments.map((comment) => comment.id).join('|') : ''),
    [comments],
  )

  const count = comments.length
  const commentCountLabel = count === 0 ? 'No comments yet' : count === 1 ? '1 comment' : `${count} comments`

  useEffect(() => {
    if (typeof window === 'undefined') return
    let stored = window.localStorage.getItem(voterStorageKey)
    if (!stored) {
      stored = crypto.randomUUID()
      window.localStorage.setItem(voterStorageKey, stored)
    }
    setVoterId(stored)
  }, [])

  useEffect(() => {
    const ids = commentIdsKey ? commentIdsKey.split('|').filter(Boolean) : []
    if (!voterId || ids.length === 0) return

    const controller = new AbortController()
    ;(async () => {
      try {
        const response = await fetch('/api/comments/votes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voterId,
            commentIds: ids,
          }),
          signal: controller.signal,
        })
        if (!response.ok) return
        const payload = (await response.json()) as {
          votes?: { commentId: string; vote: 'up' | 'down' }[]
        }
        if (!payload.votes) return
        setUserVotes((prev) => {
          const updated: Record<string, UserVote> = { ...prev }
          for (const vote of payload.votes ?? []) {
            updated[vote.commentId] = vote.vote
          }
          return updated
        })
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Failed to load comment votes', fetchError)
        }
      }
    })()

    return () => controller.abort()
  }, [voterId, commentIdsKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(false)
    const trimmedName = name.trim()
    const trimmedContent = content.trim()
    if (!trimmedName || !trimmedContent) {
      setError('Please add your name and a comment before submitting.')
      return
    }
    if (linkPattern.test(trimmedContent)) {
      setError('Links are not allowed in comments. Please share plain text instead.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          name: trimmedName,
          email: email.trim(),
          content: trimmedContent,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.error || 'Something went wrong. Please try again.'
        setError(message)
        return
      }

      const payload = (await response.json()) as {
        comment?: {
          id: string
          author_name: string
          content: string
          created_at: string
          upvote_count: number
          downvote_count: number
        }
      }

      if (!payload.comment) {
        setError('Unexpected response from server.')
        return
      }

      const createdComment = payload.comment

      setComments((prev) => [
        ...prev,
        {
          id: createdComment.id,
          authorName: createdComment.author_name || 'Anonymous',
          content: createdComment.content,
          createdAt: createdComment.created_at || new Date().toISOString(),
          upvoteCount: createdComment.upvote_count ?? 0,
          downvoteCount: createdComment.downvote_count ?? 0,
        },
      ])
      setName('')
      setEmail('')
      setContent('')
      setSuccess(true)
    } catch (submitError) {
      console.error('Failed to submit comment', submitError)
      setError('Unable to save your comment right now. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleVote(commentId: string, vote: 'up' | 'down') {
    setError(null)
    setSuccess(false)

    let currentVoterId = voterId
    if (typeof window !== 'undefined' && !currentVoterId) {
      currentVoterId = crypto.randomUUID()
      window.localStorage.setItem(voterStorageKey, currentVoterId)
      setVoterId(currentVoterId)
    }
    if (!currentVoterId) return

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voterId: currentVoterId, vote }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        const message = payload?.error || 'Unable to register your vote. Please try again.'
        setError(message)
        return
      }

      const payload = (await response.json()) as {
        comment?: {
          id: string
          upvoteCount: number
          downvoteCount: number
          userVote: UserVote
        }
      }

      const updatedComment = payload.comment
      if (!updatedComment) return

      setComments((prev) =>
        prev.map((commentItem) =>
          commentItem.id === commentId
            ? {
                ...commentItem,
                upvoteCount: updatedComment.upvoteCount ?? commentItem.upvoteCount,
                downvoteCount: updatedComment.downvoteCount ?? commentItem.downvoteCount,
              }
            : commentItem,
        ),
      )
      setUserVotes((prev) => ({
        ...prev,
        [commentId]: updatedComment.userVote ?? null,
      }))
    } catch (voteError) {
      console.error('Failed to vote on comment', voteError)
      setError('Unable to register your vote right now. Please try again later.')
    }
  }

  async function handleDelete(commentId: string) {
    setError(null)
    setSuccess(false)

    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Delete this comment?')
      if (!confirmed) return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (response.status === 204) {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId))
        setUserVotes((prev) => {
          const updated = { ...prev }
          delete updated[commentId]
          return updated
        })
        return
      }

      const payload = await response.json().catch(() => null)
      const message = payload?.error || 'Unable to delete comment. Please try again.'
      setError(message)
    } catch (deleteError) {
      console.error('Failed to delete comment', deleteError)
      setError('Unable to delete comment right now. Please try again later.')
    }
  }

  return (
    <section className="mt-16 border-t border-black/10 bg-white">
      <div className="container mx-auto max-w-3xl space-y-10 px-4 py-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="section-title mb-2">Join the Conversation</h2>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-muted-foreground">
              {commentCountLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground">Sort</span>
            <div className="flex overflow-hidden rounded-full border border-black/10 bg-white shadow-sm">
              {(['top', 'recent'] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  className={clsx(
                    'px-4 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] transition-colors',
                    sortMode === mode
                      ? 'bg-black text-white'
                      : 'text-muted-foreground hover:text-black',
                  )}
                >
                  {mode === 'top' ? 'Upvoted' : 'Recent'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form className="card border-black/10 p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="comment-name" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Name<span className="ml-1 text-rose-500">*</span>
              </label>
              <input
                id="comment-name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm leading-tight text-foreground transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                autoComplete="name"
                maxLength={80}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="comment-email" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Email <span className="text-[0.6rem] font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="comment-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm leading-tight text-foreground transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
                autoComplete="email"
                maxLength={120}
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label htmlFor="comment-content" className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Comment<span className="ml-1 text-rose-500">*</span>
            </label>
            <textarea
              id="comment-content"
              name="content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="min-h-[160px] w-full rounded-2xl border border-black/10 px-4 py-3 text-sm leading-relaxed text-foreground transition focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10"
              maxLength={2000}
              required
            />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="btn btn-primary px-10 py-3 text-xs tracking-[0.24em]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending…' : 'Post Comment'}
              </button>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                Kind words build kind community.
              </p>
            </div>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            {success ? (
              <p className="text-sm font-medium text-emerald-600">Thanks! Your comment is now live.</p>
            ) : null}
          </div>
        </form>

        <ul className="space-y-6">
          {sortedComments.map((comment) => {
            const userVote = userVotes[comment.id] ?? null
            return (
              <li key={comment.id} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
                      {formatRelative(comment.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleVote(comment.id, 'up')}
                      className={clsx(
                        'flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] transition-colors',
                        userVote === 'up'
                          ? 'bg-black text-white'
                          : 'text-muted-foreground hover:text-black',
                      )}
                    >
                      ▲ {comment.upvoteCount}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVote(comment.id, 'down')}
                      className={clsx(
                        'flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] transition-colors',
                        userVote === 'down'
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:text-black',
                      )}
                    >
                      ▼ {comment.downvoteCount}
                    </button>
                    {canModerate ? (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose-500 transition hover:text-rose-700"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
              </li>
            )
          })}
          {sortedComments.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-sm text-muted-foreground">
              Be the first to share your thoughts.
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  )
}
