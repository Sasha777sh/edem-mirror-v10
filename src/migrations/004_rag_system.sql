-- Migration 004: RAG System for Multi-level Dialogue
-- Adds pgvector support and tables for RAG chunks, prompt versions, session states, and practices

-- Enable pgvector extension
create extension if not exists vector;

-- RAG chunks table (knowledge base)
create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  title text,
  stage text[] check (stage <@ array['shadow','truth','integration']),
  symptom text[] default '{}',      -- ['anxiety','breakup','sleep','anger'...]
  archetype text[] default '{}',    -- ['rescuer','persecutor','victim','lilith'...]
  modality text[] default '{}',     -- ['body','breath','cognitive','music']
  lang text default 'ru',
  text text not null,
  embedding vector(1536),           -- под размер эмбеддингов
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for RAG chunks
create index if not exists idx_rag_chunks_embedding on rag_chunks using ivfflat (embedding vector_cosine_ops) with (lists=100);
create index if not exists idx_rag_chunks_lang on rag_chunks (lang);
create index if not exists idx_rag_chunks_stage on rag_chunks using gin (stage);
create index if not exists idx_rag_chunks_symptom on rag_chunks using gin (symptom);
create index if not exists idx_rag_chunks_archetype on rag_chunks using gin (archetype);
create index if not exists idx_rag_chunks_modality on rag_chunks using gin (modality);

-- Prompt versions table
create table if not exists prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text,               -- 'shadow_v1'
  stage text check (stage in ('shadow','truth','integration')),
  content text,            -- шаблон
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Create indexes for prompt versions
create index if not exists idx_prompt_versions_stage on prompt_versions(stage);
create index if not exists idx_prompt_versions_active on prompt_versions(is_active);

-- Session state table
create table if not exists session_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  stage text check (stage in ('shadow','truth','integration')) default 'shadow',
  defensiveness int default 0,     -- 0..3
  acknowledgement int default 0,   -- 0..3
  readiness int default 0,         -- 0..3
  shadow_streak int default 0,     -- consecutive shadow stages
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Create indexes for session states
create index if not exists idx_session_states_user on session_states(user_id);
create index if not exists idx_session_states_session on session_states(session_id);
create index if not exists idx_session_states_stage on session_states(stage);

-- Practices table
create table if not exists practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id uuid references sessions(id) on delete cascade,
  practice_key text,      -- ключ из каталога практик
  assigned_at timestamptz default now(),
  due_at timestamptz,
  done boolean default false,
  self_report int,        -- 0..10
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for practices
create index if not exists idx_practices_user on practices(user_id);
create index if not exists idx_practices_session on practices(session_id);
create index if not exists idx_practices_done on practices(done);
create index if not exists idx_practices_due on practices(due_at);

-- RPC function for matching RAG chunks
create or replace function match_rag_chunks(
  query_embedding vector(1536),
  match_count int default 5,
  p_stage text[] default array['shadow'],
  p_symptom text[] default array[]::text[],
  p_lang text default 'ru'
)
returns table (
  id uuid,
  title text,
  stage text[],
  symptom text[],
  archetype text[],
  modality text[],
  lang text,
  text text,
  similarity float
)
language sql
as $$
  select
    rag_chunks.id,
    rag_chunks.title,
    rag_chunks.stage,
    rag_chunks.symptom,
    rag_chunks.archetype,
    rag_chunks.modality,
    rag_chunks.lang,
    rag_chunks.text,
    (rag_chunks.embedding <#> query_embedding) * -1 as similarity
  from rag_chunks
  where rag_chunks.lang = p_lang
    and rag_chunks.stage && p_stage
    and (array_length(p_symptom, 1) is null or rag_chunks.symptom && p_symptom)
  order by rag_chunks.embedding <#> query_embedding
  limit match_count;
$$;

-- Insert default prompt templates
insert into prompt_versions (name, stage, content, is_active) values
('shadow_v1', 'shadow', 'Зеркало: вижу {паттерн}. Триггер: {ситуация}. Цена: {потеря}. Коротко. Без советов.', true),
('truth_v1', 'truth', 'Правда: тебе важно {потребность}. Сейчас ты закрываешь это {паттерн}, потому что {история/страх}.
Место выбора: {1 маленький альтернативный шаг}.', true),
('integration_v1', 'integration', 'Шаг на сегодня (≤3 мин): {практика}.
Якорь в теле: {ощущение/дыхание}.
Завтра спрошу: сделал ли и что изменилось (0–10).', true)
on conflict (name) do nothing;