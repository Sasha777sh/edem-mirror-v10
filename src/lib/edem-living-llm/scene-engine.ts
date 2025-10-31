import { EDEM_LIVING_LLM_CONFIG } from '@/config/edem-living-llm';
import { LIVING_PROMPT } from './prompt';

// Scene Engine for EDEM Living LLM
export class SceneEngine {
  /**
   * Select an appropriate scene based on emotion and time of day
   */
  selectScene(emotion: string, currentTime: Date): string {
    // Get hour of day
    const hour = currentTime.getHours();

    // Map time of day to scene
    let timeOfDay = '';
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'утро';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'день';
    } else if (hour >= 18 && hour < 24) {
      timeOfDay = 'вечер';
    } else {
      timeOfDay = 'ночь';
    }

    // Select scene based on emotion and time of day
    const scene = this.getSceneForEmotionAndTime(emotion, timeOfDay);
    return scene;
  }

  /**
   * Get scene for specific emotion and time of day
   */
  private getSceneForEmotionAndTime(emotion: string, timeOfDay: string): string {
    // Define scenes for different emotions and times
    const scenes: { [key: string]: { [key: string]: string } } = {
      'тревога': {
        'утро': 'окно в начале дня',
        'день': 'руки на столе',
        'вечер': 'чайник на плите',
        'ночь': 'пустая кровать'
      },
      'стыд': {
        'утро': 'зубная щетка',
        'день': 'непрочитанное сообщение',
        'вечер': 'зеркало в ванной',
        'ночь': 'подушка'
      },
      'обида': {
        'утро': 'ключи на столе',
        'день': 'дверь, которую не открыли',
        'вечер': 'окно в темноту',
        'ночь': 'стена'
      }
    };

    // Return scene if exists, otherwise fallback
    if (scenes[emotion] && scenes[emotion][timeOfDay]) {
      return scenes[emotion][timeOfDay];
    }

    // Default scenes from the living prompt
    const defaultScenes = LIVING_PROMPT.mirrors;
    const randomIndex = Math.floor(Math.random() * defaultScenes.length);
    return defaultScenes[randomIndex];
  }
}