-- Bookings table to track attendance and waitlists for classes
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  class_id uuid references public.classes(id) on delete cascade,
  class_name text,
  class_date timestamptz,
  location text,
  created_at timestamptz default now()
);

alter table public.bookings enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Allow booking reads') then
    create policy "Allow booking reads" on public.bookings for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'User owns their booking') then
    create policy "User owns their booking" on public.bookings for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
