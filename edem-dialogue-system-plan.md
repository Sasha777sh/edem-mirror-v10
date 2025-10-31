# EDEM Многоуровневый Диалог: План Реализации

## 1. Архитектура Системы

### 1.1. Три Режима Ответа

1. **Shadow (Тень)** - отзеркаливание паттерна без советов
2. **Truth (Правда)** - корневая потребность и контекст выбора
3. **Spirit/Integration (Дух/Интеграция)** - микро-шаг и закрепление

### 1.2. Машина Состояний

```
stateDiagram-v2
    [*] --> Shadow
    Shadow --> Truth: user_acknowledged OR low_defensiveness
    Shadow --> Shadow: defensiveness_high OR avoidance
    Truth --> Integration: user_accepts_need AND readiness_score>=2
    Truth --> Shadow: denial OR blame_spike
    Integration --> Truth: practice_fail OR confusion
    Integration --> [*]: 3 successful check-ins
```

### 1.3. Шаблоны Ответов

- Shadow: "Зеркало → Название паттерна → Маркер запуска → Цена паттерна"
- Truth: "Что на самом деле хочешь → Как паттерн закрывает это криво → Где есть выбор сейчас"
- Integration: "1 мини-практика → якорь в теле → чек-ин на завтра"

## 2. Единый Корпус Знаний (RAG)

### 2.1. Структура Базы Знаний

- glossary/ - словарь паттернов и архетипов
- protocols/ - микро-практики (1-3 минуты)
- maps/ - карты переходов паттерн→потребность
- cases/ - кейсы "было/стало"
- ethics/ - границы и кризис-скрипты

### 2.2. Метаданные Чанков

```json
{
  "id": "...",
  "title": "Гнев как защита от стыда",
  "stage": ["shadow","truth","integration"],
  "symptom": ["anxiety","breakup","anger","sleep"],
  "archetype": ["rescuer","persecutor","victim","lilith"],
  "modality": ["body","breath","music","cognitive"],
  "language": "ru",
  "reading_time": 1.5
}
```

## 3. Версионирование и Управление

### 3.1. Таблица prompt_versions

| id | name | stage | content | created_at | is_active |
|----|------|-------|---------|------------|-----------|
| 1 | shadow_v1 | shadow | ...template... | ... | true |
| 2 | truth_v1 | truth | ...template... | ... | true |
| 3 | integ_v1 | integration | ...template... | ... | true |

### 3.2. Таблица rag_chunks

| id | title | stage[] | symptom[] | archetype[] | modality[] | lang | text | embedding vector |

## 4. Схемы БД для Состояния Пользователя

```sql
-- текущая стадия и сигналы
create table session_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  session_id uuid,
  stage text check (stage in ('shadow','truth','integration')) default 'shadow',
  defensiveness int default 0,     -- 0..3
  acknowledgement int default 0,   -- 0..3
  readiness int default 0,         -- 0..3
  updated_at timestamptz default now()
);

-- задания/практики
create table practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  session_id uuid,
  practice_key text,       -- ссылка на protocols/
  assigned_at timestamptz default now(),
  due_at timestamptz,
  done boolean default false,
  self_report int,         -- 0..10
  note text
);
```

## 5. Маршрут в Коде (TypeScript)

```typescript
type Stage = 'shadow' | 'truth' | 'integration';

function decideStage(sig: {
  defensiveness: number; // 0..3
  acknowledged: boolean;
  readiness: number;     // 0..3
  current: Stage;
}): Stage {
  if (sig.defensiveness >= 2) return 'shadow';
  if (sig.acknowledged && sig.current === 'shadow') return 'truth';
  if (sig.readiness >= 2) return 'integration';
  return sig.current;
}

// пример пайплайна
async function handleMessage(input: string, userId: string) {
  const sig = await detectSignals(input); // простая эвристика + классификатор
  const current = await getCurrentStage(userId);

  const stage = decideStage({ ...sig, current });

  const query = buildRagQuery({ stage, input /* +symptom, archetype*/ });
  const context = await ragSearch(query); // pgvector + фильтры метаданных

  const template = await loadPromptTemplate(stage); // из prompt_versions
  const system = buildSystemMessage(); // из §3
  const policy = buildPolicyMessage(); // из §3

  const answer = await callLLM({
    system, developer: policy, context, template, user: input
  });

  await saveStage(userId, stage, sig);
  if (stage === 'integration') await scheduleCheckIn(userId);

  return answer;
}
```

## 6. Безопасность и Кризисы

- Маркеры кризиса/суицида → безопасный ответ + контакты помощи + завершение
- Логирование с флагом crisis=true
- Без "терапевт-советов" - только self-help

## 7. Метрики Качества

- % переходов Shadow→Truth за 1-2 хода (≥60%)
- Доля возвратов на чек-ин (D1/D2)
- Процент выполнения практик (self_report≥1)
- Ограничение пребывания в Shadow (≤2 хода)

## 8. Внедрение в Стек

- Supabase: pgvector, таблицы rag_chunks, prompt_versions, session_state, practices
- ETL: YAML/Markdown → нарезка → эмбеддинги → insert
- API: /api/chat, /api/checkin
- Лендинг: онбординг с маркерами симптомов
- PostHog: события stage_change, practice_assigned, practice_done
