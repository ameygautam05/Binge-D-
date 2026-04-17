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

create table if not exists titles (
  id uuid primary key default gen_random_uuid(),
  imdb_id text unique,
  source_key text unique,
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
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_profile_id uuid not null references profiles(id) on delete cascade,
  to_profile_id uuid not null references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (from_profile_id, to_profile_id)
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

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  created_by_profile_id uuid not null references profiles(id) on delete cascade,
  title_id uuid references titles(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

create table if not exists group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_titles_imdb on titles(imdb_id);
create index if not exists idx_titles_source_key on titles(source_key);
create index if not exists idx_friend_requests_from_to on friend_requests(from_profile_id, to_profile_id);
create index if not exists idx_watch_entries_profile on watch_entries(profile_id, updated_at desc);
create index if not exists idx_recommendations_to_profile on direct_recommendations(to_profile_id, created_at desc);
create index if not exists idx_group_members_profile on group_members(profile_id);
create index if not exists idx_group_messages_group on group_messages(group_id, created_at desc);

alter table profiles enable row level security;
alter table titles enable row level security;
alter table friend_requests enable row level security;
alter table watch_entries enable row level security;
alter table direct_recommendations enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table group_messages enable row level security;

drop policy if exists "profiles_are_readable" on profiles;
create policy "profiles_are_readable" on profiles
for select to authenticated using (true);

drop policy if exists "users_insert_own_profile" on profiles;
create policy "users_insert_own_profile" on profiles
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "users_update_own_profile" on profiles;
create policy "users_update_own_profile" on profiles
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "titles_are_readable" on titles;
create policy "titles_are_readable" on titles
for select to authenticated using (true);

drop policy if exists "authenticated_users_insert_titles" on titles;
create policy "authenticated_users_insert_titles" on titles
for insert to authenticated with check (true);

drop policy if exists "friend_requests_visible_to_involved_profiles" on friend_requests;
create policy "friend_requests_visible_to_involved_profiles" on friend_requests
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.id = friend_requests.from_profile_id or p.id = friend_requests.to_profile_id)
  )
);

drop policy if exists "users_send_requests_from_themselves" on friend_requests;
create policy "users_send_requests_from_themselves" on friend_requests
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.id = friend_requests.from_profile_id
  )
);

drop policy if exists "involved_profiles_update_requests" on friend_requests;
create policy "involved_profiles_update_requests" on friend_requests
for update to authenticated
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.id = friend_requests.from_profile_id or p.id = friend_requests.to_profile_id)
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.id = friend_requests.from_profile_id or p.id = friend_requests.to_profile_id)
  )
);

drop policy if exists "involved_profiles_delete_requests" on friend_requests;
create policy "involved_profiles_delete_requests" on friend_requests
for delete to authenticated
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.id = friend_requests.from_profile_id or p.id = friend_requests.to_profile_id)
  )
);

drop policy if exists "watch_entries_visible_to_authenticated" on watch_entries;
create policy "watch_entries_visible_to_authenticated" on watch_entries
for select to authenticated using (true);

drop policy if exists "users_manage_their_watch_entries" on watch_entries;
create policy "users_manage_their_watch_entries" on watch_entries
for all to authenticated
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.id = watch_entries.profile_id
  )
)
with check (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.id = watch_entries.profile_id
  )
);

drop policy if exists "recommendations_visible_to_involved_profiles" on direct_recommendations;
create policy "recommendations_visible_to_involved_profiles" on direct_recommendations
for select to authenticated
using (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (p.id = direct_recommendations.from_profile_id or p.id = direct_recommendations.to_profile_id)
  )
);

drop policy if exists "users_create_recommendations_from_themselves" on direct_recommendations;
create policy "users_create_recommendations_from_themselves" on direct_recommendations
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and p.id = direct_recommendations.from_profile_id
  )
);

drop policy if exists "groups_visible_to_members" on groups;
create policy "groups_visible_to_members" on groups
for select to authenticated
using (
  exists (
    select 1 from group_members gm
    join profiles p on p.id = gm.profile_id
    where gm.group_id = groups.id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "users_create_groups_from_themselves" on groups;
create policy "users_create_groups_from_themselves" on groups
for insert to authenticated
with check (
  exists (
    select 1 from profiles p
    where p.id = groups.created_by_profile_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "group_members_visible_to_group_members" on group_members;
create policy "group_members_visible_to_group_members" on group_members
for select to authenticated
using (
  exists (
    select 1 from group_members gm
    join profiles p on p.id = gm.profile_id
    where gm.group_id = group_members.group_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "owners_add_group_members" on group_members;
create policy "owners_add_group_members" on group_members
for insert to authenticated
with check (
  exists (
    select 1 from groups g
    join profiles p on p.id = g.created_by_profile_id
    where g.id = group_members.group_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "group_messages_visible_to_members" on group_messages;
create policy "group_messages_visible_to_members" on group_messages
for select to authenticated
using (
  exists (
    select 1 from group_members gm
    join profiles p on p.id = gm.profile_id
    where gm.group_id = group_messages.group_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "members_post_group_messages" on group_messages;
create policy "members_post_group_messages" on group_messages
for insert to authenticated
with check (
  exists (
    select 1 from group_members gm
    join profiles p on p.id = gm.profile_id
    where gm.group_id = group_messages.group_id
      and gm.profile_id = group_messages.profile_id
      and p.user_id = auth.uid()
  )
);
