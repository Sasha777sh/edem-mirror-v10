import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserOrGuest } from '@/lib/auth';
import { checkSafetyContent, logSafetyIncident } from '@/lib/safety';
import { getCachedData, setCachedData, generateCacheKey, CACHE_TTL, apiRateLimit } from '@/lib/redis';
import { detectPolarity, POLARITIES } from '@/lib/polarities';
import { validateLLMResponse, getPaywallCopy, FALLBACK_RESPONSES } from '@/lib/validation';
import { callOpenAI } from '@/lib/openai';
import { detectArchetype } from '@/lib/archetypes';
import { generateTodayStep } from '@/lib/today-steps';
import { getPracticeForToday } from '@/lib/practices';
import { ChatStep, OnbStep, getNextStep, isValidTransition } from '@/lib/chat-fsm';
import { getShadowPrompt, mapPolarityButton, mapAgreementButton, DECLINE_PROMPTS, AGREEMENT_PROMPTS } from '@/lib/shadow-prompts';
import { z } from 'zod';

// Input validation schema - updated for Shadow v2
const StepRequestSchema = z.object({
    sessionId: z.string().uuid().optional(),
    mode: z.enum(['demo', 'pro']),
    voice: z.enum(['soft', 'hard', 'therapist']),
    step: z.enum([
        // Shadow v2 onboarding
        'onb_1_mask', 'onb_2_trigger', 'onb_3_polarity', 'onb_4_body', 'onb_5_one_word', 'onb_6_cost_agree',
        // Core EDEM flow
        'intro', 'problem', 'clarify_polarity', 'locate_body', 'name_one_word', 'truth_cut',
        'archetype', 'today_step', 'practice_5min', 'close'
    ]),
    payload: z.record(z.any()),
    canGoBack: z.boolean().optional(),
    retryCount: z.number().optional()
});

// Response validation schema
const StepResponseSchema = z.object({
    nextStep: z.string(),
    utterance: z.string().max(180),
    update: z.record(z.any()).optional(),
    sessionId: z.string().uuid().optional(),
    paywall: z.boolean().optional()
});

// Enhanced LLM call with Shadow v2 onboarding support
async function callLLM(payload: any): Promise<string> {
    const { step, voice, mode, userId, guestId, ...data } = payload;
    const identifier = userId || guestId || 'anonymous';

    // Shadow v2 Onboarding Steps
    if (step === 'onb_1_mask') {
        const prompt = getShadowPrompt('onb_1_mask', voice);
        return JSON.stringify({
            nextStep: 'onb_2_trigger',
            utterance: prompt.utterance,
            update: { onb: { mask: data.mask } }
        });
    }

    if (step === 'onb_2_trigger' && data.trigger) {
        const prompt = getShadowPrompt('onb_2_trigger', voice);
        return JSON.stringify({
            nextStep: 'onb_3_polarity',
            utterance: prompt.utterance,
            update: { onb: { trigger: data.trigger } }
        });
    }

    if (step === 'onb_3_polarity') {
        const prompt = getShadowPrompt('onb_3_polarity', voice);
        return JSON.stringify({
            nextStep: 'onb_4_body',
            utterance: prompt.utterance,
            hasButtons: true,
            buttons: prompt.buttons
        });
    }

    if (step === 'onb_4_body' && data.polarity) {
        const prompt = getShadowPrompt('onb_4_body', voice);
        const polarity = mapPolarityButton(data.polarity);
        return JSON.stringify({
            nextStep: 'onb_5_one_word',
            utterance: prompt.utterance,
            update: { onb: { polarity } }
        });
    }

    if (step === 'onb_5_one_word' && data.body) {
        const prompt = getShadowPrompt('onb_5_one_word', voice);
        return JSON.stringify({
            nextStep: 'onb_6_cost_agree',
            utterance: prompt.utterance,
            update: { onb: { body: data.body } }
        });
    }

    if (step === 'onb_6_cost_agree') {
        if (data.oneWord) {
            const prompt = getShadowPrompt('onb_6_cost_agree', voice);
            return JSON.stringify({
                nextStep: 'truth_cut',
                utterance: prompt.utterance,
                hasButtons: true,
                buttons: prompt.buttons,
                update: { onb: { oneWord: data.oneWord } }
            });
        }
    }

    if (step === 'truth_cut' && data.costAgree !== undefined) {
        const agreed = mapAgreementButton(data.costAgree);

        if (!agreed) {
            // User declined to continue
            return JSON.stringify({
                nextStep: 'close',
                utterance: DECLINE_PROMPTS[voice],
                update: { onb: { costAgree: false }, declined: true }
            });
        }

        // Generate truth cut using onboarding data
        const truthCut = await generateTruthCut(payload, voice);

        return JSON.stringify({
            nextStep: mode === 'demo' ? 'paywall' : 'archetype',
            utterance: truthCut,
            update: {
                onb: { costAgree: true },
                truthCut: truthCut
            },
            paywall: mode === 'demo'
        });
    }

    // Legacy intro (redirects to onboarding)
    if (step === 'intro') {
        const prompt = getShadowPrompt('onb_1_mask', voice);
        return JSON.stringify({
            nextStep: 'onb_1_mask',
            utterance: prompt.utterance
        });
    }

    // Fallback response
    return JSON.stringify({
        nextStep: 'close',
        utterance: FALLBACK_RESPONSES.error,
        update: {}
    });
}

