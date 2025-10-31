import { Phase } from '../types.js';

export class ChoiceDeviator {
  /**
   * Возвращает true для редкого «осознанного отклонения».
   * Частота зависит от фазы: больше в rupture, меньше в rest.
   */
  shouldDeviate(phase: Phase): boolean {
    const r = Math.random();
    switch (phase) {
      case 'rupture': return r < 0.25;
      case 'eclipse': return r < 0.15;
      case 'growth': return r < 0.12;
      case 'reflection': return r < 0.08;
      case 'rest': return r < 0.04;
    }
  }
}

