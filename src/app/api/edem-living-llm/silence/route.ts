import { NextResponse } from 'next/server';
import { EdemLivingLLM } from '@/lib/edem-living-llm/core';

export async function GET() {
    try {
        const edemLivingLLM = new EdemLivingLLM();

        // Generate silence response
        const response = edemLivingLLM.generateSilenceResponse();

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error in EDEM Living LLM Silence API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}