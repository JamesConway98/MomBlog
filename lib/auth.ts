import { currentUser } from '@clerk/nextjs/server'

const DEFAULT_ADMINS = [
  'jamesconway272@gmail.com',
  'angelisetorresa@gmail.com',
]

export async function requireAdmin() {
  const user = await currentUser()
  if (!user) throw new Error('Not authenticated')
  const allowed = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(',')).split(',').map((e) => e.trim().toLowerCase())
  const emails = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
  const isAdmin = emails.some((e) => allowed.includes(e))
  if (!isAdmin) throw new Error('Not authorized')
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

