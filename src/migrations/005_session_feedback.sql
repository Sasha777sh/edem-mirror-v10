-- Session feedback table for NSM metrics
create table session_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  feedback boolean not null, -- true = "стало легче", false = "не помогло"
  comment text,
  shift_score int check (shift_score between 0 and 10), -- self-reported shift score
  created_at timestamptz default now()
);

-- Indexes for performance
create index idx_session_feedback_user_id on session_feedback(user_id);
create index idx_session_feedback_session_id on session_feedback(session_id);
create index idx_session_feedback_created_at on session_feedback(created_at);