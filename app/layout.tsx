import './globals.css'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Playfair_Display, Inter, Dancing_Script } from 'next/font/google'

const display = Playfair_Display({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-display' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans' })
const script = Dancing_Script({ subsets: ['latin'], weight: ['400','700'], variable: '--font-script' })

export const metadata: Metadata = {
  title: {
    default: 'Angelise — Blog',
    template: '%s · Angelise'
  },
  description: 'Stories, tips, and reflections from everyday life.'
}

 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable}`}>
      <body className="min-h-screen antialiased">
        <Header />
        <div className="bg-[linear-gradient(to_bottom,rgba(255,240,245,.6),rgba(255,255,255,1))]">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
