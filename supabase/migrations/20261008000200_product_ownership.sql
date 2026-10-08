-- Milestone 12: run once in the SAME Supabase project's SQL Editor.
-- Existing rows remain unassigned; no rows, images or public URLs are changed.
begin;

alter table public.products
  add column if not exists owner_id uuid references auth.users(id) on delete restrict;

create index if not exists products_owner_created_idx
  on public.products (owner_id, created_at desc);

alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select, insert on public.products to service_role;

-- The existing server API explicitly checks ownership. There are no direct
-- browser table-write policies and no changes to public signed-image uploads.
commit;
