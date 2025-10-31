import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { featureFlags } from '@/lib/feature-flags';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const flagIds = searchParams.get('flags')?.split(',') || [];

        if (flagIds.length === 0) {
            return NextResponse.json({ error: 'At least one flag ID is required' }, { status: 400 });
        }

        // Get user session (optional for feature flags)
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        let userId: string | undefined;
        let userPlan = 'free';

        if (session?.user) {
            userId = session.user.id;

            // Get user subscription plan
            try {
                const subscription = await sql`
                    SELECT plan, status FROM subscriptions 
                    WHERE user_id = ${userId} AND status = 'active'
                    ORDER BY created_at DESC 
                    LIMIT 1
                `;

                if (subscription.length > 0) {
                    userPlan = subscription[0].plan;
                }
            } catch (error) {
                console.warn('Failed to get user subscription:', error);
            }
        }

        // Check multiple flags
        const flagResults = await featureFlags.getFlags(flagIds, userId, userPlan);

        return NextResponse.json({
            flags: flagResults,
            user: {
                id: userId,
                plan: userPlan
            }
        });

    } catch (error) {
        console.error('Feature flags check error:', error);
        return NextResponse.json({
            error: 'Failed to check feature flags',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { flags: flagIds = [] } = body;

        if (!Array.isArray(flagIds) || flagIds.length === 0) {
            return NextResponse.json({ error: 'Flag IDs array is required' }, { status: 400 });
        }

        // Get user session (optional for feature flags)
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        let userId: string | undefined;
        let userPlan = 'free';

        if (session?.user) {
            userId = session.user.id;

            // Get user subscription plan
            try {
                const subscription = await sql`
                    SELECT plan, status FROM subscriptions 
                    WHERE user_id = ${userId} AND status = 'active'
                    ORDER BY created_at DESC 
                    LIMIT 1
                `;

                if (subscription.length > 0) {
                    userPlan = subscription[0].plan;
                }
            } catch (error) {
                console.warn('Failed to get user subscription:', error);
            }
        }

        // Check multiple flags
        const flagResults = await featureFlags.getFlags(flagIds, userId, userPlan);

        return NextResponse.json({
            flags: flagResults,
            user: {
                id: userId,
                plan: userPlan
            }
        });

    } catch (error) {
        console.error('Feature flags check error:', error);
        return NextResponse.json({
            error: 'Failed to check feature flags',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}