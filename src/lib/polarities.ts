// Expanded polarity mapping with Russian keywords
export const POLARITIES = {
    // Base polarities
    'loss': {
        keywords: ['потеря', 'утрата', 'лишился', 'потерял', 'ушёл', 'умер', 'расстался'],
        label: 'Потеря'
    },
    'control': {
        keywords: ['контроль', 'управление', 'хватка', 'власть', 'не могу', 'беспомощность'],
        label: 'Контроль'
    },
    'rejection': {
        keywords: ['отвергли', 'отказ', 'не нужен', 'игнор', 'одиночество', 'бросили'],
        label: 'Отвержение'
    },
    'guilt': {
        keywords: ['вина', 'виноват', 'должен был', 'моя ошибка', 'из-за меня'],
        label: 'Вина'
    },
    'shame': {
        keywords: ['стыд', 'стыдно', 'позор', 'недостойный', 'плохой', 'неправильный'],
        label: 'Стыд'
    },
    // Extended polarities
    'anxiety': {
        keywords: ['тревога', 'беспокойство', 'волнение', 'страх', 'паника', 'нервы'],
        label: 'Тревога'
    },
    'emptiness': {
        keywords: ['пустота', 'бессмысленность', 'апатия', 'ничего не хочу', 'серость'],
        label: 'Пустота'
    },
    'anger': {
        keywords: ['злость', 'гнев', 'бесит', 'раздражение', 'ярость', 'негодование'],
        label: 'Злость'
    },
    'fear': {
        keywords: ['страх', 'боюсь', 'испуг', 'ужас', 'паранойя', 'фобия'],
        label: 'Страх'
    },
    'betrayal': {
        keywords: ['предательство', 'предали', 'обманули', 'подставили', 'изменили'],
        label: 'Предательство'
    },
    'helplessness': {
        keywords: ['беспомощность', 'бессилие', 'не справляюсь', 'сдаюсь', 'не могу'],
        label: 'Бессилие'
    }
} as const;

export type PolarityKey = keyof typeof POLARITIES;

// Map text to polarity using keywords
export function detectPolarity(text: string): PolarityKey | 'other' {
    const lowerText = text.toLowerCase();

    for (const [polarity, data] of Object.entries(POLARITIES)) {
        const hasKeyword = data.keywords.some(keyword =>
            lowerText.includes(keyword.toLowerCase())
        );
        if (hasKeyword) {
            return polarity as PolarityKey;
        }
    }

    return 'other';
}

// Get polarity options for UI
export function getPolarityOptions(): Array<{ key: PolarityKey | 'other', label: string }> {
    return [
        ...Object.entries(POLARITIES).map(([key, data]) => ({
            key: key as PolarityKey,
            label: data.label
        })),
        { key: 'other', label: 'Другое' }
    ];
}