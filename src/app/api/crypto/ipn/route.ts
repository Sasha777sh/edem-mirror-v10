import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { nowpaymentsClient } from '@/lib/nowpayments';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-nowpayments-sig') || '';

        console.log('📡 IPN webhook received from NOWPayments');
        console.log('🔍 Signature:', signature ? 'Present' : 'Missing');

        // Проверяем подпись webhook
        if (!nowpaymentsClient.verifyWebhook(body, signature)) {
            console.error('❌ Invalid NOWPayments IPN signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        console.log('📋 IPN Event:', {
            payment_id: event.payment_id,
            payment_status: event.payment_status,
            order_id: event.order_id
        });

        const paymentId = event.payment_id;
        const paymentStatus = event.payment_status;

        // Обрабатываем статусы платежа согласно NOWPayments документации
        if (paymentStatus === 'finished' || paymentStatus === 'confirmed') {
            // ✅ Платёж успешно завершён - активируем подписку
            const result = await sql`
                update subscriptions 
                set status = 'active', updated_at = now()
                where stripe_subscription_id = ${paymentId}
                returning user_id, plan, period_end
            `;

            if (result.length > 0) {
                console.log(`✅ Payment ${paymentId} confirmed - subscription activated for user ${result[0].user_id}`);

                // Логируем успешную активацию
                await sql`
                    insert into analytics_events (user_id, event_type, properties)
                    values (${result[0].user_id}, 'crypto_payment_success', ${JSON.stringify({
                    payment_id: paymentId,
                    plan: result[0].plan,
                    payment_status: paymentStatus
                })})
                `;
            } else {
                console.warn(`⚠️ Payment ${paymentId} confirmed but no subscription found`);
            }
        }
        else if (paymentStatus === 'failed' || paymentStatus === 'expired') {
            // ❌ Платёж не прошёл
            await sql`
                update subscriptions 
                set status = 'canceled', updated_at = now()
                where stripe_subscription_id = ${paymentId}
            `;

            console.log(`❌ Payment ${paymentId} ${paymentStatus}`);
        }
        else if (paymentStatus === 'partially_paid') {
            // ⏳ Частичная оплата - ждём доплаты
            console.log(`⏳ Payment ${paymentId} partially paid - waiting for full amount`);
        }
        else if (paymentStatus === 'waiting') {
            // ⏳ Ожидание оплаты
            console.log(`⏳ Payment ${paymentId} waiting for payment`);
        }
        else if (paymentStatus === 'confirming') {
            // 🔄 Подтверждение в блокчейне
            console.log(`🔄 Payment ${paymentId} confirming in blockchain`);
        }
        else if (paymentStatus === 'sending') {
            // 📤 Отправка на наш кошелёк
            console.log(`📤 Payment ${paymentId} sending to our wallet`);
        }
        else {
            console.warn(`❓ Unknown payment status: ${paymentStatus} for payment ${paymentId}`);
        }

        return NextResponse.json({
            received: true,
            payment_id: paymentId,
            status: paymentStatus
        });

    } catch (error) {
        console.error('💥 NOWPayments IPN webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}