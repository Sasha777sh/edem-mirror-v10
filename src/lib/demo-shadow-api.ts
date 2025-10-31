// Demo API для Shadow v2 онбординга (моки без реального бэкенда)

import { ChatStep } from './chat-fsm';
import { getShadowPrompt, mapPolarityButton, mapAgreementButton, DECLINE_PROMPTS, AGREEMENT_PROMPTS } from './shadow-prompts';

interface DemoResponse {
    nextStep: ChatStep;
    utterance: string;
    hasButtons?: boolean;
    buttons?: string[];
    paywall?: boolean;
    sessionId?: string;
    update?: any;
}

// Моковые данные сессии в localStorage
class DemoSessionManager {
    private sessionKey = 'edem_shadow_demo_session';

    getSession(): any {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(this.sessionKey);
        return stored ? JSON.parse(stored) : null;
    }

    updateSession(data: any): void {
        if (typeof window === 'undefined') return;
        const current = this.getSession() || {
            sessionId: 'demo_' + Date.now(),
            onb: {},
            step: 'intro'
        };
        const updated = { ...current, ...data };
        localStorage.setItem(this.sessionKey, JSON.stringify(updated));
    }

    clearSession(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.sessionKey);
    }
}

const sessionManager = new DemoSessionManager();

export async function processShadowStep(
    step: ChatStep,
    voice: 'soft' | 'hard' | 'therapist',
    payload: any
): Promise<DemoResponse> {

    // Задержка для имитации API
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const session = sessionManager.getSession();

    // Intro - начало онбординга
    if (step === 'intro') {
        const prompt = getShadowPrompt('onb_1_mask', voice);
        sessionManager.updateSession({
            step: 'onb_1_mask',
            voice,
            onb: {}
        });

        return {
            nextStep: 'onb_1_mask',
            utterance: prompt.utterance,
            sessionId: session?.sessionId || 'demo_' + Date.now()
        };
    }

    // Шаг 1: Маска
    if (step === 'onb_1_mask' && payload.mask) {
        const prompt = getShadowPrompt('onb_2_trigger', voice);
        sessionManager.updateSession({
            step: 'onb_2_trigger',
            onb: { ...session?.onb, mask: payload.mask }
        });

        return {
            nextStep: 'onb_2_trigger',
            utterance: prompt.utterance
        };
    }

    // Шаг 2: Триггер
    if (step === 'onb_2_trigger' && payload.trigger) {
        const prompt = getShadowPrompt('onb_3_polarity', voice);
        sessionManager.updateSession({
            step: 'onb_3_polarity',
            onb: { ...session?.onb, trigger: payload.trigger }
        });

        return {
            nextStep: 'onb_3_polarity',
            utterance: prompt.utterance,
            hasButtons: true,
            buttons: prompt.buttons
        };
    }

    // Шаг 3: Полярность (с кнопками)
    if (step === 'onb_3_polarity' && payload.polarity) {
        const prompt = getShadowPrompt('onb_4_body', voice);
        const polarity = mapPolarityButton(payload.polarity);
        sessionManager.updateSession({
            step: 'onb_4_body',
            onb: { ...session?.onb, polarity }
        });

        return {
            nextStep: 'onb_4_body',
            utterance: prompt.utterance
        };
    }

    // Шаг 4: Тело
    if (step === 'onb_4_body' && payload.body) {
        const prompt = getShadowPrompt('onb_5_one_word', voice);
        sessionManager.updateSession({
            step: 'onb_5_one_word',
            onb: { ...session?.onb, body: payload.body }
        });

        return {
            nextStep: 'onb_5_one_word',
            utterance: prompt.utterance
        };
    }

    // Шаг 5: Одно слово
    if (step === 'onb_5_one_word' && payload.oneWord) {
        const prompt = getShadowPrompt('onb_6_cost_agree', voice);
        sessionManager.updateSession({
            step: 'onb_6_cost_agree',
            onb: { ...session?.onb, oneWord: payload.oneWord }
        });

        return {
            nextStep: 'onb_6_cost_agree',
            utterance: prompt.utterance,
            hasButtons: true,
            buttons: prompt.buttons
        };
    }

    // Шаг 6: Согласие работать (с кнопками да/нет)
    if (step === 'onb_6_cost_agree' && payload.costAgree !== undefined) {
        const agreed = mapAgreementButton(payload.costAgree);

        if (!agreed) {
            // Пользователь отказался
            sessionManager.clearSession();
            return {
                nextStep: 'close',
                utterance: DECLINE_PROMPTS[voice]
            };
        }

        // Генерируем truth cut на основе собранных данных
        const truthCut = generateDemoTruthCut(session?.onb, voice);
        sessionManager.updateSession({
            step: 'truth_cut',
            truthCut,
            onb: { ...session?.onb, costAgree: true }
        });

        return {
            nextStep: 'paywall',
            utterance: truthCut,
            paywall: true
        };
    }

    // Fallback
    return {
        nextStep: 'close',
        utterance: 'Что-то пошло не так. Попробуйте ещё раз.'
    };
}

// Генерация truth cut для демо
function generateDemoTruthCut(onb: any, voice: string): string {
    if (!onb?.oneWord || !onb?.polarity) {
        return 'Корень становится ясен. Готовы к следующему шагу?';
    }

    const truthTemplates = {
        loss: {
            soft: `"${onb.oneWord}" — это ключ. Это не про потерю, а про страх отпустить контроль.`,
            hard: `"${onb.oneWord}" — вскрыто. Ты боишься не потерять, а отпустить контроль.`,
            therapist: `"${onb.oneWord}" — я вижу корень. Это про контроль, не про потерю.`
        },
        control: {
            soft: `"${onb.oneWord}" — понимаю. Ты держишь всё, боясь рухнуть.`,
            hard: `"${onb.oneWord}" — ты хватаешься за иллюзию безопасности.`,
            therapist: `"${onb.oneWord}" — это защитная реакция на неопределённость.`
        },
        rejection: {
            soft: `"${onb.oneWord}" — вижу. Ты путаешь отказ с оценкой ценности.`,
            hard: `"${onb.oneWord}" — отказ не про тебя, а про совпадение.`,
            therapist: `"${onb.oneWord}" — отвержение и самооценка — разные категории.`
        },
        guilt: {
            soft: `"${onb.oneWord}" — понятно. Вина — способ не двигаться вперёд.`,
            hard: `"${onb.oneWord}" — вина тормозит, ответственность движет.`,
            therapist: `"${onb.oneWord}" — различаем вину и ответственность.`
        },
        shame: {
            soft: `"${onb.oneWord}" — да. Стыд — чужой взгляд, поселившийся внутри.`,
            hard: `"${onb.oneWord}" — стыд делает желание грязным. Желание — жизнь.`,
            therapist: `"${onb.oneWord}" — стыд искажает восприятие собственной ценности.`
        },
        other: {
            soft: `"${onb.oneWord}" — чувствую суть. Это про принятие себя настоящего.`,
            hard: `"${onb.oneWord}" — корень найден. Дальше — действие.`,
            therapist: `"${onb.oneWord}" — основа для дальнейшей работы определена.`
        }
    };

    const template = truthTemplates[onb.polarity as keyof typeof truthTemplates] || truthTemplates.other;
    return template[voice as keyof typeof template] || template.soft;
}