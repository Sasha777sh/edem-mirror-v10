export class WoundFilter {
  private wound: string | null;
  constructor(initial: string | null = null) { this.wound = initial; }

  get() { return this.wound; }
  set(value: string | null) { this.wound = value; }

  tint(text: string): string {
    if (!this.wound) return text;
    // Мягкое окрашивание: добавляем образ/тон
    return `${text}\n\n(я помню: ${this.wound.toLowerCase()})`;
  }
}

