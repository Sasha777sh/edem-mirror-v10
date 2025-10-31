import { createServerSupabase } from '@/lib/supabase-server';

// User Archetype Service for EDEM Living LLM
export class UserArchetypeService {
    private supabase: ReturnType<typeof createServerSupabase>;

    constructor() {
        this.supabase = createServerSupabase();
    }

    /**
     * Set user archetype
     */
    async setUserArchetype(userId: string, archetype: string): Promise<boolean> {
        try {
            const { error } = await this.supabase
                .from('user_archetypes')
                .upsert({
                    user_id: userId,
                    archetype: archetype,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) {
                console.error('Error setting user archetype:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error setting user archetype:', error);
            return false;
        }
    }

    /**
     * Get user archetype
     */
    async getUserArchetype(userId: string): Promise<{ archetype: string } | null> {
        try {
            const { data, error } = await this.supabase
                .from('user_archetypes')
                .select('archetype')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching user archetype:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error fetching user archetype:', error);
            return null;
        }
    }

    /**
     * Get all available archetypes
     */
    getAvailableArchetypes(): string[] {
        return [
            'seeker',
            'healer',
            'warrior',
            'child',
            'wanderer'
        ];
    }
}