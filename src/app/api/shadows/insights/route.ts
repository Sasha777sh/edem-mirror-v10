import { NextRequest, NextResponse } from 'next/server';

// API для микро-инсайтов
export async function GET(req: NextRequest) {
    try {
        const mockInsights = [
            {
                id: 'insight_001',
                text: 'В разговорах стало меньше слов-извинений. Голос увереннее на 15%',
                shadowType: 'shame',
                confidence: 0.87,
                date: '2025-03-29',
                validated: true,
                source: 'voice_analysis'
            },
            {
                id: 'insight_002',
                text: 'Дыхание при отказах стало ровнее. Паузы перед ответом удлинились',
                shadowType: 'rejection',
                confidence: 0.92,
                date: '2025-03-28',
                source: 'breathing_pattern'
            },
            {
                id: 'insight_003',
                text: 'Делегируешь чаще. Проверяешь результат реже — доверие растет',
                shadowType: 'control',
                confidence: 0.78,
                date: '2025-03-27',
                validated: false,
                source: 'behavior_tracking'
            },
            {
                id: 'insight_004',
                text: 'Время на принятие решений сократилось. Меньше сомнений в выборе',
                shadowType: 'guilt',
                confidence: 0.84,
                date: '2025-03-26',
                source: 'decision_analysis'
            },
            {
                id: 'insight_005',
                text: 'Отпускаешь мелочи быстрее. Фокус на главном усилился',
                shadowType: 'loss',
                confidence: 0.89,
                date: '2025-03-25',
                validated: true,
                source: 'attention_tracking'
            }
        ];

        return NextResponse.json({
            success: true,
            insights: mockInsights,
            meta: {
                totalInsights: mockInsights.length,
                averageConfidence: 0.86,
                validatedCount: mockInsights.filter(i => i.validated === true).length,
                pendingValidation: mockInsights.filter(i => i.validated === undefined).length
            }
        });

    } catch (error) {
        console.error('Insights API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch insights' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const { type, text, shadowType, confidence } = await req.json();

        // В реальном приложении: сохранение в БД
        const newInsight = {
            id: `insight_${Date.now()}`,
            text,
            shadowType,
            confidence: confidence || 0.75,
            date: new Date().toISOString().split('T')[0],
            source: type || 'manual',
            validated: undefined
        };

        console.log('New insight created:', newInsight);

        return NextResponse.json({
            success: true,
            insight: newInsight,
            message: 'Insight created successfully'
        });

    } catch (error) {
        console.error('Create insight error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create insight' },
            { status: 500 }
        );
    }
}