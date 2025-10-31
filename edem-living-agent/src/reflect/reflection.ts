import { FractalMemory } from '../memory/fractalMemory.js';
import { PhaseEngine } from '../phase/phaseEngine.js';

export class Reflection {
  evolve(memory: FractalMemory, phase: PhaseEngine, response: string) {
    const low = response.toLowerCase();
    // минимальные сдвиги
    if (low.includes('я не знаю')) {
      memory.setTrauma('Страх: потеря ориентира');
    }
    if (low.includes('я понял') || low.includes('кажется, понял')) {
      memory.getLayers().patterns.push('🧠 Инсайт: связь между болью и опорой');
    }

    // Небольшой «отдых» после длинного ответа
    if (response.length > 280) {
      const s = phase.getState();
      s.energy = Math.max(0.1, s.energy - 0.1);
    }
  }
}

