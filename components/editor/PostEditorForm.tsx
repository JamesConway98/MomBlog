"use client"
import { useState } from 'react'
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
}

export function PostEditorForm({ initial }: { initial?: Initial }) {
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || '')
  

  return (
    <form className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6" action={savePost}>
      <input type="hidden" name="id" defaultValue={initial?.id || ''} />
      <section className="md:col-span-2 space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <input
            name="title"
            defaultValue={initial?.title || ''}
            placeholder="Post title"
            className="w-full border rounded-xl px-3 py-2"
            onChange={(e) => {
              const slugEl = document.querySelector<HTMLInputElement>('input[name=slug]')
              if (slugEl && !(initial?.slug && initial.slug.length > 0)) slugEl.value = slugify(e.currentTarget.value)
            }}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Content</label>
          <input type="hidden" name="contentHtml" value={contentHtml} />
          <TipTapEditor contentHtml={contentHtml} onUpdate={setContentHtml} />
        </div>
      </section>
      <aside className="space-y-4">
        <div className="card p-4">
          <div>
            <label className="block text-sm mb-1">Slug</label>
            <input name="slug" defaultValue={initial?.slug || ''} placeholder="auto-from-title" className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Excerpt</label>
            <textarea name="excerpt" defaultValue={initial?.excerpt || ''} rows={3} className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Status</label>
            <select name="status" defaultValue={initial?.status || 'draft'} className="w-full border rounded-xl px-3 py-2">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
          <div className="mt-3">
            <label className="block text-sm mb-1">Publish at (optional)</label>
            <input name="publishedAt" type="datetime-local" defaultValue={initial?.publishedAt || ''} className="w-full border rounded-xl px-3 py-2" />
          </div>
          <div className="mt-4 flex gap-2">
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
