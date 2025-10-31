// Archetype Profiler for EDEM Living LLM
// Detects user's mental style and communication preferences based on input patterns

export interface MentalStyle {
  communication: 'direct' | 'metaphorical' | 'analytical' | 'intuitive';
  pace: 'fast' | 'slow' | 'rhythmic';
  tone: 'soft' | 'firm' | 'neutral' | 'playful';
  preference: 'body' | 'mind' | 'emotion' | 'spirit';
}

export interface ArchetypeProfile {
  primary: string;
  mentalStyle: MentalStyle;
  communicationCues: string[];
}

// Mental style patterns for different user types
const MENTAL_PATTERNS = {
  // Gen Z / Digital Natives
  'digital_native': {
    communication: 'direct',
    pace: 'fast',
    tone: 'playful',
    preference: 'emotion'
  },
  
  // Millennials / Analytical
  'analytical_mind': {
    communication: 'analytical',
    pace: 'rhythmic',
    tone: 'neutral',
    preference: 'mind'
  },
  
  // Spiritual Seekers
  'spiritual_seeker': {
    communication: 'metaphorical',
    pace: 'slow',
    tone: 'soft',
    preference: 'spirit'
  },
  
  // Trauma-Sensitive
  'trauma_sensitive': {
    communication: 'intuitive',
    pace: 'slow',
    tone: 'soft',
    preference: 'body'
  },
  
  // Traditional / Structured
  'structured_thinker': {
    communication: 'analytical',
    pace: 'rhythmic',
    tone: 'firm',
    preference: 'mind'
  }
} as const;

// Communication cues for different mental styles
const COMMUNICATION_CUES = {
  'direct': ['просто', 'ясно', 'четко', 'сразу', 'напрямую'],
  'metaphorical': ['как', 'словно', 'будто', 'образ', 'внутри'],
  'analytical': ['потому что', 'поскольку', 'следовательно', 'анализ', 'структура'],
  'intuitive': ['чувствую', 'кажется', 'внутри', 'вибрация', 'поток']
} as const;

// Archetype descriptions
const ARCHETYPE_DESCRIPTIONS = {
  'wanderer': 'Ищу правду, даже если она пугает',
  'healer': 'Здесь, чтобы исцелиться и передать это другим',
  'warrior': 'Не отступаю, когда становится больно',
  'child': 'Хочу быть увиденным и любимым таким, какой я есть',
  'sage': 'Ищу мудрость через понимание',
  'rebel': 'Бросаю вызов тому, что ограничивает',
  'mystic': 'Соединяю земное с божественным',
  'caretaker': 'Забочусь о других, иногда забывая о себе'
} as const;

/**
 * Detect user's mental style from input text
 */
export function detectMentalStyle(input: string): MentalStyle {
  const lowerInput = input.toLowerCase();
  
  // Count cues for each communication style
  const styleScores: Record<string, number> = {};
  
  for (const [style, cues] of Object.entries(COMMUNICATION_CUES)) {
    styleScores[style] = 0;
    for (const cue of cues) {
      if (lowerInput.includes(cue)) {
        styleScores[style] += 1;
      }
    }
  }
  
  // Find dominant communication style
  let dominantStyle: keyof typeof COMMUNICATION_CUES = 'direct';
  let maxScore = 0;
  
  for (const [style, score] of Object.entries(styleScores)) {
    if (score > maxScore) {
      maxScore = score;
      dominantStyle = style as keyof typeof COMMUNICATION_CUES;
    }
  }
  
  // Determine pace based on sentence length and punctuation
  const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().length, 0) / sentences.length;
  
  let pace: 'fast' | 'slow' | 'rhythmic' = 'rhythmic';
  if (avgSentenceLength < 20) pace = 'fast';
  if (avgSentenceLength > 50) pace = 'slow';
  
  // Determine tone based on emotional words
  const emotionalWords = {
    soft: ['мягко', 'нежно', 'спокойно', 'тихо', 'тепло', 'нежность'],
    firm: ['четко', 'ясно', 'строго', 'твердо', 'ясность', 'четкость'],
    playful: ['играть', 'легко', 'смешно', 'игра', 'легкость', 'шутка'],
    neutral: ['понимаю', 'вижу', 'слышу', 'чувствую', 'замечаю', 'осознаю']
  };
  
  const toneScores: Record<string, number> = { soft: 0, firm: 0, playful: 0, neutral: 0 };
  
  for (const [tone, words] of Object.entries(emotionalWords)) {
    for (const word of words) {
      if (lowerInput.includes(word)) {
        toneScores[tone] += 1;
      }
    }
  }
  
  let dominantTone: 'soft' | 'firm' | 'neutral' | 'playful' = 'neutral';
  let maxToneScore = 0;
  
  for (const [tone, score] of Object.entries(toneScores)) {
    if (score > maxToneScore) {
      maxToneScore = score;
      dominantTone = tone as 'soft' | 'firm' | 'neutral' | 'playful';
    }
  }
  
  // Determine preference based on content focus
  const preferenceIndicators = {
    body: ['тело', 'ощущение', 'дыхание', 'физически', 'ощущаю', 'плоть', 'ощутимо'],
    mind: ['думать', 'мысль', 'понимаю', 'анализ', 'логика', 'разум', 'мыслей'],
    emotion: ['чувствую', 'эмоция', 'сердце', 'боль', 'радость', 'страх', 'тревога'],
    spirit: ['дух', 'энергия', 'вибрация', 'свет', 'тень', 'энергия', 'вибрирует']
  };
  
  const preferenceScores: Record<string, number> = { body: 0, mind: 0, emotion: 0, spirit: 0 };
  
  for (const [preference, words] of Object.entries(preferenceIndicators)) {
    for (const word of words) {
      if (lowerInput.includes(word)) {
        preferenceScores[preference] += 1;
      }
    }
  }
  
  let dominantPreference: 'body' | 'mind' | 'emotion' | 'spirit' = 'emotion';
  let maxPreferenceScore = 0;
  
  for (const [preference, score] of Object.entries(preferenceScores)) {
    if (score > maxPreferenceScore) {
      maxPreferenceScore = score;
      dominantPreference = preference as 'body' | 'mind' | 'emotion' | 'spirit';
    }
  }
  
  return {
    communication: dominantStyle,
    pace,
    tone: dominantTone,
    preference: dominantPreference
  };
}

