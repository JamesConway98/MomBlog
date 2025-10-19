import Image from 'next/image'
import { notFound } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseClient } from '@/lib/supabase'
import { Comments } from '@/components/posts/Comments'

type Props = { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  if (!slug) return notFound()

  const { userId } = auth()
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

  let canModerate = false
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    canModerate = profile?.role === 'admin'
  }

  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('id,author_name,content,created_at,status,upvote_count,downvote_count')
    .eq('post_id', post.id)
    .eq('status', 'approved')
    .order('upvote_count', { ascending: false })
    .order('created_at', { ascending: true })

  if (commentsError) {
    console.error('Failed to load comments', commentsError)
  }

  const comments = commentsData ?? []

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
      <Comments
        postId={post.id}
        initialComments={comments.map((comment) => ({
          id: comment.id,
          authorName: comment.author_name,
          content: comment.content,
          createdAt: comment.created_at,
          upvoteCount: comment.upvote_count ?? 0,
          downvoteCount: comment.downvote_count ?? 0,
        }))}
        canModerate={canModerate}
      />
    </main>
  )
}
