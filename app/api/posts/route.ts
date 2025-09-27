import { NextResponse } from 'next/server'

// Placeholder CRUD: wire to Supabase later.
export async function GET() {
  return NextResponse.json({ posts: [] })
}

export async function POST(req: Request) {
  const data = await req.json().catch(() => null)
  return NextResponse.json({ ok: true, data }, { status: 201 })
}

