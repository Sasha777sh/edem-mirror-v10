import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { referralService } from '@/lib/referrals';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');
        const userId = session.user.id;

        if (action === 'code') {
            // Get or create referral code for user
            const referralCode = await referralService.getOrCreateReferralCode(userId);
            const referralLink = referralService.generateReferralLink(referralCode.code);

            return NextResponse.json({
                code: referralCode.code,
                link: referralLink,
                usage_count: referralCode.usage_count,
                max_uses: referralCode.max_uses,
                created_at: referralCode.created_at
            });
        }

        if (action === 'stats') {
            // Get referral statistics
            const stats = await referralService.getReferralStats(userId);
            return NextResponse.json(stats);
        }

        if (action === 'history') {
            // Get referral history
            const limit = parseInt(searchParams.get('limit') || '20');
            const history = await referralService.getReferralHistory(userId, limit);
            return NextResponse.json({ history });
        }

        if (action === 'validate') {
            // Validate referral code (public endpoint)
            const code = searchParams.get('code');
            if (!code) {
                return NextResponse.json({ error: 'Code is required' }, { status: 400 });
            }

            const validation = await referralService.validateReferralCode(code);
            return NextResponse.json(validation);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Referral API error:', error);
        return NextResponse.json({
            error: 'Failed to process referral request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { action, code } = body;
        const userId = session.user.id;

        if (action === 'use') {
            // Use referral code for current user
            if (!code) {
                return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
            }

            const success = await referralService.useReferralCode(code, userId);

            if (success) {
                return NextResponse.json({
                    success: true,
                    message: 'Реферальный код применён! Вы получили 3 дня PRO в подарок.'
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: 'Код недействителен или уже использован.'
                }, { status: 400 });
            }
        }

        if (action === 'create') {
            // Force create new referral code (admin only)
            const referralCode = await referralService.getOrCreateReferralCode(userId);
            const referralLink = referralService.generateReferralLink(referralCode.code);

            return NextResponse.json({
                code: referralCode.code,
                link: referralLink,
                created: true
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Referral API error:', error);
        return NextResponse.json({
            error: 'Failed to process referral request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}