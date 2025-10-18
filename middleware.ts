import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server"

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const session = await auth()
    if (!session.userId) {
      return session.redirectToSignIn()
    }
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(session.userId)
      const emails = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
      const allowed = (process.env.ADMIN_EMAILS || 'jamesconway272@gmail.com,angelisetorresa@gmail.com')
        .split(',')
        .map((e) => e.trim().toLowerCase())
      const isAllowed = emails.some((e) => allowed.includes(e))
      if (!isAllowed) {
        return Response.redirect(new URL('/', req.url))
      }
    } catch {}
  }
})

export const config = {
  matcher: [
    // Run on all routes so createRouteMatcher can evaluate; static files and _next are excluded.
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
}
