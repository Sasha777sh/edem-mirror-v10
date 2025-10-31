-- RAG System tables for EDEM Living LLM

-- Enable pgvector extension
create extension if not exists vector;

-- RAG chunks table
create table rag_chunks (
  id uuid primary key default gen_random_uuid(),
  title text,
  stage text[],
  symptom text[],
  archetype text[],
  modality text[],
  language text default 'ru',
  reading_time numeric,
  text_content text,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to perform similarity search
create or replace function rag_search(
  query_embedding vector,
  stage_filter text default null,
  symptom_filter text default null,
  archetype_filter text default null,
  language_filter text default 'ru',
  match_limit int default 5
)
returns setof rag_chunks
language sql
as $$
  select *
  from rag_chunks
  where language = language_filter
    and (stage_filter is null or stage && array[stage_filter])
    and (symptom_filter is null or symptom && array[symptom_filter])
    and (archetype_filter is null or archetype && array[archetype_filter])
  order by embedding <=> query_embedding
  limit match_limit;
$$;

-- Index for vector similarity search
create index on rag_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Indexes for filtering
create index on rag_chunks using gin (stage);
create index on rag_chunks using gin (symptom);
create index on rag_chunks using gin (archetype);
create index on rag_chunks (language);

-- Prompt versions table
create table prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text,
  stage text check (stage in ('shadow','truth','integration')),
  content text,
  created_at timestamptz default now(),
  is_active boolean default true
);

-- Session state table
create table session_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  stage text check (stage in ('shadow','truth','integration')) default 'shadow',
  defensiveness int default 0,     -- 0..3
  acknowledgement int default 0,   -- 0..3
  readiness int default 0,         -- 0..3
  updated_at timestamptz default now()
);

-- Practices table
create table practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  practice_key text,       -- reference to protocols/
  assigned_at timestamptz default now(),
  due_at timestamptz,
  done boolean default false,
  self_report int,         -- 0..10
  note text
);

-- Indexes for better performance
create index on rag_chunks (title);
create index on rag_chunks (created_at);
create index on prompt_versions (stage);
create index on prompt_versions (is_active);
create index on session_state (user_id);
create index on session_state (session_id);
create index on practices (user_id);
create index on practices (session_id);
create index on practices (assigned_at);