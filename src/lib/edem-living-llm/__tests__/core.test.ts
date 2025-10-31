import { EdemLivingLLM } from '../core';
import { EmotionEngine } from '../emotion-engine';
import { SceneEngine } from '../scene-engine';
import { selectRitual } from '../ritual-engine';
import { VoiceGenerator } from '../voice-generator';

describe('Emotion Engine', () => {
    describe('detectEmotion', () => {
        it('should detect тревога from text containing "тревога"', () => {
            const emotionEngine = new EmotionEngine();
            const result = emotionEngine.detectEmotion('Я чувствую тревогу');
            expect(result).toBe('тревога');
        });

        it('should detect стыд from text containing "стыд"', () => {
            const emotionEngine = new EmotionEngine();
            const result = emotionEngine.detectEmotion('Меня переполняет стыд');
            expect(result).toBe('стыд');
        });

        it('should default to тревога for unknown emotions', () => {
            const emotionEngine = new EmotionEngine();
            const result = emotionEngine.detectEmotion('Я чувствую что-то неопределенное');
            expect(result).toBe('тревога');
        });
    });
});

describe('Scene Engine', () => {
    describe('selectScene', () => {
        it('should return a scene based on emotion and time', () => {
            const sceneEngine = new SceneEngine();
            const result = sceneEngine.selectScene('тревога', new Date('2023-01-01T10:00:00Z'));
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });
    });
});

describe('Ritual Engine', () => {
    describe('selectRitual', () => {
        it('should return a ritual based on emotion, scene, and user', async () => {
            const result = await selectRitual('тревога', 'окно в начале дня', 'test-user-id');
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
        });
    });
});

describe('Voice Generator', () => {
    describe('generateVoiceResponse', () => {
        it('should generate a response with rhythm and pauses', () => {
            const voiceGenerator = new VoiceGenerator();
            const params = {
                userInput: 'Я чувствую тревогу',
                emotion: 'тревога',
                scene: 'окно в начале дня',
                ritual: 'Положи руку на живот и дыши 3 раза',
                stage: 'shadow' as const,
                archetype: 'Раненый воин'
            };

            const result = voiceGenerator.generateResponse(params);
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
            // Check that response contains pauses (newlines)
            expect(result.includes('\n\n')).toBe(true);
        });
    });
});