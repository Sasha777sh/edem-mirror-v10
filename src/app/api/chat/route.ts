import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { detectSignals, decideStage } from '@/lib/stages';
import { ragSearch } from '@/lib/rag';
import { getSessionState, saveSessionState } from '@/lib/session-state';
import { assignPractice } from '@/lib/practices';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { text, sessionId, symptom = 'anxiety', lang = 'ru' } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Get current session state
        let state = await getSessionState(session.user.id, sessionId);

        // If no state exists, create initial state
        if (!state) {
            state = {
                id: '',
                user_id: session.user.id,
                session_id: sessionId,
                stage: 'shadow',
                defensiveness: 0,
                acknowledgement: 0,
                readiness: 0,
                shadow_streak: 0,
                updated_at: new Date(),
                created_at: new Date()
            };
        }

        // Detect signals from user text
        const sig = detectSignals(text);

        // Decide next stage
        const stage = decideStage(sig, state.stage, state.shadow_streak);

        // Search RAG for context
        const ctx = await ragSearch(text, { stage, symptom: [symptom], lang });

        // Get active prompt template for stage
        const promptTemplate = await getPromptTemplate(stage);

        // Build messages for LLM
        const system = `Ты — EDEM Mirror. Веди: Shadow→Truth→Integration. Кратко (120–180 слов). Без морали. Если кризис — выдай безопасный ответ и завершай.`;
        const policy = `POLICY: if defensiveness_high stay Shadow (≤2 хода), if acknowledged→Truth, if readiness>=2→Integration; cite контекст своими словами.`;

        // Build prompt with context
        const prompt = buildStagePrompt(stage, promptTemplate, ctx, text);

        // In a real implementation, this would call an LLM
        // For now, we'll generate a mock response
        const answer = generateMockResponse(stage, promptTemplate, ctx, text);

        // Save session state
        await saveSessionState(session.user.id, sessionId, stage, sig);

        // If stage is integration, assign a practice
        if (stage === 'integration') {
            // For demo, we'll use a simple practice key
            // In real implementation, this would be based on context
            await assignPractice(session.user.id, sessionId, 'body/ground_30s');

            // In real implementation, we would schedule a check-in
            // await scheduleCheckIn(session.user.id, sessionId);
        }

        return NextResponse.json({
            stage,
            answer,
            context: ctx.slice(0, 2) // Return first 2 context items for debugging
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({
            error: 'Failed to process chat message',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * Get active prompt template for stage
 */
async function getPromptTemplate(stage: string): Promise<string> {
    try {
        const supabase = createServerSupabase();
        const { data, error } = await supabase
            .from('prompt_versions')
            .select('content')
            .eq('stage', stage)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            return data[0].content;
        }

        // Fallback templates
        const fallbacks: Record<string, string> = {
            shadow: 'Зеркало: вижу паттерн. Триггер: ситуация. Цена: потеря. Коротко. Без советов.',
            truth: 'Правда: тебе важно потребность. Сейчас ты закрываешь это паттерн, потому что история/страх. Место выбора: 1 маленький альтернативный шаг.',
            integration: 'Шаг на сегодня (≤3 мин): практика. Якорь в теле: ощущение/дыхание. Завтра спрошу: сделал ли и что изменилось (0–10).'
        };

        return fallbacks[stage] || 'Продолжай делиться своими мыслями.';
    } catch (error) {
        console.error('Error getting prompt template:', error);
        return 'Продолжай делиться своими мыслями.';
    }
}

/**
 * Build stage prompt with context
 */
function buildStagePrompt(
    stage: string,
    template: string,
    context: any[],
    userInput: string
): string {
    // In a real implementation, this would substitute variables in the template
    // For now, we'll just return the template with context info
    return `${template}\n\nКонтекст: ${context.map(c => c.title).join(', ')}\n\nПользователь: ${userInput}`;
}

/**
 * Generate mock response (in real implementation, this would call LLM)
 */
function generateMockResponse(stage: string, template: string, context: any[], userInput: string): string {
    // This is a mock implementation - in real system this would call LLM
    switch (stage) {
        case 'shadow':
            return "Зеркало: вижу защиту через обесценивание. Триггер: критика со стороны. Цена: отсутствие поддержки и понимания со стороны близких. Без советов. Только факт.";
        case 'truth':
            return "Правда: на самом деле тебе важно чувствовать себя значимым. Сейчас ты закрываешь это через обесценивание, потому что боишься быть уязвимым. Место выбора: принять свою уязвимость как силу.";
        case 'integration':
            return "Шаг на сегодня (3 минуты): вспомни ситуацию, где ты чувствовал обесценивание. Напиши одно предложение о том, что ты в ней чувствовал. Якорь в теле: ощути это чувство в груди. Завтра спрошу: «Сделал ли? Что изменилось по шкале 0–10?»";
        default:
            return "Продолжай делиться своими мыслями.";
    }
}