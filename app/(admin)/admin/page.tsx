import Link from 'next/link'
import { getSupabaseClient } from '@/lib/supabase'

export default async function AdminDashboardPage() {
  const supabase = getSupabaseClient()

  const [
    { count: totalPosts },
    { count: draftCount },
    { count: publishedCount },
    { count: scheduledCount },
    { count: mediaCount },
    latestRes,
  ] = await Promise.all([
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase
      .from('posts')
      .select('id,title,slug,status,updated_at')
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  const latest = latestRes.data || []
  const byStatus: Record<'draft' | 'published' | 'scheduled', number> = {
    draft: draftCount ?? 0,
    published: publishedCount ?? 0,
    scheduled: scheduledCount ?? 0,
  }

  return (
    <main className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Link className="btn btn-primary px-4 py-2 rounded-xl" href="/admin/editor/new">New Post</Link>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-3"><div className="text-xs text-muted-foreground">Total Posts</div><div className="text-lg font-medium">{totalPosts ?? 0}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Draft</div><div className="text-lg font-medium">{byStatus.draft}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Published</div><div className="text-lg font-medium">{byStatus.published}</div></div>
        <div className="card p-3"><div className="text-xs text-muted-foreground">Scheduled</div><div className="text-lg font-medium">{byStatus.scheduled}</div></div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2 card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Latest Posts</h2>
            <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">Manage Posts</Link>
          </div>
          <div className="mt-3 grid gap-2">
            {latest.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
            {latest.map((p) => (
              <div key={p.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
                <div>
                  <div className="font-medium">{p.title || '(Untitled)'} <span className="text-xs text-muted-foreground">/{p.slug}</span></div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span className={`badge ${p.status === 'published' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span>
                    <span>updated {new Date(p.updated_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link className="btn btn-outline px-3 py-1.5 rounded-lg" href={`/admin/editor/${p.id}`}>Edit</Link>
                  {p.status === 'published' && (
                    <a className="text-blue-600 hover:underline text-xs" href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-3">
          <div className="card p-4">
            <div className="text-sm font-medium">Shortcuts</div>
            <div className="mt-3 grid gap-2">
              <Link className="btn btn-outline px-4 py-2 rounded-xl" href="/admin/posts">Manage Posts</Link>
              <Link className="btn btn-outline px-4 py-2 rounded-xl" href="/admin/media">Media Library ({mediaCount ?? 0})</Link>
              <Link className="btn btn-outline px-4 py-2 rounded-xl" href="/admin/settings">Site Settings</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
