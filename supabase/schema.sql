-- Ram Lakhan Toy House — database, security and photo storage.
-- Run once: Supabase dashboard → SQL Editor → New query → paste all → Run.
-- Safe to run again.

-- ---------- who is allowed to manage the shop ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select using (user_id = auth.uid());

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- catalogue (public read, admin write) ----------
create table if not exists public.products (
  id text primary key,            -- the product slug
  data jsonb not null,
  sort integer not null default 0,
  updated_at timestamptz not null default now()
);
create table if not exists public.categories (
  id text primary key,
  data jsonb not null,
  sort integer not null default 0
);
create table if not exists public.seasons (
  id text primary key,
  data jsonb not null
);
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null
);

do $$
declare t text;
begin
  foreach t in array array['products', 'categories', 'seasons', 'settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- ---------- enquiries (anyone can send, only admin can read) ----------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null default 'retail' check (type in ('retail', 'wholesale')),
  product text not null check (char_length(product) between 1 and 600),
  variant text check (char_length(variant) <= 120),
  qty text check (char_length(qty) <= 60),
  season text check (char_length(season) <= 60),
  name text not null check (char_length(name) between 1 and 120),
  mobile text not null check (mobile ~ '^[6-9][0-9]{9}$'),
  area text not null check (char_length(area) between 1 and 200),
  note text check (char_length(note) <= 600),
  status text not null default 'new' check (status in ('new', 'called', 'done'))
);
create index if not exists enquiries_created_idx on public.enquiries (created_at desc);
alter table public.enquiries enable row level security;
drop policy if exists "anyone can enquire" on public.enquiries;
create policy "anyone can enquire" on public.enquiries for insert to anon, authenticated
  with check (status = 'new');
drop policy if exists "admin manages enquiries" on public.enquiries;
create policy "admin manages enquiries" on public.enquiries for all
  using (public.is_admin()) with check (public.is_admin());

-- ---------- photo storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "photos public read" on storage.objects;
create policy "photos public read" on storage.objects for select using (bucket_id = 'product-photos');
drop policy if exists "photos admin write" on storage.objects;
create policy "photos admin write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos' and public.is_admin());
drop policy if exists "photos admin update" on storage.objects;
create policy "photos admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());
drop policy if exists "photos admin delete" on storage.objects;
create policy "photos admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());

-- ---------- make the owner an admin ----------
-- 1. Authentication → Users → Add user → enter the owner's email + a password (tick "Auto confirm").
-- 2. Then run this line with that email:
--    insert into public.admins (user_id) select id from auth.users where email = 'OWNER_EMAIL_HERE' on conflict do nothing;
