import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getUserAchievements, getAchievementProgress, checkAndUnlockAchievements } from '@/lib/achievements';

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const action = searchParams.get('action');

        switch (action) {
            case 'progress':
                const progress = await getAchievementProgress(user.id);
                return NextResponse.json({ progress });

            case 'check':
                const newAchievements = await checkAndUnlockAchievements(user.id);
                return NextResponse.json({ newAchievements });

            default:
                const achievements = await getUserAchievements(user.id);
                return NextResponse.json(achievements);
        }
    } catch (error) {
        console.error('Achievements API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Проверяем и разблокируем новые достижения
        const newAchievements = await checkAndUnlockAchievements(user.id);

        return NextResponse.json({
            success: true,
            newAchievements
        });
    } catch (error) {
        console.error('Achievements check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}