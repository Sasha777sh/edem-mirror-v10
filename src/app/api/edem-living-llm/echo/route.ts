import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { EdemLivingLLM } from '@/lib/edem-living-llm/core';

export async function POST(request: Request) {
    try {
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

        // Parse request body
        const body = await request.json();
        const { echoText, sessionId } = body;

        if (!echoText || !sessionId) {
            return NextResponse.json(
                { error: 'Echo text and session ID are required' },
                { status: 400 }
            );
        }

        // Store user echo
        const result = await edemLivingLLM.storeUserEcho({
            userId,
            sessionId,
            echoText
        });

        return NextResponse.json({ success: result });
    } catch (error) {
        console.error('Error in EDEM Living LLM Echo API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}