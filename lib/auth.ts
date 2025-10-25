import { auth, clerkClient, getAuth } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'

export const DEFAULT_ADMINS = ['jamesconway272@gmail.com', 'angelisetorresa@gmail.com']

type ClerkClient = Awaited<ReturnType<typeof clerkClient>>
type AdminUser = Awaited<ReturnType<ClerkClient['users']['getUser']>>
type AuthState = Awaited<ReturnType<typeof getAuth>>

function isAllowedAdmin(user: AdminUser) {
  const allowedEmails = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(','))
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  const userEmails = user.emailAddresses?.map((entry) => entry.emailAddress.toLowerCase()) || []
  return userEmails.some((email) => allowedEmails.includes(email))
}

async function getClerkUser(userId: string) {
  const client = await clerkClient()
  return client.users.getUser(userId)
}

export async function getAuthState(request?: NextRequest): Promise<AuthState> {
  if (request) {
    return await getAuth(request)
  }
  const { protect, redirectToSignIn, ...authState } = await auth()
  return authState
}

export async function isAdmin(request?: NextRequest) {
  const { userId } = await getAuthState(request)
  if (!userId) return false

  const user = await getClerkUser(userId)
  return isAllowedAdmin(user)
}

export async function requireAdmin(request?: NextRequest) {
  const { userId } = await getAuthState(request)
  if (!userId) throw new Error('Not authenticated')

  const user = await getClerkUser(userId)
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
