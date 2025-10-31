-- Migration 008: User Preferences and History Control
-- Adds tables for user preferences, history control, and session tracking

-- Table for user preferences and history control
create table if not exists user_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    
    -- History control
    allow_history boolean default true,
    history_retention_days integer default 30,
    
    -- Communication preferences
    preferred_voice text check (preferred_voice in ('soft', 'hard', 'therapist')) default 'soft',
    preferred_archetype text default 'wanderer',
    
    -- Mental style preferences
    preferred_communication_style text check (preferred_communication_style in ('direct', 'metaphorical', 'analytical', 'intuitive')),
    preferred_pace text check (preferred_pace in ('fast', 'slow', 'rhythmic')),
    preferred_tone text check (preferred_tone in ('soft', 'firm', 'neutral', 'playful')),
    preferred_focus text check (preferred_focus in ('body', 'mind', 'emotion', 'spirit')),
    
    -- Created and updated timestamps
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Table for session history (if allowed)
create table if not exists session_history (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    session_id uuid references sessions(id) on delete cascade,
    
    -- Emotional context
    primary_emotion text,
    secondary_emotion text,
    emotion_intensity numeric(3,2),
    
    -- Mental style
    communication_style text,
    pace text,
    tone text,
    focus text,
    
    -- Archetype and scene
    archetype text,
    scene_id text,
    scene_name text,
    
    -- Ritual
    ritual text,
    
    -- User input and response
    user_input text,
    ai_response text,
    
    -- Timestamps
    created_at timestamptz default now()
);

-- Table for user echoes (personal truths)
create table if not exists user_echoes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    
    -- Echo content
    echo_text text not null,
    emotion_context text,
    
    -- Metadata
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_preferences_user on user_preferences(user_id);
create index if not exists idx_session_history_user on session_history(user_id);
create index if not exists idx_session_history_session on session_history(session_id);
create index if not exists idx_session_history_emotion on session_history(primary_emotion);
create index if not exists idx_user_echoes_user on user_echoes(user_id);
create index if not exists idx_user_echoes_active on user_echoes(is_active);

-- Add history preference column to users table if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'allow_history') then
        alter table users add column allow_history boolean default true;
    end if;
end $$;

-- Function to clean old session history based on user preferences
create or replace function clean_old_session_history()
returns void as $$
begin
    delete from session_history 
    where created_at < now() - interval '30 days';
end;
$$ language plpgsql;

-- Add updated_at trigger for user_preferences
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_user_preferences_updated_at 
    before update on user_preferences 
    for each row 
    execute function update_updated_at_column();

create trigger update_user_echoes_updated_at 
    before update on user_echoes 
    for each row 
    execute function update_updated_at_column();