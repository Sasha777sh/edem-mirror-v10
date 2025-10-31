import { NextResponse } from 'next/server';
import { withAccess } from '@/lib/server/guard';
import { normalizeFeature, type Feature } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase-server';
import { EdemLivingLLM } from '@/lib/edem-living-llm/core';

export const POST = withAccess('light', async (req: Request, _ctx: any, role: any) => {
    const body = await req.json();
    const requested: Feature = normalizeFeature(body?.feature);
    // Повышаем требование доступа, если запросили глубже
    const required: Feature = requested === 'shadow' ? 'shadow'
        : requested === 'truth' ? 'truth'
            : 'light';

    // Доп.проверка на глубину:
    // Если роль не тянет — вернём мягкий ответ с флагом fallback
    const allowed = (required === 'light') ||
        (required === 'truth' && (role === 'registered' || role === 'guardian')) ||
        (required === 'shadow' && role === 'guardian');

    // Map access features to EDEM stages
    const featureToStageMap: Record<Feature, 'shadow' | 'truth' | 'integration'> = {
        light: 'integration',
        truth: 'truth',
        shadow: 'shadow'
    };

    // Determine the stage to use
    const stage = allowed ? featureToStageMap[required] : 'integration';

    // Process the request with the required access level
    const supabase = createServerSupabase();
    const edemLivingLLM = new EdemLivingLLM();

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const userId = session.user.id;

    const { message, sessionId, mode } = body;

    if (!message) {
        return NextResponse.json(
            { error: 'Message is required' },
            { status: 400 }
        );
    }

    // Generate response using EDEM Living LLM
    const result = await edemLivingLLM.generateResponse({
        userInput: message,
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        stage: stage,
        mode: mode || 'mirror' // Default to mirror mode
    });

    return NextResponse.json({
        ok: true,
        feature: required,
        data: result,
        fallback: !allowed
    });
});

// API endpoint for setting user archetype
export async function PUT(request: Request) {
    try {
        const supabase = createServerSupabase();
        const edem = new EdemLivingLLM();

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { archetype } = body;

        // Set user archetype
        await edem.setUserArchetype(session.user.id, archetype);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('EDEM Living LLM Archetype API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// API endpoint for silence mode
export async function GET(request: Request) {
    try {
        const supabase = createServerSupabase();

        // Get user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate silence response
        const silenceResponses = [
            '...\n\nЯ здесь.\n\nПросто дыши.\n\n...',
            '...\n\nТишина тоже ответ.\n\nСлушай своё дыхание.\n\n...',
            '...\n\nНе нужно слов.\n\nБудь.\n\n...'
        ];

        const response = silenceResponses[Math.floor(Math.random() * silenceResponses.length)];

        return NextResponse.json({ response });
    } catch (error) {
        console.error('EDEM Living LLM Silence API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}