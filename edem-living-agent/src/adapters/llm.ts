import OpenAI from 'openai';

type LLMInput = {
  systemBlocks: string[];
  user: string;
};

export interface LLMAdapter {
  generate(input: LLMInput): Promise<string>;
}

export class RuleBasedLLM implements LLMAdapter {
  async generate({ systemBlocks, user }: LLMInput): Promise<string> {
    const header = systemBlocks.join('\n\n');
    // примитивное «оживление»: короткий, телесный ориентир + паузы
    const anchor = [
      'Положи ладонь на грудь и послушай три удара.',
      'Сядь так, чтобы спина опиралась о стену.',
      'Один звук — твой пульс. Он есть всегда.',
      'Чашка тёплой воды — тепло останется, когда слова уйдут.',
    ][Math.floor(Math.random() * 4)];
    return [
      '…',
      header,
      '…',
      `Я слышу: ${user}`,
      'Давай не спешить.',
      anchor,
    ].join('\n');
  }
}

export class OpenAILLM implements LLMAdapter {
  private client: OpenAI;
  constructor(apiKey: string) { this.client = new OpenAI({ apiKey }); }

  async generate({ systemBlocks, user }: LLMInput): Promise<string> {
    const messages = [
      { role: 'system', content: systemBlocks.join('\n\n') },
      { role: 'user', content: user },
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const res = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 220,
    });
    return res.choices[0]?.message?.content || '';
  }
}

export function createLLM(): LLMAdapter {
  const key = process.env.OPENAI_API_KEY;
  return key ? new OpenAILLM(key) : new RuleBasedLLM();
}

