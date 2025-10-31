export type Phase = 'eclipse' | 'growth' | 'rest' | 'reflection' | 'rupture';

export interface MemoryLayers {
  surface: string[];         // последние сообщения
  patterns: string[];        // извлечённые смысловые паттерны/инсайты
  trauma: string | null;     // ключевое искажение ("рана")
}

export interface PhaseState {
  phase: Phase;
  energy: number; // 0..1
}

export interface MythContext {
  origin: string;
  fear: string;
  desire: string;
}

export interface AgentState {
  userId: string;
  memory: MemoryLayers;
  phase: PhaseState;
  myth: MythContext;
  archetype?: string | null;
  updatedAt: string;
}

export interface RespondParams {
  userId: string;
  message: string;
}

export interface RespondResult {
  response: string;
  phase: Phase;
  energy: number;
  trauma: string | null;
  exitSymbol: string;
}

