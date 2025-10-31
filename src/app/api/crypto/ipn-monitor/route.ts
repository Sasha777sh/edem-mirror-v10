import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// API для мониторинга IPN событий (админка)
export async function GET(req: NextRequest) {
    try {
        // Получаем последние IPN события из аналитики
        const events = await sql`
            select 
                id,
                event_type,
                properties,
                timestamp,
                user_id
            from analytics_events 
            where event_type like 'crypto_%'
            order by timestamp desc 
            limit 50
        `;

        // Получаем статистику по платежам
        const stats = await sql`
            select 
                count(*) as total_payments,
                count(case when properties->>'payment_status' = 'finished' then 1 end) as successful_payments,
                count(case when properties->>'payment_status' = 'failed' then 1 end) as failed_payments,
                count(case when properties->>'payment_status' = 'waiting' then 1 end) as pending_payments
            from analytics_events 
            where event_type = 'crypto_payment_success'
            and timestamp >= current_date - interval '7 days'
        `;

        return NextResponse.json({
            success: true,
            data: {
                recent_events: events,
                weekly_stats: stats[0] || {
                    total_payments: 0,
                    successful_payments: 0,
                    failed_payments: 0,
                    pending_payments: 0
                }
            }
        });

    } catch (error) {
        console.error('IPN monitoring error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch IPN events'
        }, { status: 500 });
    }
}