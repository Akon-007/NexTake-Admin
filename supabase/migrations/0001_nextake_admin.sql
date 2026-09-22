-- =====================================================================
-- NexTake — shared editorial schema
--
-- Idempotent and additive: safe to run against a Supabase project that
-- already hosts the public NexTake blog. Existing columns are preserved
-- and every new field is added with ADD COLUMN IF NOT EXISTS.
--
-- Security model
--   * Passwords are hashed and verified by Supabase Auth (bcrypt) —
--     no credential material is ever stored in the application bundle.
--   * Verification codes are issued, time-limited and compared by
--     Supabase Auth. Row level security protects every table below.
--   * Only emails listed in public.admin_profiles can reach CMS data.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Admin allow-list
-- ---------------------------------------------------------------------

create table if not exists public.admin_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.admin_profiles enable row level security;

-- SECURITY DEFINER helper so policies can check membership without
-- recursing into admin_profiles' own policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_profiles where id = auth.uid()
  );
$$;

drop policy if exists "admin_profiles_self_read" on public.admin_profiles;
create policy "admin_profiles_self_read"
  on public.admin_profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "admin_profiles_admin_write" on public.admin_profiles;
create policy "admin_profiles_admin_write"
  on public.admin_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Promote an existing Supabase Auth user to administrator:
--   select public.promote_admin('editor@nextake.africa');
create or replace function public.promote_admin(target_email text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_id uuid;
begin
  select id into target_id from auth.users where lower(email) = lower(target_email);
  if target_id is null then
    raise exception 'No auth user exists for %', target_email;
  end if;

  insert into public.admin_profiles (id, email, full_name, role)
  values (target_id, lower(target_email), split_part(target_email, '@', 1), 'admin')
  on conflict (id) do update set role = 'admin';
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Tracked companies / operators
-- ---------------------------------------------------------------------

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sector text,
  website_url text,
  created_at timestamptz not null default now()
);

alter table public.companies enable row level security;

drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read"
  on public.companies for select
  to anon, authenticated
  using (true);

drop policy if exists "companies_admin_write" on public.companies;
create policy "companies_admin_write"
  on public.companies for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 3. Site-wide settings (single row, id = 1)
-- ---------------------------------------------------------------------

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'NexTake',
  slogan text not null default 'TECHNOLOGY NEWS. INTELLIGENTLY CURATED.',
  hero_headline text,
  hero_subhead text,
  nav_links jsonb not null default '[]'::jsonb,
  breaking_enabled boolean not null default true,
  breaking_label text not null default 'BREAKING',
  daily_edit_enabled boolean not null default true,
  daily_edit_subject text not null default 'The Daily Edit',
  newsletter_enabled boolean not null default true,
  newsletter_headline text,
  contact_email text not null default 'nextakeafrica@gmail.com',
  updated_at timestamptz
);

alter table public.site_settings enable row level security;

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 4. Audit log
-- ---------------------------------------------------------------------

create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  target text,
  type text not null default 'system' check (type in ('publish', 'edit', 'subscriber', 'system')),
  actor_email text,
  created_at timestamptz not null default now()
);

alter table public.admin_activity enable row level security;

drop policy if exists "admin_activity_admin_read" on public.admin_activity;
create policy "admin_activity_admin_read"
  on public.admin_activity for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------
-- 5. Articles — shared with the public NexTake blog
-- ---------------------------------------------------------------------

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'Other',
  status text not null default 'draft',
  views integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- legacy columns kept for the previous blog build
  excerpt text,
  content text,
  author text,
  date text,
  read_time text,
  avatar text,
  image text,
  is_new boolean
);

-- A. Source & link -----------------------------------------------------
alter table public.articles add column if not exists slug text;
alter table public.articles add column if not exists source_url text;
alter table public.articles add column if not exists source_name text;
alter table public.articles add column if not exists source_logo_url text;
alter table public.articles add column if not exists original_author text;
alter table public.articles add column if not exists original_published_at timestamptz;
alter table public.articles add column if not exists link_behavior text not null default 'reader';

-- B. Content & editorial ----------------------------------------------
alter table public.articles add column if not exists summary text;
alter table public.articles add column if not exists key_takeaways jsonb not null default '[]'::jsonb;
alter table public.articles add column if not exists tags jsonb not null default '[]'::jsonb;
alter table public.articles add column if not exists cover_image_url text;
alter table public.articles add column if not exists image_credit text;

-- C. SEO & syndication -------------------------------------------------
alter table public.articles add column if not exists canonical_url text;
alter table public.articles add column if not exists syndication_license text;
alter table public.articles add column if not exists syndicated_body text;

-- D. Placement & visibility -------------------------------------------
alter table public.articles add column if not exists published_at timestamptz;
alter table public.articles add column if not exists hero_priority smallint;
alter table public.articles add column if not exists in_daily_edit boolean not null default false;
alter table public.articles add column if not exists is_breaking boolean not null default false;
alter table public.articles add column if not exists related_company_ids jsonb not null default '[]'::jsonb;
alter table public.articles add column if not exists updated_by text;

