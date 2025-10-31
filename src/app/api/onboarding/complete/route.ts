import { createServerSupabase } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = createServerSupabase();

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { answers, reflection, lang } = body;

        // Save onboarding answers
        const { error: insertError } = await supabase
            .from('mirror_onboarding_answers')
            .insert({
                user_id: session.user.id,
                light: answers.light,
                shadow: answers.shadow,
                body: answers.body,
                world: answers.world,
                reflection: reflection,
                lang: lang
            });

        if (insertError) {
            console.error('Error saving onboarding data:', insertError);
            return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
        }

        // Mark user as having completed mirror onboarding
        const { error: updateError } = await supabase
            .from('users')
            .update({ mirror_onboarding_completed: true })
            .eq('id', session.user.id);

        if (updateError) {
            console.error('Error updating user onboarding status:', updateError);
            return NextResponse.json({ error: 'Failed to update user onboarding status' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error in onboarding completion:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}