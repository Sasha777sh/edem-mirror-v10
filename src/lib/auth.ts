import { NextRequest } from 'next/server';
import { createServerSupabase, getCurrentUser, User } from './supabase';
import { sql } from './db';
import crypto from 'crypto-js';

export type { User };

// Get current user (server-side)
export async function getUser(): Promise<User | null> {
    return await getCurrentUser();
}

// Get user or guest ID for rate limiting
export async function getUserOrGuest(req?: NextRequest): Promise<{ userId?: string; guestId?: string }> {
    try {
        const user = await getCurrentUser();

        if (user) {
            return { userId: user.id };
        }

        // If no request provided, we can't generate a guest ID
        if (!req) {
            return { guestId: 'unknown' };
        }

        // Generate guest ID from IP + User-Agent
        const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
        const userAgent = req.headers.get('user-agent') || 'unknown';
        const guestId = crypto.SHA256(`${ip}-${userAgent}`).toString();

        return { guestId };
    } catch (error) {
        console.error('Error getting user or guest:', error);
        // Fallback to IP-based guest ID
        const ip = req?.ip || req?.headers.get('x-forwarded-for') || 'fallback';
        const guestId = crypto.SHA256(ip || 'fallback').toString();
        return { guestId };
    }
}

// Create or update user in our database (called after successful auth)
export async function upsertUser(user: User): Promise<User> {
    try {
        const existingUsers = await sql`
      select * from users where id = ${user.id}
    `;

        if (existingUsers.length > 0) {
            // Update existing user
            const updated = await sql`
        update users 
        set email = ${user.email}, 
            name = ${user.name || null}, 
            avatar_url = ${user.avatar_url || null},
            updated_at = now()
        where id = ${user.id}
        returning *
      `;
            return updated[0] as User;
        } else {
            // Insert new user
            const inserted = await sql`
        insert into users (id, email, name, avatar_url)
        values (${user.id}, ${user.email}, ${user.name || null}, ${user.avatar_url || null})
        returning *
      `;

            // Create initial subscription record
            await sql`
        insert into subscriptions (user_id, plan, status)
        values (${user.id}, 'free', 'active')
        on conflict (user_id) do nothing
      `;

            return inserted[0] as User;
        }
    } catch (error) {
        console.error('Error upserting user:', error);
        throw error;
    }
}

// Check if user is PRO
export async function isProUser(userId: string): Promise<boolean> {
    try {
        const subscriptions = await sql`
      select plan, status from subscriptions 
      where user_id = ${userId} and status = 'active'
    `;

        return subscriptions.length > 0 && subscriptions[0].plan === 'pro';
    } catch (error) {
        console.error('Error checking pro status:', error);
        return false;
    }
}