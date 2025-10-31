import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get today's checklist status
        const today = new Date().toISOString().split('T')[0];

        // Check if user completed ritual today
        const todayRitual = await sql`
            select id, finished_at from sessions 
            where user_id = ${user.id} 
            and date(started_at) = ${today}
            and finished_at is not null
            limit 1
        `;

        // Check if user made journal entry today
        const todayJournal = await sql`
            select id from journal 
            where user_id = ${user.id} 
            and date(created_at) = ${today}
            limit 1
        `;

        // Calculate streak
        let streak = 0;
        let checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const dayActivity = await sql`
                select 1 from sessions 
                where user_id = ${user.id} 
                and date(started_at) = ${dateStr}
                and finished_at is not null
                limit 1
            `;

            if (dayActivity.length === 0) break;
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);

            // Limit check to last 30 days for performance
            if (streak > 30) break;
        }

        return NextResponse.json({
            ritual_completed: todayRitual.length > 0,
            journal_written: todayJournal.length > 0,
            practice_done: false, // Will be tracked when we add practice tracking
            streak,
            date: today
        });
    } catch (error) {
        console.error('Error checking todos:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}