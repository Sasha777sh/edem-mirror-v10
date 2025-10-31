import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { priceId } = await req.json();

        if (!priceId) {
            return NextResponse.json(
                { error: 'Price ID is required' },
                { status: 400 }
            );
        }

        // Get or create customer
        let customerId: string;

        const existingSubscription = await sql`
      select stripe_customer_id from subscriptions where user_id=${user.id}
    `;

        if (existingSubscription.length > 0 && existingSubscription[0].stripe_customer_id) {
            customerId = existingSubscription[0].stripe_customer_id;
        } else {
            // Create new customer
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name || undefined,
                metadata: {
                    userId: user.id,
                },
            });
            customerId = customer.id;
        }

        // Create checkout session
        const checkoutSession = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}