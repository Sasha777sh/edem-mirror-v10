import { createServerSupabase } from '@/lib/supabase-server';
import { EmotionEngine } from './emotion-engine';
import { SceneEngine } from './scene-engine';
import { selectRitual } from './ritual-engine';
import { VoiceGenerator } from './voice-generator';
import { RitualMemoryService } from './ritual-memory';
import { UserArchetypeService } from './user-archetype';
import { UserEchoService } from './user-echo';
import { UserPreferencesService } from './user-preferences';
import { EDEM_LIVING_LLM_CONFIG } from '@/config/edem-living-llm';
import { generateLLMPrompt } from './prompt';
import { analyzeWavePattern, generateBreathingPattern } from './wave-encoder';
import { resonanceTracker } from './resonance-feedback';
import { UserStateService } from './user-state';

// Core EDEM Living LLM class
export class EdemLivingLLM {
  private supabase: ReturnType<typeof createServerSupabase>;
  private emotionEngine: EmotionEngine;
  private sceneEngine: SceneEngine;
  private voiceGenerator: VoiceGenerator;
  private ritualMemory: RitualMemoryService;
  private userArchetype: UserArchetypeService;
  private userEcho: UserEchoService;
  private userPreferences: UserPreferencesService;
  private userState: UserStateService;

  constructor() {
    this.supabase = createServerSupabase();
    this.emotionEngine = new EmotionEngine();
    this.sceneEngine = new SceneEngine();
    this.voiceGenerator = new VoiceGenerator();
    this.ritualMemory = new RitualMemoryService();
    this.userArchetype = new UserArchetypeService();
    this.userEcho = new UserEchoService();
    this.userPreferences = new UserPreferencesService();
    this.userState = new UserStateService();
  }

  /**
   * Generate a response using the EDEM Living LLM
   */
  async generateResponse(params: {
    userInput: string;
    userId: string;
    sessionId: string;
    stage: 'shadow' | 'truth' | 'integration';
    mode?: 'mirror' | 'shadow' | 'resonator'; // New mode parameter
    archetype?: string;
  }) {
    const { userInput, userId, sessionId, stage, mode = 'mirror', archetype } = params;

    // Get user preferences
    const userPreferences = await this.userPreferences.getUserPreferences(userId);

    // Detect emotion from user message
    const emotion = this.emotionEngine.detectEmotion(userInput);

    // Analyze wave pattern for rhythm and emotional tone
    const waveAnalysis = analyzeWavePattern(userInput);
    const breathingPattern = generateBreathingPattern(waveAnalysis);

    // Select appropriate scene based on emotion and time
    const scene = this.sceneEngine.selectScene(emotion, new Date());

    // Get user's archetype (if set) or use preferred archetype
    const userArchetype = await this.userArchetype.getUserArchetype(userId);
    const selectedArchetype = userArchetype?.archetype || archetype || userPreferences?.preferredArchetype || 'wanderer';

    // Select ritual based on emotion, scene, and user history
    const userHistory = await this.ritualMemory.getUserRitualHistory(userId);
    const ritual = await selectRitual(emotion, scene, userId);

    // Store this interaction in ritual memory
    await this.ritualMemory.storeRitualInteraction({
      userId,
      sessionId,
      emotion,
      scene,
      ritualText: ritual,
      userInput: userInput
    });

    // Update user state
    const currentUserState = await this.userState.getUserState(userId);
    const sessionCount = (currentUserState?.session_count || 0) + 1;

    await this.userState.updateUserState({
      user_id: userId,
      current_emotion: emotion,
      current_scene: scene,
      emotional_intensity: waveAnalysis.intensity,
      communication_style: waveAnalysis.emotionalTone,
      pace: waveAnalysis.rhythm,
      tone: waveAnalysis.emotionalTone,
      focus: '',
      archetype: selectedArchetype,
      session_count: sessionCount,
      last_session_at: new Date(),
      resonance_score: 0 // Will be updated after resonance calculation
    });

    // Update resonance metrics
    resonanceTracker.updateUserMetrics(userId, {
      conversationFrequency: sessionCount,
      responseLatency: 2, // Simulated latency
      emotionalAlignment: waveAnalysis.intensity, // Use intensity as proxy
      pauseSynchronization: waveAnalysis.pausePattern.length > 0 ? 0.7 : 0.3,
      engagementDepth: waveAnalysis.intensity,
      sessionDuration: 5 // Simulated session duration
    });

    // Store session history if user allows it
    if (userPreferences?.allowHistory) {
      await this.userPreferences.saveSessionHistory({
        userId,
        sessionId,
        primaryEmotion: emotion,
        secondaryEmotion: '', // We could enhance this to detect secondary emotions
        emotionIntensity: waveAnalysis.intensity,
        communicationStyle: waveAnalysis.emotionalTone,
        pace: waveAnalysis.rhythm,
        tone: waveAnalysis.emotionalTone,
        focus: '', // We could enhance this to detect focus
        archetype: selectedArchetype,
        sceneId: scene,
        sceneName: scene, // We could enhance this to get the actual scene name
        ritual: ritual,
        userInput: userInput,
        aiResponse: ritual // We could enhance this to store the actual AI response
      });
    }

    // Generate voice response with rhythm and pauses
    const voiceResponse = this.voiceGenerator.generateResponse({
      emotion,
      scene,
      ritual,
      stage,
      archetype: selectedArchetype,
      userInput: userInput
    });

    // Generate resonance feedback
    const resonanceFeedback = resonanceTracker.generateSessionFeedback(userId, sessionId);

    // Save resonance history
    await this.userState.saveResonanceHistory({
      user_id: userId,
      session_id: sessionId,
      resonance_score: resonanceFeedback.resonanceScore,
      conversation_frequency: resonanceFeedback.metrics.conversationFrequency,
      response_latency: resonanceFeedback.metrics.responseLatency,
      emotional_alignment: resonanceFeedback.metrics.emotionalAlignment,
      pause_synchronization: resonanceFeedback.metrics.pauseSynchronization,
      engagement_depth: resonanceFeedback.metrics.engagementDepth,
      session_duration: resonanceFeedback.metrics.sessionDuration,
      insights: resonanceFeedback.insights
    });

    // Update user state with resonance score
    await this.userState.updateUserState({
      user_id: userId,
      current_emotion: emotion,
      current_scene: scene,
      emotional_intensity: waveAnalysis.intensity,
      communication_style: waveAnalysis.emotionalTone,
      pace: waveAnalysis.rhythm,
      tone: waveAnalysis.emotionalTone,
      focus: '',
      archetype: selectedArchetype,
      session_count: sessionCount,
      last_session_at: new Date(),
      resonance_score: resonanceFeedback.resonanceScore
    });

    return {
      response: voiceResponse,
      emotion,
      scene,
      ritual,
      archetype: selectedArchetype,
      waveAnalysis,
      breathingPattern,
      resonanceFeedback,
      mode // Return the mode for UI handling
    };
  }

