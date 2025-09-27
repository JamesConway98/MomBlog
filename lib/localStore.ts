export type LocalPost = {
  id: string
  title: string
  slug: string
  contentHtml: string
  excerpt?: string
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

const posts = new Map<string, LocalPost>()

export const localStore = {
  list(): LocalPost[] {
    return Array.from(posts.values()).sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
  },
  get(id: string): LocalPost | undefined {
    return posts.get(id)
  },
  getBySlug(slug: string): LocalPost | undefined {
    return Array.from(posts.values()).find((p) => p.slug === slug)
  },
  upsert(input: Partial<LocalPost> & { title: string; slug: string; contentHtml: string; id?: string }): LocalPost {
    const now = new Date().toISOString()
    const id = input.id ?? randomUUID()
    const existing = posts.get(id)
    const post: LocalPost = {
      id,
      title: input.title,
      slug: input.slug,
      contentHtml: input.contentHtml,
      excerpt: input.excerpt ?? existing?.excerpt ?? '',
      status: (input.status as any) ?? existing?.status ?? 'draft',
      publishedAt: input.publishedAt ?? existing?.publishedAt,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    posts.set(id, post)
    return post
  },
  remove(id: string): boolean {
    return posts.delete(id)
  },
}
import { randomUUID } from 'node:crypto'
