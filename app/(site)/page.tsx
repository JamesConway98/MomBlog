import Link from 'next/link'
import Image from 'next/image'
import { NewsletterSignup } from '@/components/home/NewsletterSignup'
import { getSupabaseClient } from '@/lib/supabase'
import { PostCard } from '@/components/posts/PostCard'
import { SECTION_CATEGORIES } from '@/lib/constants/categories'

const categoryHref = (name: string) => `/blog?category=${encodeURIComponent(name)}`

type CategoryRecord = {
  id: number
  name: string
}

export default async function HomePage() {
  const supabase = getSupabaseClient()
  const nowIso = new Date().toISOString()

  const [postsResponse, categoriesResponse] = await Promise.all([
    supabase
      .from('posts')
      .select(
        'id,title,slug,excerpt,status,updated_at,published_at,primary_category_id,cover_image_url,cover_image_alt'
      )
      .eq('status', 'published')
      .or(`published_at.is.null,published_at.lte.${nowIso}`)
      .order('published_at', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(24),
    supabase
      .from('categories')
      .select('id,name')
      .in('name', Array.from(SECTION_CATEGORIES))
  ])

  const latest = (postsResponse.data ?? []) as Array<{
    id: string | number
    title: string
    slug: string
    excerpt: string | null
    status: string
    updated_at: string
    published_at: string | null
    primary_category_id: number | null
    cover_image_url: string | null
    cover_image_alt: string | null
  }>

  type Post = (typeof latest)[number]

  const categoriesRaw = (categoriesResponse.data ?? []) as CategoryRecord[]
  const categoriesById = new Map<number, CategoryRecord>()
  const categoriesByName = new Map<string, CategoryRecord>()
  categoriesRaw.forEach((record) => {
    categoriesById.set(record.id, record)
    categoriesByName.set(record.name, record)
  })

  const postsByCategory = new Map<number, Post[]>()
  latest.forEach((post) => {
    if (!post.primary_category_id) return
    const list = postsByCategory.get(post.primary_category_id) ?? []
    list.push(post)
    postsByCategory.set(post.primary_category_id, list)
  })

  const orderedCategories = Array.from(SECTION_CATEGORIES).map((label) => {
    const record = categoriesByName.get(label)
    const posts = record ? postsByCategory.get(record.id) ?? [] : []
    return { label, record, posts }
  })

  const categoriesToShow = orderedCategories.filter(
    ({ record, posts }) => Boolean(record) && posts.length > 0
  )

  const [featurePost, ...restPosts] = latest
  const supportingPosts = restPosts.slice(0, 4)
  const showcasePosts = restPosts.slice(0, 6)
  const sidebarPosts: Post[] =
    supportingPosts.length > 0 ? supportingPosts : featurePost ? [] : latest
  const editorsPicks: Post[] =
    showcasePosts.length > 0 ? showcasePosts : restPosts.length > 0 ? restPosts : latest

  const featureCategory =
    featurePost?.primary_category_id != null
      ? categoriesById.get(featurePost.primary_category_id)
      : undefined

  const heroImageSrc = featurePost?.cover_image_url ?? '/images/home/hero.jpg'
  const heroImageAlt = featurePost?.cover_image_alt ?? ''

  return (
    <main>
      <section className="border-b border-black/10 bg-white">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[3fr,2fr] lg:items-start">
            <div>
              <p className="eyebrow">{featureCategory ? featureCategory.name : 'Featured'}</p>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-serif headline">
                {featurePost ? (
                  <Link
                    href={`/blog/${featurePost.slug}`}
                    className="transition-colors hover:text-[hsl(var(--primary))]"
                  >
                    {featurePost.title}
                  </Link>
                ) : (
                  'Inside the Angelise Journal'
                )}
              </h1>
              <p className="mt-6 lede">
                {featurePost?.excerpt ??
                  'Dispatches on creativity, family life, ritual, and the small rebellions that keep us curious.'}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 text-[0.7rem] uppercase tracking-[0.4em] font-semibold">
                <Link
                  href={featurePost ? `/blog/${featurePost.slug}` : '/blog'}
                  className="flex items-center gap-2 text-black transition-colors hover:text-[hsl(var(--primary))]"
                >
                  Read Feature
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-black"
                >
                  Browse Archive
                </Link>
              </div>
            </div>
            <div className="space-y-8 border-t border-black/10 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="eyebrow">Latest Dispatches</p>
              <div className="space-y-6">
                {sidebarPosts.map((post) => {
                  const category =
                    post.primary_category_id != null
                      ? categoriesById.get(post.primary_category_id)
                      : undefined

                  return (
                    <article key={post.id} className="space-y-2">
                      {category ? (
                        <Link
                          href={categoryHref(category.name)}
                          className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground transition-colors hover:text-black"
                        >
                          {category.name}
                        </Link>
                      ) : null}
                      <h3 className="font-serif text-xl leading-snug">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="transition-colors hover:text-[hsl(var(--primary))]"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {post.excerpt ? (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </article>
                  )
                })}
                {sidebarPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Fresh stories will appear here once you publish your first post.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-14 aspect-[10/7] w-full bg-black/5">
            <Image
              src={heroImageSrc}
              alt={heroImageAlt}
              width={1600}
              height={1120}
              priority
              className="h-full w-full object-cover object-center mix-blend-multiply"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            {categoriesToShow.map(({ label, record, posts }) => {
              if (!record) return null
              const topPost = posts[0]
              if (!topPost) return null

              return (
                <div key={label} className="flex flex-col gap-4 border-t border-black/10 pt-6">
                  <Link
                    href={categoryHref(label)}
                    className="text-[0.68rem] uppercase tracking-[0.38em] text-black transition-colors hover:text-[hsl(var(--primary))]"
                  >
                    {label}
                  </Link>
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl leading-snug">
                      <Link
                        href={`/blog/${topPost.slug}`}
                        className="transition-colors hover:text-[hsl(var(--primary))]"
                      >
                        {topPost.title}
                      </Link>
                    </h3>
                    {topPost.excerpt ? (
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {topPost.excerpt}
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif headline">Editor&apos;s Picks</h2>
            <Link
              href="/blog"
              className="text-xs uppercase tracking-[0.4em] text-muted-foreground transition-colors hover:text-black"
            >
              View All
            </Link>
          </div>
          <div className="mt-10 space-y-10">
            {editorsPicks.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt || ''}
                coverUrl={post.cover_image_url || undefined}
                coverAlt={post.cover_image_alt || undefined}
                updatedAt={post.updated_at}
                status={post.status as any}
                categoryName={
                  post.primary_category_id != null
                    ? categoriesById.get(post.primary_category_id)?.name
                    : undefined
                }
              />
            ))}
            {editorsPicks.length === 0 ? (
              <div className="border-t border-black/10 pt-6 text-sm text-muted-foreground">
                Once posts are published, they will populate this section automatically.
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-[2fr,3fr] md:items-center">
            <div>
              <p className="eyebrow">Notebook</p>
              <h2 className="mt-4 text-3xl font-serif headline">Scenes From the Week</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Glimpses of what&apos;s inspiring Angelise right now—snapshots from the kitchen, the studio,
                and the road.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {['/images/home/gallery-01.jpg', '/images/home/gallery-02.jpg', '/images/home/gallery-03.jpg', '/images/home/gallery-04.jpg'].map((src) => (
                <div key={src} className="overflow-hidden border border-black/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover grayscale transition hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup />
    </main>
  )
}
