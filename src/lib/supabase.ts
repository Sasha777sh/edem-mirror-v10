import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Server-side Supabase client
export const createServerSupabase = () =>
    createServerComponentClient({
        cookies,
    });

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface UserSession {
    user: User | null;
    session: any;
}

// Get current user (server-side)
export async function getCurrentUser(): Promise<User | null> {
    try {
        const supabase = createServerSupabase();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return null;
        }

        return {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
        };
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}