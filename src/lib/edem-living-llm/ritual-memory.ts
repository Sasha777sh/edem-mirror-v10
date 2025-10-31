import { createServerSupabase } from '@/lib/supabase-server';

// Ritual Memory Service for EDEM Living LLM
export class RitualMemoryService {
    private supabase: ReturnType<typeof createServerSupabase>;

    constructor() {
        this.supabase = createServerSupabase();
    }

    /**
     * Store a ritual interaction in memory
     */
    async storeRitualInteraction(params: {
        userId: string;
        sessionId: string;
        emotion: string;
        scene: string;
        ritualText: string;
        userInput: string;
    }): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('ritual_memory')
                .insert({
                    user_id: params.userId,
                    session_id: params.sessionId,
                    emotion: params.emotion,
                    scene: params.scene,
                    ritual: params.ritualText,
                    user_input: params.userInput
                });

            if (error) {
                console.error('Error storing ritual interaction:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error storing ritual interaction:', error);
            return false;
        }
    }

    /**
     * Get user's ritual history
     */
    async getUserRitualHistory(userId: string): Promise<any[]> {
        try {
            const { data, error } = await this.supabase
                .from('ritual_memory')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching user ritual history:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error fetching user ritual history:', error);
            return [];
        }
    }

    /**
     * Clear user's ritual history
     */
    async clearUserRitualHistory(userId: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('ritual_memory')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error clearing user ritual history:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error clearing user ritual history:', error);
            return false;
        }
    }
}