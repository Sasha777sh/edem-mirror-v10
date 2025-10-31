# edem-living-agent

Независимый прототип «живого» слоя поверх LLM: память-как‑искажение, фазы/ритмы, «рана», миф, рефлексия и редкие отклонения от вероятного ответа.

— Изолирован от основного проекта EDEM. Можно запускать локально и деплоить отдельно.

## Стек
- TypeScript (Node 18+)
- Fastify (HTTP API)
- Zod (валидация)
- OpenAI SDK (опционально, если есть `OPENAI_API_KEY`)
- Хранилище: файл `.data/state.json` (по умолчанию) или in-memory

## Быстрый старт
```bash
cd edem-living-agent
npm install
cp .env.example .env   # при наличии ключа OpenAI добавьте его сюда
npm run dev
# Откройте UI: http://localhost:3100/
# Health:      http://localhost:3100/health
```

## Примеры запросов
Ответ с «живым слоем» (через UI проще):
```bash
curl -s -X POST http://localhost:3100/api/respond \
  -H 'Content-Type: application/json' \
  -d '{"userId":"u1","message":"Я чувствую, что теряю себя"}' | jq
```
Тишина:
```bash
curl -s http://localhost:3100/api/silence | jq
```
Задать архетип:
```bash
curl -s -X PUT http://localhost:3100/api/archetype \
  -H 'Content-Type: application/json' \
  -d '{"userId":"u1","archetype":"wanderer"}' | jq
```

## Переменные окружения
См. `.env.example`:
- `PORT` — порт сервера (по умолчанию 3100)
- `OPENAI_API_KEY` — опционально; если задан, используется OpenAI для генерации текста

## Структура
```
edem-living-agent/
├─ src/
│  ├─ server.ts                 # Fastify сервер и маршруты
│  ├─ core/livingCore.ts        # Оркестратор живого ответа
│  ├─ memory/fractalMemory.ts   # Память-как‑искажение
│  ├─ phase/phaseEngine.ts      # Фазы/ритмы
│  ├─ wound/woundFilter.ts      # «Рана» как фильтр
│  ├─ myth/mythContext.ts       # Миф/легенда
│  ├─ reflect/reflection.ts     # Саморефлексия
│  ├─ choice/choiceDeviator.ts  # Отклонение от вероятного
│  ├─ adapters/llm.ts           # Адаптер LLM (OpenAI | rule-based)
│  ├─ storage/fileStorage.ts    # Простое файловое хранилище состояния
│  └─ types.ts                  # Общие типы
├─ .data/state.json             # Персистентное состояние (автосоздание)
├─ .env.example
├─ package.json
├─ tsconfig.json
└─ README.md
```

## Примечания
- Проект специально минимален. Легко заменить file-storage на БД (например, SQLite/Drizzle) при необходимости.
- Без `OPENAI_API_KEY` ответы генерируются правил-based генератором, достаточным для UX‑оценки «живого слоя».
