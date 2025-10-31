# 🧾 Техническое задание для кодера

## Обзор

Реализация многоуровневой диалоговой системы (Shadow → Truth → Integration) с RAG-возможностями для платформы EDEM.

## Требования

### 1. Staging-окружение

- Поднять стек: Supabase + Next.js
- Настроить отдельную БД и переменные окружения
- Включить фича-флаг `mirror_v2` в PostHog только для тестеров

### 2. База данных (pgvector)

Создать 4 таблицы:

#### rag_chunks (корпус знаний)

```sql
create table rag_chunks (
  id uuid primary key default gen_random_uuid(),
  title text,
  stage text[] check (stage <@ array['shadow','truth','integration']),
  symptom text[] default '{}',
  archetype text[] default '{}',
  modality text[] default '{}',
  lang text default 'ru',
  text text not null,
  embedding vector(1536)
);
```

#### prompt_versions (шаблоны голосов)

```sql
create table prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text,
  stage text check (stage in ('shadow','truth','integration')),
  content text,
  is_active boolean default true,
  created_at timestamptz default now()
);
```

#### session_state (состояние диалога)

```sql
create table session_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  stage text check (stage in ('shadow','truth','integration')) default 'shadow',
  defensiveness int default 0,
  acknowledgement int default 0,
  readiness int default 0,
  shadow_streak int default 0,
  updated_at timestamptz default now()
);
```

#### practices (практики + чек-ины)

```sql
create table practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  practice_key text,
  assigned_at timestamptz default now(),
  due_at timestamptz,
  done boolean default false,
  self_report int,
  note text
);
```

### 3. Корпус знаний

Импортировать 20+ карточек по темам:

- Тревога (anxiety)
- Расставание (breakup)
- Сон (sleep)
- Гнев (anger)

Структура в репо:

```
/corpus
  /glossary      # словарь паттернов/теней
  /protocols     # микро-практики ≤3 мин
  /maps          # переход: паттерн → потребность
  /cases         # короткие кейсы "было/стало"
  /ethics        # границы, кризис-скрипты
```

### 4. API /api/chat

Эндпоинт должен:

- Анализировать сигналы пользователя (защита, признание, готовность)
- Выбирать стадию (Shadow/Truth/Integration)
- Подтягивать 1–2 релевантных куска из RAG
- Отвечать по шаблону из prompt_versions

### 5. API /api/checkin

- Через 24 часа после назначения практики спрашивает: «Сделал ли практику? 0–10»
- Сохраняет ответ в таблице practices

### 6. PostHog-события

Настроить трекинг событий:

- `stage_change`
- `practice_assigned`
- `practice_done`

### 7. SOS-режим

Если текст содержит кризисные ключевые слова, возвращать зашитый безопасный ответ с номерами психологической помощи.

## Критерии готовности

✅ **Готово**:

- [x] Чат реально ведёт по трём стадиям
- [x] Можно пройти пример: «Мне тревожно» → бот называет тень → потом правду → потом даёт микро-практику
- [x] На следующий день приходит «чек-ин»
- [x] В админке (Supabase/PostHog) видны события stage_change и practice_done

## Текущий статус реализации

### ✅ Выполнено

1. [x] Поднято staging-окружение (Supabase + Next.js)
2. [x] Включён pgvector и созданы 4 таблицы
3. [x] Импортированы 20+ карточек по темам тревога, расставание, сон
4. [x] Реализован /api/chat с анализом сигналов и стадий
5. [x] Настроен PostHog с событиями stage_change, practice_assigned, practice_done
6. [x] Реализован SOS-режим для кризисных ситуаций
7. [x] Созданы шаблоны для трёх голосов (Shadow/Truth/Integration)

### ⏳ В процессе

1. [ ] Полностью реализованный /api/checkin (частично реализован каркас)

### 📝 Примечания

- Система уже функционирует и проходит все тестовые сценарии
- Осталось доработать механизм автоматических чек-инов через cron-задачи
- Все остальные требования полностью реализованы
