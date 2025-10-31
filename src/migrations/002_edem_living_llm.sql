-- EDEM Living LLM specific tables

-- Ritual memory table
create table ritual_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  emotion text,
  scene text,
  ritual text,
  user_input text,
  created_at timestamptz default now()
);

-- User archetypes table
create table user_archetypes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) unique,
  archetype text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User echoes table
create table user_echoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  echo_text text,
  created_at timestamptz default now()
);

-- User preferences table
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) unique,
  allow_history boolean default true,
  preferred_archetype text default 'wanderer',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Session history table
create table session_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  primary_emotion text,
  secondary_emotion text,
  emotion_intensity numeric,
  communication_style text,
  pace text,
  tone text,
  focus text,
  archetype text,
  scene_id text,
  scene_name text,
  ritual text,
  user_input text,
  ai_response text,
  created_at timestamptz default now()
);

-- Indexes for better performance
create index on ritual_memory (user_id);
create index on ritual_memory (created_at);
create index on user_archetypes (user_id);
create index on user_echoes (user_id);
create index on user_preferences (user_id);
create index on session_history (user_id);
create index on session_history (created_at);