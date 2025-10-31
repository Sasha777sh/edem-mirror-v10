import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2023-10-16' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;

                if (!userId) {
                    console.error('No userId in session metadata');
                    break;
                }

                // Get the subscription
                if (session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    );

                    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;

                    await sql`
            insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, period_end)
            values (${userId}, ${customerId}, ${subscription.id}, 'pro', ${subscription.status}, ${new Date(subscription.current_period_end * 1000)})
            on conflict (user_id)
            do update set 
              stripe_customer_id = ${customerId},
              stripe_subscription_id = ${subscription.id},
              plan = 'pro',
              status = ${subscription.status},
              period_end = ${new Date(subscription.current_period_end * 1000)}
          `;
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;

                await sql`
          update subscriptions 
          set status = ${subscription.status},
              period_end = ${new Date(subscription.current_period_end * 1000)}
          where stripe_subscription_id = ${subscription.id}
        `;
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;

                await sql`
          update subscriptions 
          set status = 'canceled',
              plan = 'free'
          where stripe_subscription_id = ${subscription.id}
        `;
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        );
    }
}