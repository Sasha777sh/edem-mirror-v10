// Style Adapter for EDEM Living LLM
// Adapts communication style based on user's mental profile and context

import { MentalStyle, ArchetypeProfile } from './archetype-profiler';
import { LIVING_PROMPT } from './prompt';

export interface StyleAdaptation {
  voice: keyof typeof LIVING_PROMPT.voices;
  rhythm: 'short' | 'medium' | 'long';
  metaphor: number; // 0-1 scale
  directness: number; // 0-1 scale
  bodyFocus: number; // 0-1 scale
  pauseFrequency: number; // 0-1 scale
}

// Voice mapping based on mental style
const VOICE_MAPPING: Record<string, keyof typeof LIVING_PROMPT.voices> = {
  'direct_fast_soft_body': 'soft',
  'metaphorical_slow_soft_spirit': 'soft',
  'analytical_rhythmic_neutral_mind': 'therapist',
  'intuitive_slow_soft_body': 'soft',
  'direct_fast_firm_mind': 'hard',
  'analytical_rhythmic_firm_mind': 'therapist',
  'metaphorical_slow_soft_emotion': 'soft',
  'intuitive_slow_soft_spirit': 'soft'
};

// Style parameters for different combinations
const STYLE_PARAMETERS: Record<string, Omit<StyleAdaptation, 'voice'>> = {
  'direct_fast_soft_body': {
    rhythm: 'short',
    metaphor: 0.2,
    directness: 0.9,
    bodyFocus: 0.8,
    pauseFrequency: 0.3
  },
  'metaphorical_slow_soft_spirit': {
    rhythm: 'long',
    metaphor: 0.9,
    directness: 0.3,
    bodyFocus: 0.6,
    pauseFrequency: 0.7
  },
  'analytical_rhythmic_neutral_mind': {
    rhythm: 'medium',
    metaphor: 0.4,
    directness: 0.7,
    bodyFocus: 0.4,
    pauseFrequency: 0.5
  },
  'intuitive_slow_soft_body': {
    rhythm: 'long',
    metaphor: 0.7,
    directness: 0.4,
    bodyFocus: 0.9,
    pauseFrequency: 0.8
  },
  'direct_fast_firm_mind': {
    rhythm: 'short',
    metaphor: 0.1,
    directness: 1.0,
    bodyFocus: 0.3,
    pauseFrequency: 0.2
  },
  'analytical_rhythmic_firm_mind': {
    rhythm: 'medium',
    metaphor: 0.5,
    directness: 0.8,
    bodyFocus: 0.5,
    pauseFrequency: 0.4
  },
  'metaphorical_slow_soft_emotion': {
    rhythm: 'long',
    metaphor: 0.8,
    directness: 0.3,
    bodyFocus: 0.7,
    pauseFrequency: 0.6
  },
  'intuitive_slow_soft_spirit': {
    rhythm: 'long',
    metaphor: 0.8,
    directness: 0.2,
    bodyFocus: 0.5,
    pauseFrequency: 0.9
  }
};

/**
 * Adapt style based on archetype profile and context
 */
export function adaptStyle(profile: ArchetypeProfile, emotion: string, stage: string): StyleAdaptation {
  const { mentalStyle } = profile;
  
  // Create style key from mental style components
  const styleKey = `${mentalStyle.communication}_${mentalStyle.pace}_${mentalStyle.tone}_${mentalStyle.preference}`;
  
  // Get base parameters
  const baseParams = STYLE_PARAMETERS[styleKey] || STYLE_PARAMETERS['direct_fast_soft_body'];
  
  // Adjust for emotion
  const emotionAdjustments = getEmotionAdjustments(emotion);
  
  // Adjust for stage
  const stageAdjustments = getStageAdjustments(stage);
  
  // Select voice based on style key
  const voice = VOICE_MAPPING[styleKey] || 'soft';
  
  // Apply adjustments
  return {
    voice,
    rhythm: adjustRhythm(baseParams.rhythm, emotionAdjustments.rhythm, stageAdjustments.rhythm),
    metaphor: clamp(
      baseParams.metaphor + emotionAdjustments.metaphor + stageAdjustments.metaphor,
      0, 1
    ),
    directness: clamp(
      baseParams.directness + emotionAdjustments.directness + stageAdjustments.directness,
      0, 1
    ),
    bodyFocus: clamp(
      baseParams.bodyFocus + emotionAdjustments.bodyFocus + stageAdjustments.bodyFocus,
      0, 1
    ),
    pauseFrequency: clamp(
      baseParams.pauseFrequency + emotionAdjustments.pauseFrequency + stageAdjustments.pauseFrequency,
      0, 1
    )
  };
}

