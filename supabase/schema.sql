-- Supabase Postgres schema for Angelise Blog
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  role text not null default 'reader' check (role in ('admin','author','reader'))
);

-- posts
create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references public.profiles(id),
  title text not null,
  slug text not null unique,
  content_mdx text,
  excerpt text,
  cover_image_url text,
  cover_image_alt text,
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  canonical_url text
);

-- tags
create table if not exists public.tags (
  id serial primary key,
  name text not null unique
);

-- categories
create table if not exists public.categories (
  id serial primary key,
  name text not null unique
);

-- post_tags (join)
create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id integer references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- media
create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  uploader_id uuid references public.profiles(id),
  file_path text not null,
  file_name text not null,
  alt_text text not null,
  created_at timestamptz not null default now()
);

-- settings
create table if not exists public.settings (
  key text primary key,
  value jsonb
);

-- RLS: enable on all
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.media enable row level security;
alter table public.settings enable row level security;

-- Example RLS policies will be added during integration.
