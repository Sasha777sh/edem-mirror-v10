// Генератор шагов на день для PRO-версии
// Принцип: одно действие, измеримое, ≤20 минут, конкретное

export interface TodayStep {
    id: string;
    action: string;
    check: string; // как проверить выполнение
    timeMin: number;
    category: 'communication' | 'self_care' | 'boundaries' | 'expression' | 'physical';
}

const STEP_TEMPLATES: Record<string, TodayStep[]> = {
    // Для полярности control
    control: [
        {
            id: 'delegate_one_task',
            action: 'Выбери одну задачу и делегируй её кому-то сегодня',
            check: 'Задача передана, получено подтверждение',
            timeMin: 10,
            category: 'boundaries'
        },
        {
            id: 'leave_one_unfinished',
            action: 'Оставь одно дело на 80% готовности и не доделывай сегодня',
            check: 'Дело остановлено, не возвращался к нему',
            timeMin: 5,
            category: 'boundaries'
        },
        {
            id: 'ask_for_help',
            action: 'Попроси помощи у кого-то в том, с чем справляешься сам',
            check: 'Помощь запрошена, получен ответ',
            timeMin: 15,
            category: 'communication'
        }
    ],

    // Для полярности rejection
    rejection: [
        {
            id: 'initiate_contact',
            action: 'Напиши первым тому, с кем давно не общался',
            check: 'Сообщение отправлено',
            timeMin: 10,
            category: 'communication'
        },
        {
            id: 'express_need',
            action: 'Скажи близкому человеку, что тебе от него нужно прямо сейчас',
            check: 'Потребность озвучена открыто',
            timeMin: 15,
            category: 'expression'
        },
        {
            id: 'join_activity',
            action: 'Присоединись к групповой активности (чат, встреча, звонок)',
            check: 'Участие принято, время проведено',
            timeMin: 20,
            category: 'communication'
        }
    ],

    // Для полярности loss
    loss: [
        {
            id: 'let_go_object',
            action: 'Выбрось/подари одну вещь, которую давно не используешь',
            check: 'Вещь удалена из дома',
            timeMin: 10,
            category: 'boundaries'
        },
        {
            id: 'stop_one_habit',
            action: 'Откажись сегодня от одной привычки (кофе, соцсети, сериал)',
            check: 'Привычка не выполнена весь день',
            timeMin: 5,
            category: 'self_care'
        },
        {
            id: 'forgive_action',
            action: 'Скажи вслух: "Я прощаю [имя] за [действие]"',
            check: 'Фраза произнесена вслух',
            timeMin: 5,
            category: 'expression'
        }
    ],

    // Для полярности guilt
    guilt: [
        {
            id: 'do_for_yourself',
            action: 'Сделай что-то только для себя, не для других',
            check: 'Действие выполнено, никому не рассказано',
            timeMin: 15,
            category: 'self_care'
        },
        {
            id: 'say_no_today',
            action: 'Откажи в одной просьбе сегодня',
            check: 'Отказ дан, объяснения минимальны',
            timeMin: 5,
            category: 'boundaries'
        },
        {
            id: 'admit_mistake',
            action: 'Признай одну свою ошибку без извинений и самобичевания',
            check: 'Ошибка названа как факт',
            timeMin: 10,
            category: 'expression'
        }
    ],

    // Для полярности shame
    shame: [
        {
            id: 'show_imperfection',
            action: 'Покажи кому-то то, что в себе считаешь неидеальным',
            check: 'Несовершенство показано, реакция получена',
            timeMin: 15,
            category: 'expression'
        },
        {
            id: 'praise_yourself',
            action: 'Похвали себя вслух за три вещи, которые сделал хорошо',
            check: 'Три похвалы произнесены вслух',
            timeMin: 5,
            category: 'self_care'
        },
        {
            id: 'do_visible_action',
            action: 'Сделай что-то на виду у людей (спой, станцуй, выскажи мнение)',
            check: 'Действие выполнено публично',
            timeMin: 10,
            category: 'expression'
        }
    ],

    // Универсальные шаги
    universal: [
        {
            id: 'physical_challenge',
            action: 'Сделай 10 отжиманий или планку на 30 секунд',
            check: 'Упражнение выполнено',
            timeMin: 5,
            category: 'physical'
        },
        {
            id: 'call_someone',
            action: 'Позвони кому-то голосом вместо текста',
            check: 'Звонок состоялся',
            timeMin: 10,
            category: 'communication'
        },
        {
            id: 'walk_outside',
            action: 'Выйди на улицу на 15 минут без телефона',
            check: 'Прогулка завершена',
            timeMin: 15,
            category: 'physical'
        }
    ]
};

// Функция для генерации шага на основе полярности и контекста
export function generateTodayStep(
    polarity: string,
    oneWord: string,
    problem: string,
    voice: 'soft' | 'hard' | 'therapist'
): TodayStep {

    // Выбираем подходящие шаги по полярности
    const polaritySteps = STEP_TEMPLATES[polarity] || STEP_TEMPLATES.universal;
    const universalSteps = STEP_TEMPLATES.universal;

    // Объединяем варианты
    const allSteps = [...polaritySteps, ...universalSteps];

    // Фильтруем по контексту проблемы
    let filteredSteps = allSteps;

    if (problem.toLowerCase().includes('отношен') || problem.toLowerCase().includes('люд')) {
        filteredSteps = allSteps.filter(s => s.category === 'communication');
    } else if (problem.toLowerCase().includes('работ') || problem.toLowerCase().includes('дел')) {
        filteredSteps = allSteps.filter(s => s.category === 'boundaries');
    } else if (problem.toLowerCase().includes('сам') || problem.toLowerCase().includes('себ')) {
        filteredSteps = allSteps.filter(s => s.category === 'self_care');
    }

    // Если после фильтрации ничего не осталось, берём все
    if (filteredSteps.length === 0) {
        filteredSteps = allSteps;
    }

    // Адаптируем под голос
    const selectedStep = filteredSteps[Math.floor(Math.random() * filteredSteps.length)];

    return {
        ...selectedStep,
        action: adaptStepToVoice(selectedStep.action, voice)
    };
}

// Функция для адаптации шага под голос
function adaptStepToVoice(action: string, voice: 'soft' | 'hard' | 'therapist'): string {
    if (voice === 'hard') {
        return action
            .replace('Выбери', 'Возьми')
            .replace('Попроси', 'Требуй')
            .replace('Скажи', 'Заяви')
            .replace('Сделай', 'Действуй:');
    }

    if (voice === 'therapist') {
        return action
            .replace('Выбери', 'Определите')
            .replace('Попроси', 'Обратитесь за')
            .replace('Скажи', 'Выразите')
            .replace('Сделай', 'Выполните');
    }

    // soft voice - оставляем как есть
    return action;
}

// Функция для получения шага по ID
export function getStepById(id: string): TodayStep | undefined {
    const allSteps = Object.values(STEP_TEMPLATES).flat();
    return allSteps.find(s => s.id === id);
}

// Функция для получения шагов по категории
export function getStepsByCategory(category: TodayStep['category']): TodayStep[] {
    const allSteps = Object.values(STEP_TEMPLATES).flat();
    return allSteps.filter(s => s.category === category);
}