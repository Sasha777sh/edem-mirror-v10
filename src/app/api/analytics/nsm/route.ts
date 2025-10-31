import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { calculateUserNsm, calculateOverallNsm, getNsmTrend } from '@/lib/nsm';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const scope = searchParams.get('scope') || 'user'; // 'user' or 'overall'
        const days = parseInt(searchParams.get('days') || '30');

        let metrics;
        if (scope === 'user') {
            metrics = await calculateUserNsm(session.user.id);
        } else {
            metrics = await calculateOverallNsm();
        }

        // Get trend data
        const trend = await getNsmTrend(days);

        return NextResponse.json({
            ...metrics,
            trend
        });
    } catch (error) {
        console.error('Error fetching NSM metrics:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}