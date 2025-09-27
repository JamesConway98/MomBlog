# Angelise Blog

A modern, fast, and easy-to-manage personal blog built with Next.js (App Router), Tailwind, Supabase, and Clerk. This repo currently provides the scaffold, routes, and placeholders to wire up your integrations.

## Stack
- Next.js (App Router)
- Tailwind CSS + shadcn/ui components (placeholder)
- Supabase (Postgres + Storage)
- Clerk auth
- Resend email
- TipTap editor (placeholder)
- Vercel deployment + Analytics

## Getting Started
1. Install deps: `pnpm i` or `npm i`
2. Set env vars in `.env.local`:
   - `NEXT_PUBLIC_SITE_URL=`
   - `NEXT_PUBLIC_SUPABASE_URL=`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=`
   - `SUPABASE_SERVICE_ROLE_KEY=` (server-only)
   - `CLERK_SECRET_KEY=`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`
   - `RESEND_API_KEY=`
3. Run dev server: `pnpm dev` or `npm run dev`

## Notes
- API and editor implementations are stubbed. Wire up Supabase, Clerk, and Resend in `lib/` and `app/api/*`.
- `supabase/schema.sql` contains the database schema from the spec with RLS enabled (policies pending).
- `app/api/og` generates dynamic OG images using `@vercel/og`.
- `app/sitemap.xml` and `app/rss.xml` are placeholders for dynamic generation.

## Directory Overview
- `app/(site)/*` public pages
- `app/(admin)/admin/*` admin dashboard and editor scaffolds
- `app/api/*` API routes (CRUD posts, media upload, contact, newsletter, OG)
- `components/*` shared UI, layout, posts, auth, editor
- `lib/*` Supabase client, utilities, and server actions
- `middleware.ts` protects `/admin` using Clerk
