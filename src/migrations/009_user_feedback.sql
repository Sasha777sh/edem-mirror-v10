-- Migration 009: User Feedback Table
-- Adds table for collecting user feedback on sessions

-- Table for user feedback
create table if not exists user_feedback (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    session_id uuid references sessions(id) on delete cascade,
    rating integer check (rating >= 1 and rating <= 5),
    feedback text,
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_feedback_user on user_feedback(user_id);
create index if not exists idx_user_feedback_session on user_feedback(session_id);
create index if not exists idx_user_feedback_rating on user_feedback(rating);
create index if not exists idx_user_feedback_created on user_feedback(created_at);