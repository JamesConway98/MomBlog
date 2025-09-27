import Link from 'next/link'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'
import Image from 'next/image'
import { getSupabaseClient } from '@/lib/supabase'
import { PostCard } from '@/components/posts/PostCard'

export default async function HomePage() {
  const supabase = getSupabaseClient()
  const nowIso = new Date().toISOString()
  const { data: latest = [] } = await supabase
    .from('posts')
    .select('id,title,slug,excerpt,status,updated_at,published_at')
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${nowIso}`)
    .order('published_at', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(3)

  return (
    <main>
      <section className="container mx-auto py-16 md:py-24">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight" style={{fontFamily:'var(--font-display)'}}>
              <span className="text-[hsl(var(--primary))]">Hi, I’m Angelise</span>
              <span className="block signature text-3xl md:text-4xl mt-1">welcome to my life.</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Honest stories, small joys, and helpful tips — from home life to
              travel, creativity, and everything in between.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/blog" className="btn btn-primary px-5 py-3 rounded-xl">Read the Blog</Link>
              <Link href="/about" className="btn btn-outline px-5 py-3 rounded-xl">About</Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[3/2] w-full rounded-2xl card overflow-hidden">
              <Image src="/images/home/hero.jpg" alt="" width={1600} height={1200} priority className="h-full w-full object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      <div className="divider container mx-auto" />

      <section className="container mx-auto py-10">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { name: 'Home Life' },
            { name: 'Family' },
            { name: 'Creativity' },
            { name: 'Travel' },
            { name: 'Wellness' }
          ].map((c) => (
            <span key={c.name} className="badge"><span className="badge-dot" />{c.name}</span>
          ))}
        </div>
      </section>

      <section className="container mx-auto pb-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold section-title">Latest Posts</h2>
          <Link href="/blog" className="text-sm link">See all</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.length === 0 ? (
            <div className="col-span-full card p-6 text-sm text-muted-foreground">No posts yet. Once you publish, they’ll appear here.</div>
          ) : (
            latest.map((p) => (
              <PostCard key={p.id} title={p.title} slug={p.slug} excerpt={p.excerpt || ''} updatedAt={p.updated_at} status={p.status as any} />
            ))
          )}
        </div>
      </section>

      <section className="container mx-auto pb-12">
        <blockquote className="card p-8 md:p-10">
          <p className="text-xl md:text-2xl section-title">“Real life is where the beauty is — in the tiny, ordinary moments we carry with us.”</p>
          <footer className="mt-3 text-sm text-muted-foreground">A note I remind myself of often</footer>
        </blockquote>
      </section>

      <NewsletterSignup />

      <section className="container mx-auto pb-20">
        <h2 className="text-2xl font-semibold section-title">On Instagram</h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
          {['/images/home/gallery-01.jpg','/images/home/gallery-02.jpg','/images/home/gallery-03.jpg','/images/home/gallery-04.jpg'].map((src) => (
            <div key={src} className="aspect-square rounded-xl overflow-hidden card-hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