/**
 * Get emotion-based adjustments
 */
function getEmotionAdjustments(emotion: string): Omit<StyleAdaptation, 'voice'> {
  const adjustments: Record<string, Omit<StyleAdaptation, 'voice'>> = {
    'anxiety': {
      rhythm: 'short',
      metaphor: -0.1,
      directness: 0.2,
      bodyFocus: 0.3,
      pauseFrequency: 0.1
    },
    'shame': {
      rhythm: 'long',
      metaphor: 0.2,
      directness: -0.3,
      bodyFocus: 0.2,
      pauseFrequency: 0.4
    },
    'anger': {
      rhythm: 'short',
      metaphor: -0.2,
      directness: 0.3,
      bodyFocus: 0.1,
      pauseFrequency: -0.1
    },
    'sadness': {
      rhythm: 'long',
      metaphor: 0.1,
      directness: -0.1,
      bodyFocus: 0.4,
      pauseFrequency: 0.3
    },
    'loneliness': {
      rhythm: 'long',
      metaphor: 0.3,
      directness: -0.2,
      bodyFocus: 0.5,
      pauseFrequency: 0.5
    },
    'guilt': {
      rhythm: 'medium',
      metaphor: 0.0,
      directness: -0.1,
      bodyFocus: 0.2,
      pauseFrequency: 0.2
    },
    'neutral': {
      rhythm: 'medium',
      metaphor: 0.0,
      directness: 0.0,
      bodyFocus: 0.0,
      pauseFrequency: 0.0
    }
  };
  
  return adjustments[emotion] || adjustments.neutral;
}

/**
 * Get stage-based adjustments
 */
function getStageAdjustments(stage: string): Omit<StyleAdaptation, 'voice'> {
  const adjustments: Record<string, Omit<StyleAdaptation, 'voice'>> = {
    'shadow': {
      rhythm: 'short',
      metaphor: -0.1,
      directness: 0.2,
      bodyFocus: 0.1,
      pauseFrequency: -0.1
    },
    'truth': {
      rhythm: 'medium',
      metaphor: 0.0,
      directness: 0.0,
      bodyFocus: 0.0,
      pauseFrequency: 0.0
    },
    'integration': {
      rhythm: 'long',
      metaphor: 0.1,
      directness: -0.2,
      bodyFocus: 0.3,
      pauseFrequency: 0.2
    }
  };
  
  return adjustments[stage] || adjustments.truth;
}

/**
 * Adjust rhythm based on multiple factors
 */
function adjustRhythm(
  base: 'short' | 'medium' | 'long',
  emotion: 'short' | 'medium' | 'long',
  stage: 'short' | 'medium' | 'long'
): 'short' | 'medium' | 'long' {
  const rhythmValues: Record<'short' | 'medium' | 'long', number> = {
    short: 0,
    medium: 1,
    long: 2
  };
  
  const baseValue = rhythmValues[base];
  const emotionValue = rhythmValues[emotion] || 0;
  const stageValue = rhythmValues[stage] || 0;
  
  const adjustedValue = clamp(Math.round(baseValue + emotionValue + stageValue), 0, 2);
  
  const valueToRhythm: Record<number, 'short' | 'medium' | 'long'> = {
    0: 'short',
    1: 'medium',
    2: 'long'
  };
  
  return valueToRhythm[adjustedValue];
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Apply style adaptation to generate response template
 */
export function applyStyleAdaptation(adaptation: StyleAdaptation): string {
  const templates = {
    short: "Коротко. Образно. Без объяснений.",
    medium: "Поэтапно. С паузами. С телом.",
    long: "Медленно. Глубоко. С метафорами."
  };
  
  const rhythmTemplate = templates[adaptation.rhythm];
  
  return `[СТИЛЬ ОТВЕТА]
Ритм: ${rhythmTemplate}
Метафоры: ${Math.round(adaptation.metaphor * 100)}%
Прямолинейность: ${Math.round(adaptation.directness * 100)}%
Фокус на теле: ${Math.round(adaptation.bodyFocus * 100)}%
Паузы: ${Math.round(adaptation.pauseFrequency * 100)}%

[ИНСТРУКЦИИ ДЛЯ ОТВЕТА]
1. Используй голос: ${adaptation.voice}
2. Следуй ритму: ${adaptation.rhythm}
3. Варьируй метафоры по шкале: ${adaptation.metaphor}
4. Балансируй прямолинейность: ${adaptation.directness}
5. Уделяй внимание телесности: ${adaptation.bodyFocus}
6. Делай паузы: ${adaptation.pauseFrequency}`;
}