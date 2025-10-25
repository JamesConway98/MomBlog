import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'
import { Comments } from '@/components/posts/Comments'

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

  const canModerate = await isAdmin()

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
      <section className="mt-16 border-t border-black/10">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <p className="eyebrow text-muted-foreground">The Mom Board App</p>
          <h2 className="mt-4 text-3xl font-serif headline leading-tight">
            My calm command center for family life.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            I built the Mom Board app as a gentle home base for keeping routines, rituals, and the tiny triumphs
            that make motherhood feel grounded. If you&apos;re juggling a full plate, it&apos;s the space I
            use to keep everything steady.
          </p>
          <div className="mt-6">
            <Link
              href="https://momboardapp.com"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Explore Mom Board
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
