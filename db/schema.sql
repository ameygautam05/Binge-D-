create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  slug text not null unique,
  email text unique,
  display_name text not null,
  handle text not null unique,
  city text,
  tagline text,
  avatar_text text,
  taste_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists friendships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  friend_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'blocked')),
  created_at timestamptz not null default now(),
  unique (profile_id, friend_id)
);

create table if not exists titles (
  id uuid primary key default gen_random_uuid(),
  imdb_id text unique,
  title text not null,
  title_type text,
  year integer,
  end_year integer,
  runtime_minutes integer,
  rating numeric(3,1),
  num_votes integer,
  genres text[] not null default '{}',
  people_hint text[] not null default '{}',
  language_hint text,
  poster_url text,
  blurb text,
  platforms text[] not null default '{}',
  source text not null default 'imdb',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watch_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  status text not null check (status in ('watching', 'completed', 'planned', 'dropped')),
  rating numeric(2,1),
  review_text text,
  visibility text not null default 'friends' check (visibility in ('private', 'friends', 'public')),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, title_id, status)
);

create table if not exists direct_recommendations (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references profiles(id) on delete cascade,
  to_profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid not null references titles(id) on delete cascade,
  note text,
  created_at timestamptz not null default now(),
  unique (from_profile_id, to_profile_id, title_id)
);

create index if not exists idx_watch_entries_profile on watch_entries(profile_id, updated_at desc);
create index if not exists idx_watch_entries_title on watch_entries(title_id);
create index if not exists idx_recommendations_to_profile on direct_recommendations(to_profile_id, created_at desc);
create index if not exists idx_titles_imdb on titles(imdb_id);

alter table profiles enable row level security;
alter table friendships enable row level security;
alter table titles enable row level security;
alter table watch_entries enable row level security;
alter table direct_recommendations enable row level security;

drop policy if exists "authenticated users can read profiles" on profiles;
create policy "authenticated users can read profiles" on profiles
for select to authenticated using (true);

drop policy if exists "users can insert their profile" on profiles;
create policy "users can insert their profile" on profiles
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users can update their profile" on profiles;
create policy "users can update their profile" on profiles
for update to authenticated using (auth.uid() = user_id);

drop policy if exists "authenticated users can read friendships" on friendships;
create policy "authenticated users can read friendships" on friendships
for select to authenticated using (true);

drop policy if exists "users manage their own friendships" on friendships;
create policy "users manage their own friendships" on friendships
for all to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = friendships.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = friendships.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "authenticated users can read titles" on titles;
create policy "authenticated users can read titles" on titles
for select to authenticated using (true);

drop policy if exists "authenticated users can read watch entries" on watch_entries;
create policy "authenticated users can read watch entries" on watch_entries
for select to authenticated using (true);

drop policy if exists "users manage own watch entries" on watch_entries;
create policy "users manage own watch entries" on watch_entries
for all to authenticated
using (
  exists (
    select 1
    from profiles
    where profiles.id = watch_entries.profile_id
      and profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from profiles
    where profiles.id = watch_entries.profile_id
      and profiles.user_id = auth.uid()
  )
);

drop policy if exists "authenticated users can read recommendations" on direct_recommendations;
create policy "authenticated users can read recommendations" on direct_recommendations
for select to authenticated using (true);

drop policy if exists "users create recommendations from themselves" on direct_recommendations;
create policy "users create recommendations from themselves" on direct_recommendations
for insert to authenticated
with check (
  exists (
    select 1
    from profiles
    where profiles.id = direct_recommendations.from_profile_id
      and profiles.user_id = auth.uid()
  )
);
