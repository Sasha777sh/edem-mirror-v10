#!/usr/bin/env ts-node

/**
 * Script to generate additional domain-specific corpus for the EDEM Mirror system
 * This script creates 20-30 additional cards for Anxiety, Breakup, and Sleep domains
 * following the same structure as the original generate-corpus.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

// Define the structure for our corpus entries
interface CorpusEntry {
    title: string;
    stage: ('shadow' | 'truth' | 'integration')[];
    symptom: string[];
    archetype: string[];
    modality: string[];
    lang: 'ru' | 'en';
    text: string;
}

// Additional corpus entries for Anxiety domain
const anxietyCorpus: CorpusEntry[] = [
    // Shadow stage entries
    {
        title: "Anxiety Spiral Recognition",
        stage: ["shadow"],
        symptom: ["anxiety", "worry"],
        archetype: ["worrier"],
        modality: ["body", "breath"],
        lang: "en",
        text: `I notice you're caught in an anxiety spiral - thoughts racing, body tensing. 
This is your mind trying to protect you by anticipating threats, but it's gone into overdrive.
Notice how your chest feels tight and your breath is shallow. 
This is your nervous system in fight-or-flight mode. 
Right now, you don't need to fix or change anything. 
Just witness this pattern without judgment. 
Your anxiety is information, not an enemy.`
    },
    {
        title: "Переоценка тревожности",
        stage: ["shadow"],
        symptom: ["anxiety", "fear"],
        archetype: ["worrier"],
        modality: ["body", "breath"],
        lang: "ru",
        text: `Я вижу, как ты зажат в тревожной спирали - мысли скачут, тело напряжено.
Это твой ум пытается защитить тебя, предвосхищая угрозы, но зашел в тупик.
Обрати внимание, как сжимается грудь и учащается дыхание.
Это твоя нервная система в режиме бей или беги.
Сейчас тебе не нужно ничего исправлять или менять.
Просто понаблюдай за этим паттерном без осуждения.
Твоя тревога - это информация, а не враг.`
    },
    // Truth stage entries
    {
        title: "Root of Anxiety",
        stage: ["truth"],
        symptom: ["anxiety", "uncertainty"],
        archetype: ["worrier"],
        modality: ["reflection"],
        lang: "en",
        text: `Your anxiety isn't random - it's pointing to something real.
What you're experiencing as anxiety is actually your sensitivity to uncertainty.
You have a deep need for safety and predictability, which is completely valid.
But life is inherently unpredictable, creating a fundamental tension.
The real question isn't how to eliminate anxiety, but how to relate to uncertainty differently.
What would it be like to make friends with not-knowing?
What part of you is trying to control outcomes that are actually beyond your control?`
    },
    {
        title: "Корень тревоги",
        stage: ["truth"],
        symptom: ["anxiety", "uncertainty"],
        archetype: ["worrier"],
        modality: ["reflection"],
        lang: "ru",
        text: `Твоя тревога не случайна - она указывает на нечто реальное.
То, что ты испытываешь как тревогу, на самом деле является твоей чувствительностью к неопределенности.
У тебя есть глубокая потребность в безопасности и предсказуемости, что совершенно естественно.
Но жизнь по своей сути непредсказуема, создавая фундаментальное напряжение.
Настоящий вопрос не в том, как устранить тревогу, а в том, как по-другому относиться к неопределенности.
Каково это - подружиться с неизвестностью?
Какая часть тебя пытается контролировать результаты, которые на самом деле вне твоего контроля?`
    },
    // Integration stage entries
    {
        title: "Anxiety Integration Practice",
        stage: ["integration"],
        symptom: ["anxiety", "stress"],
        archetype: ["worrier"],
        modality: ["body", "breath", "movement"],
        lang: "en",
        text: `Practice: Uncertainty Embodiment
1. Find a comfortable seated position
2. Place one hand on your heart, one on your belly
3. Take three deep breaths, feeling the contact
4. Now, consciously invite a tiny bit of uncertainty into your awareness
5. Notice what happens in your body without trying to change it
6. Breathe into that sensation, making space for it
7. Thank your nervous system for its protection
8. Set an intention to practice befriending uncertainty this week

Check-in tomorrow: How did it feel to make space for uncertainty today?`
    },
    {
        title: "Практика интеграции тревоги",
        stage: ["integration"],
        symptom: ["anxiety", "stress"],
        archetype: ["worrier"],
        modality: ["body", "breath", "movement"],
        lang: "ru",
        text: `Практика: Воплощение неопределенности
1. Найди удобную позу для сидения
2. Положи одну руку на сердце, другую на живот
3. Сделай три глубоких вдоха, ощущая контакт
4. Теперь сознательно пригласи крошечную часть неопределенности в свое осознание
5. Заметь, что происходит в теле, не пытаясь это изменить
6. Вдохни в это ощущение, создавая для него пространство
7. Поблагодари свою нервную систему за защиту
8. Установи намерение практиковать дружбу с неопределенностью на этой неделе

Завтрашняя проверка: Каково было создать пространство для неопределенности сегодня?`
    }
];

// Additional corpus entries for Breakup domain
const breakupCorpus: CorpusEntry[] = [
    // Shadow stage entries
    {
        title: "Heartbreak Pattern Recognition",
        stage: ["shadow"],
        symptom: ["heartbreak", "grief"],
        archetype: ["heartbroken"],
        modality: ["body", "emotion"],
        lang: "en",
        text: `I see how your heart is aching with this loss.
The pain you're feeling isn't just about the relationship ending.
It's about the death of a future you had imagined, a version of yourself that existed with this person.
Notice how grief moves through your body - the tightness in your chest, the lump in your throat.
This is your heart breaking open, not breaking down.
Don't rush to fix or distract yourself from this pain.
Just let yourself feel the full weight of this loss.
Your heartbreak is sacred.`
    },
    {
        title: "Распознавание паттерна разбитого сердца",
        stage: ["shadow"],
        symptom: ["heartbreak", "grief"],
        archetype: ["heartbroken"],
        modality: ["body", "emotion"],
        lang: "ru",
        text: `Я вижу, как твое сердце страдает от этой утраты.
Боль, которую ты испытываешь, связана не только с окончанием отношений.
Это смерть будущего, которое ты воображал, версии себя, которая существовала с этим человеком.
Обрати внимание, как горе движется по твоему телу - сжатие в груди, ком в горле.
Это твое сердце раскрывается, а не разрушается.
Не спеши исправлять или отвлекаться от этой боли.
Позволь себе почувствовать весь вес этой утраты.
Твое разбитое сердце свято.`
    },
    // Truth stage entries
    {
        title: "Attachment and Loss",
        stage: ["truth"],
        symptom: ["heartbreak", "loneliness"],
        archetype: ["heartbroken"],
        modality: ["reflection"],
        lang: "en",
        text: `What you're experiencing as heartbreak is actually the natural result of attachment.
You opened your heart, which is courageous and beautiful.
But in opening, you also became vulnerable to loss.
The pain of heartbreak isn't a malfunction - it's the price of love.
But there's something deeper here.
What part of yourself did you lose in this relationship?
What aspects of yourself did you suppress to maintain this connection?
How might this ending be an invitation to remember who you truly are?`
    },
    {
        title: "Привязанность и потеря",
        stage: ["truth"],
        symptom: ["heartbreak", "loneliness"],
        archetype: ["heartbroken"],
        modality: ["reflection"],
        lang: "ru",
        text: `То, что ты испытываешь как разбитое сердце, на самом деле является естественным результатом привязанности.
Ты открылось сердце, что является смелым и прекрасным.
Но, открываясь, ты также стала уязвимой для потери.
Боль разбитого сердца - это не сбой, это цена любви.
Но здесь есть нечто более глубокое.
Какую часть себя ты потеряла в этих отношениях?
Какие аспекты себя ты подавляла, чтобы сохранить эту связь?
Как это окончание может быть приглашением вспомнить, кто ты есть на самом деле?`
    },
    // Integration stage entries
    {
        title: "Heartbreak Integration Ritual",
        stage: ["integration"],
        symptom: ["heartbreak", "loneliness"],
        archetype: ["heartbroken"],
        modality: ["writing", "ritual"],
        lang: "en",
        text: `Integration Practice: Letters to Your Heart
1. Set aside 20 minutes of uninterrupted time
2. Write a letter to your heart from the relationship
   - What did you learn about love?
   - What parts of yourself did you discover?
   - What gifts did this experience bring?
3. Write a letter to your future self
   - What wisdom do you want to carry forward?
   - How will you love differently now?
   - What boundaries will you honor?
4. Read both letters aloud
5. Place them in a special location as a reminder of your growth

Check-in in two days: What new wisdom about love has emerged?`
    },
    {
        title: "Ритуал интеграции разбитого сердца",
        stage: ["integration"],
        symptom: ["heartbreak", "loneliness"],
        archetype: ["heartbroken"],
        modality: ["writing", "ritual"],
        lang: "ru",
        text: `Практика интеграции: Письма твоему сердцу
1. Выдели 20 минут непрерывного времени
2. Напиши письмо своему сердцу от отношений
   - Чему ты научилась о любви?
   - Какие части себя ты открыла?
   - Какие дары принес этот опыт?
3. Напиши письмо своему будущему Я
   - Какую мудрость ты хочешь взять с собой?
   - Как ты будешь любить по-другому теперь?
   - Какие границы ты будешь соблюдать?
4. Прочитай оба письма вслух
5. Положи их в особенное место как напоминание о твоем росте

Проверка через два дня: Какая новая мудрость о любви проявилась?`
    }
];

// Additional corpus entries for Sleep domain
const sleepCorpus: CorpusEntry[] = [
    // Shadow stage entries
    {
        title: "Nighttime Mind Racing",
        stage: ["shadow"],
        symptom: ["insomnia", "racing thoughts"],
        archetype: ["overthinker"],
        modality: ["mind", "body"],
        lang: "en",
        text: `I notice your mind is racing as you try to sleep.
Thoughts are cycling through - worries, to-do lists, conversations.
Your nervous system is in overdrive, making it hard to rest.
This isn't your fault or a personal failing.
Your mind is trying to solve problems and process the day.
But right now, it's 3 AM, not problem-solving time.
Notice the pattern without judgment.
Your racing thoughts are trying to help, even if they're not helping you sleep.`
    },
    {
        title: "Ночной марафон мыслей",
        stage: ["shadow"],
        symptom: ["insomnia", "racing thoughts"],
        archetype: ["overthinker"],
        modality: ["mind", "body"],
        lang: "ru",
        text: `Я вижу, как твой ум гоняет кругами, когда ты пытаешься уснуть.
Мысли кружатся - тревоги, списки дел, разговоры.
Твоя нервная система в режиме гиперактивности, мешая отдыху.
Это не твоя вина и не личная неудача.
Твой ум пытается решать проблемы и обрабатывать день.
Но сейчас 3 часа ночи, а не время для решения проблем.
Заметь паттерн без осуждения.
Твои скачущие мысли пытаются помочь, даже если это не помогает тебе спать.`
    },
    // Truth stage entries
    {
        title: "Sleep Resistance Pattern",
        stage: ["truth"],
        symptom: ["insomnia", "resistance"],
        archetype: ["overthinker"],
        modality: ["reflection"],
        lang: "en",
        text: `Your sleep issues aren't just about stress or a busy mind.
There's something deeper happening.
What you're experiencing as insomnia might actually be resistance to rest.
You have a deep need for control in a world that feels unpredictable.
Sleep requires surrender - letting go of control, letting go of doing.
But surrender feels unsafe to a part of you that believes staying alert protects you.
What would happen if you actually let yourself fully rest?
What are you afraid you might miss or lose if you truly let go?`
    },
    {
        title: "Паттерн сопротивления сну",
        stage: ["truth"],
        symptom: ["insomnia", "resistance"],
        archetype: ["overthinker"],
        modality: ["reflection"],
        lang: "ru",
        text: `Твои проблемы со сном связаны не только со стрессом или занятостью ума.
Происходит нечто более глубокое.
То, что ты испытываешь как бессонницу, на самом деле может быть сопротивлением отдыху.
У тебя есть глубокая потребность в контроле в мире, который кажется непредсказуемым.
Сон требует сдачи - отказа от контроля, отказа от действия.
Но сдача кажется небезопасной для части тебя, которая верит, что бдительность защищает тебя.
Что произойдет, если ты действительно позволишь себе полностью отдохнуть?
Чего ты боишься пропустить или потерять, если по-настоящему отпустишь?`
    },
    // Integration stage entries
    {
        title: "Sleep Integration Practice",
        stage: ["integration"],
        symptom: ["insomnia", "restlessness"],
        archetype: ["overthinker"],
        modality: ["body", "breath", "ritual"],
        lang: "en",
        text: `Integration Practice: Evening Transition Ritual
1. One hour before bed, begin your transition
2. Dim the lights and put away screens
3. Do a body scan from feet to head
4. Notice three things you're grateful for from today
5. Write down tomorrow's top 3 priorities (not 20!)
6. Place your hands on your heart and say:
   "I did my best today. I am safe. I can rest."
7. Set a gentle alarm for tomorrow with a meaningful intention

Check-in tomorrow morning: How did your transition ritual support rest?`
    },
    {
        title: "Практика интеграции сна",
        stage: ["integration"],
        symptom: ["insomnia", "restlessness"],
        archetype: ["overthinker"],
        modality: ["body", "breath", "ritual"],
        lang: "ru",
        text: `Практика интеграции: Вечерний ритуал перехода
1. За час до сна начни свой переход
2. Приглуши свет и убери экраны
3. Сделай сканирование тела от ног до головы
4. Отметь три вещи, за которые ты благодарна сегодня
5. Запиши 3 главных приоритета на завтра (не 20!)
6. Положи руки на сердце и скажи:
   "Я сделала всё, что могла сегодня. Я в безопасности. Я могу отдохнуть."
7. Поставь мягкий будильник на завтра с осмысленным намерением

Утренняя проверка: Как твой ритуал перехода поддержал отдых?`
    }
];

// Combine all corpus entries
const allCorpusEntries = [
    ...anxietyCorpus,
    ...breakupCorpus,
    ...sleepCorpus
];

// Function to save corpus entries to files
async function saveCorpusEntries(entries: CorpusEntry[]) {
    const corpusDir = path.join(process.cwd(), 'corpus');

    // Create directories if they don't exist
    const domains = ['anxiety', 'breakup', 'sleep'];
    const stages = ['shadow', 'truth', 'integration'];

    for (const domain of domains) {
        for (const stage of stages) {
            const dirPath = path.join(corpusDir, domain, stage);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        }
    }

    // Save each entry to the appropriate file
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        // Map symptoms to domains
        const symptomToDomain: Record<string, string> = {
            'anxiety': 'anxiety',
            'worry': 'anxiety',
            'fear': 'anxiety',
            'uncertainty': 'anxiety',
            'stress': 'anxiety',
            'heartbreak': 'breakup',
            'grief': 'breakup',
            'loneliness': 'breakup',
            'insomnia': 'sleep',
            'racing thoughts': 'sleep',
            'restlessness': 'sleep',
            'resistance': 'sleep'
        };

        const domain = symptomToDomain[entry.symptom[0]] || entry.symptom[0];
        const stage = entry.stage[0]; // Use first stage for directory
        const lang = entry.lang;

        // Create filename based on title
        const filename = `${entry.title.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_').toLowerCase()}.${lang}.yaml`;
        const filePath = path.join(corpusDir, domain, stage, filename);

        // Convert to YAML
        const yamlContent = yaml.dump(entry);

        // Write file
        fs.writeFileSync(filePath, yamlContent);
        console.log(`Created: ${filePath}`);
    }

    console.log(`\n✅ Successfully generated ${entries.length} corpus entries`);
    console.log(`📁 Files saved to: ${corpusDir}`);
}

// Main execution
async function main() {
    try {
        console.log('🌱 Generating starter corpus for EDEM Mirror system...\n');

        await saveCorpusEntries(allCorpusEntries);

        console.log('\n✨ Starter corpus generation complete!');
        console.log('\nTo import this corpus into your database, run:');
        console.log('npm run import-corpus\n');
    } catch (error) {
        console.error('Error generating corpus:', error);
        process.exit(1);
    }
}

// Run the script
main();