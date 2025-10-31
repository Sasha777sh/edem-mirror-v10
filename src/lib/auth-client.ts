import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Client-side Supabase client
export const createClientSupabase = () =>
    createClientComponentClient();

// Get current user (client-side)
export async function getCurrentUserClient() {
    try {
        const supabase = createClientSupabase();
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