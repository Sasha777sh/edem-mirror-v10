import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        // Verify this is a legitimate cron request
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find trials ending in the next 24 hours
        const expiringTrials = await sql`
            SELECT ft.user_id, ft.ends_at, u.email
            FROM free_trials ft
            JOIN users u ON ft.user_id = u.id
            WHERE ft.is_active = true
            AND ft.ends_at <= CURRENT_TIMESTAMP + INTERVAL '24 hours'
            AND ft.ends_at > CURRENT_TIMESTAMP
        `;

        let processed = 0;
        let errors = 0;

        // Send notifications for each expiring trial
        for (const trial of expiringTrials) {
            try {
                // Call email notification API
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/email`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${cronSecret}`
                        },
                        body: JSON.stringify({
                            type: 'subscription_trial_ending',
                            userId: trial.user_id,
                            data: {
                                endsAt: trial.ends_at
                            }
                        })
                    }
                );

                if (response.ok) {
                    processed++;
                } else {
                    errors++;
                    console.error(`Failed to send notification for user ${trial.user_id}`);
                }
            } catch (error) {
                errors++;
                console.error(`Error sending notification for user ${trial.user_id}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            errors,
            message: `Processed ${processed} trial ending notifications with ${errors} errors`
        });

    } catch (error) {
        console.error('Trial notifications cron error:', error);
        return NextResponse.json({
            error: 'Failed to process trial notifications',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}