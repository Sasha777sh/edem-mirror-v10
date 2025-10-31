-- SQL script to import RAG cards into Supabase rag_chunks table
-- This script assumes the table structure from the 004_rag_system.sql migration

-- Create table if it doesn't exist
create table if not exists rag_chunks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  stage text[],
  symptom text[],
  archetype text[],
  lang text default 'ru',
  text jsonb not null,
  embedding vector(1536)  -- размер под OpenAI text-embedding-ada-002
);

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM rag_chunks;

-- Insert first 10 RAG cards
INSERT INTO rag_chunks (title, stage, symptom, archetype, lang, text) VALUES
('Тревога перед сном', '{shadow,truth,integration}', '{anxiety,sleep}', '{victim}', 'ru', '{
    "shadow": "Ты ложишься — и мозг орёт. Цена — тело истощается, даже во сне нет отдыха.",
    "truth": "Тебе нужна безопасность. Сон — сдача контроля. Ты боишься провалиться.",
    "integration": "3 минуты: глубокий вдох 4, выдох 6. Скажи: «Я доверяю телу». Завтра отметь, стало ли легче заснуть."
}'),
('Страх расставания', '{shadow,truth,integration}', '{breakup,fear}', '{victim,lover}', 'ru', '{
    "shadow": "Ты держишься за того, кто уходит. Цена — теряешь себя быстрее, чем его.",
    "truth": "Тебе важно быть нужным. Страх расставания — это страх пустоты внутри.",
    "integration": "1 минута: положи руку на грудь, скажи «Я остаюсь». Завтра спроси себя: что дал себе сам?"
}'),
('Гнев на близких', '{shadow,truth,integration}', '{anger,family}', '{persecutor}', 'ru', '{
    "shadow": "Ты орёшь на тех, кто рядом. Цена — рушишь мосты, чтобы не чувствовать слабость.",
    "truth": "Тебе нужна сила. Ты путаешь силу с криком. Гнев прячет страх быть уязвимым.",
    "integration": "2 минуты: напиши, что на самом деле хотел. Завтра попробуй сказать это без крика."
}'),
('Прокрастинация', '{shadow,truth,integration}', '{work,avoidance}', '{child}', 'ru', '{
    "shadow": "Ты откладываешь не дела. Ты откладываешь себя. Цена — жизнь мимо.",
    "truth": "Тебе важно признание. Ты боишься начать — потому что боишься провала.",
    "integration": "Возьми задачу на 2 минуты. Сделай. Завтра — ещё одну. Маленькие шаги двигают больше, чем план."
}'),
('Зависимость от отношений', '{shadow,truth,integration}', '{breakup,dependence}', '{lover,victim}', 'ru', '{
    "shadow": "Ты растворяешься в другом, потому что пуст внутри. Цена — исчезаешь.",
    "truth": "Тебе нужна опора в себе. Ты путаешь любовь с выживанием.",
    "integration": "3 минуты: сядь один. Почувствуй спину. Скажи: «Я стою». Завтра снова."
}'),
('Обесценивание других', '{shadow,truth,integration}', '{anger,envy}', '{persecutor}', 'ru', '{
    "shadow": "Ты режешь словами не их. Ты хочешь убить свою зависть. Цена — никто не остаётся рядом.",
    "truth": "Тебе важно признание. Ты нападаешь, чтобы не признаться в своей боли.",
    "integration": "Запиши одно качество другого человека, которое уважаешь. Заметь сопротивление."
}'),
('Ревность', '{shadow,truth,integration}', '{relationship,fear}', '{lover}', 'ru', '{
    "shadow": "Ты сходишь с ума не от них. Ты боишься быть заменённым. Цена — недоверие убивает любовь.",
    "truth": "Тебе нужна безопасность. Ревность — это крик страха потерять себя.",
    "integration": "1 минута: почувствуй грудь, положи руку. Скажи: «Я остаюсь собой». Завтра проверь: стал ли спокойнее."
}'),
('Вина после срыва', '{shadow,truth,integration}', '{guilt,anger}', '{victim,judge}', 'ru', '{
    "shadow": "Ты бичуешь себя, потому что думаешь: если накажешь — станешь лучше. Цена — вечный круг.",
    "truth": "Тебе важна ответственность. Вина держит тебя в прошлом, не давая действовать.",
    "integration": "Запиши: «Я сделал ошибку — и живой». 2 минуты: дыхание + шаг в новое действие."
}'),
('Самообесценивание', '{shadow,truth,integration}', '{selfesteem}', '{victim,child}', 'ru', '{
    "shadow": "Ты шепчешь «я никто», чтобы никто не ожидал от тебя. Цена — теряешь силу.",
    "truth": "Тебе важно признание. Ты гасишь себя раньше, чем мир скажет «нет».",
    "integration": "Запиши 1 вещь, что сделал сегодня. Завтра — добавь ещё одну."
}'),
('Зависимость от похвалы', '{shadow,truth,integration}', '{approval,selfesteem}', '{child,lover}', 'ru', '{
    "shadow": "Ты живёшь лайками, потому что сам себе не веришь. Цена — пустота, даже когда хлопают.",
    "truth": "Тебе нужна опора внутри. Внешнее признание — лишь суррогат.",
    "integration": "Закрой глаза. Назови вслух: «Я сделал X сегодня». Услышь себя."
}');

-- Verify the import
SELECT COUNT(*) as total_cards FROM rag_chunks;
SELECT title, symptom FROM rag_chunks ORDER BY ctid LIMIT 5;