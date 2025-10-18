import { Buffer } from 'node:buffer'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

type Params = { path: string[] }

export async function GET(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params
  const segments = Array.isArray(path) ? path : [path]
  const filePath = segments.join('/')
  if (!filePath || filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage.from('media').download(filePath)
  if (error || !data) {
    const status = error?.message?.includes('No such file or directory') ? 404 : 500
    const message = status === 404 ? 'Not found' : 'Failed to fetch media'
    return NextResponse.json({ error: message }, { status })
  }

  const arrayBuffer = await data.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const headers = new Headers()
  headers.set('Content-Type', data.type || 'application/octet-stream')
  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  headers.set('Content-Length', buffer.byteLength.toString())

  return new NextResponse(buffer, { status: 200, headers })
}
