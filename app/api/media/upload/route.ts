import { Buffer } from 'node:buffer'
import { randomUUID } from 'crypto'
import { extname } from 'path'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
])

const altSchema = z
  .string()
  .trim()
  .min(1, 'Alt text is required')
  .max(300, 'Alt text must be 300 characters or fewer')

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
}

function getExtension(fileName: string, mimeType: string) {
  const fromName = extname(fileName || '').toLowerCase()
  if (fromName) return fromName
  return MIME_EXTENSION_MAP[mimeType] || ''
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req)
  } catch (error) {
    console.error('[media/upload] unauthorized', error)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const altValue = formData.get('altText') ?? formData.get('alt')
  const altParse = altSchema.safeParse(typeof altValue === 'string' ? altValue : '')
  if (!altParse.success) {
    return NextResponse.json({ error: altParse.error.issues[0]?.message ?? 'Alt text is required' }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file upload' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const ext = getExtension(file.name, file.type)
  const filename = `${randomUUID()}${ext || ''}`
  const folder = new Date().toISOString().slice(0, 10)
  const storagePath = `${folder}/${filename}`

  const { error: uploadError } = await supabase.storage.from('media').upload(storagePath, buffer, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || 'Failed to upload file' }, { status: 500 })
  }

  const metadata = {
    file_path: storagePath,
    file_name: sanitizeFileName(file.name || filename),
    alt_text: altParse.data,
    uploader_id: null,
  }

  const { data: row, error: insertError } = await supabase
    .from('media')
    .insert(metadata)
    .select('*')
    .single()

  if (insertError) {
    await supabase.storage.from('media').remove([storagePath]).catch(() => {})
    return NextResponse.json({ error: insertError.message || 'Failed to save metadata' }, { status: 500 })
  }

  const { data: signed } = await supabase.storage.from('media').createSignedUrl(storagePath, 60 * 60 * 24)
  const previewUrl = `/api/media/${storagePath}`

  return NextResponse.json(
    {
      id: row.id,
      path: row.file_path,
      filename: row.file_name,
      altText: row.alt_text,
      mimeType: file.type,
      size: file.size,
      url: previewUrl,
      signedUrl: signed?.signedUrl ?? null,
      expiresIn: 60 * 60 * 24,
    },
    { status: 201 }
  )
}
