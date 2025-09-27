import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="container mx-auto h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart size={20} style={{ color: 'hsl(var(--primary))' }} />
          <span className="signature signature-brand">Angelise</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/blog" className="hover:underline">Blog</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/#newsletter" className="hover:underline">Newsletter</Link>
        </nav>
      </div>
    </header>
  )
}
