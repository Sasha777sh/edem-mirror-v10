import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const days = parseInt(searchParams.get('days') || '30');

        // Get emotional data over time
        const emotionData = await sql`
            select 
                date(started_at) as date,
                count(*) as rituals,
                array_agg(distinct polarity) as polarities
            from sessions 
            where user_id = ${user.id} 
            and started_at >= now() - interval '${days} days'
            and finished_at is not null
            group by date(started_at)
            order by date desc
        `;

        // Get overall statistics
        const stats = await sql`
            select 
                (select count(*) from sessions where user_id = ${user.id} and finished_at is not null) as total_sessions,
                (select count(*) from journal where user_id = ${user.id}) as total_journal_entries,
                (select count(distinct date(started_at)) from sessions where user_id = ${user.id} and finished_at is not null) as total_active_days
        `;

        // Get polarity breakdown
        const polarityStats = await sql`
            select 
                polarity,
                count(*) as count
            from sessions 
            where user_id = ${user.id} 
            and finished_at is not null
            and polarity is not null
            group by polarity
            order by count desc
        `;

        // Calculate current streak
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

            if (streak > 30) break;
        }

        return NextResponse.json({
            emotionData,
            stats: stats[0],
            polarityStats,
            streak
        });
    } catch (error) {
        console.error('Error getting progress data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}