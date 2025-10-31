import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

// Word of the day generator by voice
const WORD_LIBRARY = {
    soft: [
        { word: 'Принятие', meaning: 'Позволить себе быть в том состоянии, в котором ты есть', meditation: 'Сегодня — просто заметь, когда сопротивляешься тому, что есть. Выдохни и скажи: «Пока так».' },
        { word: 'Доверие', meaning: 'Отпустить контроль и позволить жизни течь', meditation: 'Найди одну вещь, которую можешь доверить миру сегодня. Отпусти.' },
        { word: 'Нежность', meaning: 'Мягкость к себе в моменты боли', meditation: 'Когда будет трудно — положи руку на сердце и скажи: «Я здесь для тебя».' },
        { word: 'Дыхание', meaning: 'Якорь в моменте настоящего', meditation: 'Каждый час делай 3 глубоких вдоха. Возвращайся в тело.' }
    ],
    hard: [
        { word: 'Правда', meaning: 'Видеть реальность без фильтров и иллюзий', meditation: 'Назови одну правду о себе, которую избегаешь. Скажи её вслух.' },
        { word: 'Действие', meaning: 'Движение вопреки сопротивлению', meditation: 'Сделай то, что откладывал. Сейчас. Без оправданий.' },
        { word: 'Граница', meaning: 'Чёткое «нет» тому, что тебя разрушает', meditation: 'Скажи «нет» одной вещи, которая крадёт твою энергию.' },
        { word: 'Сила', meaning: 'Способность выбирать свою реакцию', meditation: 'В сложной ситуации спроси: «Как бы поступил сильный я?»' }
    ],
    therapist: [
        { word: 'Осознанность', meaning: 'Наблюдение за своими мыслями и чувствами без оценки', meditation: 'Установи 3 напоминания в телефоне: спрашивай себя «Что я чувствую прямо сейчас?»' },
        { word: 'Интеграция', meaning: 'Объединение разных частей себя в целое', meditation: 'Вечером запиши: какие разные «я» проявлялись сегодня? Поблагодари каждого.' },
        { word: 'Процесс', meaning: 'Фокус на пути, а не на результате', meditation: 'Выбери одно дело и делай его медленно, осознанно, наслаждаясь процессом.' },
        { word: 'Баланс', meaning: 'Гармония между действием и покоем', meditation: 'Сегодня чередуй 25 минут активности с 5 минутами отдыха.' }
    ]
};

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get voice preference (default to soft)
        const { searchParams } = new URL(req.url);
        const voice = (searchParams.get('voice') as 'soft' | 'hard' | 'therapist') || 'soft';

        // Get day-based seed for consistency
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);

        const wordsForVoice = WORD_LIBRARY[voice];
        const todayWord = wordsForVoice[seed % wordsForVoice.length];

        return NextResponse.json({
            ...todayWord,
            voice,
            date: today
        });
    } catch (error) {
        console.error('Error getting word of the day:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
