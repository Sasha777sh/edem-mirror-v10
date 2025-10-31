// User Preferences Service for EDEM Living LLM
// Manages user preferences, history control, and privacy settings

import { createServerSupabase } from '@/lib/supabase-server';

// User Preferences Service for EDEM Living LLM
export class UserPreferencesService {
  private supabase: ReturnType<typeof createServerSupabase>;

  constructor() {
    this.supabase = createServerSupabase();
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If not found, return default preferences
        if (error.code === 'PGRST116') {
          return {
            allowHistory: true,
            preferredArchetype: 'wanderer'
          };
        }
        console.error('Error fetching user preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  /**
   * Set user preferences
   */
  async setUserPreferences(userId: string, preferences: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          allow_history: preferences.allowHistory,
          preferred_archetype: preferences.preferredArchetype,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error setting user preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error setting user preferences:', error);
      return false;
    }
  }

  /**
   * Toggle history permission
   */
  async toggleHistoryPermission(userId: string, allowHistory: boolean): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          allow_history: allowHistory,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error toggling history permission:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error toggling history permission:', error);
      return false;
    }
  }

  /**
   * Clear user history
   */
  async clearUserHistory(userId: string): Promise<boolean> {
    try {
      const { error: sessionError } = await this.supabase
        .from('session_history')
        .delete()
        .eq('user_id', userId);

      const { error: ritualError } = await this.supabase
        .from('ritual_memory')
        .delete()
        .eq('user_id', userId);

      const { error: echoError } = await this.supabase
        .from('user_echoes')
        .delete()
        .eq('user_id', userId);

      if (sessionError || ritualError || echoError) {
        console.error('Error clearing user history:', sessionError || ritualError || echoError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error clearing user history:', error);
      return false;
    }
  }

  /**
   * Save session history
   */
  async saveSessionHistory(data: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('session_history')
        .insert({
          user_id: data.userId,
          session_id: data.sessionId,
          primary_emotion: data.primaryEmotion,
          secondary_emotion: data.secondaryEmotion,
          emotion_intensity: data.emotionIntensity,
          communication_style: data.communicationStyle,
          pace: data.pace,
          tone: data.tone,
          focus: data.focus,
          archetype: data.archetype,
          scene_id: data.sceneId,
          scene_name: data.sceneName,
          ritual: data.ritual,
          user_input: data.userInput,
          ai_response: data.aiResponse
        });

      if (error) {
        console.error('Error saving session history:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving session history:', error);
      return false;
    }
  }

  /**
   * Add user echo
   */
  async addUserEcho(params: {
    userId: string;
    echoText: string;
    emotionContext?: string;
    isActive: boolean;
  }): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_echoes')
        .insert({
          user_id: params.userId,
          echo_text: params.echoText,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error adding user echo:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding user echo:', error);
      return false;
    }
  }
}