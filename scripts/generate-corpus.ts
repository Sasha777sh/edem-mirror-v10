#!/usr/bin/env ts-node

/**
 * Script to generate starter corpus for RAG system
 * Usage: npm run generate-corpus
 */

import fs from 'fs/promises';
import path from 'path';

// Anxiety corpus
const anxietyCorpus = [
    {
        filename: 'anxiety/control_ru.yml',
        content: `title: Контроль как защита от страха
stage: [shadow, truth, integration]
symptom: [anxiety, breakup]
archetype: [rescuer, persecutor]
modality: [cognitive, body]
lang: ru
shadow: "Зеркало: вижу контроль. Триггер: когда другие свободны. Цена: ты теряешь доверие и связь."
truth: "Тебе важна безопасность. Ты закрываешь её контролем, потому что боишься провала и стыда."
integration:
  practice_key: "body/ground_30s"
  hint: "Стой, почувствуй стопы 30 сек, опиши 3 факта без интерпретаций."
text: |
  Контроль — типичная попытка управлять тревогой. Полезно на проектах, разрушает близость.`
    },
    {
        filename: 'anxiety/dismissal_ru.yml',
        content: `title: Обесценивание как защита
stage: [shadow, truth, integration]
symptom: [anxiety, self_doubt]
archetype: [victim]
modality: [cognitive]
lang: ru
shadow: "Зеркало: вижу обесценивание. Триггер: критика. Цена: упущенные возможности для роста."
truth: "Тебе важно чувствовать себя в безопасности. Ты закрываешь это через отрицание, потому что боишься быть уязвимыми."
integration:
  practice_key: "cognitive/reframe"
  hint: "Напиши 3 факта о критике и 3 о себе вне контекста критики."
text: |
  Обесценивание — защитный механизм, который помогает избегать боли от критики.`
    },
    {
        filename: 'protocols/body_ground_30s.yml',
        content: `key: body/ground_30s
title: Заземление 30 сек
duration_sec: 30
steps:
  - "Встань. Чувствуй стопы на полу, вес тела."
  - "Сделай 4 спокойных выдоха длиннее вдоха."
  - "Назови 3 факта из текущего момента."`
    }
];

// Breakup corpus
const breakupCorpus = [
    {
        filename: 'breakup/abandonment_ru.yml',
        content: `title: Страх abandonment как защита
stage: [shadow, truth, integration]
symptom: [breakup, anxiety]
archetype: [victim, lilith]
modality: [body, cognitive]
lang: ru
shadow: "Зеркало: вижу страх abandonment. Триггер: расставание/измена. Цена: одиночество и недоверие."
truth: "Тебе важно чувствовать связь и принятие. Ты закрываешь это через цепляние, потому что боишься быть отвергнутым."
integration:
  practice_key: "body/breath_478"
  hint: "4 сек вдох, 7 сек удержание, 8 сек выдох. Повторить 3 раза."
text: |
  Страх abandonment активируется при угрозе потери близких отношений.`
    },
    {
        filename: 'protocols/cognitive_reframe.yml',
        content: `key: cognitive/reframe
title: Переоценка ситуации
duration_sec: 120
steps:
  - "Опиши ситуацию в 1 предложении."
  - "Назови 3 факта о ситуации."
  - "Назови 3 альтернативных объяснения."
  - "Выбери самое щадящее объяснение."`
    }
];

// Sleep corpus
const sleepCorpus = [
    {
        filename: 'sleep/racing_mind_ru.yml',
        content: `title: Беспокойный ум перед сном
stage: [shadow, truth, integration]
symptom: [sleep, anxiety]
archetype: [victim]
modality: [breath, cognitive]
lang: ru
shadow: "Зеркало: вижу беспокойный ум. Триггер: вечерние размышления. Цена: усталость и раздражение."
truth: "Тебе важно обработать день. Ты закрываешь это через rumination, потому что боишься упустить что-то важное."
integration:
  practice_key: "breath/box"
  hint: "Вдох 4 сек, удержание 4 сек, выдох 4 сек, пауза 4 сек. 5 кругов."
text: |
  Беспокойный ум перед сном — способ ума обработать незавершенные дела дня.`
    },
    {
        filename: 'protocols/breath_box.yml',
        content: `key: breath/box
title: Квадратное дыхание
duration_sec: 180
steps:
  - "Вдох 4 секунды."
  - "Удержание 4 секунды."
  - "Выдох 4 секунды."
  - "Пауза 4 секунды."
  - "Повторить 5 раз."`
    }
];

