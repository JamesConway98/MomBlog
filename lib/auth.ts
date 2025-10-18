import { auth, clerkClient } from '@clerk/nextjs/server'

export const DEFAULT_ADMINS = ['jamesconway272@gmail.com', 'angelisetorresa@gmail.com']

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>
type AdminUser = Awaited<ReturnType<ClerkClient['users']['getUser']>>

function isAllowedAdmin(user: AdminUser) {
  const allowedEmails = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(','))
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  const userEmails = user.emailAddresses?.map((entry) => entry.emailAddress.toLowerCase()) || []
  return userEmails.some((email) => allowedEmails.includes(email))
}

export async function getAuthState(request?: Request) {
  if (request) {
    const { userId } = await auth(request)
    return { userId }
  }
  const { userId } = await auth()
  return { userId }
}

export async function requireAdmin(request?: Request) {
  const { userId } = await getAuthState(request)
  if (!userId) throw new Error('Not authenticated')

  const client = await clerkClient()
  const user = await client.users.getUser(userId)
  console.info('[requireAdmin] verified user', userId)

  if (!isAllowedAdmin(user)) {
    throw new Error('Not authorized')
  }

  return user
}

export async function getAdminContext() {
  const user = await requireAdmin()
  return {
    userId: user.id,
    email: user.emailAddresses?.[0]?.emailAddress ?? '',
    name: user.fullName || user.firstName || user.username || 'Admin',
  }
}
