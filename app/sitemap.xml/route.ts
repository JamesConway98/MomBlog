import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Generate from published posts
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}</loc></url>
  <url><loc>${base}/blog</loc></url>
</urlset>`
  return new NextResponse(xml, { headers: { 'content-type': 'application/xml' } })
}

