import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const event = JSON.parse(body);

        // Verify the webhook (simple validation)
        if (!event.object || !event.object.id) {
            return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
        }

        const payment = event.object;
        const paymentId = payment.id;

        // Handle payment status changes
        if (event.event === 'payment.succeeded') {
            // Payment was successful - activate subscription
            await sql`
                update subscriptions 
                set status = 'active', updated_at = now()
                where stripe_subscription_id = ${paymentId}
            `;

            console.log(`Payment ${paymentId} succeeded - subscription activated`);
        }
        else if (event.event === 'payment.canceled') {
            // Payment was canceled
            await sql`
                update subscriptions 
                set status = 'canceled', updated_at = now()
                where stripe_subscription_id = ${paymentId}
            `;

            console.log(`Payment ${paymentId} canceled`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('YooKassa webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}