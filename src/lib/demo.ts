import { sql } from './db';
import { getUserOrGuest } from './auth';
import { NextRequest } from 'next/server';

export interface DemoCheckResult {
    ok: boolean;
    reason?: 'guest_limit' | 'limit' | 'login_required';
    remaining?: number;
}

export async function checkDemoLimit(req?: NextRequest): Promise<DemoCheckResult> {
    // Create a minimal request object if none provided
    const request = req || new Request('http://localhost');
    const { userId, guestId } = await getUserOrGuest(request as NextRequest);
    const today = new Date().toISOString().slice(0, 10);

    if (userId) {
        // Registered user - check usage_counters
        const rows = await sql`
            select * from usage_counters where user_id = ${userId}
        `;

        if (!rows.length) {
            // First time user - create record
            await sql`
                insert into usage_counters (user_id, last_demo_date, demos_today)
                values (${userId}, ${today}, 0)
            `;
            return { ok: true, remaining: 2 };
        }

        const record = rows[0];

        // Reset if new day
        if (record.last_demo_date !== today) {
            await sql`
                update usage_counters 
                set last_demo_date = ${today}, demos_today = 0 
                where user_id = ${userId}
            `;
            return { ok: true, remaining: 2 };
        }

        // Check if at limit (free users get 2/day)
        if (record.demos_today >= 2) {
            return { ok: false, reason: 'limit', remaining: 0 };
        }

        return { ok: true, remaining: 2 - record.demos_today };
    } else if (guestId) {
        // Guest user - check guest_usage
        const rows = await sql`
            select * from guest_usage where guest_id = ${guestId}
        `;

        if (!rows.length) {
            // First time guest - create record
            await sql`
                insert into guest_usage (guest_id, last_demo_date, demos_today)
                values (${guestId}, ${today}, 0)
            `;
            return { ok: true, remaining: 1 };
        }

        const record = rows[0];

        // Reset if new day
        if (record.last_demo_date !== today) {
            await sql`
                update guest_usage 
                set last_demo_date = ${today}, demos_today = 0 
                where guest_id = ${guestId}
            `;
            return { ok: true, remaining: 1 };
        }

        // Check if at limit (guests get 1/day)
        if (record.demos_today >= 1) {
            return { ok: false, reason: 'guest_limit', remaining: 0 };
        }

        return { ok: true, remaining: 1 - record.demos_today };
    }

    return { ok: false, reason: 'login_required' };
}

export async function consumeDemo(req?: NextRequest): Promise<boolean> {
    // Create a minimal request object if none provided
    const request = req || new Request('http://localhost');
    const { userId, guestId } = await getUserOrGuest(request as NextRequest);
    const today = new Date().toISOString().slice(0, 10);

    if (userId) {
        try {
            await sql`
                update usage_counters 
                set demos_today = demos_today + 1, last_demo_date = ${today}
                where user_id = ${userId}
            `;
            return true;
        } catch (error) {
            console.error('Error consuming demo for user:', error);
            return false;
        }
    } else if (guestId) {
        try {
            await sql`
                update guest_usage 
                set demos_today = demos_today + 1, last_demo_date = ${today}
                where guest_id = ${guestId}
            `;
            return true;
        } catch (error) {
            console.error('Error consuming demo for guest:', error);
            return false;
        }
    }

    return false;
}