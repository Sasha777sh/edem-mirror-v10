import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

// Create feedback table migration
const createFeedbackTable = `
  CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id UUID REFERENCES sessions(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  
  CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_feedback_session ON user_feedback(session_id);
  CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
`;

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { sessionId, userId, rating, feedback } = body;
    
    // Validate input
    if (!sessionId || !userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    // Insert feedback
    const { error } = await supabase
      .from('user_feedback')
      .insert({
        user_id: userId,
        session_id: sessionId,
        rating,
        feedback: feedback || null,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}