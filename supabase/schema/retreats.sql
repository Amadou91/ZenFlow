-- Retreat management tables
create table if not exists public.retreats (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date,
  end_date date,
  date_label text,
  location text,
  description text,
  price numeric,
  capacity integer default 0,
  waitlist_capacity integer default 0,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists public.retreat_signups (
  id uuid primary key default gen_random_uuid(),
  retreat_id uuid references public.retreats(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  created_at timestamptz default now()
);

alter table public.retreats enable row level security;
alter table public.retreat_signups enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Retreats readable') then
    create policy "Retreats readable" on public.retreats for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Retreats write for service roles') then
    create policy "Retreats write for service roles" on public.retreats for all
      using (auth.role() in ('anon','authenticated')) with check (auth.role() in ('anon','authenticated'));
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Signup readable') then
    create policy "Signup readable" on public.retreat_signups for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Signup owner write') then
    create policy "Signup owner write" on public.retreat_signups for all
      using (auth.uid() = user_id or auth.role() = 'service_role')
      with check (auth.uid() = user_id or auth.role() = 'service_role');
  end if;
end $$;

-- Storage bucket for retreat images (create via Supabase dashboard if missing)
--   name: retreat-images, public: true
