import { authMiddleware, clerkClient, createRouteMatcher, redirectToSignIn } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { DEFAULT_ADMINS } from '@/lib/auth'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default authMiddleware({
  async afterAuth(auth, req) {
    if (!isAdminRoute(req)) {
      return NextResponse.next()
    }

    if (!auth.userId) {
      if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    try {
      const client = clerkClient()
      const user = await client.users.getUser(auth.userId)
      const allowed = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(','))
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
      const emails = user.emailAddresses?.map((email) => email.emailAddress.toLowerCase()) || []
      const isAllowed = emails.some((email) => allowed.includes(email))

      if (!isAllowed) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
})

export const config = {
  matcher: [
    // Run on all routes so createRouteMatcher can evaluate; static files and _next are excluded.
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}
