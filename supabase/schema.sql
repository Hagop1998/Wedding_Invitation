create table if not exists public.rsvps (
  id uuid primary key,
  created_at timestamptz not null default now(),
  name text not null,
  attending text not null check (attending in ('yes', 'no')),
  guest_count integer not null default 0,
  guest_names text[] not null default '{}',
  phone text not null default '',
  email text not null default '',
  message text not null default ''
);

create index if not exists rsvps_created_at_idx on public.rsvps (created_at desc);
create index if not exists rsvps_attending_idx on public.rsvps (attending);