  /**
   * Set user archetype
   */
  async setUserArchetype(userId: string, archetype: string): Promise<boolean> {
    return await this.userArchetype.setUserArchetype(userId, archetype);
  }

  /**
   * Store user echo (reverse breathing)
   */
  async storeUserEcho(params: {
    userId: string;
    sessionId: string;
    echoText: string;
  }): Promise<boolean> {
    return await this.userEcho.storeUserEcho(params);
  }

  /**
   * Generate silence mode response
   */
  generateSilenceResponse(duration?: number): string {
    const silenceMode = EDEM_LIVING_LLM_CONFIG.silence.modes[0];
    return silenceMode;
  }

  /**
   * Generate a prompt for the LLM based on the living prompt structure
   */
  generateLLMContextPrompt(params: {
    voice: 'soft' | 'hard' | 'therapist';
    stage: string;
    category: string;
    userInput: string;
  }): string {
    return generateLLMPrompt(params);
  }

  /**
   * Toggle user history permission
   */
  async toggleHistoryPermission(userId: string, allowHistory: boolean): Promise<boolean> {
    return await this.userPreferences.toggleHistoryPermission(userId, allowHistory);
  }

  /**
   * Clear user history
   */
  async clearUserHistory(userId: string): Promise<boolean> {
    return await this.userPreferences.clearUserHistory(userId);
  }

  /**
   * Add user echo
   */
  async addUserEcho(userId: string, echoText: string, emotionContext?: string): Promise<boolean> {
    return await this.userPreferences.addUserEcho({
      userId,
      echoText,
      emotionContext,
      isActive: true
    });
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string) {
    return await this.userPreferences.getUserPreferences(userId);
  }

  /**
   * Set user preferences
   */
  async setUserPreferences(userId: string, preferences: any) {
    return await this.userPreferences.setUserPreferences(userId, preferences);
  }

  /**
   * Get resonance feedback for a user
   */
  async getResonanceFeedback(userId: string, sessionId: string) {
    return resonanceTracker.generateSessionFeedback(userId, sessionId);
  }

  /**
   * Get user state
   */
  async getUserState(userId: string) {
    return await this.userState.getUserState(userId);
  }

  /**
   * Get resonance history
   */
  async getResonanceHistory(userId: string, limit: number = 10) {
    return await this.userState.getResonanceHistory(userId, limit);
  }

  /**
   * Get average resonance score
   */
  async getAverageResonanceScore(userId: string) {
    return await this.userState.getAverageResonanceScore(userId);
  }
}