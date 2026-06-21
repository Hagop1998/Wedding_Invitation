-- Run this in Supabase SQL Editor if admin/RSVP returns 500 errors.
-- Allows the backend (service role) to read and write RSVPs.

alter table public.rsvps enable row level security;

create policy "Service role full access"
  on public.rsvps
  for all
  to service_role
  using (true)
  with check (true);

grant all on public.rsvps to service_role;
