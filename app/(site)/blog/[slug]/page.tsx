import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'

type Props = { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  if (!slug) return notFound()
  const supabase = getSupabaseClient()
  const nowIso = new Date().toISOString()
  const { data: post } = await supabase
    .from('posts')
    .select('id,title,slug,content_mdx,excerpt,status,published_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .maybeSingle()
  if (!post) return notFound()

  return (
    <main className="container mx-auto py-10">
      <article className="prose mx-auto">
        <h1>{post.title}</h1>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: post.content_mdx || '' }} />
      </article>
    </main>
  )
}
