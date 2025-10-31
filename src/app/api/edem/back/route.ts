import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserOrGuest } from '@/lib/auth';
import { z } from 'zod';

const BackRequestSchema = z.object({
    sessionId: z.string().uuid(),
    currentStep: z.enum(['problem', 'clarify_polarity', 'locate_body', 'name_one_word', 'truth_cut'])
});

// Step progression mapping
const STEP_FLOW = {
    'problem': 'intro',
    'clarify_polarity': 'problem',
    'locate_body': 'clarify_polarity',
    'name_one_word': 'locate_body',
    'truth_cut': 'name_one_word'
} as const;

export async function POST(req: NextRequest) {
    try {
        const { userId, guestId } = await getUserOrGuest(req);
        const body = await req.json();
        const { sessionId, currentStep } = BackRequestSchema.parse(body);

        // Validate session ownership
        const session = await sql`
            select id, step, inputs from sessions
            where id = ${sessionId}
            and (user_id = ${userId || null} or guest_id = ${guestId || null})
        `;

        if (session.length === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Calculate previous step
        const previousStep = STEP_FLOW[currentStep as keyof typeof STEP_FLOW];
        if (!previousStep) {
            return NextResponse.json({ error: 'Cannot go back from intro' }, { status: 400 });
        }

        // Clear data for current step and later steps
        const inputs = session[0].inputs || {};
        const stepsToClear = getStepsToClear(currentStep);

        stepsToClear.forEach(step => {
            delete inputs[step];
        });

        // Update session
        await sql`
            update sessions
            set step = ${previousStep},
                inputs = ${JSON.stringify(inputs)},
                updated_at = now()
            where id = ${sessionId}
        `;

        // Get appropriate message for previous step
        const messages = {
            intro: "Давайте начнём сначала. Что мешает вам сейчас?",
            problem: "Расскажите подробнее о проблеме.",
            clarify_polarity: "Выберите, что ближе к вашему состоянию.",
            locate_body: "Где в теле вы это ощущаете?",
            name_one_word: "Назовите это одним словом."
        };

        return NextResponse.json({
            success: true,
            step: previousStep,
            message: messages[previousStep as keyof typeof messages],
            clearedInputs: stepsToClear
        });

    } catch (error) {
        console.error('Back step error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid request data',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Failed to go back'
        }, { status: 500 });
    }
}

function getStepsToClear(currentStep: string): string[] {
    const stepOrder = ['problem', 'polarity', 'body', 'oneWord', 'truthCut'];
    const currentIndex = stepOrder.findIndex(step => {
        const stepMap: Record<string, string> = {
            'problem': 'problem',
            'clarify_polarity': 'polarity',
            'locate_body': 'body',
            'name_one_word': 'oneWord',
            'truth_cut': 'truthCut'
        };
        return stepMap[currentStep] === step;
    });

    return currentIndex >= 0 ? stepOrder.slice(currentIndex) : [];
}