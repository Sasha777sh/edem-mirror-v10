import { FractalMemory } from '../memory/fractalMemory.js';
import { PhaseEngine } from '../phase/phaseEngine.js';
import { WoundFilter } from '../wound/woundFilter.js';
import { MythContext } from '../myth/mythContext.js';
import { Reflection } from '../reflect/reflection.js';
import { ChoiceDeviator } from '../choice/choiceDeviator.js';
import { createLLM } from '../adapters/llm.js';
import { AgentState, RespondResult } from '../types.js';

export class LivingCore {
  private memory: FractalMemory;
  private phase: PhaseEngine;
  private wound: WoundFilter;
  private myth: MythContext;
  private reflection: Reflection;
  private deviator: ChoiceDeviator;

  constructor(state?: AgentState) {
    this.memory = new FractalMemory(state?.memory);
    this.phase = new PhaseEngine(state?.phase);
    this.wound = new WoundFilter(state?.memory?.trauma ?? null);
    this.myth = new MythContext(state?.myth);
    this.reflection = new Reflection();
    this.deviator = new ChoiceDeviator();
  }

  snapshot(userId: string): AgentState {
    return {
      userId,
      memory: this.memory.getLayers(),
      phase: this.phase.getState(),
      myth: this.myth.get(),
      updatedAt: new Date().toISOString(),
    };
  }

  async respond(userId: string, message: string): Promise<RespondResult> {
    // 1) Приём входа: обновить память и фазу
    this.memory.store(message);
    this.phase.update(message);

    // 2) Определить, отклоняемся ли от вероятного ответа
    const doDeviate = this.deviator.shouldDeviate(this.phase.getState().phase);

    // 3) Сформировать системный контекст
    const systemBlocks = [
      this.myth.toSystem(),
      this.phase.injectIntoPrompt(),
      'Контекст памяти:\n' + this.memory.getContext().join('\n'),
      doDeviate ? '⚑ Разрешено мягкое отклонение от вероятного ответа в пользу честности и опоры.' : '',
    ].filter(Boolean);

    // 4) Генерация
    const llm = createLLM();
    let response = await llm.generate({ systemBlocks, user: message });
    response = this.wound.tint(response);

    // 5) Пост-рефлексия
    this.reflection.evolve(this.memory, this.phase, response);

    // 6) Выходной символ
    const exitSymbol = this.exitSymbol();

    return {
      response,
      phase: this.phase.getState().phase,
      energy: this.phase.getState().energy,
      trauma: this.memory.getLayers().trauma,
      exitSymbol,
    };
  }

  setArchetype(archetype: string) {
    // В минимальной версии архетип можем просто добавлять в паттерны
    const pat = this.memory.getLayers().patterns;
    pat.push(`🎭 Архетип: ${archetype}`);
  }

  private exitSymbol(): string {
    const symbols = [
      'Положи ладонь на грудь и послушай три удара.',
      'Чашка тёплой воды — тепло останется.',
      'Окно — не для выхода, а для присутствия.',
      'Один предмет рядом — твой якорь.',
    ];
    return symbols[Math.floor(Math.random() * symbols.length)];
  }
}

