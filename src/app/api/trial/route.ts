import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { freeTrialService } from '@/lib/free-trial';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const userId = session.user.id;

        if (action === 'status' || !action) {
            // Get trial status
            const status = await freeTrialService.getTrialStatus(userId);
            return NextResponse.json(status);
        }

        if (action === 'can_start') {
            // Check if user can start trial
            const canStart = await freeTrialService.canStartTrial(userId);
            return NextResponse.json({ can_start: canStart });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Free trial API error:', error);
        return NextResponse.json({
            error: 'Failed to process trial request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, auto_upgrade = false, payment_method } = body;
        const userId = session.user.id;

        if (action === 'start') {
            // Start free trial
            const canStart = await freeTrialService.canStartTrial(userId);
            if (!canStart) {
                return NextResponse.json({
                    error: 'Trial not available',
                    message: 'Вы уже использовали пробный период или имеете активную подписку'
                }, { status: 400 });
            }

            const trial = await freeTrialService.startTrial(userId, auto_upgrade, payment_method);

            if (trial) {
                return NextResponse.json({
                    success: true,
                    trial,
                    message: 'Пробный период активирован! 7 дней PRO бесплатно.'
                });
            } else {
                return NextResponse.json({
                    error: 'Failed to start trial',
                    message: 'Не удалось активировать пробный период'
                }, { status: 500 });
            }
        }

        if (action === 'cancel') {
            // Cancel trial
            const success = await freeTrialService.endTrial(userId, 'cancelled');

            if (success) {
                return NextResponse.json({
                    success: true,
                    message: 'Пробный период отменён'
                });
            } else {
                return NextResponse.json({
                    error: 'Failed to cancel trial',
                    message: 'Не удалось отменить пробный период'
                }, { status: 500 });
            }
        }

        if (action === 'extend') {
            // Extend trial (admin only)
            const isAdmin = session.user.email?.endsWith('@edem.admin');
            if (!isAdmin) {
                return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
            }

            const { additional_days = 7 } = body;
            const success = await freeTrialService.extendTrial(userId, additional_days);

            if (success) {
                return NextResponse.json({
                    success: true,
                    message: `Пробный период продлён на ${additional_days} дней`
                });
            } else {
                return NextResponse.json({
                    error: 'Failed to extend trial'
                }, { status: 500 });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Free trial API error:', error);
        return NextResponse.json({
            error: 'Failed to process trial request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}