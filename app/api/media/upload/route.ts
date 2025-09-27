import { NextResponse } from 'next/server'

export async function POST() {
  // TODO: Verify Clerk auth, enforce alt-text, upload to Supabase Storage.
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
}

