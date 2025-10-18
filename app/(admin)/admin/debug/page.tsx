import { headers } from 'next/headers'
import { getAuthState, requireAdmin, DEFAULT_ADMINS } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export default async function AdminDebugPage() {
  const h = await headers()
  const cookieHeader = h.get('cookie') || ''
  const auth = await getAuthState()
  const user = await requireAdmin()
  const claims = auth.sessionClaims || {}
  const email =
    (claims as any)?.email ||
    (claims as any)?.primary_email ||
    (claims as any)?.primary_email_address ||
    user.emailAddresses?.[0]?.emailAddress
  const allowed = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(','))
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const emails = (user.emailAddresses || []).map((e) => e.emailAddress.toLowerCase())
  const isAllowed = email ? allowed.includes(email.toLowerCase()) : false

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-2xl font-semibold">Admin Auth Debug</h1>
      <div className="mt-6 card p-4">
        <pre className="text-xs whitespace-pre-wrap break-all">{JSON.stringify({
          runtime: 'nodejs',
          cookieHasSession: /__session=/.test(cookieHeader),
          userId: auth.userId || null,
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
