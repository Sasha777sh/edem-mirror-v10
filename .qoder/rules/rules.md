---
trigger: manual
---
# 📦 Qoder Rules — полный комплект для проекта EDEM

> Скопируй файлы в каталог проекта. Правила — в `.qoder/rules/`. Дополнительно — `.env.example` и `migrations/002_edem_core.sql`.

---

## .qoder/rules/00-always.md
```md
Тип: Всегда применять

1) Пиши ответы и комментарии по-русски. Термины EN допустимы, пояснение — RU.
2) Не создавай заглушки/стабы без явной просьбы.
3) Не ломай существующий код. Breaking-изменения — только с миграционным планом и diff.
4) Не инициируй деплой/релиз. Предлагай PR + инструкции.
5) Перед любым PR: lint, typecheck, тесты, краткий risk & rollback в описании.
6) Любой API: rate-limit, проверка прав, санитайз, try/catch с нормализацией ошибок, негативные кейсы.
7) Любая LLM-логика: строгая JSON-схема, zod-валидация, timeouts, retry с джиттером, детерминированность в DEMO.
8) Любой ввод пользователя: санитайз, size-limit, защита от инъекций.
9) Секреты — только через ENV. Добавляй ключи в `.env.example`.
10) Дроби задачи, маленькие PR. Если объём > 300 строк — предложи декомпозицию.
```

---

## .qoder/rules/10-chat-edem.md
```md
Тип: Всегда применять

Протокол: intro → problem → polarity → body → oneWord → truth_cut → (PRO) archetype → today_step → practice → close.

Ответы модели ≤ 180 символов. Один шаг — один вопрос/инструкция.

JSON-схема:
{
  "nextStep": "clarify_polarity",
  "utterance": "строка ≤180",
  "update": {
    "inputs.problem": "...",
    "inputs.polarity": "loss|control|rejection|guilt|shame|other",
    "inputs.body": "...",
    "inputs.oneWord": "...",
    "output.truthCut": "...",
    "output.archetype": "...",
    "output.todayStep": "...",
    "output.practice": {"name":"...","how":"...","durationMin":5},
    "output.disclaimer": "..."
  }
}

DEMO: жёстко останавливаемся на truth_cut, открываем пейвол (A/B тексты по тону).
Safety: словарь RU/EN → мягкий дисклеймер, switch voice=therapist, ресурсы помощи.
События: demo_start, truth_cut, paywall_view, pro_buy_click, pro_buy_success, sos_click.
Ошибки LLM: 3 попытки → честная ошибка + сохранение state.
```

---

## .qoder/rules/20-wearos-sensors.md
```md
Тип: Всегда применять

Часы: Wear OS app + Foreground Service (уведомление «EDEM активен»).
IBI/HRV — из внешнего BLE (Polar/кольцо). Из Pixel Watch: HR/шаги/движение (Health Services).
Аудио — только по триггеру (HR↑/RMSSD↓/метка), 5–10 сек, явное разрешение, индикатор записи.
Энергопрофили: Eco / Normal / Focus.
Оффлайн-буфер (Room/ProtoBuf), ретраи с экспонентой.
Tile: HR, RMSSD, статус BLE, кнопка «Метка». Complication: мини-индекс.
Серверный /ingest: батчи, подпись user/device, дедуп, size-лимиты.
Никаких скрытых записей/хака прошивки.
```

---

## .qoder/rules/30-security.md
```md
Тип: Всегда применять

OWASP API Top-10: authn/authz, доступ только по user_id.
Rate-limit на все публичные /api/*.
Валидация входа (zod/DTO), 413 для больших payload’ов, лимиты на файл/аудио.
Логи без PII, только хэши/идентификаторы.
Шифрование чувствительных данных (аудио и т.п.).
CORS по allowlist. Безопасные заголовки (CSP, HSTS, X-CTO и т.д.).
Secrets — через ENV/Vault, ротация ключей.
Регрессионный тест: инъекции/IDOR/массовые запросы.
```

---

## .qoder/rules/40-git-and-deploy.md
```md
Тип: Всегда применять

Ветки: feature/* → PR в develop. В main — только релизы.
PR-чеклист: lint, types, tests, миграции (UP/DOWN), perf-замер, security-чек.
Деплой — только пайплайном, после ручного апрува.
Feature-флаги для незавершённых частей.
Миграции всегда с rollback и backfill-планом.
Никаких «горячих» пушей в прод.
```

---

## .qoder/rules/50-style-and-i18n.md
```md
Тип: Всегда применять

i18n RU/EN (next-intl). Все строки — в ресурсы.
1 экран = 1 идея. Короткие тексты, честные ошибки («Не получилось. Попробуй ещё раз.»).
Доступность: контраст, aria, клавиатура.
Лоадеры ≤ 1200 мс, скелетоны, оптимистичный UI.
Мобильный UX — приоритет.
```

