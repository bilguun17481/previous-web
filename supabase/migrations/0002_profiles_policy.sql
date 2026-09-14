-- Fix "infinite recursion detected in policy for relation profiles".
-- The owner policy queried profiles from inside a profiles policy. A security-definer helper
-- reads the role without re-entering row level security, the same way is_staff() does.
create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

drop policy if exists "profiles owner manages" on public.profiles;
create policy "profiles owner manages" on public.profiles for all using (public.is_owner()) with check (public.is_owner());
