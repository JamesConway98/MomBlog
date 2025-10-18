import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { clerkClient, getAuth } from '@clerk/nextjs/server'

export const DEFAULT_ADMINS = ['jamesconway272@gmail.com', 'angelisetorresa@gmail.com']

export async function getAuthState() {
  const headerList = await headers()
  const request = new NextRequest('https://placeholder.com', { headers: headerList })
  return getAuth(request)
}

export async function requireAdmin() {
  const auth = await getAuthState()
  if (!auth.userId) throw new Error('Not authenticated')

  const client = clerkClient()
  const user = await client.users.getUser(auth.userId)
  const allowed = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(','))
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  const emails = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
  const isAdmin = emails.some((email) => allowed.includes(email))
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
