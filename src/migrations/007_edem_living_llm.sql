-- Migration 007: EDEM Living LLM Support
-- Adds tables for ritual memory, user archetypes, and emotion tracking

-- Table for storing ritual memory
create table if not exists ritual_memory (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    session_id uuid references sessions(id),
    
    -- Emotion and scene data
    emotion text,
    scene text,
    ritual text,
    
    -- User input that triggered the ritual
    user_input text,
    
    -- Timestamp
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_ritual_memory_user_ts on ritual_memory(user_id, created_at desc);
create index if not exists idx_ritual_memory_session on ritual_memory(session_id);
create index if not exists idx_ritual_memory_emotion on ritual_memory(emotion);

-- Table for storing user archetypes
create table if not exists user_archetypes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    
    -- User selected archetype
    archetype text,
    
    -- Timestamp
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_archetypes_user_ts on user_archetypes(user_id, created_at desc);

-- Table for storing user echoes (reverse breathing)
create table if not exists user_echoes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    session_id uuid references sessions(id),
    
    -- User's echo or truth they're afraid to hear
    echo_text text,
    
    -- Whether this echo was used in a ritual
    used_in_ritual boolean default false,
    
    -- Timestamp
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_user_echoes_user_ts on user_echoes(user_id, created_at desc);
create index if not exists idx_user_echoes_session on user_echoes(session_id);

-- Add columns to sessions table for EDEM Living LLM
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'current_emotion') then
        alter table sessions add column current_emotion text;
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'current_scene') then
        alter table sessions add column current_scene text;
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'current_ritual') then
        alter table sessions add column current_ritual text;
    end if;
    
    if not exists (select 1 from information_schema.columns where table_name = 'sessions' and column_name = 'user_archetype') then
        alter table sessions add column user_archetype text;
    end if;
end $$;