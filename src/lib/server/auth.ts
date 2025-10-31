import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function getUserAndRole() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { user: null, role: 'public' as const };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    const role = (profile?.role ?? 'registered') as 'public' | 'registered' | 'guardian';
    return { user: session.user, role };
}