-- Включаем pgvector (если ещё не включён)
create extension if not exists vector;

-- Добавим колонку, если вдруг её нет
do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_name='rag_chunks' and column_name='embedding'
  ) then
    alter table rag_chunks add column embedding vector(3072); -- под text-embedding-3-large
  end if;
end$$;

-- Индекс для быстрого поиска (IVFFLAT). Создавать после заполнения первых ~100 строк.
create index if not exists rag_chunks_embedding_idx
  on rag_chunks using ivfflat (embedding vector_cosine) with (lists = 100);

-- Полезные частичные индексы по метаданным
create index if not exists rag_chunks_stage_gin on rag_chunks using gin (stage);
create index if not exists rag_chunks_symptom_gin on rag_chunks using gin (symptom);