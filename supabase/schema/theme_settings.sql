-- Theme settings table to persist palettes globally
create table if not exists public.theme_settings (
  id text primary key,
  theme jsonb not null,
  updated_at timestamptz default now()
);

alter table public.theme_settings enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'theme_settings' and policyname = 'allow_read_theme'
  ) then
    create policy "allow_read_theme" on public.theme_settings
      for select using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'theme_settings' and policyname = 'allow_manage_theme'
  ) then
    create policy "allow_manage_theme" on public.theme_settings
      for insert with check (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'theme_settings' and policyname = 'allow_update_theme'
  ) then
    create policy "allow_update_theme" on public.theme_settings
      for update using (true) with check (true);
  end if;
end$$;

insert into public.theme_settings (id, theme)
values ('global', '{}'::jsonb)
on conflict (id) do nothing;
