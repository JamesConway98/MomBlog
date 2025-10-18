import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Libre_Baskerville, Source_Sans_3 } from 'next/font/google'

const display = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-display'
})

const sans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-sans'
})

export const metadata: Metadata = {
  title: {
    default: 'Angelise — Blog',
    template: '%s · Angelise'
  },
  description: 'Stories, tips, and reflections from everyday life.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-screen antialiased bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <Header />
        <div>{children}</div>
        <Footer />
      </body>
    </html>
  )
}
