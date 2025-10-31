import { PhaseState } from '../types.js';

export class PhaseEngine {
  private state: PhaseState;

  constructor(initial?: Partial<PhaseState>) {
    this.state = {
      phase: 'reflection',
      energy: 1.0,
      ...initial,
    };
  }

  update(inputText: string) {
    const t = inputText.toLowerCase();
    // простые эвристики перехода фаз
    if (t.includes('теря') || t.includes('потерян')) this.state.phase = 'eclipse';
    else if (t.includes('понимаю') || t.includes('понял')) this.state.phase = 'growth';

    // упрощённое «истощение энергии» от длины реплики
    this.state.energy = Math.max(0.1, Math.min(1.0, this.state.energy - Math.min(0.2, inputText.length / 400)));

    if (this.state.energy < 0.3) this.state.phase = 'rest';
  }

  injectIntoPrompt() {
    return `[Фаза: ${this.state.phase} | Энергия: ${this.state.energy.toFixed(2)}]`;
  }

  getState() { return this.state; }
}