-- Server-side validation ----------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'articles_status_check'
  ) then
    alter table public.articles
      add constraint articles_status_check
      check (status in ('draft', 'published', 'scheduled', 'archived'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'articles_link_behavior_check'
  ) then
    alter table public.articles
      add constraint articles_link_behavior_check
      check (link_behavior in ('external', 'reader'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'articles_syndication_check'
  ) then
    alter table public.articles
      add constraint articles_syndication_check
      check (
        syndication_license is null
        or syndication_license in ('fair_use_summary', 'full_licensed_syndication', 'press_release')
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'articles_hero_priority_check'
  ) then
    alter table public.articles
      add constraint articles_hero_priority_check
      check (hero_priority is null or (hero_priority between 1 and 5));
  end if;
end $$;

-- Backfill from legacy columns so older rows keep rendering -----------
update public.articles
set summary = coalesce(summary, excerpt),
    syndicated_body = coalesce(syndicated_body, content),
    cover_image_url = coalesce(cover_image_url, image),
    original_author = coalesce(original_author, author),
    slug = coalesce(slug, lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')))
where summary is null
   or syndicated_body is null
   or cover_image_url is null
   or slug is null;

-- Unique slug (only if it does not already exist) ---------------------
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'articles_slug_key') then
    alter table public.articles add constraint articles_slug_key unique (slug);
  end if;
end $$;

create index if not exists articles_status_published_at_idx
  on public.articles (status, published_at desc);

create index if not exists articles_category_idx on public.articles (category);
create index if not exists articles_hero_idx on public.articles (hero_priority)
  where hero_priority is not null;
create index if not exists articles_tags_idx on public.articles using gin (tags);

-- updated_at + slug defaults ------------------------------------------
create or replace function public.articles_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();

  if new.slug is null or btrim(new.slug) = '' then
    new.slug := lower(regexp_replace(new.title, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;

  -- keep the legacy columns readable by older builds of the public blog
  new.excerpt := coalesce(new.excerpt, new.summary);
  new.image := coalesce(new.image, new.cover_image_url);
  new.content := coalesce(new.content, new.syndicated_body);
  new.is_new := coalesce(new.is_new, new.is_breaking, false);

  return new;
end;
$$;

drop trigger if exists articles_touch on public.articles;
create trigger articles_touch
  before insert or update on public.articles
  for each row execute function public.articles_touch();

-- Audit trail ----------------------------------------------------------
create or replace function public.articles_audit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_activity (action, target, type, actor_email)
  values (
    case
      when tg_op = 'INSERT' then 'Created article'
      when tg_op = 'DELETE' then 'Removed article'
      else 'Updated article'
    end,
    coalesce(new.title, old.title),
    case
      when tg_op = 'INSERT' and new.status = 'published' then 'publish'
      when tg_op = 'INSERT' then 'edit'
      when tg_op = 'DELETE' then 'system'
      else 'edit'
    end,
    coalesce(new.updated_by, (select email from auth.users where id = auth.uid()))
  );
  return null;
end;
$$;

drop trigger if exists articles_audit on public.articles;
create trigger articles_audit
  after insert or update or delete on public.articles
  for each row execute function public.articles_audit();

-- Row level security ---------------------------------------------------
alter table public.articles enable row level security;

-- Readers (including the public blog's anonymous key) only ever see
-- published stories whose release time has passed.
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read"
  on public.articles for select
  to anon, authenticated
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
  );

-- Admins see and change everything.
drop policy if exists "articles_admin_all" on public.articles;
create policy "articles_admin_all"
  on public.articles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 6. Public read views (what the blog queries)
-- ---------------------------------------------------------------------

create or replace view public.published_articles as
  select *
  from public.articles
  where status = 'published'
    and (published_at is null or published_at <= now())
  order by published_at desc nulls last;

create or replace view public.hero_carousel as
  select *
  from public.published_articles
  where hero_priority is not null
  order by hero_priority asc, published_at desc
  limit 5;

create or replace view public.breaking_alert as
  select *
  from public.published_articles
  where is_breaking
  order by published_at desc
  limit 1;

create or replace view public.daily_edit_queue as
  select *
  from public.published_articles
  where in_daily_edit
  order by published_at desc;

-- ---------------------------------------------------------------------
-- 7. Media storage (cover images, source logos)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('nextake-media', 'nextake-media', true)
on conflict (id) do nothing;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'nextake-media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'nextake-media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'nextake-media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'nextake-media' and public.is_admin());

-- ---------------------------------------------------------------------
-- 8. Newsletter subscribers (shared with the public footer)
-- ---------------------------------------------------------------------

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekend', 'all')),
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Visitors can join the list; nobody can read it without admin rights.
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert"
  on public.newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "newsletter_admin_read" on public.newsletter_subscribers;
create policy "newsletter_admin_read"
  on public.newsletter_subscribers for select
  to authenticated
  using (public.is_admin());

drop policy if exists "newsletter_admin_delete" on public.newsletter_subscribers;
create policy "newsletter_admin_delete"
  on public.newsletter_subscribers for delete
  to authenticated
  using (public.is_admin());
