import { EDEM_LIVING_LLM_CONFIG } from '@/config/edem-living-llm';
import { LIVING_PROMPT } from './prompt';

// Emotion Engine for EDEM Living LLM
export class EmotionEngine {
  /**
   * Detect emotion from user input text
   */
  detectEmotion(text: string): string {
    // Convert text to lowercase for matching
    const lowerText = text.toLowerCase();

    // Check for each primary emotion in the config
    for (const emotion of EDEM_LIVING_LLM_CONFIG.emotions.primary) {
      if (lowerText.includes(emotion)) {
        return emotion;
      }
    }

    // Check for secondary emotions
    for (const emotion of EDEM_LIVING_LLM_CONFIG.emotions.secondary) {
      if (lowerText.includes(emotion)) {
        return emotion;
      }
    }

    // Return fallback emotion if none detected
    return EDEM_LIVING_LLM_CONFIG.emotions.detection.fallbackEmotion;
  }

  /**
   * Map emotion to body zone
   */
  mapEmotionToBodyZone(emotion: string): string {
    // Map emotions to body zones
    const emotionToBodyMap: { [key: string]: string } = {
      'тревога': 'грудь',
      'стыд': 'лицо',
      'обида': 'живот',
      'одиночество': 'сердце',
      'пустота': 'живот',
      'печаль': 'грудь',
      'вина': 'плечи',
      'контроль': 'челюсть'
    };

    return emotionToBodyMap[emotion] || 'грудь';
  }
}