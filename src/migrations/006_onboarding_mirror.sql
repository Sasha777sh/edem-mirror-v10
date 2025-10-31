-- Migration 006: Mirror Onboarding Support
-- Adds support for the new 5-mirror onboarding system

-- Table for storing mirror onboarding answers
create table if not exists mirror_onboarding_answers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id),
    
    -- Mirror onboarding data (5 mirrors)
    light text,         -- свет (positive experiences)
    shadow text,        -- тень (negative experiences)
    body text,          -- тело (physical sensations)
    world text,         -- мир (external events/signs)
    
    -- Reflection and metadata
    reflection text,    -- generated reflection text
    lang text check (lang in ('ru', 'en')) default 'ru',
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_mirror_onb_user_ts on mirror_onboarding_answers(user_id, created_at desc);

-- Add mirror onboarding support to users table
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'users' and column_name = 'mirror_onboarding_completed') then
        alter table users add column mirror_onboarding_completed boolean default false;
    end if;
end $$;

-- Update the existing onboarding_answers table to include user_id as a proper foreign key
do $$
begin
    if not exists (select 1 from information_schema.constraint_column_usage where table_name = 'onboarding_answers' and constraint_name = 'onboarding_answers_user_id_fkey') then
        alter table onboarding_answers 
        add constraint onboarding_answers_user_id_fkey 
        foreign key (user_id) references users(id);
    end if;
end $$;