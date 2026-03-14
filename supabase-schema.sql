-- ═══════════════════════════════════════════════════════
-- عَقول (Akool) — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. User Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  is_donor boolean default false,
  donation_amount numeric(10,2) default 0,
  show_donation boolean default false,
  badge text, -- 'bronze', 'silver', 'gold', 'platinum'
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Forum Posts
create table if not exists forum_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  author_name text not null,
  topic text default 'عام',
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

alter table forum_posts enable row level security;

create policy "Forum posts are viewable by everyone"
  on forum_posts for select using (true);

create policy "Authenticated users can create posts"
  on forum_posts for insert with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on forum_posts for delete using (auth.uid() = user_id);

-- 3. Forum Replies
create table if not exists forum_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references forum_posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete set null,
  author_name text not null,
  body text not null,
  is_ai boolean default false,
  created_at timestamptz default now()
);

alter table forum_replies enable row level security;

create policy "Forum replies are viewable by everyone"
  on forum_replies for select using (true);

create policy "Authenticated users can create replies"
  on forum_replies for insert with check (auth.uid() = user_id or is_ai = true);

-- 4. Content Submissions (YouTube/Articles shared by users)
create table if not exists content_submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text check (type in ('article', 'youtube')) not null,
  url text not null,
  title text not null,
  description text default '',
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  ai_review text,
  created_at timestamptz default now()
);

alter table content_submissions enable row level security;

create policy "Approved submissions are viewable by everyone"
  on content_submissions for select using (status = 'approved' or auth.uid() = user_id);

create policy "Authenticated users can submit content"
  on content_submissions for insert with check (auth.uid() = user_id);

-- 5. Donations
create table if not exists donations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  currency text default 'USD',
  note text,
  created_at timestamptz default now()
);

alter table donations enable row level security;

create policy "Public donations are viewable"
  on donations for select using (true);

create policy "Authenticated users can record donations"
  on donations for insert with check (auth.uid() = user_id);

-- Helper function: update donor badge based on total
create or replace function update_donor_badge()
returns trigger as $$
declare
  total numeric;
  new_badge text;
begin
  select coalesce(sum(amount), 0) into total
  from donations where user_id = new.user_id;

  if total >= 100 then new_badge := 'platinum';
  elsif total >= 50 then new_badge := 'gold';
  elsif total >= 20 then new_badge := 'silver';
  elsif total >= 5 then new_badge := 'bronze';
  else new_badge := null;
  end if;

  update profiles
  set is_donor = (total > 0),
      donation_amount = total,
      badge = new_badge
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_donation_created
  after insert on donations
  for each row execute function update_donor_badge();
