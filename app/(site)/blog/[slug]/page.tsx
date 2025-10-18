import Image from 'next/image'
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
    .select('id,title,slug,content_mdx,excerpt,status,published_at,cover_image_url,cover_image_alt')
    .eq('slug', slug)
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .maybeSingle()
  if (!post) return notFound()

  return (
    <main className="container mx-auto py-10">
      {post.cover_image_url ? (
        <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-3xl border border-black/10">
          <Image
            src={post.cover_image_url}
            alt={post.cover_image_alt || `${post.title} cover image`}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}
      <article className="prose mx-auto">
        <h1>{post.title}</h1>
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: post.content_mdx || '' }} />
      </article>
    </main>
  )
}
