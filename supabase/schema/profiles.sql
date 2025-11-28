-- Create a table for public profiles linked to auth.users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  is_admin boolean default false,
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policies: Control who can see/edit data

-- 1. Everyone can read profiles (needed for teachers to see student names in bookings)
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

-- 2. Users can insert their own profile (used during signup)
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

-- 3. Users can update their own profile
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Function to handle new user signups automatically (Backup for the frontend logic)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger the function every time a user is created in auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();