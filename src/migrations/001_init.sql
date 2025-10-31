-- Initial database schema for EDEM Living LLM

-- Users table
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  created_at timestamptz default now()
);

-- Subscriptions table
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text check (plan in ('free','pro')) default 'free',
  status text,
  period_end timestamptz,
  created_at timestamptz default now()
);

-- Sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  mode text,
  voice text,
  step text,
  inputs jsonb,
  output jsonb,
  started_at timestamptz default now(),
  finished_at timestamptz
);

-- Usage counters table
create table usage_counters (
  user_id uuid primary key references users(id),
  last_demo_date date,
  demos_today int default 0
);

-- Indexes for better performance
create index on sessions (user_id);
create index on sessions (started_at);
create index on subscriptions (user_id);
create index on subscriptions (stripe_customer_id);
create index on subscriptions (stripe_subscription_id);
