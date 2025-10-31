import { NextRequest, NextResponse } from 'next/server'
import { generatePrompt } from '@/lib/edem/promptEngine'
import { createServerSupabase } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const supabase = createServerSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    const body = await req.json()
    const {
      stage = 'shadow',
      voice = 'soft',
      archetype = 'wanderer',
      input = '',
      memory = []
    } = body

    const prompt = await generatePrompt({ 
      stage, 
      voice, 
      archetype, 
      input, 
      memory,
      userId: session?.user?.id
    })
    return NextResponse.json({ prompt })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate prompt' }, { status: 500 })
  }
}