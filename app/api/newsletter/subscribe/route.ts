import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: '' }))
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  // TODO: Add to newsletter provider or DB
  return NextResponse.json({ ok: true })
}

