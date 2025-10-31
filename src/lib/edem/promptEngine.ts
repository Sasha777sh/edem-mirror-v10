import { LIVING_PROMPT, getVoice, getRitualsForCategory } from '@/lib/edem-living-llm/prompt';
import { profileArchetype, getArchetypeDescription } from '@/lib/edem-living-llm/archetype-profiler';
import { adaptStyle, applyStyleAdaptation } from '@/lib/edem-living-llm/style-adapter';
import { EXTENDED_ARCHETYPES, EXTENDED_EMOTIONS, EXTENDED_RITUALS, EXTENDED_SCENES } from '@/lib/edem-living-llm/extended-content';
import { createServerSupabase } from '@/lib/supabase-server';

// Simple in-memory cache for performance optimization
const cache: Record<string, any> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Types
type Stage = 'shadow' | 'truth' | 'integration';
type Voice = keyof typeof LIVING_PROMPT.voices;
type Archetype = keyof typeof LIVING_PROMPT.archetypes;
type Emotion = keyof typeof EXTENDED_SCENES;

interface PromptParams {
  stage: Stage;
  voice: Voice;
  archetype: Archetype;
  input: string;
  memory: string[];
  userId?: string;
}

interface EmotionDetectionResult {
  primary: string;
  secondary: string;
  intensity: number;
}

interface CachedItem {
  data: any;
  timestamp: number;
}

// Cache helper functions
function getFromCache(key: string) {
  const item = cache[key];
  if (!item) return null;
  
  // Check if cache is expired
  if (Date.now() - item.timestamp > CACHE_TTL) {
    delete cache[key];
    return null;
  }
  
  return item.data;
}

function setInCache(key: string, data: any) {
  cache[key] = {
    data,
    timestamp: Date.now()
  };
}

// Performance optimized emotion detection based on user input
function detectEmotion(input: string): EmotionDetectionResult {
  // Check cache first
  const cacheKey = `emotion_${input}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  if (!input) {
    const result = { primary: 'neutral', secondary: 'curious', intensity: 0.5 };
    setInCache(cacheKey, result);
    return result;
  }

  const lowerInput = input.toLowerCase();
  
  // Combine base emotions with extended emotions
  const allEmotions = { ...EXTENDED_EMOTIONS };
  
  // Count emotional keywords
  const emotionScores: Record<string, number> = {};
  
  for (const [emotion, keywords] of Object.entries(allEmotions)) {
    emotionScores[emotion] = 0;
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        emotionScores[emotion] += 1;
      }
    }
  }
  
  // Find primary and secondary emotions
  let primary = 'neutral';
  let secondary = 'curious';
  let maxScore = 0;
  let secondMaxScore = 0;
  
  for (const [emotion, score] of Object.entries(emotionScores)) {
    if (score > maxScore) {
      secondMaxScore = maxScore;
      secondary = primary;
      maxScore = score;
      primary = emotion;
    } else if (score > secondMaxScore) {
      secondMaxScore = score;
      secondary = emotion;
    }
  }
  
  // Calculate intensity (0-1)
  const intensity = Math.min(1, maxScore / 3);
  
  const result = { primary, secondary, intensity };
  setInCache(cacheKey, result);
  return result;
}

// Performance optimized scene selection based on emotion and time of day
function selectScene(emotion: string, timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
  // Check cache first
  const cacheKey = `scene_${emotion}_${timeOfDay}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // Combine base scenes with extended scenes
  const allScenes = { ...EXTENDED_SCENES };
  
  // Get scenes for the emotion
  const emotionScenes = allScenes[emotion as Emotion] || allScenes.neutral;
  
  // Filter by time of day
  const timeFilteredScenes = emotionScenes.filter(scene => 
    scene.time.includes(timeOfDay) || scene.time.includes('any')
  );
  
  // If no scenes match time, use any time scenes
  const availableScenes = timeFilteredScenes.length > 0 ? timeFilteredScenes : emotionScenes;
  
  // Select randomly from available scenes
  const randomIndex = Math.floor(Math.random() * availableScenes.length);
  const result = availableScenes[randomIndex].id;
  
  setInCache(cacheKey, result);
  return result;
}

// Performance optimized ritual selection based on emotion
function selectRitual(emotion: string, memory: string[]): string {
  // Check cache first
  const cacheKey = `ritual_${emotion}_${memory.join('_')}`;
  const cached = getFromCache(cacheKey);
  if (cached) return cached;

  // Map emotions to ritual categories
  const emotionToCategory: Record<string, string> = {
    'anxiety': 'loss',
    'shame': 'shame',
    'anger': 'control',
    'sadness': 'loss',
    'loneliness': 'loss',
    'guilt': 'guilt',
    'neutral': 'loss',
    'confusion': 'loss',
    'envy': 'loss',
    'gratitude': 'loss',
    'hope': 'loss',
    'despair': 'loss',
    'curiosity': 'loss',
    'contentment': 'loss',
    'boredom': 'loss',
    'excitement': 'loss',
    'nostalgia': 'loss'
  };
  
  // Get category for emotion
  const category = emotionToCategory[emotion] || 'loss';
  
  // Combine base rituals with extended rituals
  const allRituals = { ...LIVING_PROMPT.rituals, ...EXTENDED_RITUALS };
  
  // Get rituals for the category
  const categoryRituals = allRituals[category as keyof typeof allRituals] || 
                         Object.values(allRituals)[0];
  
  // Filter out rituals that are in memory
  const availableRituals = categoryRituals.filter(ritual => 
    !memory.includes(ritual)
  );
  
  // If all rituals are in memory, reset and use all
  const finalRituals = availableRituals.length > 0 ? availableRituals : categoryRituals;
  
  // Select randomly from available rituals
  const randomIndex = Math.floor(Math.random() * finalRituals.length);
  const result = finalRituals[randomIndex];
  
  setInCache(cacheKey, result);
  return result;
}

