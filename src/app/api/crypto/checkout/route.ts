import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { nowpaymentsClient, CRYPTO_PLANS, CryptoPlan } from '@/lib/nowpayments';

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { plan, crypto_currency } = await req.json();

        if (!plan || !['24h', '30d'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "24h" or "30d"' },
                { status: 400 }
            );
        }

        const planDetails = CRYPTO_PLANS[plan as CryptoPlan];
        const orderId = `edem_${user.id}_${Date.now()}`;

        // Создаём платёж в NOWPayments
        const payment = await nowpaymentsClient.createPayment({
            price_amount: planDetails.amount,
            price_currency: planDetails.currency,
            pay_currency: crypto_currency || 'btc', // По умолчанию BTC
            order_id: orderId,
            order_description: planDetails.description,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/app?payment=cancelled`,
        });

        // Сохраняем в базу как pending
        await sql`
            insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, period_end)
            values (
                ${user.id},
                ${'nowpayments_' + payment.id},
                ${payment.id},
                'pro',
                'pending',
                ${new Date(Date.now() + planDetails.duration)}
            )
            on conflict (user_id) do update set
                stripe_customer_id = ${'nowpayments_' + payment.id},
                stripe_subscription_id = ${payment.id},
                plan = 'pro',
                status = 'pending',
                period_end = ${new Date(Date.now() + planDetails.duration)},
                updated_at = now()
        `;

        return NextResponse.json({
            payment_url: payment.payment_url,
            payment_id: payment.id,
            pay_address: payment.pay_address,
            pay_amount: payment.pay_amount,
            pay_currency: payment.pay_currency,
        });

    } catch (error) {
        console.error('Error creating crypto payment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}