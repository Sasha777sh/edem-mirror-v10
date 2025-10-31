import { sql } from './db';

export interface Subscription {
    id: string;
    user_id: string;
    stripe_customer_id?: string;
    stripe_subscription_id?: string;
    plan: 'free' | 'pro';
    status?: string;
    period_end?: Date;
    created_at: Date;
}

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
    const subs = await sql`
    select * from subscriptions where user_id = ${userId}
  `;

    if (subs.length === 0) {
        return null;
    }

    return subs[0] as Subscription;
}

export async function createOrUpdateSubscription(
    userId: string,
    data: Partial<Subscription>
): Promise<Subscription> {
    const existing = await getUserSubscription(userId);

    if (existing) {
        const updated = await sql`
      update subscriptions 
      set 
        stripe_customer_id = ${data.stripe_customer_id || existing.stripe_customer_id || null},
        stripe_subscription_id = ${data.stripe_subscription_id || existing.stripe_subscription_id || null},
        plan = ${data.plan || existing.plan},
        status = ${data.status || existing.status || null},
        period_end = ${data.period_end || existing.period_end || null}
      where user_id = ${userId}
      returning *
    `;
        return updated[0] as Subscription;
    } else {
        const created = await sql`
      insert into subscriptions (user_id, stripe_customer_id, stripe_subscription_id, plan, status, period_end)
      values (${userId}, ${data.stripe_customer_id || null}, ${data.stripe_subscription_id || null}, ${data.plan || 'free'}, ${data.status || null}, ${data.period_end || null})
      returning *
    `;
        return created[0] as Subscription;
    }
}

export async function isProUser(userId: string): Promise<boolean> {
    const subscription = await getUserSubscription(userId);
    return subscription?.plan === 'pro' && subscription?.status === 'active';
}