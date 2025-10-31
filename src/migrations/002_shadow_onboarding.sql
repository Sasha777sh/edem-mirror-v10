-- Migration 002: Shadow v2 Onboarding Support
-- Adds onboarding_answers table and updates sessions for shadow data

-- Table for storing onboarding answers separately
create table if not exists onboarding_answers (
    id uuid primary key default gen_random_uuid(),
    session_id uuid not null,
    user_id uuid references users(id),
    
    -- Shadow v2 onboarding data
    mask text,          -- роль/маска пользователя
    trigger text,       -- когда включается маска
    polarity text check (polarity in ('loss', 'control', 'rejection', 'guilt', 'shame', 'other')),
    body text,          -- где в теле ощущается
    one_word text,      -- одно слово-суть
    cost_agree boolean, -- согласие работать с ценой маски
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_onb_user_ts on onboarding_answers(user_id, created_at desc);
create index if not exists idx_onb_session on onboarding_answers(session_id);

-- Add onboarding support to sessions table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'onboarding_completed') then
        alter table sessions add column onboarding_completed boolean default false;
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'voice') then
        alter table sessions add column voice text check (voice in ('soft', 'hard', 'therapist')) default 'soft';
    end if;
end $$;

-- Events table for analytics (if not exists)
create table if not exists events (
    id uuid primary key default gen_random_uuid(),
    session_id uuid,
    user_id uuid references users(id),
    event_type text not null,
    metadata jsonb default '{}',
    created_at timestamptz default now()
);

create index if not exists idx_events_type_time on events(event_type, created_at desc);
create index if not exists idx_events_user_time on events(user_id, created_at desc);