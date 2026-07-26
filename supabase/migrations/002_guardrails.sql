-- Guardrails: users cannot create offers on their own listings
drop policy if exists "Users can create offers" on public.offers;
create policy "Users can create offers"
  on public.offers for insert with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from public.listings l
      where l.id = listing_id
        and l.owner_id <> auth.uid()
    )
  );
