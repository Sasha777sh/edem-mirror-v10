export const translations = {
    ru: {
        // Landing page
        landing: {
            hero: {
                title: "EDEM — зеркало для психики за 3 минуты",
                subtitle: "ИИ, который показывает корень твоего страха или блока и даёт шаг на сегодня. Анонимно. Без мантр и морали.",
                startDemo: "Начать демо",
                howItWorks: "Как это работает"
            },
            voices: {
                soft: "🌑 Мягкий",
                hard: "⚡ Жёсткий",
                therapist: "🧠 Психотерапевт"
            },
            pricing: {
                day: "24 часа",
                month: "30 дней",
                try24h: "Попробовать 24 часа",
                takeMonth: "Взять на месяц"
            }
        },
        // Dashboard
        dashboard: {
            welcome: "Добро пожаловать",
            wordOfDay: "Слово дня",
            recentSessions: "Недавние сессии",
            quickActions: "Быстрые действия",
            journal: "Дневник",
            history: "История",
            continuePath: "Продолжить путь"
        },
        // Chat
        chat: {
            intro: {
                soft: "Ты здесь не случайно. Я помогу увидеть корень. Скажи одной фразой: что мешает тебе сейчас?",
                hard: "Без кружев. Что мешает двигаться — одной фразой.",
                therapist: "Пойдём шаг за шагом. Сформулируй, что мешает прямо сейчас."
            },
            paywall: {
                title: "Открыть полный доступ",
                soft: "Корень найден. Хочешь узнать архетип и получить практику?",
                hard: "Вскрыто. Дальше — план действий. Берёшь?",
                therapist: "Основа понятна. Готов к структурированному плану восстановления?"
            }
        }
    },
    en: {
        // Landing page
        landing: {
            hero: {
                title: "EDEM — Mind Mirror in 3 Minutes",
                subtitle: "AI that reveals the root of your fear or block and gives you today's step. Anonymous. No mantras or moralizing.",
                startDemo: "Start Demo",
                howItWorks: "How It Works"
            },
            voices: {
                soft: "🌑 Gentle",
                hard: "⚡ Direct",
                therapist: "🧠 Therapist"
            },
            pricing: {
                day: "24 hours",
                month: "30 days",
                try24h: "Try 24 hours",
                takeMonth: "Get for a month"
            }
        },
        // Dashboard
        dashboard: {
            welcome: "Welcome",
            wordOfDay: "Word of the Day",
            recentSessions: "Recent Sessions",
            quickActions: "Quick Actions",
            journal: "Journal",
            history: "History",
            continuePath: "Continue Journey"
        },
        // Chat
        chat: {
            intro: {
                soft: "You're here for a reason. I'll help you see the root. Tell me in one phrase: what's bothering you now?",
                hard: "No fluff. What's blocking your progress?",
                therapist: "Let's go step by step. Describe what's troubling you right now."
            },
            paywall: {
                title: "Unlock Full Access",
                soft: "Root found. Want to discover your archetype and get a practice?",
                hard: "Exposed. Next — action plan. You in?",
                therapist: "Foundation is clear. Ready for a structured recovery plan?"
            }
        }
    }
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = typeof translations.ru;