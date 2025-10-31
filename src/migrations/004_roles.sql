-- Roles and access control for EDEM Living LLM

-- Create user role enum
create type user_role as enum ('public','registered','guardian');

-- Add role column to profiles table
alter table public.profiles
  add column if not exists role user_role not null default 'public';

-- Row Level Security policies for profiles
-- Users can read their own profile
create policy "read_own_profile"
on public.profiles for select
using (auth.uid() = id);

-- Users can update their own profile
create policy "update_own_profile"
on public.profiles for update
using (auth.uid() = id);

-- Note: Admins and services should use the service role key to update roles
-- This should be done through server-side scripts or admin panels