// Get time of day
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// Generate prompt with emotional context
export async function generatePrompt({ stage, voice, archetype, input, memory, userId }: PromptParams): Promise<string> {
  // Detect emotion from input
  const emotionResult = detectEmotion(input);
  
  // Profile archetype and mental style
  const archetypeProfile = profileArchetype(input, archetype.toString());
  
  // Adapt style based on profile, emotion, and stage
  const styleAdaptation = adaptStyle(archetypeProfile, emotionResult.primary, stage);
  
  // Get time of day
  const timeOfDay = getTimeOfDay();
  
  // Select scene and ritual
  const sceneId = selectScene(emotionResult.primary, timeOfDay);
  const ritualText = selectRitual(emotionResult.primary, memory);
  
  // Get components
  const voiceData = getVoice(voice);
  const archetypeData = getArchetypeDescription(archetype.toString());
  
  // Combine base scenes with extended scenes to find scene details
  const allScenes = { ...EXTENDED_SCENES };
  
  let sceneDetails = { id: 'light_candle', name: 'Свеча', description: 'Танцующее пламя' };
  for (const [, emotionScenes] of Object.entries(allScenes)) {
    const foundScene = emotionScenes.find(s => s.id === sceneId);
    if (foundScene) {
      sceneDetails = foundScene;
      break;
    }
  }
  
  // If userId is provided, get user preferences
  let userPreferences = null;
  if (userId) {
    try {
      const supabase = createServerSupabase();
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        userPreferences = {
          allowHistory: data.allow_history,
          historyRetentionDays: data.history_retention_days,
          preferredVoice: data.preferred_voice,
          preferredArchetype: data.preferred_archetype
        };
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  }
  
  // Build prompt
  let prompt = `EDEM Living LLM - Stage: ${stage}\n`;
  prompt += `Voice: ${voice} (${voiceData.description})\n`;
  prompt += `Archetype: ${archetype} (${archetypeData})\n`;
  
  if (userPreferences) {
    prompt += `User Preferences: History Allowed=${userPreferences.allowHistory}, Preferred Voice=${userPreferences.preferredVoice}\n`;
  }
  
  prompt += `\n`;
  
  prompt += `[EMOTIONAL CONTEXT]\n`;
  prompt += `Primary emotion: ${emotionResult.primary} (${Math.round(emotionResult.intensity * 100)}% intensity)\n`;
  prompt += `Secondary emotion: ${emotionResult.secondary}\n`;
  prompt += `Time of day: ${timeOfDay}\n\n`;
  
  prompt += `[MENTAL STYLE PROFILE]\n`;
  prompt += `Communication: ${archetypeProfile.mentalStyle.communication}\n`;
  prompt += `Pace: ${archetypeProfile.mentalStyle.pace}\n`;
  prompt += `Tone: ${archetypeProfile.mentalStyle.tone}\n`;
  prompt += `Preference: ${archetypeProfile.mentalStyle.preference}\n\n`;
  
  prompt += `[STYLE ADAPTATION]\n`;
  prompt += applyStyleAdaptation(styleAdaptation) + '\n\n';
  
  prompt += `[SCENE: ${sceneDetails.name}]\n`;
  prompt += `${sceneDetails.description}\n\n`;
  
  prompt += `[RITUAL]\n`;
  prompt += `${ritualText}\n\n`;
  
  prompt += `[USER INPUT]\n`;
  prompt += `${input}\n\n`;
  
  prompt += `[INSTRUCTIONS]\n`;
  prompt += `1. Respond in the specified voice style (${voiceData.description})\n`;
  prompt += `2. Incorporate the emotional context and scene setting\n`;
  prompt += `3. Guide the user through the ritual\n`;
  prompt += `4. Use the archetype characteristics in your response\n`;
  prompt += `5. Adapt to the mental style profile\n`;
  prompt += `6. Follow the style adaptation parameters\n`;
  prompt += `7. Keep responses concise and focused\n\n`;
  
  prompt += `[RESPONSE FORMAT]\n`;
  prompt += `Begin with an empathetic acknowledgment of the user's emotions.\n`;
  prompt += `Transition into the scene setting.\n`;
  prompt += `Guide the user through the ritual steps.\n`;
  prompt += `End with an open question or invitation for reflection.\n`;
  prompt += `Maintain the adapted mental style throughout.\n`;
  
  return prompt;
}