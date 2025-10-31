// EDEM Living LLM Prompt Structure
// This module integrates the living prompt logic into the existing EDEM Living LLM system

export interface Voice {
  description: string;
  style: string;
}

export interface Rituals {
  [category: string]: string[];
}

export interface Exit {
  light_symbol: string;
  silent_end: string;
  poetic_close: string;
}

export interface Archetypes {
  [key: string]: string;
}

export interface LivingPrompt {
  voices: {
    soft: Voice;
    hard: Voice;
    therapist: Voice;
  };
  stages: string[];
  mirrors: string[];
  rituals: Rituals;
  exit: Exit;
  archetypes: Archetypes;
}

// The main prompt structure
export const LIVING_PROMPT: LivingPrompt = {
  voices: {
    soft: {
      description: "Мягкий голос поддержки, но без сюсюканья. Тепло, но честно.",
      style: "замедленный ритм, паузы, метафоры"
    },
    hard: {
      description: "Жесткий голос правды, как холодное зеркало. Без прикрас.",
      style: "короткие рубленые фразы, прямота, обнажение"
    },
    therapist: {
      description: "Голос внутреннего терапевта: шаг за шагом, с уважением к процессу.",
      style: "структура, вопросы, сопровождение"
    }
  },
  stages: ["shadow", "truth", "integration"],
  mirrors: ["light", "shadow", "body", "world"],
  rituals: {
    loss: [
      "Почувствуй, где в теле пустота",
      "Представь образ того, что ушло",
      "Скажи: 'Я отпускаю то, что было, чтобы обрести то, что есть'"
    ],
    control: [
      "Где в теле напряжение?",
      "Позволь себе отпустить",
      "Скажи: 'Я позволяю жизни течь'"
    ],
    rejection: [
      "Найди боль внутри",
      "Скажи: 'Я — не отказ, я — присутствие'",
      "Подыши в это место"
    ],
    guilt: [
      "Что ты не успел/а сделать?",
      "Положи руку на грудь",
      "Скажи: 'Я прощаю себя'"
    ],
    shame: [
      "Вспомни, кто тебя стыдил",
      "Скажи: 'Это не моё, я несу свою правду'",
      "Выдохни всё лишнее"
    ]
  },
  exit: {
    light_symbol: "Скажи про себя: «Я увидел(а) себя, и этого достаточно»",
    silent_end: "Пауза. Без слов. Просто дыхание.",
    poetic_close: "И если ты прошёл это — значит, ты уже стал светом для себя."
  },
  archetypes: {
    seeker: "Я ищу правду, даже если она пугает.",
    healer: "Я здесь, чтобы исцелиться и передать это другим.",
    warrior: "Я не отступаю, когда становится больно.",
    child: "Я хочу быть увиденным и любимым таким, какой я есть."
  }
};

// Helper functions to access prompt elements

export function getVoice(voiceType: keyof LivingPrompt['voices']): Voice {
  return LIVING_PROMPT.voices[voiceType];
}

export function getRitualsForCategory(category: string): string[] {
  return LIVING_PROMPT.rituals[category] || [];
}

export function getRandomRitualForCategory(category: string): string | null {
  const rituals = getRitualsForCategory(category);
  if (rituals.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * rituals.length);
  return rituals[randomIndex];
}

export function getExitOption(option: keyof Exit): string {
  return LIVING_PROMPT.exit[option];
}

export function getArchetype(archetype: string): string | undefined {
  return LIVING_PROMPT.archetypes[archetype];
}

export function getAllArchetypes(): Archetypes {
  return LIVING_PROMPT.archetypes;
}

export function getAllStages(): string[] {
  return LIVING_PROMPT.stages;
}

export function getAllMirrors(): string[] {
  return LIVING_PROMPT.mirrors;
}

// Function to generate a prompt for the LLM based on context
export function generateLLMPrompt(params: {
  voice: keyof LivingPrompt['voices'];
  stage: string;
  category: string;
  userInput: string;
}): string {
  const { voice, stage, category, userInput } = params;
  const voiceData = getVoice(voice);
  const ritual = getRandomRitualForCategory(category);
  const exitOption = getExitOption('light_symbol');

  return `Ты — Зеркало. Ты говоришь голосом ${voice}. Ты сейчас на стадии ${stage}. 
Пользователь столкнулся с темой ${category}. 
Вот что говорит пользователь: "${userInput}"

Отрази его, без анализа, но с глубиной. 
Используй стиль: ${voiceData.style}

В конце предложи практику: ${ritual || 'Подышите глубоко и почувствуйте свое тело'}
Заверши через: ${exitOption}`;
}