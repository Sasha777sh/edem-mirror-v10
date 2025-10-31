import { NextRequest, NextResponse } from 'next/server';

// API для системы работы с тенями - эмоциональный график
export async function GET(req: NextRequest) {
    try {
        // В реальном приложении здесь будет запрос к БД
        // Например: SELECT shadow_type, intensity, date FROM emotions WHERE user_id = ?

        const mockData = [
            {
                date: '2025-03-24',
                shadows: {
                    shame: 32,
                    rejection: 18,
                    control: 24,
                    loss: 8,
                    guilt: 12
                },
                totalIntensity: 52
            },
            {
                date: '2025-03-25',
                shadows: {
                    shame: 28,
                    rejection: 22,
                    control: 16,
                    loss: 12,
                    guilt: 8
                },
                totalIntensity: 48
            },
            {
                date: '2025-03-26',
                shadows: {
                    shame: 24,
                    rejection: 20,
                    control: 22,
                    loss: 6,
                    guilt: 14
                },
                totalIntensity: 45
            },
            {
                date: '2025-03-27',
                shadows: {
                    shame: 30,
                    rejection: 15,
                    control: 18,
                    loss: 10,
                    guilt: 9
                },
                totalIntensity: 49
            },
            {
                date: '2025-03-28',
                shadows: {
                    shame: 26,
                    rejection: 25,
                    control: 20,
                    loss: 5,
                    guilt: 11
                },
                totalIntensity: 46
            },
            {
                date: '2025-03-29',
                shadows: {
                    shame: 22,
                    rejection: 19,
                    control: 15,
                    loss: 8,
                    guilt: 7
                },
                totalIntensity: 42
            },
            {
                date: '2025-03-30',
                shadows: {
                    shame: 18,
                    rejection: 16,
                    control: 12,
                    loss: 6,
                    guilt: 5
                },
                totalIntensity: 38
            }
        ];

        return NextResponse.json({
            success: true,
            data: mockData,
            insights: {
                trend: 'decreasing',
                topShadow: 'shame',
                improvement: '📉 Общая интенсивность снижается на 25%',
                weeklyPattern: 'Утром интенсивность выше, к вечеру спадает'
            }
        });

    } catch (error) {
        console.error('Shadow emotions API error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch emotion data' },
            { status: 500 }
        );
    }
}