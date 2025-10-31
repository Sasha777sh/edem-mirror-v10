import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';
import { UserPreferencesService } from '@/lib/edem-living-llm/user-preferences';

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabase();
    
    // Get user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const userPreferencesService = new UserPreferencesService();
    const success = await userPreferencesService.clearUserHistory(userId);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error clearing user history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}