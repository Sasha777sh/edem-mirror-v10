import { NextRequest, NextResponse } from 'next/server';
import { sendDailyNotifications } from '@/lib/telegram';

export async function GET(req: NextRequest) {
    try {
        // Verify this is being called by a cron service
        const authHeader = req.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Running daily Telegram notifications...');
        await sendDailyNotifications();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Daily notifications cron error:', error);
        return NextResponse.json({
            error: 'Failed to send notifications'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Same as GET for flexibility
    return GET(req);
}