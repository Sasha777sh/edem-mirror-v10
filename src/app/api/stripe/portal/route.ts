import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2023-10-16' });

export async function POST() {
    const user = await getUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });
    const rows = await sql`select stripe_customer_id from subscriptions where user_id=${user.id}`;
    if (!rows.length) return new NextResponse('No sub', { status: 404 });
    const portal = await stripe.billingPortal.sessions.create({ customer: rows[0].stripe_customer_id, return_url: `${process.env.NEXT_PUBLIC_APP_URL}/app/billing` });
    return NextResponse.json({ url: portal.url });
}