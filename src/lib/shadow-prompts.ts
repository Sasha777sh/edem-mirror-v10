// Shadow v2 Onboarding Prompts - "Теневая ветка"
// Все тексты на русском, максимум 140 символов

import { OnbStep, Polarity } from './chat-fsm';

export interface ShadowPrompt {
    step: OnbStep;
    voice: 'soft' | 'hard' | 'therapist';
    utterance: string;
    hasButtons?: boolean;
    buttons?: string[];
}

// Шаг 1: Маска
export const ONB_1_MASK_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_1_mask',
        voice: 'soft',
        utterance: 'Кого ты показываешь миру, чтобы тебя приняли? Назови роль.'
    },
    hard: {
        step: 'onb_1_mask',
        voice: 'hard',
        utterance: 'Какая маска держит тебя в строю? Скажи одним словом: «умный», «сильный»…'
    },
    therapist: {
        step: 'onb_1_mask',
        voice: 'therapist',
        utterance: 'Зафиксируем роль, что помогает выживать. Как ты её называешь?'
    }
};

// Шаг 2: Триггер
export const ONB_2_TRIGGER_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_2_trigger',
        voice: 'soft',
        utterance: 'Когда эта маска включается сильнее всего? Ситуация/люди.'
    },
    hard: {
        step: 'onb_2_trigger',
        voice: 'hard',
        utterance: 'Что тебя запускает? Назови конкретный триггер.'
    },
    therapist: {
        step: 'onb_2_trigger',
        voice: 'therapist',
        utterance: 'Опиши контекст, где маска включается чаще всего.'
    }
};

// Шаг 3: Полюс (с кнопками)
export const ONB_3_POLARITY_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_3_polarity',
        voice: 'soft',
        utterance: 'Что ближе по сути? Выбери полюс чувства.',
        hasButtons: true,
        buttons: ['Потеря', 'Контроль', 'Отвержение', 'Вина', 'Стыд', 'Другое']
    },
    hard: {
        step: 'onb_3_polarity',
        voice: 'hard',
        utterance: 'Выбери корень. Без красивостей.',
        hasButtons: true,
        buttons: ['Потеря', 'Контроль', 'Отвержение', 'Вина', 'Стыд', 'Другое']
    },
    therapist: {
        step: 'onb_3_polarity',
        voice: 'therapist',
        utterance: 'Определим доминирующее чувство. Нажми вариант.',
        hasButtons: true,
        buttons: ['Потеря', 'Контроль', 'Отвержение', 'Вина', 'Стыд', 'Другое']
    }
};

// Шаг 4: Тело
export const ONB_4_BODY_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_4_body',
        voice: 'soft',
        utterance: 'Где это в теле? Грудь, горло, живот…'
    },
    hard: {
        step: 'onb_4_body',
        voice: 'hard',
        utterance: 'Где сидит? Грудь/горло/живот?'
    },
    therapist: {
        step: 'onb_4_body',
        voice: 'therapist',
        utterance: 'Локализуем ощущение. Где плотнее всего?'
    }
};

// Шаг 5: Одно слово
export const ONB_5_ONE_WORD_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_5_one_word',
        voice: 'soft',
        utterance: 'Назови это одним словом. Первое, что пришло.'
    },
    hard: {
        step: 'onb_5_one_word',
        voice: 'hard',
        utterance: 'Одно слово. Сейчас.'
    },
    therapist: {
        step: 'onb_5_one_word',
        voice: 'therapist',
        utterance: 'Зафиксируем кратко: одно слово-суть.'
    }
};

// Шаг 6: Цена маски / Согласие (с кнопками да/нет)
export const ONB_6_COST_AGREE_PROMPTS: Record<string, ShadowPrompt> = {
    soft: {
        step: 'onb_6_cost_agree',
        voice: 'soft',
        utterance: 'Что ты теряешь, когда держишь маску? Идём работать с этим?',
        hasButtons: true,
        buttons: ['Да', 'Нет']
    },
    hard: {
        step: 'onb_6_cost_agree',
        voice: 'hard',
        utterance: 'Цена маски — что уходит из жизни? Готов резать?',
        hasButtons: true,
        buttons: ['Да', 'Нет']
    },
    therapist: {
        step: 'onb_6_cost_agree',
        voice: 'therapist',
        utterance: 'Отметь цену удержания роли. Готов двигаться дальше?',
        hasButtons: true,
        buttons: ['Да', 'Нет']
    }
};

// Промпты для отказа (cost_agree = false)
export const DECLINE_PROMPTS: Record<string, string> = {
    soft: 'Понимаю. Возвращайся, когда будешь готов встретиться с тенью.',
    hard: 'Ясно. Без готовности — без результата. Приходи позже.',
    therapist: 'Фиксирую паузу. Время созреть — часть процесса. До встречи.'
};

// Переходные промпты после согласия
export const AGREEMENT_PROMPTS: Record<string, string> = {
    soft: 'Цена маски понятна. Пойдём резать — осторожно и честно.',
    hard: 'Готов. Режем быстро и точно. Держись.',
    therapist: 'Готовность зафиксирована. Переходим к анализу корня.'
};

// Получить промпт для шага и голоса
export function getShadowPrompt(step: OnbStep, voice: 'soft' | 'hard' | 'therapist'): ShadowPrompt {
    const promptMaps = {
        'onb_1_mask': ONB_1_MASK_PROMPTS,
        'onb_2_trigger': ONB_2_TRIGGER_PROMPTS,
        'onb_3_polarity': ONB_3_POLARITY_PROMPTS,
        'onb_4_body': ONB_4_BODY_PROMPTS,
        'onb_5_one_word': ONB_5_ONE_WORD_PROMPTS,
        'onb_6_cost_agree': ONB_6_COST_AGREE_PROMPTS
    };

    return promptMaps[step][voice];
}

// Маппинг кнопок полярности на внутренние значения
export function mapPolarityButton(buttonText: string): Polarity {
    const mapping: Record<string, Polarity> = {
        'Потеря': 'loss',
        'Контроль': 'control',
        'Отвержение': 'rejection',
        'Вина': 'guilt',
        'Стыд': 'shame',
        'Другое': 'other'
    };

    return mapping[buttonText] || 'other';
}

// Маппинг да/нет кнопок
export function mapAgreementButton(buttonText: string): boolean {
    return buttonText === 'Да';
}