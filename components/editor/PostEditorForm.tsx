"use client"
import { useRef, useState, type ChangeEvent } from 'react'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { slugify } from '@/lib/utils'
import { savePost } from '@/lib/actions/posts'
import { useFormStatus } from 'react-dom'

type Initial = {
  id?: string
  title?: string
  slug?: string
  contentHtml?: string
  excerpt?: string
  status?: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  coverImageUrl?: string
  coverImageAlt?: string
}

export function PostEditorForm({ initial }: { initial?: Initial }) {
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || '')
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl || '')
  const [coverImageAlt, setCoverImageAlt] = useState(initial?.coverImageAlt || '')
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)

  const openCoverPicker = () => {
    coverInputRef.current?.click()
  }

  const handleCoverFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    let alt = coverImageAlt.trim()
    if (!alt.length) {
      alt = window.prompt('Describe the cover image (alt text):', coverImageAlt)?.trim() ?? ''
      if (!alt.length) {
        window.alert('Cover image upload canceled: alt text is required.')
        event.target.value = ''
        return
      }
    }

    setCoverImageAlt(alt)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('altText', alt)

    setCoverUploading(true)
    setCoverError(null)
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to upload cover image')
      }

      const nextUrl = data?.url || data?.signedUrl
      if (!nextUrl) {
        throw new Error('Upload succeeded but no URL was returned')
      }

      setCoverImageUrl(nextUrl)
    } catch (error: any) {
      setCoverError(error?.message || 'Failed to upload cover image')
    } finally {
      setCoverUploading(false)
      event.target.value = ''
    }
  }

  const handleRemoveCover = () => {
    setCoverImageUrl('')
    setCoverError(null)
  }

  return (
    <form className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr] items-start" action={savePost}>
      <input type="hidden" name="id" defaultValue={initial?.id || ''} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      <section className="space-y-6">
        <div className="card p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Compose</p>
            <label className="block text-sm font-semibold">Title</label>
            <input
              name="title"
              defaultValue={initial?.title || ''}
              placeholder="Give your post a memorable title"
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              onChange={(e) => {
                const slugEl = document.querySelector<HTMLInputElement>('input[name=slug]')
                if (slugEl && !(initial?.slug && initial.slug.length > 0)) slugEl.value = slugify(e.currentTarget.value)
              }}
            />
            <p className="text-xs text-muted-foreground">Titles appear on the homepage, in RSS feeds, and search results.</p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Content</label>
            <p className="text-xs text-muted-foreground">Write your story, embed images, and format with the toolbar.</p>
            <input type="hidden" name="contentHtml" value={contentHtml} />
            <TipTapEditor contentHtml={contentHtml} onUpdate={setContentHtml} />
          </div>
        </div>
      </section>
      <aside className="space-y-4">
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cover image</p>
            {coverImageUrl ? (
              <button
                type="button"
                className="text-xs text-red-600 hover:underline"
                onClick={handleRemoveCover}
              >
                Remove
              </button>
            ) : null}
          </div>
          {coverImageUrl ? (
            <div className="overflow-hidden rounded-xl border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt={coverImageAlt || 'Cover image preview'} className="h-48 w-full object-cover" />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-black/20 bg-black/5 p-4 text-xs text-muted-foreground">
              Upload a lead image that appears at the top of your post and in listing cards.
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline px-4 py-2 rounded-xl"
              onClick={openCoverPicker}
              disabled={coverUploading}
            >
              {coverUploading ? 'Uploading…' : coverImageUrl ? 'Replace image' : 'Upload cover'}
            </button>
          </div>
          <div>
            <label className="block text-sm mb-1">Alt text</label>
            <input
              name="coverImageAlt"
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              placeholder="Describe the cover image"
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
              required={Boolean(coverImageUrl)}
            />
            <p className="mt-1 text-xs text-muted-foreground">Keep it descriptive for accessibility and SEO.</p>
          </div>
          {coverError ? <p className="text-xs text-red-600">{coverError}</p> : null}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/svg+xml"
            className="hidden"
            onChange={handleCoverFileChange}
          />
        </div>
        <div className="card p-4 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Details</p>
            <p className="mt-1 text-sm text-muted-foreground">Slug, excerpt, and status control how your post appears around the site.</p>
          </div>
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input
              name="slug"
              defaultValue={initial?.slug || ''}
              placeholder="auto-from-title"
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lowercase, hyphenated — e.g. <code className="bg-black/5 px-1 rounded">spring-morning-rituals</code>.
            </p>
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Excerpt</label>
            <textarea
              name="excerpt"
              defaultValue={initial?.excerpt || ''}
              rows={3}
              placeholder="One or two sentences to entice the reader."
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Status</label>
            <select
              name="status"
              defaultValue={initial?.status || 'draft'}
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">Drafts stay private. Published posts go live immediately.</p>
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Publish at (optional)</label>
            <input
              name="publishedAt"
              type="datetime-local"
              defaultValue={initial?.publishedAt || ''}
              className="w-full border rounded-xl px-3 py-2 focus:border-black/60 focus:outline-none focus:ring-2 focus:ring-black/10 transition"
            />
            <p className="mt-1 text-xs text-muted-foreground">Schedule future posts or leave blank to publish right away.</p>
          </div>
          <div className="pt-2 border-t border-black/10 flex gap-2">
            <SubmitButton />
            <a className="btn btn-outline px-4 py-2 rounded-xl" href="/admin/posts">Back</a>
          </div>
        </div>
      </aside>
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button className="btn btn-primary px-4 py-2 rounded-xl" type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save'}
    </button>
  )
}
