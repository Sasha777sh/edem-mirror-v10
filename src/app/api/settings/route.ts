import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { voice_preference, language, telegram_notifications, email_notifications } = await req.json();

        // Validate input
        if (!['soft', 'hard', 'therapist'].includes(voice_preference)) {
            return NextResponse.json({ error: 'Invalid voice preference' }, { status: 400 });
        }

        if (!['ru', 'en'].includes(language)) {
            return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        }

        // Update or insert user settings
        await sql`
            insert into user_settings (
                user_id, voice_preference, language, telegram_notifications, email_notifications, updated_at
            ) values (
                ${user.id}, ${voice_preference}, ${language}, ${telegram_notifications}, ${email_notifications}, now()
            )
            on conflict (user_id) do update set
                voice_preference = ${voice_preference},
                language = ${language},
                telegram_notifications = ${telegram_notifications},
                email_notifications = ${email_notifications},
                updated_at = now()
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await sql`
            select voice_preference, language, telegram_notifications, email_notifications 
            from user_settings 
            where user_id = ${user.id}
        `;

        return NextResponse.json(settings[0] || {
            voice_preference: 'soft',
            language: 'ru',
            telegram_notifications: false,
            email_notifications: true
        });
    } catch (error) {
        console.error('Error getting settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}