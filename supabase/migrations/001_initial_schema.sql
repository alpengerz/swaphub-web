-- SwapHub initial schema: profiles, listings, chat, offers, trades, reviews, reports
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query)

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  city text,
  bio text default '',
  email_verified boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

-- Listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null default '',
  condition text not null check (condition in ('New', 'Like New', 'Good', 'Used')),
  category text not null,
  looking_for text not null default '',
  location text not null default '',
  latitude double precision,
  longitude double precision,
  status text not null default 'active' check (status in ('active', 'reserved', 'traded', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_owner_idx on public.listings (owner_id);
create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_category_idx on public.listings (category);
create index if not exists listings_created_idx on public.listings (created_at desc);

-- Listing photos (paths in Storage bucket `listing-photos`)
create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists listing_photos_listing_idx on public.listing_photos (listing_id);

-- Conversations (1:1 per listing between two users)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

create index if not exists conversations_buyer_idx on public.conversations (buyer_id);
create index if not exists conversations_seller_idx on public.conversations (seller_id);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text,
  image_paths text[] default '{}',
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, created_at);

-- Offers
create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  offered_listing_ids uuid[] not null default '{}',
  message text default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_listing_idx on public.offers (listing_id);
create index if not exists offers_from_user_idx on public.offers (from_user_id);

-- Trades
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null unique references public.offers (id) on delete cascade,
  meeting_method text not null default 'Meet in person',
  meeting_location text not null default '',
  status text not null default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  unique (trade_id, from_user_id)
);

create index if not exists reviews_to_user_idx on public.reviews (to_user_id);

-- Reports
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'user', 'message')),
  target_id uuid not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url, email_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    coalesce(new.email_confirmed_at is not null, false)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep email_verified in sync
create or replace function public.sync_email_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email_verified = (new.email_confirmed_at is not null),
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email_confirmed_at on auth.users
  for each row execute function public.sync_email_verified();

-- Updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_updated_at on public.listings;
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.offers enable row level security;
alter table public.trades enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Listings policies
create policy "Active listings are public"
  on public.listings for select using (
    status = 'active' or owner_id = auth.uid()
  );

create policy "Users can create listings"
  on public.listings for insert with check (auth.uid() = owner_id);

create policy "Owners can update listings"
  on public.listings for update using (auth.uid() = owner_id);

create policy "Owners can delete listings"
  on public.listings for delete using (auth.uid() = owner_id);

-- Photos
create policy "Photos viewable with listing"
  on public.listing_photos for select using (true);

create policy "Owners can insert photos"
  on public.listing_photos for insert with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Owners can delete photos"
  on public.listing_photos for delete using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- Conversations
create policy "Participants can view conversations"
  on public.conversations for select using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

create policy "Authenticated users can start conversations"
  on public.conversations for insert with check (
    auth.uid() = buyer_id and auth.uid() <> seller_id
  );

create policy "Participants can update conversations"
  on public.conversations for update using (
    auth.uid() = buyer_id or auth.uid() = seller_id
  );

-- Messages
create policy "Participants can view messages"
  on public.messages for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- Offers
create policy "Involved users can view offers"
  on public.offers for select using (
    from_user_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

create policy "Users can create offers"
  on public.offers for insert with check (auth.uid() = from_user_id);

create policy "Involved users can update offers"
  on public.offers for update using (
    from_user_id = auth.uid()
    or exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- Trades
create policy "Involved users can view trades"
  on public.trades for select using (
    exists (
      select 1 from public.offers o
      join public.listings l on l.id = o.listing_id
      where o.id = offer_id
        and (o.from_user_id = auth.uid() or l.owner_id = auth.uid())
    )
  );

create policy "Involved users can create trades"
  on public.trades for insert with check (
    exists (
      select 1 from public.offers o
      join public.listings l on l.id = o.listing_id
      where o.id = offer_id
        and (o.from_user_id = auth.uid() or l.owner_id = auth.uid())
    )
  );

create policy "Involved users can update trades"
  on public.trades for update using (
    exists (
      select 1 from public.offers o
      join public.listings l on l.id = o.listing_id
      where o.id = offer_id
        and (o.from_user_id = auth.uid() or l.owner_id = auth.uid())
    )
  );

-- Reviews
create policy "Reviews are public"
  on public.reviews for select using (true);

create policy "Users can create reviews for their trades"
  on public.reviews for insert with check (auth.uid() = from_user_id);

-- Reports
create policy "Users can create reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

create policy "Users can view own reports"
  on public.reports for select using (auth.uid() = reporter_id);

-- Storage buckets (run via Storage API or Dashboard; also create policies below)
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Public read listing photos"
  on storage.objects for select using (bucket_id = 'listing-photos');

create policy "Auth users upload listing photos"
  on storage.objects for insert with check (
    bucket_id = 'listing-photos' and auth.role() = 'authenticated'
  );

create policy "Owners delete own listing photos"
  on storage.objects for delete using (
    bucket_id = 'listing-photos' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public read avatars"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Auth users upload avatars"
  on storage.objects for insert with check (
    bucket_id = 'avatars' and auth.role() = 'authenticated'
  );

create policy "Users update own avatars"
  on storage.objects for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Realtime for messages (ignore if already added)
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception when duplicate_object then null;
end $$;

-- Helper: profile completeness
create or replace function public.is_profile_complete(uid uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = uid
      and username is not null
      and length(trim(username)) >= 3
      and city is not null
      and length(trim(city)) >= 2
  );
$$;
