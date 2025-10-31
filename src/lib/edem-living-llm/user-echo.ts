import { createServerSupabase } from '@/lib/supabase-server';

// User Echo Service for EDEM Living LLM
export class UserEchoService {
    private supabase: ReturnType<typeof createServerSupabase>;

    constructor() {
        this.supabase = createServerSupabase();
    }

    /**
     * Store user echo (reverse breathing)
     */
    async storeUserEcho(params: {
        userId: string;
        sessionId: string;
        echoText: string;
    }): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('user_echoes')
                .insert({
                    user_id: params.userId,
                    session_id: params.sessionId,
                    echo_text: params.echoText
                });

            if (error) {
                console.error('Error storing user echo:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error storing user echo:', error);
            return false;
        }
    }

    /**
     * Get user echoes
     */
    async getUserEchoes(userId: string): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from('user_echoes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching user echoes:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching user echoes:', error);
            return [];
        }
    }

    /**
     * Clear user echoes
     */
    async clearUserEchoes(userId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('user_echoes')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error clearing user echoes:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error clearing user echoes:', error);
            return false;
        }
    }
}