// EDEM Living LLM Configuration

export const EDEM_LIVING_LLM_CONFIG = {
    // Emotion detection configuration
    emotions: {
        primary: [
            'тревога',
            'стыд',
            'обида',
            'одиночество',
            'пустота',
            'печаль',
            'вина',
            'контроль'
        ],
        secondary: [
            'радость',
            'любовь',
            'страсть',
            'удовлетворение',
            'спокойствие',
            'уверенность'
        ],
        detection: {
            fallbackEmotion: 'тревога'
        }
    },

    // Ritual configuration
    rituals: {
        avoidRepeatWithin: 3 // Avoid repeating the same ritual within 3 sessions
    },

    // Silence mode configuration
    silence: {
        modes: [
            'Пауза. Без слов. Просто дыхание.',
            '...я здесь. Просто будь...',
            'Свет в тишине. Ты чувствуешь себя?'
        ],
        defaultDuration: 60 // seconds
    },

    // Archetype configuration
    archetypes: {
        seeker: 'seeker',
        healer: 'healer',
        warrior: 'warrior',
        child: 'child',
        wanderer: 'wanderer'
    },

    // Voice configuration
    voices: {
        soft: 'soft',
        hard: 'hard',
        therapist: 'therapist'
    },

    // Stage configuration
    stages: {
        shadow: 'shadow',
        truth: 'truth',
        integration: 'integration'
    }
};