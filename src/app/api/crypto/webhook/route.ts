import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { nowpaymentsClient } from '@/lib/nowpayments';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-nowpayments-sig') || '';

        // Проверяем подпись webhook
        if (!nowpaymentsClient.verifyWebhook(body, signature)) {
            console.error('Invalid NOWPayments webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        const paymentId = event.payment_id;

        console.log('NOWPayments webhook received:', event.payment_status, paymentId);

        // Обрабатываем статусы платежа
        if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
            // Платёж успешно завершён - активируем подписку
            await sql`
                update subscriptions 
                set status = 'active', updated_at = now()
                where stripe_subscription_id = ${paymentId}
            `;

            console.log(`Crypto payment ${paymentId} confirmed - subscription activated`);
        }
        else if (event.payment_status === 'failed' || event.payment_status === 'expired') {
            // Платёж не прошёл
            await sql`
                update subscriptions 
                set status = 'canceled', updated_at = now()
                where stripe_subscription_id = ${paymentId}
            `;

            console.log(`Crypto payment ${paymentId} failed/expired`);
        }
        else if (event.payment_status === 'partially_paid') {
            // Частичная оплата - ждём доплаты
            console.log(`Crypto payment ${paymentId} partially paid`);
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('NOWPayments webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}