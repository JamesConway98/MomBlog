import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Props = {
  title: string
  slug: string
  excerpt?: string
  coverUrl?: string
  updatedAt?: string
  status?: string
}

export function PostCard({ title, slug, excerpt, coverUrl, updatedAt, status }: Props) {
  return (
    <article className="card p-5 card-hover">
      <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[rgba(255,240,245,.7)]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
      <h3 className="mt-4 text-lg font-medium">
        <Link href={`/blog/${slug}`} className="hover:underline">{title}</Link>
      </h3>
      {excerpt ? <p className="mt-1 text-sm text-muted-foreground">{excerpt}</p> : null}
      {(updatedAt || status) ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {status ? <span className="mr-2 capitalize">{status}</span> : null}
          {updatedAt ? `Updated ${formatDate(updatedAt)}` : null}
        </p>
      ) : null}
      <Link href={`/blog/${slug}`} className="mt-3 inline-flex text-sm link">Read more →</Link>
    </article>
  )
}
