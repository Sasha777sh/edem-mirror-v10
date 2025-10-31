-- User State Table for EDEM Mirror v10
-- Tracks user emotional states and resonance metrics

-- User state table
create table user_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  current_emotion text,
  current_scene text,
  emotional_intensity numeric(3,2), -- 0.00 to 1.00
  communication_style text,
  pace text,
  tone text,
  focus text,
  archetype text,
  session_count integer default 0,
  last_session_at timestamptz,
  resonance_score integer, -- 0 to 100
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User resonance history table
create table user_resonance_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  session_id uuid,
  resonance_score integer, -- 0 to 100
  conversation_frequency integer,
  response_latency numeric(5,2),
  emotional_alignment numeric(3,2), -- 0.00 to 1.00
  pause_synchronization numeric(3,2), -- 0.00 to 1.00
  engagement_depth numeric(3,2), -- 0.00 to 1.00
  session_duration numeric(5,2),
  insights text[],
  created_at timestamptz default now()
);

-- Indexes for better performance
create index on user_state (user_id);
create index on user_state (created_at);
create index on user_resonance_history (user_id);
create index on user_resonance_history (created_at);
create index on user_resonance_history (resonance_score);

-- Row Level Security policies
alter table user_state enable row level security;
alter table user_resonance_history enable row level security;

-- Users can read their own state
create policy "read_own_state"
on user_state for select
using (auth.uid() = user_id);

-- Users can update their own state
create policy "update_own_state"
on user_state for update
using (auth.uid() = user_id);

-- Users can insert their own state
create policy "insert_own_state"
on user_state for insert
with check (auth.uid() = user_id);

-- Users can read their own resonance history
create policy "read_own_resonance_history"
on user_resonance_history for select
using (auth.uid() = user_id);

-- Users can insert their own resonance history
create policy "insert_own_resonance_history"
on user_resonance_history for insert
with check (auth.uid() = user_id);