-- Post-schema setup for Angelise Blog
-- Run this after applying supabase/schema.sql

-- 1) Ensure updated_at auto-updates on posts
create or replace function public.set_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- 2) Create the private Storage bucket for media (safe to re-run)
do $$
begin
  perform storage.create_bucket('media', public := false);
exception when others then null; -- ignore if it already exists or extension missing
end $$;

-- 3) Helpful indexes
create index if not exists idx_posts_status_published_at on public.posts(status, published_at);
create index if not exists idx_posts_author_id on public.posts(author_id);
create index if not exists idx_post_tags_post_id on public.post_tags(post_id);
create index if not exists idx_post_tags_tag_id on public.post_tags(tag_id);
create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_upvotes on public.comments(upvote_count desc);
create index if not exists idx_comment_votes_comment_id on public.comment_votes(comment_id);

-- 4) Seed canonical editorial categories
insert into public.categories (name)
values
  ('Ideas'),
  ('Home'),
  ('Travel'),
  ('Field Notes'),
  ('Letters')
on conflict (name) do nothing;

-- 5) Profiles: auto-create profile row on new auth user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'reader')
  on conflict (id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 6) RLS policies
-- Note: RLS is enabled in schema.sql. These policies grant public read to published posts
-- and authenticated author/admin write access. Admin is determined via profiles.role = 'admin'.

-- Helpers used in policies (inline via EXISTS subqueries):
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
--   exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author'))

-- posts
create policy "Public read published posts"
  on public.posts for select to anon
  using (status = 'published' and (published_at is null or published_at <= now()));

create policy "Authors read own posts"
  on public.posts for select to authenticated
  using (author_id = auth.uid());

create policy "Admins read all posts"
  on public.posts for select to authenticated
  using (exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  ));

create policy "Authors insert posts"
  on public.posts for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author'))
  );

create policy "Authors update own posts"
  on public.posts for update to authenticated
  using (
    author_id = auth.uid()
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author'))
  )
  with check (author_id = auth.uid());

create policy "Admins manage posts"
  on public.posts for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- tags
create policy "Public read tags"
  on public.tags for select
  using (true);

create policy "Authors manage tags"
  on public.tags for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author')));

-- categories
create policy "Public read categories"
  on public.categories for select
  using (true);

create policy "Authors manage categories"
  on public.categories for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author')))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin','author')));

-- post_tags
create policy "Public read post_tags"
  on public.post_tags for select
  using (true);

create policy "Authors manage own post_tags"
  on public.post_tags for all to authenticated
  using (exists (
    select 1 from public.posts po
    where po.id = post_id
      and (
        po.author_id = auth.uid()
        or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      )
  ))
  with check (exists (
    select 1 from public.posts po
    where po.id = post_id
      and (
        po.author_id = auth.uid()
        or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
      )
  ));

-- media (DB metadata, objects live in Storage)
create policy "User read own media rows"
  on public.media for select to authenticated
  using (
    uploader_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "User insert own media rows"
  on public.media for insert to authenticated
  with check (
    uploader_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- comments
create policy "Public read approved comments"
  on public.comments for select to anon
  using (status = 'approved');

create policy "Public submit comments"
  on public.comments for insert to anon
  with check (status = 'approved');

create policy "Admins manage comments"
  on public.comments for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- comment_votes
create policy "Public interact with comment_votes"
  on public.comment_votes for all to anon
  using (true)
  with check (true);

-- Keep comment_votes updated_at fresh
create or replace function public.touch_comment_vote_updated_at()
returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists set_comment_votes_updated_at on public.comment_votes;
create trigger set_comment_votes_updated_at
before update on public.comment_votes
for each row execute function public.touch_comment_vote_updated_at();

-- Voting helper
create or replace function public.vote_on_comment(
  p_comment_id uuid,
  p_voter_id uuid,
  p_vote text
)
returns table (
  comment_id uuid,
  upvote_count integer,
  downvote_count integer,
  user_vote text
)
language plpgsql
security definer
set search_path = public as $$
declare
  existing_vote text;
  final_vote text;
begin
  if p_vote not in ('up','down') then
    raise exception 'Invalid vote type %', p_vote;
  end if;

  select vote into existing_vote
  from public.comment_votes cv
  where cv.comment_id = p_comment_id
    and cv.voter_id = p_voter_id;

  if existing_vote is null then
    insert into public.comment_votes (comment_id, voter_id, vote)
    values (p_comment_id, p_voter_id, p_vote)
    returning vote into final_vote;
  elsif existing_vote = p_vote then
    delete from public.comment_votes
    where public.comment_votes.comment_id = p_comment_id
      and public.comment_votes.voter_id = p_voter_id;
    final_vote := null;
  else
    update public.comment_votes
    set vote = p_vote
    where public.comment_votes.comment_id = p_comment_id
      and public.comment_votes.voter_id = p_voter_id
    returning vote into final_vote;
  end if;

  update public.comments
    set
      upvote_count = (
        select count(*)
        from public.comment_votes cv_up
        where cv_up.comment_id = p_comment_id and cv_up.vote = 'up'
      ),
      downvote_count = (
        select count(*)
        from public.comment_votes cv_down
        where cv_down.comment_id = p_comment_id and cv_down.vote = 'down'
      )
    where id = p_comment_id;

  return query
    select c.id as comment_id,
           c.upvote_count,
           c.downvote_count,
           final_vote as user_vote
    from public.comments c
    where c.id = p_comment_id;
end
$$;

create policy "User update own media rows"
  on public.media for update to authenticated
  using (
    uploader_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  )
  with check (
    uploader_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "User delete own media rows"
  on public.media for delete to authenticated
  using (
    uploader_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- settings
create policy "Public read settings"
  on public.settings for select
  using (true);

create policy "Admins manage settings"
  on public.settings for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- profiles
create policy "User read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "User update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admin read profiles"
  on public.profiles for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Optional: elevate a specific user to admin (replace 00000000-0000-0000-0000-000000000000)
-- update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000000';
