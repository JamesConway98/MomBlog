import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container mx-auto px-4">
        <div className="flex h-[5.5rem] items-center justify-between">
          <Link href="/" className="masthead">
            Angelise
          </Link>
          <nav className="flex items-center gap-8 text-[0.68rem] font-semibold uppercase tracking-[0.38em]">
            <Link href="/blog" className="transition-colors hover:text-[hsl(var(--primary))]">
              Latest
            </Link>
            <Link href="/about" className="transition-colors hover:text-[hsl(var(--primary))]">
              About
            </Link>
            <Link href="/contact" className="transition-colors hover:text-[hsl(var(--primary))]">
              Contact
            </Link>
            <Link href="/#newsletter" className="transition-colors hover:text-[hsl(var(--primary))]">
              Newsletter
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
