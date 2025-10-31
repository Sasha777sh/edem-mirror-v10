import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendSubscriptionNotification, sendRitualNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        // This endpoint should be protected and called only by internal services
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, userId, data } = body;

        if (!userId || !type) {
            return NextResponse.json({ error: 'User ID and type are required' }, { status: 400 });
        }

        // Get user email
        const user = await sql`
            SELECT email, settings FROM users WHERE id = ${userId}
        `;

        if (user.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userEmail = user[0].email;
        const userSettings = user[0].settings || {};

        // Check if user has email notifications enabled
        if (!userSettings.email_notifications) {
            return NextResponse.json({
                success: true,
                message: 'User has email notifications disabled'
            });
        }

        let success = false;

        // Handle different notification types
        switch (type) {
            case 'subscription_trial_started':
                success = await sendSubscriptionNotification(
                    userEmail,
                    'trial_started',
                    data
                );
                break;

            case 'subscription_trial_ending':
                success = await sendSubscriptionNotification(
                    userEmail,
                    'trial_ending',
                    data
                );
                break;

            case 'subscription_activated':
                success = await sendSubscriptionNotification(
                    userEmail,
                    'subscription_activated',
                    data
                );
                break;

            case 'subscription_cancelled':
                success = await sendSubscriptionNotification(
                    userEmail,
                    'subscription_cancelled',
                    data
                );
                break;

            case 'payment_failed':
                success = await sendSubscriptionNotification(
                    userEmail,
                    'payment_failed',
                    data
                );
                break;

            case 'ritual_completed':
                success = await sendRitualNotification(
                    userEmail,
                    data?.ritualType || 'Ритуал самопознания',
                    data
                );
                break;

            default:
                return NextResponse.json({ error: 'Unknown notification type' }, { status: 400 });
        }

        if (success) {
            return NextResponse.json({
                success: true,
                message: 'Email notification sent successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to send email notification'
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Email notification error:', error);
        return NextResponse.json({
            error: 'Failed to send email notification',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}