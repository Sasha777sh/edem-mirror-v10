import { EDEM_LIVING_LLM_CONFIG } from '@/config/edem-living-llm';
import { LIVING_PROMPT } from './prompt';

// Voice Generator for EDEM Living LLM
export class VoiceGenerator {
  /**
   * Generate a response with rhythm, pauses, and whisper-like style
   */
  generateResponse(params: {
    emotion: string;
    scene: string;
    ritual: string;
    stage: string;
    archetype: string;
    userInput: string;
  }): string {
    const { emotion, scene, ritual, stage, archetype, userInput } = params;

    // Get voice configuration based on stage
    let voiceConfig;
    switch (stage) {
      case 'shadow':
        voiceConfig = LIVING_PROMPT.voices.soft;
        break;
      case 'truth':
        voiceConfig = LIVING_PROMPT.voices.hard;
        break;
      case 'integration':
        voiceConfig = LIVING_PROMPT.voices.therapist;
        break;
      default:
        voiceConfig = LIVING_PROMPT.voices.soft;
    }

    // Generate response based on the living prompt structure
    let response = '';

    switch (stage) {
      case 'shadow':
        response = this.generateShadowResponse(emotion, scene, userInput, voiceConfig);
        break;
      case 'truth':
        response = this.generateTruthResponse(emotion, scene, archetype, voiceConfig);
        break;
      case 'integration':
        response = this.generateIntegrationResponse(ritual, voiceConfig);
        break;
      default:
        response = this.generateDefaultResponse(emotion, scene, voiceConfig);
    }

    return response;
  }

  private generateShadowResponse(
    emotion: string,
    scene: string,
    userInput: string,
    voiceConfig: any
  ): string {
    // Use the living prompt structure for shadow stage
    return `...${emotion}...

Ты в ${scene} — это место тоже знает тишину....

${userInput.split(' ').slice(0, 3).join(' ')}...`;
  }

  private generateTruthResponse(
    emotion: string,
    scene: string,
    archetype: string,
    voiceConfig: any
  ): string {
    // Use the living prompt structure for truth stage
    const archetypeDescription = LIVING_PROMPT.archetypes[archetype as keyof typeof LIVING_PROMPT.archetypes] ||
      Object.values(LIVING_PROMPT.archetypes)[0];

    return `Глубже...

В ${emotion} ты прячешь...

${scene} отражает то, что ты...

${archetypeDescription}`;
  }

  private generateIntegrationResponse(ritual: string, voiceConfig: any): string {
    // Use the living prompt structure for integration stage
    return `Свет в том, что...

Твоя практика — ${ritual}

Повтори это завтра и скажи, что изменилось...`;
  }

  private generateDefaultResponse(
    emotion: string,
    scene: string,
    voiceConfig: any
  ): string {
    // Default response using the living prompt structure
    return `...я слышу, как ты ${emotion}...\n\nВ ${scene}...`;
  }
}