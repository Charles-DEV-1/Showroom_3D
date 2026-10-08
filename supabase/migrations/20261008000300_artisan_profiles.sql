-- Milestone 13: private contact defaults, separate from published product data.
begin;
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from public, anon, authenticated;
grant select, insert, update on public.profiles to service_role;
-- No public profile route or browser table-write policy. The API verifies the
-- caller and filters/upserts only that caller's ID using its server-only client.
commit;
