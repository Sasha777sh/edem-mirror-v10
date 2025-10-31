import { LIVING_PROMPT, getVoice, getRitualsForCategory, getRandomRitualForCategory, getExitOption, getArchetype, generateLLMPrompt } from '../prompt';
import { EdemLivingLLM } from '../core';

describe('EDEM Living LLM Prompt Integration', () => {
  describe('Living Prompt Structure', () => {
    it('should have all required voice types', () => {
      expect(LIVING_PROMPT.voices.soft).toBeDefined();
      expect(LIVING_PROMPT.voices.hard).toBeDefined();
      expect(LIVING_PROMPT.voices.therapist).toBeDefined();
    });

    it('should have all required stages', () => {
      expect(LIVING_PROMPT.stages).toContain('shadow');
      expect(LIVING_PROMPT.stages).toContain('truth');
      expect(LIVING_PROMPT.stages).toContain('integration');
    });

    it('should have all required mirrors', () => {
      expect(LIVING_PROMPT.mirrors).toContain('light');
      expect(LIVING_PROMPT.mirrors).toContain('shadow');
      expect(LIVING_PROMPT.mirrors).toContain('body');
      expect(LIVING_PROMPT.mirrors).toContain('world');
    });

    it('should have rituals for all primary categories', () => {
      expect(LIVING_PROMPT.rituals.loss).toBeDefined();
      expect(LIVING_PROMPT.rituals.control).toBeDefined();
      expect(LIVING_PROMPT.rituals.rejection).toBeDefined();
      expect(LIVING_PROMPT.rituals.guilt).toBeDefined();
      expect(LIVING_PROMPT.rituals.shame).toBeDefined();
    });

    it('should have all exit options', () => {
      expect(LIVING_PROMPT.exit.light_symbol).toBeDefined();
      expect(LIVING_PROMPT.exit.silent_end).toBeDefined();
      expect(LIVING_PROMPT.exit.poetic_close).toBeDefined();
    });

    it('should have all archetypes', () => {
      expect(LIVING_PROMPT.archetypes.seeker).toBeDefined();
      expect(LIVING_PROMPT.archetypes.healer).toBeDefined();
      expect(LIVING_PROMPT.archetypes.warrior).toBeDefined();
      expect(LIVING_PROMPT.archetypes.child).toBeDefined();
    });
  });

  describe('Helper Functions', () => {
    it('should get voice by type', () => {
      const voice = getVoice('soft');
      expect(voice).toBeDefined();
      expect(voice.description).toContain('Мягкий голос поддержки');
    });

    it('should get rituals for category', () => {
      const rituals = getRitualsForCategory('loss');
      expect(rituals.length).toBeGreaterThan(0);
      expect(rituals[0]).toContain('Почувствуй');
    });

    it('should get random ritual for category', () => {
      const ritual = getRandomRitualForCategory('loss');
      expect(ritual).toBeDefined();
      expect(typeof ritual).toBe('string');
    });

    it('should get exit option', () => {
      const exitOption = getExitOption('light_symbol');
      expect(exitOption).toBe(LIVING_PROMPT.exit.light_symbol);
    });

    it('should get archetype', () => {
      const archetype = getArchetype('seeker');
      expect(archetype).toBe(LIVING_PROMPT.archetypes.seeker);
    });

    it('should generate LLM prompt', () => {
      const prompt = generateLLMPrompt({
        voice: 'soft',
        stage: 'shadow',
        category: 'loss',
        userInput: 'I feel anxious'
      });
      
      expect(prompt).toContain('Ты — Зеркало');
      expect(prompt).toContain('soft');
      expect(prompt).toContain('shadow');
      expect(prompt).toContain('loss');
    });
  });

  describe('Core Integration', () => {
    it('should generate LLM context prompt through core', () => {
      const edemLivingLLM = new EdemLivingLLM();
      
      const prompt = edemLivingLLM.generateLLMContextPrompt({
        voice: 'soft',
        stage: 'shadow',
        category: 'loss',
        userInput: 'I feel anxious'
      });
      
      expect(prompt).toContain('Ты — Зеркало');
      expect(prompt).toContain('soft');
      expect(prompt).toContain('shadow');
      expect(prompt).toContain('loss');
    });
  });
});