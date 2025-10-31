import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event, properties = {}, user_id } = body;

        if (!event) {
            return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
        }

        // Get user session for context
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        const enrichedProperties = {
            ...properties,
            user_id: user_id || session?.user?.id || 'anonymous',
            server_tracked: true,
            timestamp: new Date().toISOString(),
            ip_address: request.ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
            user_agent: request.headers.get('user-agent'),
            referer: request.headers.get('referer')
        };

        // Track the event
        analytics.track(event, enrichedProperties);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            error: 'Failed to track event',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'identify') {
            const userId = searchParams.get('user_id');
            const properties = Object.fromEntries(
                Array.from(searchParams.entries()).filter(([key]) =>
                    key !== 'action' && key !== 'user_id'
                )
            );

            if (userId) {
                analytics.identify(userId, properties);
                return NextResponse.json({ success: true });
            } else {
                return NextResponse.json({ error: 'User ID is required for identify' }, { status: 400 });
            }
        }

        if (action === 'page_view') {
            const path = searchParams.get('path') || '/';
            const properties = Object.fromEntries(
                Array.from(searchParams.entries()).filter(([key]) =>
                    key !== 'action' && key !== 'path'
                )
            );

            analytics.trackPageView(path, {
                ...properties,
                ip_address: request.ip || request.headers.get('x-forwarded-for'),
                user_agent: request.headers.get('user-agent'),
                referer: request.headers.get('referer')
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json({
            error: 'Failed to process analytics request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}