import { NextRequest, NextResponse } from 'next/server';
import { freeTrialService } from '@/lib/free-trial';
import { analytics } from '@/lib/analytics';

export async function POST(request: NextRequest) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process expired trials
        const result = await freeTrialService.processExpiredTrials();

        // Track analytics
        analytics.track('cron_trials_processed', {
            processed: result.processed,
            errors: result.errors,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            processed: result.processed,
            errors: result.errors,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to process expired trials:', error);

        analytics.track('cron_trials_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            error: 'Failed to process expired trials',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// Get expiring trials (for monitoring)
export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const hours = parseInt(searchParams.get('hours') || '24');

        const expiringTrials = await freeTrialService.getExpiringTrials(hours);

        return NextResponse.json({
            expiring_trials: expiringTrials.length,
            trials: expiringTrials.map(trial => ({
                user_id: trial.user_id,
                ends_at: trial.ends_at,
                auto_upgrade: trial.auto_upgrade
            }))
        });

    } catch (error) {
        console.error('Failed to get expiring trials:', error);
        return NextResponse.json({
            error: 'Failed to get expiring trials',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}