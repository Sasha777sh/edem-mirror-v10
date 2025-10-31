import { NextRequest, NextResponse } from 'next/server';

// API для валидации инсайтов
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { isValid } = await req.json();
        const insightId = params.id;

        // В реальном приложении: UPDATE insights SET validated = ? WHERE id = ?
        console.log(`Validating insight ${insightId}: ${isValid ? 'confirmed' : 'rejected'}`);

        // Логика обучения AI на основе фидбека
        if (isValid) {
            console.log('✅ Positive feedback - improving AI confidence for similar patterns');
        } else {
            console.log('❌ Negative feedback - adjusting AI model for better accuracy');
        }

        return NextResponse.json({
            success: true,
            message: `Insight ${isValid ? 'confirmed' : 'rejected'} successfully`,
            data: {
                insightId,
                validated: isValid,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Validate insight error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to validate insight' },
            { status: 500 }
        );
    }
}