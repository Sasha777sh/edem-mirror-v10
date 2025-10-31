import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface LLMCall {
    step: string;
    voice: 'soft' | 'hard' | 'therapist';
    mode: 'demo' | 'pro';
    [key: string]: any;
}

export async function callOpenAI(payload: LLMCall): Promise<string> {
    const { step, voice, mode, ...data } = payload;

    // Системный промпт: жёсткий, четкий, как "нож"
    let systemPrompt = `Ты — EDEM. Честное зеркало психики. Никаких нравоучений.

ПРИНЦИП: 1 шаг = 1 вопрос = 1 ответ. Как нож.
СТИЛЬ: ${voice === 'soft' ? 'мягко но правдиво' : voice === 'hard' ? 'жёстко без прикрас' : 'структурированно и точно'}.

ВСЕГДА отвечай строго в JSON. НИКАКИХ советов, только вопросы и truth cuts.
Если видишь суицидальный риск — вставь дисклеймер про специалиста.`;

    let userPrompt = '';

    // Voice-specific intro messages (короткие, как выстрел)
    if (step === 'intro') {
        const intros = {
            soft: "Ты здесь не случайно. Покажу корень. Отвечай честно.",
            hard: "Без прикрас. Скажи правду — увидишь свою.",
            therapist: "Идём поэтапно. Это безопасно и точно."
        };

        return JSON.stringify({
            nextStep: 'problem',
            utterance: intros[voice],
            update: { started: true }
        });
    }

    // Problem identification - одна задача: понять проблему, перейти к полярности
    if (step === 'problem' && data.problem) {
        userPrompt = `СТИЛЬ: ${voice}
ПРОБЛЕМА: "${data.problem}"

ЗАДАЧА: Подтверди понимание одним предложением. Переведи к выбору полярности.
ПРИНЦИП: Без анализа, без советов. Только переход к следующему шагу.

ОТВЕТ: JSON {"nextStep": "clarify_polarity", "utterance": "<= 100 символов", "update": {"problem": "текст"}}`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 150,
                temperature: 0.3  // Меньше креативности = больше точности
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) throw new Error('Empty response from OpenAI');

            return response;

        } catch (error) {
            console.error('OpenAI error:', error);

            // Fallback responses (короткие и точные)
            const fallbacks = {
                soft: "Понимаю. Выберите, что ближе:",
                hard: "Ясно. Что из этого?",
                therapist: "Фиксирую. Определим категорию:"
            };

            return JSON.stringify({
                nextStep: 'clarify_polarity',
                utterance: fallbacks[voice],
                update: { problem: data.problem }
            });
        }
    }

    // Truth cut — САМЫЙ ВАЖНЫЙ шаг. Как нож: быстро, точно, в корень
    if (step === 'name_one_word' && data.oneWord) {
        const polarity = data.polarity || 'other';

        userPrompt = `СТИЛЬ: ${voice}
ПОЛЯРНОСТЬ: ${polarity}
СЛОВО: "${data.oneWord}"
ПРОБЛЕМА: "${data.problem}"
ТЕЛО: "${data.body}"

ЗАДАЧА: Truth cut — разрез в корень проблемы. 
ФОРМУЛА: "Это не про X. Это про Y." 
ДЛИНА: Максимум 100 символов. Как удар ножом.

ПРИМЕРЫ по полярности:
• loss: "Это не про потерю. Это про контроль."
• control: "Ты боишься не хаоса, а безконтрольности."
• rejection: "Ты путаешь отказ с оценкой ценности."
• guilt: "Вина — способ не двигаться вперёд."
• shame: "Стыд — чужой взгляд, поселившийся внутри."

ВКЛЮЧИ СЛОВО ПОЛЬЗОВАТЕЛЯ В TRUTH CUT.

ОТВЕТ: JSON {"nextStep": "${mode === 'demo' ? 'paywall' : 'archetype'}", "utterance": "truth_cut", "update": {"oneWord": "слово", "truthCut": "разрез"}, "paywall": ${mode === 'demo'}}`;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 200,
                temperature: 0.9  // Больше креативности для truth cut
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) throw new Error('Empty response from OpenAI');

            return response;

        } catch (error) {
            console.error('OpenAI error for truth_cut:', error);

            // Качественные fallback truth cuts (обновлённые)
            const voiceTruthTemplates = {
                loss: {
                    soft: `"${data.oneWord}" — это ключ. Это не про потерю, а про страх отпустить.`,
                    hard: `"${data.oneWord}" — ты боишься не потерять, а отпустить контроль.`,
                    therapist: `"${data.oneWord}" — механизм защиты от неопределённости.`
                },
                control: {
                    soft: `"${data.oneWord}" — ты держишься, боясь рухнуть.`,
                    hard: `"${data.oneWord}" — хватаешься за иллюзию безопасности.`,
                    therapist: `"${data.oneWord}" — попытка управлять неуправляемым.`
                },
                rejection: {
                    soft: `"${data.oneWord}" — ты путаешь отказ с оценкой себя.`,
                    hard: `"${data.oneWord}" — боишься не отказа, а правды о себе.`,
                    therapist: `"${data.oneWord}" — проекция страха быть неприемлемым.`
                },
                guilt: {
                    soft: `"${data.oneWord}" — вина как способ не меняться.`,
                    hard: `"${data.oneWord}" — вина удобнее ответственности.`,
                    therapist: `"${data.oneWord}" — механизм избегания действий.`
                },
                shame: {
                    soft: `"${data.oneWord}" — стыд это чужой взгляд внутри.`,
                    hard: `"${data.oneWord}" — ты судишь себя чужими глазами.`,
                    therapist: `"${data.oneWord}" — интроекция внешних оценок.`
                }
            };

            const template = voiceTruthTemplates[polarity as keyof typeof voiceTruthTemplates];
            const truthCut = template?.[voice] || `"${data.oneWord}" — корень найден.`;

            return JSON.stringify({
                nextStep: mode === 'demo' ? 'paywall' : 'archetype',
                utterance: truthCut,
                update: {
                    oneWord: data.oneWord,
                    truthCut: truthCut
                },
                paywall: mode === 'demo'
            });
        }
    }

    // Простые шаги: без GPT, быстро и точно
    const stepResponses = {
        clarify_polarity: {
            nextStep: 'locate_body',
            utterance: voice === 'soft'
                ? "Закрой глаза. Где в теле это живёт?"
                : voice === 'hard'
                    ? "Где в теле сидит?"
                    : "Найди ощущение в теле. Где?",
            update: { polarity: data.polarity }
        },
        locate_body: {
            nextStep: 'name_one_word',
            utterance: voice === 'soft'
                ? "Какое слово приходит оттуда?"
                : voice === 'hard'
                    ? "Одно слово. Какое?"
                    : "Слово из этого места?",
            update: { body: data.body }
        }
    };

    const stepResponse = stepResponses[step as keyof typeof stepResponses];
    if (stepResponse) {
        return JSON.stringify(stepResponse);
    }

    // Final fallback
    return JSON.stringify({
        nextStep: 'close',
        utterance: 'Ошибка. Попробуй ещё раз.',
        update: {}
    });
}