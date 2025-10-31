import { NextRequest, NextResponse } from 'next/server';
import { createTelegramBot, sendDailyNotifications } from '@/lib/telegram';

export async function POST(req: NextRequest) {
    try {
        const { action } = await req.json();
        const bot = createTelegramBot();

        if (!bot) {
            return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
        }

        switch (action) {
            case 'set_webhook':
                const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
                const success = await bot.setWebhook(webhookUrl);

                if (success) {
                    return NextResponse.json({
                        success: true,
                        webhook_url: webhookUrl
                    });
                } else {
                    return NextResponse.json({
                        error: 'Failed to set webhook'
                    }, { status: 500 });
                }

            case 'send_daily_notifications':
                await sendDailyNotifications();
                return NextResponse.json({ success: true });

            case 'get_webhook_info':
                const webhookInfo = await bot.getWebhookInfo();
                return NextResponse.json({ webhook: webhookInfo });

            default:
                return NextResponse.json({
                    error: 'Invalid action'
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Telegram admin error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const bot = createTelegramBot();
        if (!bot) {
            return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
        }

        const webhookInfo = await bot.getWebhookInfo();

        return NextResponse.json({
            bot_configured: true,
            webhook: webhookInfo,
            webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`
        });
    } catch (error) {
        console.error('Telegram admin get error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}