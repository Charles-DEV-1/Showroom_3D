-- Run this whole file once in Supabase Dashboard > SQL Editor.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  photo_url text,
  model_url text,
  parts jsonb not null check (
    jsonb_typeof(parts) = 'array' and jsonb_array_length(parts) between 1 and 100
  ),
  finishes jsonb not null default '[]'::jsonb check (
    jsonb_typeof(finishes) = 'array' and jsonb_array_length(finishes) <= 24
  ),
  price bigint not null check (price between 0 and 1000000000),
  dimensions_cm jsonb not null check (
    jsonb_typeof(dimensions_cm) = 'array' and jsonb_array_length(dimensions_cm) = 3
  ),
  dimensions text not null check (char_length(dimensions) between 1 and 120),
  whatsapp text not null check (whatsapp ~ '^[1-9][0-9]{7,14}$'),
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
grant select, insert on public.products to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
);
-- No anonymous product or storage-write policies. Our API uses a server-only
-- secret key, and the browser uploads using a path-scoped signed token.
