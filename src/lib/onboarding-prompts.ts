// Onboarding prompts based on Belfort's "Straight Line" methodology
// Структура: боль → усиление → мечта → решение
// Принцип: каждый вопрос = одна цель = быстрый ответ (как "нож")

export interface OnboardingPrompt {
    stage: 'problem_capture' | 'pain_amplification' | 'future_vision' | 'truth_reveal';
    question: string;
    options?: string[];
    voice: 'soft' | 'hard' | 'therapist';
    followUp?: string;
    timing?: number; // seconds to wait before follow-up
}

// ЭТАП 1: Подхватить проблему (создать связь)
// Принцип Белфорда: 3 кнопки = быстрый выбор = никаких раздумий
export const PROBLEM_CAPTURE: Record<string, OnboardingPrompt> = {
    soft: {
        stage: 'problem_capture',
        voice: 'soft',
        question: 'Что больше всего мешает тебе сейчас?',
        options: ['Тревога и страхи', 'Отношения с людьми', 'Деньги и работа'],
        followUp: 'Понимаю. Это тяжело, когда накрывает каждый день.',
        timing: 2
    },
    hard: {
        stage: 'problem_capture',
        voice: 'hard',
        question: 'Что сжирает твою энергию прямо сейчас?',
        options: ['Тревога', 'Отношения', 'Деньги'],
        followUp: 'Ясно. Надоело терпеть?',
        timing: 1
    },
    therapist: {
        stage: 'problem_capture',
        voice: 'therapist',
        question: 'Определим основную область дискомфорта.',
        options: ['Тревожные состояния', 'Межличностные отношения', 'Финансовые вопросы'],
        followUp: 'Хорошо. Это значимая область для работы.',
        timing: 3
    }
};

// ЭТАП 2: Усилить боль (чтобы создать мотивацию)
// Белфорт: "Боль должна стать невыносимой для покупки"
export const PAIN_AMPLIFICATION: Record<string, OnboardingPrompt> = {
    soft: {
        stage: 'pain_amplification',
        voice: 'soft',
        question: 'Если честно, что это отбирает у тебя больше всего?',
        options: ['Энергию на жизнь', 'Спокойный сон', 'Веру в себя'],
        followUp: 'Да, это забирает самое важное. Сколько месяцев ты это терпишь?',
        timing: 2
    },
    hard: {
        stage: 'pain_amplification',
        voice: 'hard',
        question: 'Что это сжирает в тебе каждый день?',
        options: ['Энергию', 'Сон', 'Уверенность'],
        followUp: 'Понял. Сколько ещё будешь кормить эту дыру?',
        timing: 1
    },
    therapist: {
        stage: 'pain_amplification',
        voice: 'therapist',
        question: 'Какой ресурс страдает больше остальных?',
        options: ['Энергетический баланс', 'Качество сна', 'Самооценка'],
        followUp: 'Это влияет на качество жизни. Как долго длится состояние?',
        timing: 3
    }
};

// ЭТАП 3: Показать мечту (будущее без проблемы)
// Белфорт: "Сначала они должны захотеть, потом покупают"
export const FUTURE_VISION: Record<string, OnboardingPrompt> = {
    soft: {
        stage: 'future_vision',
        voice: 'soft',
        question: 'Если это ушло бы завтра — что стало бы легче всего?',
        options: ['Дышать полной грудью', 'Спать без тревог', 'Просто быть собой'],
        followUp: 'Представь: завтра утром просыпаешься — и этого груза нет.',
        timing: 3
    },
    hard: {
        stage: 'future_vision',
        voice: 'hard',
        question: 'Если бы это исчезло завтра — что сделал бы первым?',
        options: ['Вздохнул полной грудью', 'Выспался нормально', 'Перестал извиняться'],
        followUp: 'Видишь? А сейчас ты от этого отрезан.',
        timing: 2
    },
    therapist: {
        stage: 'future_vision',
        voice: 'therapist',
        question: 'Какое изменение в самочувствии наиболее ценно?',
        options: ['Свободное дыхание', 'Качественный отдых', 'Внутренняя уверенность'],
        followUp: 'Это достижимо. Найдём путь к этому состоянию.',
        timing: 4
    }
};

