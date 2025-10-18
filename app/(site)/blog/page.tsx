import Link from 'next/link'
import Image from 'next/image'
import { PostCard } from '@/components/posts/PostCard'
import { getSupabaseClient } from '@/lib/supabase'

export default async function BlogIndexPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams
  const q = (sp?.q || '').toLowerCase().trim()
  const supabase = getSupabaseClient()
  const nowIso = new Date().toISOString()
  let query = supabase
    .from('posts')
    .select('id,title,slug,excerpt,status,updated_at,published_at,cover_image_url,cover_image_alt')
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order('published_at', { ascending: false })
    .order('updated_at', { ascending: false })

  if (q) {
    const like = `%${q}%`
    query = query.or(`title.ilike.${like},excerpt.ilike.${like},slug.ilike.${like}`)
  }

  const { data } = await query
  // Ensure we always have an array for rendering, even if Supabase returns null
  const posts = (data ?? []) as Array<{
    id: string | number
    title: string
    slug: string
    excerpt: string | null
    status: string
    updated_at: string
    published_at: string | null
    cover_image_url: string | null
    cover_image_alt: string | null
  }>
  const [featured, ...rest] = posts

  return (
    <main className="container mx-auto py-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold section-title">The Blog</h1>
          <p className="mt-2 text-sm text-muted-foreground">Bits of life, lessons learned, and things that made me smile.</p>
        </div>
        <form className="mt-4 md:mt-0 flex items-center gap-2" action="/blog" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts"
            className="border rounded-xl px-3 py-2 w-60"
          />
          <button className="btn btn-outline px-4 py-2 rounded-xl" type="submit">Search</button>
        </form>
      </div>

      <section className="mt-6">
        <div className="flex items-center gap-2 flex-wrap">
          {['Home Life','Family','Creativity','Travel','Wellness'].map((c) => (
            <span key={c} className="badge"><span className="badge-dot" />{c}</span>
          ))}
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="mt-8 card p-6">
          <p className="text-sm text-muted-foreground">No posts yet{q ? ` for “${q}”` : ''}. If you’re signed in, head to <Link className="link" href="/admin/posts">Admin → Posts</Link> to create one.</p>
        </div>
      ) : (
        <>
          {featured ? (
            <section className="mt-8">
              <div className="card p-6 md:p-8 grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="badge"><span className="badge-dot" /> Featured</div>
                  <h2 className="mt-3 text-2xl section-title">{featured.title}</h2>
                  {featured.excerpt ? <p className="mt-2 text-sm text-muted-foreground">{featured.excerpt}</p> : null}
                  <Link href={`/blog/${featured.slug}`} className="mt-4 inline-flex btn btn-primary px-4 py-2 rounded-xl">Read post</Link>
                </div>
                <div className="aspect-[16/10] w-full overflow-hidden rounded-xl border border-black/10 bg-[rgba(255,240,245,.7)] relative">
                  {featured.cover_image_url ? (
                    <Image
                      src={featured.cover_image_url}
                      alt={featured.cover_image_alt || `${featured.title} cover image`}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section className="mt-8">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p) => (
                  <PostCard
                    key={p.id}
                    title={p.title}
                    slug={p.slug}
                    excerpt={p.excerpt || ''}
                    coverUrl={p.cover_image_url || undefined}
                    coverAlt={p.cover_image_alt || undefined}
                    updatedAt={p.updated_at}
                    status={p.status as any}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </main>
  )
}
