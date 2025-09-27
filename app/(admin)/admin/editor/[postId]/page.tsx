import { adminGetPost } from '@/lib/actions/posts'
import { PostEditorForm } from '@/components/editor/PostEditorForm'

type Props = { params: Promise<{ postId: string }> }

export default async function AdminEditorPage({ params }: Props) {
  const { postId } = await params
  const isNew = postId === 'new'
  const post = isNew ? undefined : await adminGetPost(postId)

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-semibold">{isNew ? 'New Post' : 'Edit Post'}</h1>
      <PostEditorForm initial={post ? {
        id: post.id,
        title: post.title,
        slug: post.slug,
        contentHtml: post.content_mdx || undefined,
        excerpt: post.excerpt || undefined,
        status: post.status,
        publishedAt: post.published_at || undefined,
      } : undefined} />
    </main>
  )
}
