-- SwapHub security guardrails (run in Supabase SQL Editor after 001 + 002)
-- Covers: seller-only accept, trade create, offered listings, conversations,
-- reviews, profile trust fields, storage path scoping, listing_photos update,
-- basic content length + abuse throttles.

-- ---------------------------------------------------------------------------
-- Offers: only listing owner may accept/reject; buyer may withdraw own pending
-- ---------------------------------------------------------------------------
drop policy if exists "Involved users can update offers" on public.offers;

create policy "Offer maker can withdraw pending offer"
  on public.offers for update
  using (from_user_id = auth.uid() and status = 'pending')
  with check (from_user_id = auth.uid() and status = 'withdrawn');

create policy "Listing owner can accept or reject pending offers"
  on public.offers for update
  using (
    status = 'pending'
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  )
  with check (
    status in ('accepted', 'rejected')
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- Validate offered_listing_ids belong to offer maker and are active
create or replace function public.validate_offer_payload()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lid uuid;
  cnt int;
begin
  if coalesce(array_length(new.offered_listing_ids, 1), 0) < 1 then
    raise exception 'Offer must include at least one of your listings';
  end if;
  if coalesce(array_length(new.offered_listing_ids, 1), 0) > 5 then
    raise exception 'Offer can include at most 5 listings';
  end if;
  if char_length(coalesce(new.message, '')) > 2000 then
    raise exception 'Offer message is too long';
  end if;

  foreach lid in array new.offered_listing_ids loop
    select count(*) into cnt
    from public.listings
    where id = lid
      and owner_id = new.from_user_id
      and status = 'active';
    if cnt = 0 then
      raise exception 'Offered listing must be your own active listing';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists offers_validate_payload on public.offers;
create trigger offers_validate_payload
  before insert on public.offers
  for each row execute function public.validate_offer_payload();

-- ---------------------------------------------------------------------------
-- Trades: only listing owner may create after offer is accepted
-- ---------------------------------------------------------------------------
drop policy if exists "Involved users can create trades" on public.trades;

create policy "Listing owner can create trade for accepted offer"
  on public.trades for insert with check (
    exists (
      select 1
      from public.offers o
      join public.listings l on l.id = o.listing_id
      where o.id = offer_id
        and o.status = 'accepted'
        and l.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Conversations: seller_id must be listing owner; listing must be active
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can start conversations" on public.conversations;

create policy "Buyers can start conversations with listing owner"
  on public.conversations for insert with check (
    auth.uid() = buyer_id
    and auth.uid() <> seller_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id = seller_id
        and l.status = 'active'
        and l.owner_id <> auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Reviews: only after completed trade, between the two parties
-- ---------------------------------------------------------------------------
drop policy if exists "Users can create reviews for their trades" on public.reviews;

create policy "Participants can review completed trades"
  on public.reviews for insert with check (
    auth.uid() = from_user_id
    and from_user_id <> to_user_id
    and exists (
      select 1
      from public.trades t
      join public.offers o on o.id = t.offer_id
      join public.listings l on l.id = o.listing_id
      where t.id = trade_id
        and t.status = 'completed'
        and (
          (from_user_id = o.from_user_id and to_user_id = l.owner_id)
          or (from_user_id = l.owner_id and to_user_id = o.from_user_id)
        )
    )
  );

-- ---------------------------------------------------------------------------
-- Profiles: clients cannot self-set email_verified
-- ---------------------------------------------------------------------------
create or replace function public.protect_profile_trust_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Allow auth sync trigger path (same transaction as auth.users update) by
  -- only blocking when email_verified flips without matching auth state.
  if tg_op = 'UPDATE'
     and new.email_verified is distinct from old.email_verified then
    if not exists (
      select 1 from auth.users u
      where u.id = new.id
        and (u.email_confirmed_at is not null) = coalesce(new.email_verified, false)
    ) then
      new.email_verified := old.email_verified;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_trust on public.profiles;
create trigger profiles_protect_trust
  before update on public.profiles
  for each row execute function public.protect_profile_trust_fields();

-- ---------------------------------------------------------------------------
-- listing_photos: owner can update sort_order; tighten public select
-- ---------------------------------------------------------------------------
drop policy if exists "Photos viewable with listing" on public.listing_photos;

create policy "Listing photos visible for active or owned listings"
  on public.listing_photos for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status = 'active' or l.owner_id = auth.uid())
    )
  );

drop policy if exists "Owners can update listing photos" on public.listing_photos;
create policy "Owners can update listing photos"
  on public.listing_photos for update using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Storage: path must start with auth.uid()
-- ---------------------------------------------------------------------------
drop policy if exists "Auth users upload listing photos" on storage.objects;
create policy "Auth users upload listing photos"
  on storage.objects for insert with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Auth users upload avatars" on storage.objects;
create policy "Auth users upload avatars"
  on storage.objects for insert with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Content length limits
-- ---------------------------------------------------------------------------
alter table public.listings
  drop constraint if exists listings_title_len,
  drop constraint if exists listings_description_len,
  drop constraint if exists listings_looking_for_len;

alter table public.listings
  add constraint listings_title_len check (char_length(title) <= 120),
  add constraint listings_description_len check (char_length(description) <= 5000),
  add constraint listings_looking_for_len check (char_length(looking_for) <= 200);

alter table public.messages
  drop constraint if exists messages_body_len;
alter table public.messages
  add constraint messages_body_len check (char_length(coalesce(body, '')) <= 4000);

alter table public.reports
  drop constraint if exists reports_reason_len;
alter table public.reports
  add constraint reports_reason_len check (char_length(reason) between 3 and 1000);

-- ---------------------------------------------------------------------------
-- Simple per-user write throttles (abuse / spam)
-- ---------------------------------------------------------------------------
create or replace function public.enforce_write_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
  uid uuid := auth.uid();
begin
  if uid is null then
    return new;
  end if;

  if tg_table_name = 'messages' then
    select count(*) into n from public.messages
    where sender_id = uid and created_at > now() - interval '1 minute';
    if n >= 30 then
      raise exception 'Too many messages. Please wait a moment.';
    end if;
  elsif tg_table_name = 'offers' then
    select count(*) into n from public.offers
    where from_user_id = uid and created_at > now() - interval '1 hour';
    if n >= 20 then
      raise exception 'Too many offers. Try again later.';
    end if;
  elsif tg_table_name = 'reports' then
    select count(*) into n from public.reports
    where reporter_id = uid and created_at > now() - interval '1 hour';
    if n >= 10 then
      raise exception 'Too many reports. Try again later.';
    end if;
  elsif tg_table_name = 'listings' then
    select count(*) into n from public.listings
    where owner_id = uid and created_at > now() - interval '1 hour';
    if n >= 15 then
      raise exception 'Too many listings created. Try again later.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function public.enforce_write_rate_limit();

drop trigger if exists offers_rate_limit on public.offers;
create trigger offers_rate_limit
  before insert on public.offers
  for each row execute function public.enforce_write_rate_limit();

drop trigger if exists reports_rate_limit on public.reports;
create trigger reports_rate_limit
  before insert on public.reports
  for each row execute function public.enforce_write_rate_limit();

drop trigger if exists listings_rate_limit on public.listings;
create trigger listings_rate_limit
  before insert on public.listings
  for each row execute function public.enforce_write_rate_limit();