// ЭТАП 4: Truth reveal (первый удар правды)
// Белфорт: "Ударь правдой, когда они готовы, затем продай решение"
export const TRUTH_REVEAL_TEMPLATES: Record<string, Record<string, string>> = {
    anxiety: {
        soft: 'Слушай... это не про тревогу. Это про контроль. Ты держишься за иллюзию безопасности.',
        hard: 'Вскрою: это не тревога. Ты боишься потери контроля.',
        therapist: 'Вижу паттерн: тревога — способ контролировать неопределённость.'
    },
    relationships: {
        soft: 'Понимаю... это не про людей. Это про страх отвержения. Ты цепляешься за одобрение.',
        hard: 'Правда: проблема не в людях. Ты боишься, что не примут.',
        therapist: 'Механизм ясен: сложности в отношениях = страх отвержения.'
    },
    money: {
        soft: 'Знаешь что... это не про деньги. Это про свободу. Ты боишься беспомощности.',
        hard: 'Реальность: дело не в деньгах. Ты боишься беспомощности.',
        therapist: 'Суть понятна: финансовые страхи = потребность в контроле.'
    }
};

// Генератор промптов для онбординга
// Принцип: каждый этап = один clear action = быстрый прогресс
export function generateOnboardingPrompt(
    stage: OnboardingPrompt['stage'],
    voice: 'soft' | 'hard' | 'therapist',
    previousAnswers?: string[]
): OnboardingPrompt {

    switch (stage) {
        case 'problem_capture':
            return PROBLEM_CAPTURE[voice];
        case 'pain_amplification':
            return PAIN_AMPLIFICATION[voice];
        case 'future_vision':
            return FUTURE_VISION[voice];
        case 'truth_reveal':
            // Определяем категорию по первому ответу (быстро и точно)
            const problemCategory = previousAnswers?.[0]?.toLowerCase().includes('тревог') ? 'anxiety' :
                previousAnswers?.[0]?.toLowerCase().includes('отношен') ? 'relationships' : 'money';

            return {
                stage: 'truth_reveal',
                voice,
                question: TRUTH_REVEAL_TEMPLATES[problemCategory][voice],
                followUp: voice === 'soft' ? 'Готов увидеть план действий?' :
                    voice === 'hard' ? 'Делаем шаги или болтаем дальше?' :
                        'Переходим к работе с механизмом?',
                timing: 2
            };
        default:
            return PROBLEM_CAPTURE[voice];
    }
}

// Дополнительные функции для оптимизации конверсии
export function getOnboardingMetrics(voice: string, stage: string) {
    // Трекинг времени на каждом этапе для оптимизации
    const optimalTimings: Record<string, Record<string, number>> = {
        soft: { problem_capture: 15, pain_amplification: 20, future_vision: 25, truth_reveal: 10 },
        hard: { problem_capture: 8, pain_amplification: 12, future_vision: 15, truth_reveal: 5 },
        therapist: { problem_capture: 25, pain_amplification: 30, future_vision: 35, truth_reveal: 15 }
    };

    return optimalTimings[voice]?.[stage] || 15;
}

export function getConversionTriggers(voice: string, answers: string[]) {
    // Возвращает триггеры для показа paywall на основе ответов
    const urgencyLevel = answers.some(a =>
        a.includes('месяц') || a.includes('год') || a.includes('долго')
    ) ? 'high' : 'medium';

    return {
        urgencyLevel,
        showPaywallAfter: urgencyLevel === 'high' ? 'truth_reveal' : 'future_vision',
        paywallCopy: voice === 'hard' ? 'Хватит терпеть. Делаем?' : 'Готов к изменениям?'
    };
}