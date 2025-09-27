"use server"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { localStore } from '@/lib/localStore'

export async function saveLocalPost(formData: FormData) {
  const id = (formData.get('id') as string) || undefined
  const title = (formData.get('title') as string)?.trim() || ''
  const slug = (formData.get('slug') as string)?.trim() || ''
  const contentHtml = (formData.get('contentHtml') as string) || ''
  const excerpt = (formData.get('excerpt') as string) || ''
  const status = ((formData.get('status') as string) || 'draft') as any
  const publishedAt = (formData.get('publishedAt') as string) || undefined

  if (!title || !slug) {
    throw new Error('Title and slug are required')
  }

  const post = localStore.upsert({ id, title, slug, contentHtml, excerpt, status, publishedAt })
  revalidatePath('/admin/posts')
  revalidatePath(`/admin/editor/${post.id}`)
  redirect(`/admin/editor/${post.id}`)
}

export async function deleteLocalPost(formData: FormData) {
  const id = formData.get('id') as string
  if (id) localStore.remove(id)
  revalidatePath('/admin/posts')
}
