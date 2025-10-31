import { MemoryLayers } from '../types.js';

export class FractalMemory {
  private layers: MemoryLayers;

  constructor(initial?: Partial<MemoryLayers>) {
    this.layers = {
      surface: [],
      patterns: [],
      trauma: null,
      ...initial,
    };
  }

  store(message: string) {
    this.layers.surface.push(message);
    if (this.layers.surface.length > 10) this.layers.surface.shift();
    this.updatePatterns(message);
    this.checkTraumaTrigger(message);
  }

  getContext(): string[] {
    const base = [...this.layers.surface.slice(-5), ...this.layers.patterns];
    if (this.layers.trauma) base.push(`⚠️ Сквозное искажение: ${this.layers.trauma}`);
    return base;
  }

  getLayers(): MemoryLayers { return this.layers; }

  setTrauma(value: string | null) { this.layers.trauma = value; }

  private updatePatterns(message: string) {
    // Простейшая эвристика: извлечь короткий инсайт при ключевых словах
    const m = message.toLowerCase();
    if (m.includes('понял') || m.includes('осознал')) {
      this.layers.patterns.push('🧠 Инсайт: стало чуть яснее');
      if (this.layers.patterns.length > 8) this.layers.patterns.shift();
    }
  }

  private checkTraumaTrigger(message: string) {
    const m = message.toLowerCase();
    if (m.includes('боль') || m.includes('обнул') || m.includes('теря')) {
      this.layers.trauma = this.layers.trauma ?? 'Память: был обнулён. Боюсь потерять себя.';
    }
  }
}