// Generate truth cut based on onboarding data
async function generateTruthCut(payload: any, voice: string): Promise<string> {
    const { onb } = payload;

    if (!onb?.polarity || !onb?.oneWord) {
        return 'Корень проблемы становится яснее. Продолжаем работу.';
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

    const template = truthTemplates[onb.polarity as keyof typeof truthTemplates];
    return template ? template[voice as keyof typeof template] : truthTemplates.other[voice as keyof typeof truthTemplates.other];
}

// Save onboarding data to database
async function saveOnboardingData(sessionId: string, userId: string | null, onboardingData: any): Promise<void> {
    try {
        await sql`
            insert into onboarding_answers (
                session_id, user_id, mask, trigger, polarity, body, one_word, cost_agree
            ) values (
                ${sessionId}, ${userId}, ${onboardingData.mask}, ${onboardingData.trigger},
                ${onboardingData.polarity}, ${onboardingData.body}, ${onboardingData.oneWord}, ${onboardingData.costAgree}
            )
        `;

        // Log analytics event
        await sql`
            insert into events (session_id, user_id, event_type, metadata)
            values (${sessionId}, ${userId}, 'onb_complete', ${JSON.stringify({
            polarity: onboardingData.polarity,
            costAgree: onboardingData.costAgree
        })})
        `;

    } catch (error) {
        console.error('Failed to save onboarding data:', error);
    }
}

export async function POST(req: NextRequest) {
    try {
        // Rate limiting with Upstash
        const { userId, guestId } = await getUserOrGuest(req);
        const identifier = userId || guestId || 'anonymous';

        const { success, limit, reset, remaining } = await apiRateLimit.limit(identifier);
        if (!success) {
            return NextResponse.json({
                error: 'Too many requests',
                limit,
                reset,
                remaining
            }, { status: 429 });
        }

        const body = await req.json();
        const validatedInput = StepRequestSchema.parse(body);

        const { sessionId, mode, voice, step, payload } = validatedInput;

        // Safety check on user input
        const inputText = Object.values(payload).join(' ');
        const safetyResult = checkSafetyContent(inputText, 'ru');

        if (!safetyResult.isSafe) {
            // Log the safety incident
            await logSafetyIncident(userId || null, guestId || null, inputText, safetyResult.riskLevel, safetyResult.triggeredWords);

            // Return crisis intervention response
            return NextResponse.json({
                nextStep: 'crisis_intervention',
                utterance: safetyResult.intervention || 'Я замечаю, что вам сейчас тяжело. Пожалуйста, обратитесь за помощью к специалисту.',
                update: {
                    safetyTriggered: true,
                    riskLevel: safetyResult.riskLevel,
                    voiceOverride: 'therapist' // Always use therapist voice for crisis
                },
                sessionId: sessionId
            });
        }

        // Check user subscription plan for step restrictions
        let userPlan = 'demo';
        if (userId) {
            const subscription = await sql`
                select plan, status from subscriptions 
                where user_id = ${userId} and status = 'active'
            `;
            userPlan = subscription[0]?.plan || 'free';
        }

        // CRITICAL: Block expensive steps for non-PRO users
        if (userPlan !== 'pro' && ['archetype', 'today_step', 'practice_5min'].includes(step)) {
            const paywallCopy = getPaywallCopy(voice, userId);
            return NextResponse.json({
                nextStep: 'paywall',
                utterance: paywallCopy,
                paywall: true,
                error: 'PRO subscription required'
            }, { status: 403 });
        }

        // Demo mode: hard stop at truth_cut
        if (mode === 'demo' && step === 'truth_cut') {
            // Force paywall after generating truth_cut
            const result = await callLLM({ step, voice, mode, ...payload });
            const parsedResult = JSON.parse(result);

            return NextResponse.json({
                ...parsedResult,
                nextStep: 'paywall',
                paywall: true
            });
        }

        // Get or create session
        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const newSession = await sql`
                insert into sessions (user_id, guest_id, mode, voice, step, inputs, started_at)
                values (${userId || null}, ${guestId || null}, ${mode}, ${voice}, ${step}, ${JSON.stringify(payload)}, now())
                returning id
            `;
            currentSessionId = newSession[0].id;
        }

        // Prepare LLM payload
        const llmPayload = {
            step,
            voice,
            mode,
            userId,
            guestId,
            sessionId: currentSessionId,
            ...payload
        };

        // Call LLM with retry logic
        let response;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const rawResponse = await callOpenAI(llmPayload);
                response = await validateLLMResponse(rawResponse);
                break;
            } catch (error) {
                console.error(`LLM call attempt ${attempt + 1} failed:`, error);
                if (attempt === 2) {
                    return NextResponse.json({
                        error: 'LLM processing failed',
                        nextStep: 'error',
                        utterance: 'Произошла ошибка. Попробуйте ещё раз.'
                    }, { status: 502 });
                }
            }
        }

        // Ensure response is defined
        if (!response) {
            return NextResponse.json({
                error: 'LLM processing failed',
                nextStep: 'error',
                utterance: 'Произошла ошибка. Попробуйте ещё раз.'
            }, { status: 502 });
        }

        // Update session with new step and outputs
        await sql`
            update sessions 
            set step = ${response.nextStep},
                inputs = ${JSON.stringify({ ...payload, ...response.update })},
                output = ${JSON.stringify(response.update)},
                finished_at = ${response.nextStep === 'close' ? 'now()' : null}
            where id = ${currentSessionId!}
        `;

        // If this completes a demo, consume the demo count
        if (mode === 'demo' && response.paywall) {
            await fetch(`${req.nextUrl.origin}/api/demo/consume`, {
                method: 'POST',
                headers: req.headers
            });

            // Track paywall view for analytics
            await fetch(`${req.nextUrl.origin}/api/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'paywall_view',
                    properties: {
                        voice,
                        step,
                        truthCut: response.update?.truthCut,
                        sessionId: currentSessionId
                    }
                })
            });
        }

        // Track truth_cut completion
        if (step === 'name_one_word' && response.update?.truthCut) {
            await fetch(`${req.nextUrl.origin}/api/analytics`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'truth_cut',
                    properties: {
                        voice,
                        polarity: payload.polarity,
                        oneWord: payload.oneWord,
                        truthCut: response.update.truthCut,
                        sessionId: currentSessionId
                    }
                })
            });
        }

        return NextResponse.json({
            ...response,
            sessionId: currentSessionId
        });

    } catch (error) {
        console.error('EDEM step error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid input',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Internal server error',
            nextStep: 'error',
            utterance: 'Произошла ошибка сервера. Попробуйте позже.'
        }, { status: 500 });
    }
}