---

## .qoder/rules/files-next-backend.md
```md
Тип: Конкретные файлы
Шаблоны: src/app/api/**/*.ts, src/lib/**/*.ts

Каждый route.ts: zod-схема входа, auth-гард, rate-limit, try/catch (нормализация), таймауты наружу.
lib/llm.ts: единая точка вызова LLM, ретраи, таймауты, JSON-валидация.
/api/edem/step: проверка шага FSM, запись в sessions, телеметрия.
/api/ingest: подпись устройства, дедуп, size-лимиты, очередь.
```

---

## .qoder/rules/files-android-wearos.md
```md
Тип: Конкретные файлы
Шаблоны: app/src/**/*.kt

ForegroundService с startForeground(), канал уведомлений.
BLE-слой отдельным модулем, автопереподключение, StateFlow.
Room: readings/events, батчи ≤1 МБ, GC старых записей.
WorkManager: отправка, backoff-политика.
TileService: лёгкий UI.
Разрешения: запрашивать явно, объяснять зачем и как выключить.
```

---

## .qoder/rules/decision-tests.md
```md
Тип: Модель решения
Сценарий: «Создать/обновить тесты».
— Если изменено >30 строк или затронут API/сервис — генерируй тесты.
— Покрытие: позитив/негатив/границы (rate-limit, auth, size-лимит).
— Фронт: тесты мини-чата, пейвола. Android: unit + instrumentation для Service/Tile.
```

---

## .qoder/rules/decision-migrations.md
```md
Тип: Модель решения
Сценарий: «Изменение схемы БД — создать миграции + план».
Всегда генерируй UP/DOWN, backfill-план, влияние на код, шаги релиза.
Миграции не применять автоматически.
```

---

## .qoder/rules/manual-checklists.md
```md
Тип: Применить вручную

### Чек-лист API
[ ] auth/roles
[ ] zod-валидация
[ ] rate-limit
[ ] логирование без PII
[ ] тесты ok/error/limit
[ ] негативные кейсы
[ ] дока вход/выход

### Чек-лист LLM-шага
[ ] schema-валид JSON
[ ] таймауты/ретраи
[ ] safety-флаги
[ ] демо-лимит/пейвол
[ ] event-лог

### Чек-лист Wear OS
[ ] батарея (профили)
[ ] аудио только по триггеру
[ ] шифрование локальных файлов
[ ] оффлайн-буфер/ретраи
[ ] Tile/Complication ок
```

---

## .env.example (минимум для веба и часов)
```env
# App
NEXT_PUBLIC_APP_URL=https://app.example.com
NODE_ENV=development

# Auth / DB
SUPABASE_URL=__fill__
SUPABASE_ANON_KEY=__fill__
SUPABASE_SERVICE_KEY=__fill__
DATABASE_URL=postgres://user:pass@host:5432/edem

# Payments (ЮKassa или Stripe — выбери одно)
# ЮKassa
YOOKASSA_SHOP_ID=__fill__
YOOKASSA_SECRET_KEY=__fill__
YOOKASSA_WEBHOOK_SECRET=__fill__

# Stripe (если нужно)
STRIPE_SECRET=__fill__
STRIPE_WEBHOOK=__fill__

# LLM
OPENAI_API_KEY=__fill__

# Security
CORS_ALLOWLIST=https://app.example.com,https://edem.example
```

---

## migrations/002_edem_core.sql
```sql
-- events для аналитики
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  type text not null,
  meta jsonb,
  ts timestamptz default now()
);
create index if not exists idx_events_user_ts on events(user_id, ts desc);

-- watch readings
create table if not exists watch_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null,
  hr int,
  ibi_ms int[],
  accel real[],
  src text check (src in ('pixel','polar','ring')),
  created_at timestamptz default now()
);
create index if not exists idx_wr_user_ts on watch_readings(user_id, ts desc);

-- watch events
create table if not exists watch_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ts timestamptz not null,
  kind text check (kind in ('spike','mark','audio')),
  payload jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_we_user_ts on watch_events(user_id, ts desc);

-- indices per day
create table if not exists indices_daily (
  user_id uuid not null,
  date date not null,
  stress_index int,
  hrv_rmssd_ms int,
  sleep_quality int,
  primary key(user_id, date)
);
```

---

## README (короткая инструкция)
```md
1) Скопируй файлы в проект.
2) Добавь `.qoder/rules/*` в репозиторий (или в .gitignore, если локальные).
3) Заполни `.env` по образцу.
4) Прогон миграции SQL.
5) В Qoder включи правила: Always — 00/10/20/30/40/50; Files — next-backend/android; Decision — tests/migrations; Manual — чек-листы при ревью.
```
