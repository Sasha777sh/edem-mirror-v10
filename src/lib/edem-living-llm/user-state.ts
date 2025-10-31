// User State Service - manages user emotional states and resonance metrics

import { createServerSupabase } from '@/lib/supabase-server';

export interface UserState {
    id?: string;
    user_id: string;
    current_emotion: string;
    current_scene: string;
    emotional_intensity: number;
    communication_style: string;
    pace: string;
    tone: string;
    focus: string;
    archetype: string;
    session_count: number;
    last_session_at: Date;
    resonance_score: number;
    created_at?: Date;
    updated_at?: Date;
}

export interface ResonanceHistory {
    id?: string;
    user_id: string;
    session_id: string;
    resonance_score: number;
    conversation_frequency: number;
    response_latency: number;
    emotional_alignment: number;
    pause_synchronization: number;
    engagement_depth: number;
    session_duration: number;
    insights: string[];
    created_at?: Date;
}

export class UserStateService {
    private supabase: ReturnType<typeof createServerSupabase>;

    constructor() {
        this.supabase = createServerSupabase();
    }

    /**
     * Get current user state
     */
    async getUserState(userId: string): Promise<UserState | null> {
        try {
            const { data, error } = await this.supabase
                .from('user_state')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned, which is fine
                    return null;
                }
                throw error;
            }

            return data as UserState;
        } catch (error) {
            console.error('Error getting user state:', error);
            return null;
        }
    }

    /**
     * Update or create user state
     */
    async updateUserState(state: Omit<UserState, 'id' | 'created_at' | 'updated_at'>): Promise<UserState | null> {
        try {
            // First try to update existing state
            const { data: existingState } = await this.supabase
                .from('user_state')
                .select('id')
                .eq('user_id', state.user_id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (existingState) {
                // Update existing state
                const { data, error } = await this.supabase
                    .from('user_state')
                    .update({
                        ...state,
                        updated_at: new Date()
                    })
                    .eq('id', existingState.id)
                    .select()
                    .single();

                if (error) throw error;
                return data as UserState;
            } else {
                // Create new state
                const { data, error } = await this.supabase
                    .from('user_state')
                    .insert([state])
                    .select()
                    .single();

                if (error) throw error;
                return data as UserState;
            }
        } catch (error) {
            console.error('Error updating user state:', error);
            return null;
        }
    }

    /**
     * Save resonance history
     */
    async saveResonanceHistory(history: Omit<ResonanceHistory, 'id' | 'created_at'>): Promise<ResonanceHistory | null> {
        try {
            const { data, error } = await this.supabase
                .from('user_resonance_history')
                .insert([history])
                .select()
                .single();

            if (error) throw error;
            return data as ResonanceHistory;
        } catch (error) {
            console.error('Error saving resonance history:', error);
            return null;
        }
    }

    /**
     * Get resonance history for a user
     */
    async getResonanceHistory(userId: string, limit: number = 10): Promise<ResonanceHistory[]> {
        try {
            const { data, error } = await this.supabase
                .from('user_resonance_history')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as ResonanceHistory[];
        } catch (error) {
            console.error('Error getting resonance history:', error);
            return [];
        }
    }

    /**
     * Get average resonance score for a user
     */
    async getAverageResonanceScore(userId: string): Promise<number> {
        try {
            const { data, error } = await this.supabase
                .from('user_resonance_history')
                .select('resonance_score')
                .eq('user_id', userId);

            if (error) throw error;

            if (data.length === 0) return 0;

            const sum = data.reduce((acc, record) => acc + (record.resonance_score || 0), 0);
            return Math.round(sum / data.length);
        } catch (error) {
            console.error('Error calculating average resonance score:', error);
            return 0;
        }
    }
}