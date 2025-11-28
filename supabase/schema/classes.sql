-- Classes table for ZenFlow scheduling
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date timestamptz not null,
  time text,
  duration text,
  location text,
  instructor text,
  description text,
  price numeric default 0,
  capacity integer default 0,
  waitlist_capacity integer default 0,
  created_at timestamptz default now()
);

alter table public.classes enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow class reads') then
    create policy "Allow class reads" on public.classes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Allow class writes for studio roles') then
    create policy "Allow class writes for studio roles" on public.classes for all using (auth.role() in ('anon','authenticated')) with check (auth.role() in ('anon','authenticated'));
  end if;
end $$;
