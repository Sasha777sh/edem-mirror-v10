import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, feedback, comment, shiftScore } = await request.json();

        // Validate input
        if (!sessionId || typeof feedback !== 'boolean') {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Insert feedback into database
        await sql`
      INSERT INTO session_feedback (user_id, session_id, feedback, comment, shift_score, created_at)
      VALUES (${session.user.id}, ${sessionId}, ${feedback}, ${comment || null}, ${shiftScore || null}, NOW())
    `;

        // Update session with completion status
        await sql`
      UPDATE sessions 
      SET completed = true, finished_at = NOW()
      WHERE id = ${sessionId} AND user_id = ${session.user.id}
    `;

        // Track analytics event
        const analyticsData = {
            event: 'session_feedback_submitted',
            properties: {
                session_id: sessionId,
                feedback: feedback,
                shift_score: shiftScore,
                has_comment: !!comment,
                user_id: session.user.id
            }
        };

        // In a real implementation, you would send this to your analytics service
        console.log('Analytics event:', analyticsData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error submitting session feedback:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}