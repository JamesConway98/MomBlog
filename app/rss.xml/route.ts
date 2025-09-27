import { NextResponse } from 'next/server'

export async function GET() {
  // TODO: Build RSS from published posts
  const rss = `<?xml version="1.0"?><rss version="2.0"><channel><title>Angelise Mom Life</title></channel></rss>`
  return new NextResponse(rss, { headers: { 'content-type': 'application/xml' } })
}

