import { headers } from 'next/headers'
import { auth, currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function AdminDebugPage() {
  const h = await headers()
  const cookieHeader = h.get('cookie') || ''
  const session = await auth()
  const user = await currentUser()
  const claims = (session as any)?.sessionClaims || {}
  const email: string | undefined = (claims as any)?.email || (claims as any)?.primary_email || (claims as any)?.primary_email_address || user?.emailAddresses?.[0]?.emailAddress
  const allowed = (process.env.ADMIN_EMAILS || 'jamesconway272@gmail.com,angelisetorresa@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  const emails = (user?.emailAddresses || []).map((e) => e.emailAddress.toLowerCase())
  const isAllowed = email ? allowed.includes(email.toLowerCase()) : false

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-semibold">Admin Auth Debug</h1>
      <div className="mt-6 card p-4">
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify({
          runtime: 'nodejs',
          cookieHasSession: /__session=/.test(cookieHeader),
          userId: session?.userId || null,
          email,
          emails,
          allowed,
          isAllowed,
          hasUser: !!user,
        }, null, 2)}</pre>
      </div>
    </main>
  )
}

