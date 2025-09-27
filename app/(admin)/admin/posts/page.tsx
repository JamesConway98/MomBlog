import Link from 'next/link'
import { adminListPosts } from '@/lib/actions/posts'
import { DeletePostButton } from '@/components/admin/DeletePostButton'

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const sp = await searchParams
  const q = sp?.q || ''
  const status = (sp?.status as any) || 'all'
  const posts = await adminListPosts({ q, status })
  const counts = posts.reduce(
    (acc, p) => {
      acc.total += 1
      acc[p.status] += 1
      return acc
    },
    { total: 0, draft: 0, published: 0, scheduled: 0 } as any
  )
  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link className="btn btn-primary px-4 py-2 rounded-xl" href="/admin/editor/new">New Post</Link>
      </div>
      <form className="mt-6 flex flex-col md:flex-row gap-3 md:items-end">
        <div>
          <label className="block text-sm mb-1">Search</label>
          <input name="q" defaultValue={q} placeholder="title or slug" className="border rounded-xl px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select name="status" defaultValue={status} className="border rounded-xl px-3 py-2">
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
        </div>
        <div>
          <button className="btn btn-outline px-4 py-2 rounded-xl" type="submit">Filter</button>
        </div>
      </form>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3"><div className="text-xs text-muted-foreground">Total</div><div className="text-lg font-medium">{counts.total}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Draft</div><div className="text-lg font-medium">{counts.draft}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Published</div><div className="text-lg font-medium">{counts.published}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Scheduled</div><div className="text-lg font-medium">{counts.scheduled}</div></div>
      </div>

      <div className="mt-6 grid gap-3">
        {posts.length === 0 && (
          <p className="text-sm text-muted-foreground">No posts yet. Create your first one.</p>
        )}
        {posts.map((p) => (
          <div key={p.id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title || '(Untitled)'} <span className="text-xs text-muted-foreground">/{p.slug}</span></div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span className={`badge ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                <span>updated {new Date(p.updated_at).toLocaleString()}</span>
                {p.status === 'published' && (
                  <a className="text-blue-600 hover:underline text-xs" href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link className="btn btn-outline px-3 py-1.5 rounded-lg" href={`/admin/editor/${p.id}`}>Edit</Link>
              <DeletePostButton id={p.id} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
