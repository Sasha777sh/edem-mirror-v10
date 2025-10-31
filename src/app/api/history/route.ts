import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user subscription
        const subscription = await sql`
            select plan, status from subscriptions 
            where user_id = ${user.id}
        `;

        const plan = subscription[0]?.plan || 'free';
        const isProUser = plan === 'pro' && subscription[0]?.status === 'active';

        // Get sessions (limit to last 24 hours for free users, 30 days for PRO)
        const timeLimit = isProUser ? '30 days' : '24 hours';
        const sessions = await sql`
            select 
                id, voice, step, inputs, output, started_at, finished_at,
                case when finished_at is not null then true else false end as completed,
                truth_cut, archetype, todays_step
            from sessions
            where user_id = ${user.id}
            and started_at >= current_timestamp - interval '${timeLimit}'
            order by started_at desc
            limit 50
        `;

        return NextResponse.json({
            sessions,
            isProUser,
            plan
        });
    } catch (error) {
        console.error('Error fetching history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}