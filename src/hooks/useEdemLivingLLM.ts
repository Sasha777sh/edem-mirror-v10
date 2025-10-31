'use client';

import { useState } from 'react';
import { createClientSupabase } from '@/lib/supabase-client';

interface SendMessageParams {
  message: string;
  sessionId?: string;
  stage?: 'shadow' | 'truth' | 'integration';
  mode?: 'mirror' | 'shadow' | 'resonator'; // New mode parameter
}

interface EdemLivingLLMResponse {
  response: string;
  emotion: string;
  scene: string;
  ritual: string;
  exitSymbol?: string;
  sessionId: string;
  mode?: 'mirror' | 'shadow' | 'resonator'; // Return mode in response
  waveAnalysis?: any; // Wave analysis data
  breathingPattern?: any; // Breathing pattern data
  resonanceFeedback?: any; // Resonance feedback data
}

interface UserPreferences {
  allowHistory: boolean;
  preferredArchetype: string;
}

export function useEdemLivingLLM() {
  const supabase = createClientSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a message to the EDEM Living LLM
   */
  const sendMessage = async (params: SendMessageParams): Promise<EdemLivingLLMResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('edem-living-llm', {
        body: {
          message: params.message,
          sessionId: params.sessionId,
          stage: params.stage || 'shadow',
          mode: params.mode || 'mirror' // Default to mirror mode
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as EdemLivingLLMResponse;
    } catch (err) {
      console.error('Error sending message to EDEM Living LLM:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a silence response
   */
  const getSilenceResponse = async (): Promise<{ response: string } | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('edem-living-llm-silence');

      if (error) {
        throw new Error(error.message);
      }

      return data as { response: string };
    } catch (err) {
      console.error('Error getting silence response:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Store user echo (reverse breathing)
   */
  const storeUserEcho = async (echoText: string, sessionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('edem-living-llm-echo', {
        body: {
          echoText,
          sessionId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Error storing user echo:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user preferences
   */
  const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edem-living-llm/preferences');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user preferences');
      }

      return data.preferences;
    } catch (err) {
      console.error('Error fetching user preferences:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle history permission
   */
  const toggleHistoryPermission = async (userId: string, allowHistory: boolean): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edem-living-llm/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: { allowHistory }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update preferences');
      }

      return data.success;
    } catch (err) {
      console.error('Error toggling history permission:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    getSilenceResponse,
    storeUserEcho,
    getUserPreferences,
    toggleHistoryPermission,
    loading,
    error
  };
}