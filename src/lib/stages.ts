export type Stage = 'shadow' | 'truth' | 'integration';

export interface SignalDetection {
    defensiveness: number; // 0-3
    acknowledgement: number; // 0-3
    readiness: number; // 0-3
}

/**
 * Detect signals from user text
 * @param text User input text
 * @returns Signal detection results
 */
export function detectSignals(text: string): SignalDetection {
    const t = text.toLowerCase();

    // Detect defensiveness
    const defensiveness =
        /(это не про меня|чушь|не согласен|вы не знаете|иди вон)/.test(t) ? 2 :
            /(но|если бы не они|они виноваты)/.test(t) ? 1 : 0;

    // Detect acknowledgement
    const acknowledgement = /(да, это во меня|узнал себя|похоже на правду)/.test(t) ? 2 :
        /(возможно|наверное)/.test(t) ? 1 : 0;

    // Detect readiness
    const readiness = /(сделаю|готов попробовать|ок, что делать)/.test(t) ? 2 : 0;

    return { defensiveness, acknowledgement, readiness };
}

/**
 * Decide next stage based on signals
 * @param signals Signal detection results
 * @param current Current stage
 * @param shadowStreak Number of consecutive shadow stages
 * @returns Next stage
 */
export function decideStage(
    signals: SignalDetection,
    current: Stage,
    shadowStreak: number
): Stage {
    // If high defensiveness, stay in shadow
    if (signals.defensiveness >= 2) return 'shadow';

    // If acknowledged and currently in shadow, move to truth
    if (signals.acknowledgement >= 1 && current === 'shadow') return 'truth';

    // If ready, move to integration
    if (signals.readiness >= 2) return 'integration';

    // If shadow streak is 2 or more, force move to truth
    if (shadowStreak >= 2) return 'truth';

    // Otherwise stay in current stage
    return current;
}