import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { referralService } from '@/lib/referrals';
import { analytics } from '@/lib/analytics';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const refCode = requestUrl.searchParams.get('ref');

    if (code) {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore,
        });

        const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);

        // If user signed up and has referral code, apply it
        if (session?.user && refCode) {
            try {
                const success = await referralService.useReferralCode(refCode, session.user.id);

                if (success) {
                    analytics.track('referral_signup_success', {
                        user_id: session.user.id,
                        referral_code: refCode
                    });

                    // Redirect with success message
                    return NextResponse.redirect(requestUrl.origin + '/app?referral=success');
                } else {
                    analytics.track('referral_signup_failed', {
                        user_id: session.user.id,
                        referral_code: refCode,
                        reason: 'invalid_or_expired'
                    });
                }
            } catch (error) {
                console.error('Failed to apply referral code:', error);
                analytics.track('referral_signup_error', {
                    user_id: session.user.id,
                    referral_code: refCode,
                    error: error instanceof Error ? error.message : 'unknown'
                });
            }
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(requestUrl.origin + '/app');
}