// Maps (transitions)
const mapsCorpus = [
    {
        filename: 'maps/control_to_safety_ru.yml',
        content: `title: От контроля к безопасности
stage: [truth]
symptom: [anxiety, breakup]
archetype: [rescuer, persecutor]
modality: [cognitive, body]
lang: ru
shadow: "Зеркало: вижу контроль как защиту."
truth: "На самом деле тебе важно чувство безопасности. Сейчас ты закрываешь эту потребность через контроль, потому что боишься провала и стыда. Место выбора: довериться процессу и принять неопределенность как часть жизни."
integration:
  practice_key: "body/ground_30s"
  hint: "Постой спокойно 30 секунд, ощути опору ног."
text: |
  Контроль — попытка управлять внешним, чтобы почувствовать внутреннюю безопасность.`
    }
];

async function generateCorpus() {
    try {
        console.log('Generating starter corpus...');

        // Create main corpus directory if it doesn't exist
        const corpusDir = path.join(process.cwd(), 'corpus');
        try {
            await fs.access(corpusDir);
        } catch {
            await fs.mkdir(corpusDir, { recursive: true });
        }

        // Create subdirectories
        const dirs = ['glossary/anxiety', 'glossary/breakup', 'glossary/sleep', 'protocols', 'maps'];
        for (const dir of dirs) {
            const fullPath = path.join(corpusDir, dir);
            try {
                await fs.access(fullPath);
            } catch {
                await fs.mkdir(fullPath, { recursive: true });
            }
        }

        // Write anxiety corpus
        for (const item of anxietyCorpus) {
            const filePath = path.join(process.cwd(), 'corpus', item.filename);
            // Create directory if it doesn't exist
            const dirPath = path.dirname(filePath);
            try {
                await fs.access(dirPath);
            } catch {
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(filePath, item.content);
            console.log(`Created: ${item.filename}`);
        }

        // Write breakup corpus
        for (const item of breakupCorpus) {
            const filePath = path.join(process.cwd(), 'corpus', item.filename);
            // Create directory if it doesn't exist
            const dirPath = path.dirname(filePath);
            try {
                await fs.access(dirPath);
            } catch {
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(filePath, item.content);
            console.log(`Created: ${item.filename}`);
        }

        // Write sleep corpus
        for (const item of sleepCorpus) {
            const filePath = path.join(process.cwd(), 'corpus', item.filename);
            // Create directory if it doesn't exist
            const dirPath = path.dirname(filePath);
            try {
                await fs.access(dirPath);
            } catch {
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(filePath, item.content);
            console.log(`Created: ${item.filename}`);
        }

        // Write maps corpus
        for (const item of mapsCorpus) {
            const filePath = path.join(process.cwd(), 'corpus', item.filename);
            // Create directory if it doesn't exist
            const dirPath = path.dirname(filePath);
            try {
                await fs.access(dirPath);
            } catch {
                await fs.mkdir(dirPath, { recursive: true });
            }
            await fs.writeFile(filePath, item.content);
            console.log(`Created: ${item.filename}`);
        }

        console.log('Starter corpus generation completed!');
    } catch (error) {
        console.error('Error generating corpus:', error);
        process.exit(1);
    }
}

// Run the generation
generateCorpus().then(() => {
    console.log('Corpus generation script completed');
    process.exit(0);
}).catch((error) => {
    console.error('Error running generation script:', error);
    process.exit(1);
});