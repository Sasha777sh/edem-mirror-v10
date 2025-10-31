-- Apply NSM Migration
-- This script creates the session_feedback table and indexes

-- Create the session_feedback table
create table if not exists session_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  feedback boolean not null, -- true = "стало легче", false = "не помогло"
  comment text,
  shift_score int check (shift_score between 0 and 10), -- self-reported shift score
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_session_feedback_user_id on session_feedback(user_id);
create index if not exists idx_session_feedback_session_id on session_feedback(session_id);
create index if not exists idx_session_feedback_created_at on session_feedback(created_at);

-- Verify the table was created
\d session_feedback;