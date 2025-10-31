import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { analytics } from '@/lib/analytics';

/**
 * POST /api/practice/complete
 * Mark a practice as completed by a user
 */
export async function POST(request: Request) {
    try {
        const supabase = createServerSupabase();

        // Get user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { practiceId } = body;

        if (!practiceId) {
            return NextResponse.json({ error: 'Practice ID is required' }, { status: 400 });
        }

        // Mark practice as completed
        const { data, error } = await supabase
            .from('practices')
            .update({
                completed: true,
                completed_at: new Date().toISOString()
            })
            .eq('id', practiceId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error completing practice:', error);
            return NextResponse.json({ error: 'Failed to complete practice' }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: 'Practice not found' }, { status: 404 });
        }

        // Track completion in analytics
        analytics.track('practice_completed', {
            practice_id: practiceId,
            user_id: userId,
            completion_time: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            practice: data
        });
    } catch (error) {
        console.error('Error in practice completion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}