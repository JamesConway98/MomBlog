import { getSupabaseClient } from '@/lib/supabase'

export type DbPost = {
  id: string
  author_id: string | null
  title: string
  slug: string
  content_mdx: string | null
  excerpt: string | null
  cover_image_url: string | null
  cover_image_alt: string | null
  status: 'draft' | 'published' | 'scheduled'
  published_at: string | null
  created_at: string
  updated_at: string
  canonical_url: string | null
}

export async function listAllPosts(params?: { q?: string; status?: DbPost['status'] | 'all' }): Promise<DbPost[]> {
  const supabase = getSupabaseClient()
  let query = supabase.from('posts').select('*').order('updated_at', { ascending: false })
  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params?.q && params.q.trim().length > 0) {
    const q = `%${params.q.trim()}%`
    query = query.or(`title.ilike.${q},slug.ilike.${q},excerpt.ilike.${q}`)
  }
  const { data, error } = await query
  if (error) throw error
  return data as DbPost[]
}

export async function getPostById(id: string): Promise<DbPost | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return (data as DbPost) || null
}

export async function upsertPost(input: {
  id?: string
  title: string
  slug: string
  contentHtml?: string
  excerpt?: string
  status?: 'draft' | 'published' | 'scheduled'
  publishedAt?: string | null
  canonicalUrl?: string | null
  coverImageUrl?: string | null
  coverImageAlt?: string | null
}): Promise<DbPost> {
  const supabase = getSupabaseClient()

  const row = {
    id: input.id,
    // author_id is nullable because we’re using Clerk; RLS handled in app code
    author_id: null as string | null,
    title: input.title,
    slug: input.slug,
    content_mdx: input.contentHtml ?? null,
    excerpt: input.excerpt ?? null,
    cover_image_url: input.coverImageUrl ?? null,
    cover_image_alt: input.coverImageAlt ?? null,
    status: (input.status ?? 'draft') as DbPost['status'],
    published_at: input.publishedAt ? new Date(input.publishedAt).toISOString() : null,
    canonical_url: input.canonicalUrl ?? null,
  }

  const { data, error } = await supabase
    .from('posts')
    .upsert(row, { onConflict: 'id' })
    .select('*')
    .single()
  if (error) throw error
  return data as DbPost
}

export async function deletePostById(id: string): Promise<void> {
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}
