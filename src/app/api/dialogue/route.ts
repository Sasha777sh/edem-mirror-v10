import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { dialogueService } from '@/lib/dialogue-system';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { message, sessionId, symptoms, archetypes } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        // Handle the message through dialogue system
        const result = await dialogueService.handleMessage(
            message,
            session.user.id,
            sessionId,
            symptoms,
            archetypes
        );

        return NextResponse.json({
            response: result.response,
            stage: result.stage,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dialogue API error:', error);
        return NextResponse.json({
            error: 'Failed to process dialogue message',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');
        const action = searchParams.get('action');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
        }

        if (action === 'state') {
            // Get current session state
            const state = await dialogueService.getSessionState(session.user.id, sessionId);
            return NextResponse.json({ state });
        }

        if (action === 'practice') {
            // Get assigned practices
            const practices = await dialogueService.searchRagChunks('integration', '');
            return NextResponse.json({ practices: practices.slice(0, 5) });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Dialogue API error:', error);
        return NextResponse.json({
            error: 'Failed to get dialogue information',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}