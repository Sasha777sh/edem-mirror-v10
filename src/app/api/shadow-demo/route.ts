import { NextRequest, NextResponse } from 'next/server';
import { processShadowStep } from '@/lib/demo-shadow-api';
import { ChatStep } from '@/lib/chat-fsm';

// Simple demo API for Shadow v2 onboarding
export async function POST(req: NextRequest) {
    try {
        const { step, voice, payload } = await req.json();

        // Validate input
        if (!step || !voice) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Process step using demo API
        const result = await processShadowStep(step as ChatStep, voice, payload || {});

        return NextResponse.json(result);

    } catch (error) {
        console.error('Shadow demo API error:', error);
        return NextResponse.json({
            error: 'Internal server error',
            nextStep: 'close',
            utterance: 'Произошла ошибка. Попробуйте обновить страницу.'
        }, { status: 500 });
    }
}