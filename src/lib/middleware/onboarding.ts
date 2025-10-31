import { createServerSupabase } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to check if user has completed onboarding
 * Redirects to onboarding if not completed
 */
export async function checkOnboarding(req: NextRequest) {
    const supabase = createServerSupabase();

    const { data: { session } } = await supabase.auth.getSession();

    // If no session, allow to proceed (will be caught by auth middleware)
    if (!session) {
        return null;
    }

    // Check if user has completed mirror onboarding
    const { data: user, error } = await supabase
        .from('users')
        .select('mirror_onboarding_completed')
        .eq('id', session.user.id)
        .single();

    // If error or onboarding not completed, redirect to onboarding
    if (error || !user?.mirror_onboarding_completed) {
        const url = req.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
    }

    return null;
}