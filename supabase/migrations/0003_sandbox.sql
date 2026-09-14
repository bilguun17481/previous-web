-- Sandbox: staged change sets. Staff edit products, pages and settings "into" a changeset,
-- preview the result on the storefront, and publish everything at once.
create table if not exists public.changesets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  note text,
  status text not null default 'open' check (status in ('open','published','discarded')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz
);
create table if not exists public.changeset_items (
  id uuid primary key default gen_random_uuid(),
  changeset_id uuid not null references public.changesets(id) on delete cascade,
  entity text not null check (entity in ('product','page','setting')),
  entity_id text not null,
  label text not null default '',
  patch jsonb not null default '{}',
  before jsonb,
  updated_at timestamptz not null default now(),
  unique (changeset_id, entity, entity_id)
);
alter table public.changesets enable row level security;
alter table public.changeset_items enable row level security;
drop policy if exists "staff changesets" on public.changesets;
create policy "staff changesets" on public.changesets for all using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff changeset items" on public.changeset_items;
create policy "staff changeset items" on public.changeset_items for all using (public.is_staff()) with check (public.is_staff());
