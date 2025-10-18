import Link from 'next/link'
import { formatDate } from '@/lib/utils'

type Props = {
  title: string
  slug: string
  excerpt?: string
  coverUrl?: string
  coverAlt?: string
  updatedAt?: string
  status?: string
  categoryName?: string
}

export function PostCard({
  title,
  slug,
  excerpt,
  coverUrl,
  coverAlt,
  updatedAt,
  status,
  categoryName
}: Props) {
  return (
    <article className="flex flex-col gap-4 border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-4 sm:flex-row">
        {coverUrl ? (
          <div className="relative sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt={coverAlt || `${title} cover image`}
              className="h-full w-full rounded-xl object-cover"
            />
          </div>
        ) : null}
        <div>
          {categoryName ? (
            <p className="text-[0.6rem] uppercase tracking-[0.32em] text-muted-foreground">
              {categoryName}
            </p>
          ) : null}
          <h3 className="font-serif text-2xl leading-snug headline">
            <Link href={`/blog/${slug}`} className="transition-colors hover:text-[hsl(var(--primary))]">
              {title}
            </Link>
          </h3>
          {excerpt ? (
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          ) : null}
        </div>
      </div>
      {(updatedAt || status) ? (
        <p className="text-[0.68rem] uppercase tracking-[0.38em] text-muted-foreground">
          {status ? <span className="mr-3">{status}</span> : null}
          {updatedAt ? `Updated ${formatDate(updatedAt)}` : null}
        </p>
      ) : null}
    </article>
  )
}
