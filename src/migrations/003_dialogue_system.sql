-- Migration 003: Multi-level Dialogue System with RAG
-- Adds session states, practices, prompt versions, and RAG chunks with pgvector support

-- Enable pgvector extension if not already enabled
create extension if not exists vector;

-- Table for prompt versions (for template versioning)
create table if not exists prompt_versions (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    stage text check (stage in ('shadow', 'truth', 'integration')) not null,
    content text not null,
    created_at timestamptz default now(),
    is_active boolean default true
);

-- Create index for prompt versions
create index if not exists idx_prompt_versions_stage on prompt_versions(stage);
create index if not exists idx_prompt_versions_active on prompt_versions(is_active);

-- Table for RAG chunks (knowledge base)
create table if not exists rag_chunks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    stage text[] not null, -- shadow, truth, integration
    symptom text[] not null, -- anxiety, breakup, anger, sleep, etc.
    archetype text[], -- rescuer, persecutor, victim, lilith, etc.
    modality text[], -- body, breath, music, cognitive, etc.
    language text check (language in ('ru', 'en')) default 'ru',
    reading_time numeric, -- in minutes
    text_content text not null,
    embedding vector(1536), -- for OpenAI embeddings
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes for RAG chunks
create index if not exists idx_rag_chunks_stage on rag_chunks using gin(stage);
create index if not exists idx_rag_chunks_symptom on rag_chunks using gin(symptom);
create index if not exists idx_rag_chunks_archetype on rag_chunks using gin(archetype);
create index if not exists idx_rag_chunks_language on rag_chunks(language);
create index if not exists idx_rag_chunks_embedding on rag_chunks using hnsw(embedding vector_cosine_ops);

-- Table for session states (current stage and signals)
create table if not exists session_states (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    session_id uuid references sessions(id) on delete cascade,
    stage text check (stage in ('shadow', 'truth', 'integration')) default 'shadow',
    defensiveness int check (defensiveness between 0 and 3) default 0,
    acknowledgement int check (acknowledgement between 0 and 3) default 0,
    readiness int check (readiness between 0 and 3) default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes for session states
create index if not exists idx_session_states_user on session_states(user_id);
create index if not exists idx_session_states_session on session_states(session_id);
create index if not exists idx_session_states_stage on session_states(stage);

-- Table for practices (assigned tasks)
create table if not exists practices (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,
    session_id uuid references sessions(id) on delete cascade,
    practice_key text, -- reference to protocols in RAG
    assigned_at timestamptz default now(),
    due_at timestamptz,
    done boolean default false,
    self_report int check (self_report between 0 and 10),
    note text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes for practices
create index if not exists idx_practices_user on practices(user_id);
create index if not exists idx_practices_session on practices(session_id);
create index if not exists idx_practices_done on practices(done);
create index if not exists idx_practices_due on practices(due_at);

-- Insert default prompt templates
insert into prompt_versions (name, stage, content, is_active) values
('shadow_v1', 'shadow', '[VOICE=mirror.blunt]
Зеркало: вижу {паттерн}. Триггер: {ситуация}. Цена: {чего это лишает}.
Без советов. Только факт. Одно предложение.', true),

('truth_v1', 'truth', '[VOICE=mirror.clarity]
Правда: на самом деле тебе важно {потребность}. Сейчас ты закрываешь это через {паттерн}, потому что {история/страх}. 
Место выбора: {1 альтернативный микро-выбор}.', true),

('integration_v1', 'integration', '[VOICE=mirror.coach]
Шаг на сегодня (3 минуты): {практика_из_корпуса}.
Якорь в теле: {дыхание/ощущения}.
Завтра спрошу: «Сделал ли? Что изменилось по шкале 0–10?»', true)

on conflict (name) do nothing;