/**
 * Profile user archetype based on input and existing archetype
 */
export function profileArchetype(input: string, existingArchetype?: string): ArchetypeProfile {
  // Detect mental style from input
  const mentalStyle = detectMentalStyle(input);
  
  // Use existing archetype or detect from input patterns
  let primaryArchetype = existingArchetype || 'wanderer';
  
  // If no existing archetype, try to detect from input
  if (!existingArchetype) {
    const lowerInput = input.toLowerCase();
    
    // Check for archetype indicators
    if (lowerInput.includes('ищу') || lowerInput.includes('поиск') || lowerInput.includes('путешеств')) {
      primaryArchetype = 'wanderer';
    } else if (lowerInput.includes('исцел') || lowerInput.includes('лечу') || lowerInput.includes('здоровье')) {
      primaryArchetype = 'healer';
    } else if (lowerInput.includes('борьб') || lowerInput.includes('высто') || lowerInput.includes('побед') || lowerInput.includes('сопротивл')) {
      primaryArchetype = 'warrior';
    } else if (lowerInput.includes('ребен') || lowerInput.includes('любим') || lowerInput.includes('забота') || lowerInput.includes('тепло')) {
      primaryArchetype = 'child';
    } else if (lowerInput.includes('мудрост') || lowerInput.includes('понима') || lowerInput.includes('осозна') || lowerInput.includes('глубин')) {
      primaryArchetype = 'sage';
    } else if (lowerInput.includes('вызов') || lowerInput.includes('бунт') || lowerInput.includes('сопротивл') || lowerInput.includes('протест')) {
      primaryArchetype = 'rebel';
    } else if (lowerInput.includes('дух') || lowerInput.includes('энерги') || lowerInput.includes('вибраци') || lowerInput.includes('сакральн')) {
      primaryArchetype = 'mystic';
    } else if (lowerInput.includes('забочу') || lowerInput.includes('помога') || lowerInput.includes('забота') || lowerInput.includes('поддержк')) {
      primaryArchetype = 'caretaker';
    }
  }
  
  // Get communication cues for the mental style
  const communicationCues = [...(COMMUNICATION_CUES[mentalStyle.communication] || [])];
  
  return {
    primary: primaryArchetype,
    mentalStyle,
    communicationCues
  };
}

/**
 * Get archetype description
 */
export function getArchetypeDescription(archetype: string): string {
  return ARCHETYPE_DESCRIPTIONS[archetype as keyof typeof ARCHETYPE_DESCRIPTIONS] || 
         ARCHETYPE_DESCRIPTIONS.wanderer;
}

/**
 * Get mental style patterns
 */
export function getMentalStylePatterns(archetype: string): MentalStyle {
  // Map archetypes to mental patterns
  const archetypeToPattern: Record<string, keyof typeof MENTAL_PATTERNS> = {
    'wanderer': 'digital_native',
    'healer': 'trauma_sensitive',
    'warrior': 'structured_thinker',
    'child': 'digital_native',
    'sage': 'analytical_mind',
    'rebel': 'digital_native',
    'mystic': 'spiritual_seeker',
    'caretaker': 'trauma_sensitive'
  };
  
  const patternKey = archetypeToPattern[archetype] || 'digital_native';
  return MENTAL_PATTERNS[patternKey];
}