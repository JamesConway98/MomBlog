import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || ''
  let payload: any = {}
  if (contentType.includes('application/json')) {
    payload = await req.json()
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData()
    payload = Object.fromEntries(form.entries())
  } else if (contentType.includes('multipart/form-data')) {
    const form = await req.formData()
    payload = Object.fromEntries(form.entries())
  }
  // TODO: Send via Resend
  return NextResponse.json({ ok: true, received: payload })
}

