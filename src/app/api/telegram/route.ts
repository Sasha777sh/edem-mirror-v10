import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { linkTelegramToUser } from '@/lib/telegram';

export async function POST(request: Request) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatId } = await request.json();

        if (!chatId) {
            return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
        }

        await linkTelegramToUser(chatId, user.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error linking Telegram:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}