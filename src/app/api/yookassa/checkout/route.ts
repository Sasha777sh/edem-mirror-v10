import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

// YooKassa API client
const YOOKASSA_API = 'https://api.yookassa.ru/v3';

interface YooKassaPayment {
    id: string;
    status: string;
    amount: {
        value: string;
        currency: string;
    };
    confirmation: {
        type: string;
        confirmation_url: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { plan } = await req.json();

        if (!plan || !['24h', '30d'].includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan. Must be "24h" or "30d"' },
                { status: 400 }
            );
        }

        // Plan pricing
        const pricing = {
            '24h': { amount: '499.00', description: 'EDEM - доступ на 24 часа' },
            '30d': { amount: '1499.00', description: 'EDEM - доступ на 30 дней' }
        };

        const planDetails = pricing[plan as keyof typeof pricing];

        // Create payment with YooKassa
        const paymentData = {
            amount: {
                value: planDetails.amount,
                currency: 'RUB'
            },
            confirmation: {
                type: 'redirect',
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/success`
            },
            capture: true,
            description: planDetails.description,
            metadata: {
                user_id: user.id,
                plan: plan,
                email: user.email || 'unknown'
            }
        };

        const authString = Buffer.from(
            `${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`
        ).toString('base64');

        const response = await fetch(`${YOOKASSA_API}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authString}`,
                'Idempotence-Key': `${user.id}-${plan}-${Date.now()}`
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('YooKassa API error:', error);
            throw new Error('Payment creation failed');
        }

        const payment: YooKassaPayment = await response.json();

        // Store payment info in our database
        await sql`
            insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, period_end)
            values (
                ${user.id},
                'yookassa_${payment.id}',
                ${payment.id},
                ${plan === '24h' ? 'pro' : 'pro'},
                'pending',
                ${plan === '24h' ?
                new Date(Date.now() + 24 * 60 * 60 * 1000) :
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
            )
            on conflict (user_id) do update set
                stripe_customer_id = 'yookassa_${payment.id}',
                stripe_subscription_id = ${payment.id},
                plan = ${plan === '24h' ? 'pro' : 'pro'},
                status = 'pending',
                period_end = ${plan === '24h' ?
                new Date(Date.now() + 24 * 60 * 60 * 1000) :
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
                updated_at = now()
        `;

        return NextResponse.json({
            url: payment.confirmation.confirmation_url,
            payment_id: payment.id
        });
    } catch (error) {
        console.error('Error creating YooKassa payment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}