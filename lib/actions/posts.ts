"use server"
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { deletePostById, upsertPost, listAllPosts, getPostById } from '@/lib/data/posts'
import { requireAdmin } from '@/lib/auth'

export async function savePost(formData: FormData) {
  await requireAdmin()
  const schema = z.object({
    id: z.string().uuid().optional().or(z.literal('')).transform((v) => (v ? v : undefined)),
    title: z.string().min(1),
    slug: z.string().min(1),
    contentHtml: z.string().optional(),
    excerpt: z.string().optional(),
    status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
    publishedAt: z.string().optional().transform((v) => (v && v.length ? v : undefined)),
    primaryCategoryId: z
      .union([z.literal(''), z.coerce.number().int().positive()])
      .optional()
      .transform((value) => (typeof value === 'number' ? value : null)),
    coverImageUrl: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length ? v : undefined)),
    coverImageAlt: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v && v.length ? v : undefined)),
  })
  .superRefine((data, ctx) => {
    if (data.coverImageUrl && !data.coverImageAlt) {
      ctx.addIssue({
        path: ['coverImageAlt'],
        code: z.ZodIssueCode.custom,
        message: 'Cover image alt text is required when a cover image is set',
      })
    }
  })

  const parsed = schema.parse({
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    contentHtml: formData.get('contentHtml'),
    excerpt: formData.get('excerpt'),
    status: formData.get('status') ?? 'draft',
    publishedAt: formData.get('publishedAt'),
    primaryCategoryId: formData.get('primaryCategoryId') ?? '',
    coverImageUrl: formData.get('coverImageUrl'),
    coverImageAlt: formData.get('coverImageAlt'),
  })

  const coverImageUrl = parsed.coverImageUrl ?? null
  const coverImageAlt = coverImageUrl ? parsed.coverImageAlt ?? null : null
  const primaryCategoryId = parsed.primaryCategoryId ?? null

  let post
  try {
    post = await upsertPost({
      id: parsed.id,
      title: parsed.title,
      slug: parsed.slug,
      contentHtml: parsed.contentHtml,
      excerpt: parsed.excerpt,
      status: parsed.status,
      publishedAt: parsed.publishedAt ?? null,
      coverImageUrl,
      coverImageAlt,
      primaryCategoryId,
    })
  } catch (error: any) {
    console.error('Failed to upsert post', error)
    throw new Error(error?.message || 'Unable to save post')
  }

  // Revalidate admin listing and the public blog
  revalidatePath('/admin/posts')
  revalidatePath('/')
  revalidatePath('/blog')
  revalidatePath(`/blog/${parsed.slug}`)
  // After save, take user to the public post if published; otherwise stay in editor
  if (parsed.status === 'published') {
    redirect(`/blog/${parsed.slug}`)
  } else {
    redirect(`/admin/editor/${post.id}`)
  }
}

export async function deletePost(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) throw new Error('Missing id')
  await deletePostById(id)
  revalidatePath('/admin/posts')
}

// Helper exports for server components
export async function adminListPosts(params?: { q?: string; status?: 'draft' | 'published' | 'scheduled' | 'all' }) {
  return listAllPosts(params)
}

export async function adminGetPost(id: string) {
  return getPostById(id)
}
