import { z } from 'zod';

// Strict JSON schema for LLM responses
export const LLMResponseSchema = z.object({
    nextStep: z.enum(['intro', 'problem', 'clarify_polarity', 'locate_body', 'name_one_word', 'truth_cut', 'archetype', 'today_step', 'practice_5min', 'close']),
    utterance: z.string().max(140, 'Utterance must be <= 140 characters'),
    update: z.record(z.any()).optional(),
    paywall: z.boolean().optional()
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

// Practice schema for structured practices
export const PracticeSchema = z.object({
    name: z.string().max(50),
    how: z.string().max(300),
    durationMin: z.number().min(1).max(30)
});

export type Practice = z.infer<typeof PracticeSchema>;

// Voice-adaptive paywall copy with A/B test variants
export const PAYWALL_COPY = {
    soft: {
        A: 'Я показал корень. Дать шаг на 24 часа?',
        B: 'Я показал корень. Хочешь план и практику?',
        C: 'Вижу корень. Покажу шаг на сегодня?'
    },
    hard: {
        A: 'Корень виден. Делаем?',
        B: 'Корень вскрыт. Хочешь довести до конца?',
        C: 'Показал правду. Берём шаг?'
    },
    therapist: {
        A: 'Архетип + шаг + практика за 1 499₽/мес',
        B: 'Вижу основу. Дальше — шаги и практика.',
        C: 'Провёл анализ. Покажу план действий?'
    }
} as const;

// Get paywall copy with A/B testing
export function getPaywallCopy(voice: 'soft' | 'hard' | 'therapist', userId?: string): string {
    const variants = PAYWALL_COPY[voice];

    // Simple A/B/C test based on user ID hash or random
    const seed = userId ? hashCode(userId) : Math.random();
    const variantIndex = Math.floor(Math.abs(seed) * 3) % 3;
    const variantKey = ['A', 'B', 'C'][variantIndex] as 'A' | 'B' | 'C';

    return variants[variantKey];
}

// Simple hash function for consistent A/B testing
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

// Validate and parse LLM response with retries
export async function validateLLMResponse(
    rawResponse: string,
    retryCount: number = 0,
    maxRetries: number = 3
): Promise<LLMResponse> {
    try {
        const parsed = JSON.parse(rawResponse);
        return LLMResponseSchema.parse(parsed);
    } catch (error) {
        if (retryCount >= maxRetries) {
            // Return fallback response after max retries
            console.error(`LLM validation failed after ${maxRetries} retries:`, error);
            return {
                nextStep: 'close',
                utterance: 'Произошла ошибка. Попробуйте ещё раз.'
            };
        }

        console.warn(`LLM validation attempt ${retryCount + 1} failed:`, error);
        throw new Error(`Invalid LLM response: ${error}`);
    }
}

// Fallback templates for critical steps
export const FALLBACK_RESPONSES = {
    intro: {
        soft: "Ты здесь не случайно. Скажи одной фразой: что мешает тебе сейчас?",
        hard: "Без кружев. Что мешает двигаться — одной фразой.",
        therapist: "Пойдём шаг за шагом. Сформулируй, что мешает прямо сейчас."
    },
    problem: "Что именно мешает тебе прямо сейчас двигаться вперёд?",
    clarify_polarity: "Выберите, что ближе к вашему состоянию:",
    locate_body: "Где это ощущается в теле? Грудь, горло, живот, спина?",
    name_one_word: "Назови это одним словом. Первое, что приходит.",
    truth_cut: "Я вижу корень проблемы. Готов к следующему шагу?",
    error: "Произошла ошибка. Попробуйте ещё раз или обратитесь в поддержку."
} as const;