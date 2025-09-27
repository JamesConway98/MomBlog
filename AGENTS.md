# AGENTS.md — Guidance for AI Agents Working in This Repo

This document orients agents (and humans) to the project and how to work within it safely and consistently.

## Project Overview
- Name: Angelise Blog
- Purpose: A modern personal blog with a warm, friendly design. Features public pages, a protected admin area, rich-text editing, media upload, and SEO/feeds.
- Status: App scaffold + styling done. Admin + DB wiring not fully implemented yet (see Roadmap).

## Tech Stack
- Framework: Next.js 15 (App Router)
- Runtime: React 19
- Styling: Tailwind CSS; custom utility classes in `app/globals.css`
- Auth: Clerk
- Database: Supabase (Postgres) with Storage for media
- Email: Resend (contact form)
- Editor: TipTap (planned; placeholder exists)
- Deploy: Vercel (planned)

## Versions (keep in sync)
- Next.js: 15.x (package currently resolves to 15.5.x)
- React/React DOM: 19.1.x
- TypeScript: 5.6+

## Local Development
1. Install deps: `npm i`
2. Env: copy `.env.example` → `.env.local` and fill at least:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
   - Optional now: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`
3. Run dev: `npm run dev` (Next auto-selects a free port; default 3000)

## Env Vars
- Site: `NEXT_PUBLIC_SITE_URL`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Clerk: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- Resend: `RESEND_API_KEY`

## Directory Structure (high-level)
- `app/`
  - `(site)/` public routes: home, about, blog, tags, contact
  - `(admin)/admin/*` protected admin routes (Clerk)
  - `api/*` routes: posts, media upload, contact, newsletter, og, rss, sitemap
  - `layout.tsx` global layout, fonts, Header/Footer
- `components/` shared UI (layout, posts, auth, editor)
- `lib/` utils, Supabase client, server actions (stubs)
- `public/` static assets (robots.txt, images)
- `supabase/schema.sql` DB schema (RLS enabled; policies TBD)
- `middleware.ts` Clerk protection for `/admin/*`

## Current Implementation Notes
- Design: Warm/personal theme, Playfair Display + Inter + Dancing Script. Global utilities in `app/globals.css` (e.g., `.card`, `.btn`, `.badge`, `.section-title`).
- Images:
  - Static assets: place under `public/images/...` and reference with `/images/...`.
  - Remote images: Supabase Storage is allowed via `next.config.mjs` `images.remotePatterns`.
- Header/Footer: in `components/layout/` with a “Newsletter” anchor link.
- Home Page: Hero, Topics badges, Latest Posts (placeholder cards), Quote block, Newsletter signup, Instagram grid using local images.
- Admin: routes scaffolded; TipTap/editor & CRUD not wired yet.

## Database Schema
- See `supabase/schema.sql` for tables: `profiles`, `posts`, `tags`, `categories`, `post_tags`, `media`, `settings`.
- RLS enabled; policies need to be added during integration (grant read to public for published posts, write to admin/author roles, etc.).

## Roadmap (priority)
1. Wire Supabase CRUD for posts in `app/api/posts` and server actions in `lib/actions`.
2. Implement TipTap editor in `/admin/editor/[postId]` with metadata sidebar and MDX support.
3. Media upload action to Supabase Storage (private bucket), enforcing alt text.
4. Settings-driven features (e.g., comments provider; home hero configurable via `settings`).
5. Generate real `sitemap.xml` and `rss.xml` from published posts.
6. Vercel Cron for scheduled post publishing.

## Conventions & Constraints
- TypeScript + App Router. Keep components server-first; mark client components with `'use client'` only when needed.
- Paths: use alias `@/*` (configured in `tsconfig.json`).
- Images: prefer Next `<Image>` for local images; remote patterns are configured for Supabase.
- Styling: Tailwind utility-first; reuse `.card`, `.btn`, `.badge`, `.section-title` where suitable.
- Auth: All `/admin/*` routes are protected via Clerk in `middleware.ts`. Keep public routes open.
- Comments: `components/posts/Comments.tsx` is a placeholder; will render Giscus/Disqus based on `settings`.
- shadcn/ui: not installed as a runtime dependency. If needed, use the CLI to generate components rather than adding `shadcn-ui` to dependencies.

## How to Add Features Safely (for agents)
- Planning: use the plan tool to outline steps if multi-phase.
- Scope: make surgical changes; avoid broad refactors unless requested.
- Compatibility: ensure Next 15 + React 19 compatibility. Do not reintroduce deprecated APIs.
- Env safety: never commit real secrets; use `.env.local`. Example keys live in `.env.example`.
- Tests: If adding logic-heavy code and tests exist nearby, mirror local patterns. Don’t add test frameworks if none present.
- Schema changes: update `supabase/schema.sql` and mention required RLS policies.
- API routes: handle JSON and formdata when relevant; validate inputs with Zod where practical.
- Accessibility: include meaningful `alt` text for images and proper labels.

## Useful File References
- Layout & theme: `app/layout.tsx`, `app/globals.css`
- Home page: `app/(site)/page.tsx`
- Header/Footer: `components/layout/Header.tsx`, `components/layout/Footer.tsx`
- Supabase client: `lib/supabase.ts`
- Server actions (stubs): `lib/actions/index.ts`
- API stubs: `app/api/*`
- DB schema: `supabase/schema.sql`

## Non-Goals (for now)
- Full CMS admin polishing (beyond CRUD/editor)
- Complex theming system or dark mode
- Client-side state management libraries

If you’re an agent planning to modify files, please:
- Keep changes minimal and focused on the requested task.
- Follow the established design language and utility classes.
- Update this file if you introduce patterns new agents should know about.

