import { createServerSupabase } from '@/lib/supabase-server';
import { EDEM_LIVING_LLM_CONFIG } from '@/config/edem-living-llm';

interface RitualMemory {
  ritual: string;
  // Add other properties if needed
}

/**
 * Select appropriate ritual based on emotion, scene, and user history
 */
export async function selectRitual(emotion: string, scene: string, userId: string): Promise<string> {
    const supabase = createServerSupabase();

    // Get user's recent rituals to avoid repetition
    const { data: recentRituals, error } = await supabase
        .from('ritual_memory')
        .select('ritual')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

    const usedRituals = recentRituals?.map((r: RitualMemory) => r.ritual) || [];

    // Base rituals mapped to emotions
    const emotionRituals: Record<string, string[]> = {
        'тревога': [
            'Положи руку на живот и дыши 3 раза',
            'Посмотри в одну точку и ничего не делай 30 секунд',
            'Шепни себе: "Я здесь. Всё будет"',
            'Почувствуй вес тела на стуле'
        ],
        'стыд': [
            'Посмотри в зеркало и скажи: "Я есть"',
            'Напиши 3 слова, которые ты боишься сказать вслух',
            'Положи руку на сердце — оно бьется',
            'Скажи: "Я имею право быть неидеальным"'
        ],
        'обида': [
            'Сожми кулаки и медленно разожми — пусть уходит',
            'Ударь подушку — не стыдно',
            'Напиши письмо и сожги (в мыслях)',
            'Почувствуй, как напряжение уходит'
        ],
        'одиночество': [
            'Обними себя — две руки, как два друга',
            'Положи руку на сердце — оно с тобой',
            'Скажи вслух: "Я не один"',
            'Почувствуй тепло своих рук'
        ],
        'пустота': [
            'Почувствуй вес тела на стуле — ты здесь',
            'Посмотри на лампу — её свет есть',
            'Дотронься до чего-то твердого',
            'Скажи: "Я чувствую — значит, я есть"'
        ],
        'печаль': [
            'Позволь себе поплакать — это не слабость',
            'Обними мягкую игрушку или подушку',
            'Посмотри на небо — оно тоже плачет облаками',
            'Шепни себе: "Мне больно, и это нормально"'
        ]
    };

    // Get available rituals for this emotion
    const availableRituals = (emotionRituals[emotion] || emotionRituals['тревога'])
        .filter(ritual => !usedRituals.includes(ritual));

    // If all rituals have been used recently, use any ritual
    const ritualsToChooseFrom = availableRituals.length > 0
        ? availableRituals
        : (emotionRituals[emotion] || emotionRituals['тревога']);

    // Return random ritual from available options
    return ritualsToChooseFrom[Math.floor(Math.random() * ritualsToChooseFrom.length)];
}

/**
 * Get all available rituals for testing/display
 */
export function getAllRituals(): Record<string, string[]> {
    return {
        'тревога': [
            'Положи руку на живот и дыши 3 раза',
            'Посмотри в одну точку и ничего не делай 30 секунд',
            'Шепни себе: "Я здесь. Всё будет"',
            'Почувствуй вес тела на стуле'
        ],
        'стыд': [
            'Посмотри в зеркало и скажи: "Я есть"',
            'Напиши 3 слова, которые ты боишься сказать вслух',
            'Положи руку на сердце — оно бьется',
            'Скажи: "Я имею право быть неидеальным"'
        ],
        'обида': [
            'Сожми кулаки и медленно разожми — пусть уходит',
            'Ударь подушку — не стыдно',
            'Напиши письмо и сожги (в мыслях)',
            'Почувствуй, как напряжение уходит'
        ],
        'одиночество': [
            'Обними себя — две руки, как два друга',
            'Положи руку на сердце — оно с тобой',
            'Скажи вслух: "Я не один"',
            'Почувствуй тепло своих рук'
        ],
        'пустота': [
            'Почувствуй вес тела на стуле — ты здесь',
            'Посмотри на лампу — её свет есть',
            'Дотронься до чего-то твердого',
            'Скажи: "Я чувствую — значит, я есть"'
        ],
        'печаль': [
            'Позволь себе поплакать — это не слабость',
            'Обними мягкую игрушку или подушку',
            'Посмотри на небо — оно тоже плачет облаками',
            'Шепни себе: "Мне больно, и это нормально"'
        ]
    };
}