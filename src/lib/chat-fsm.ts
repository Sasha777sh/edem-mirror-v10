// EDEM Chat Finite State Machine with Shadow v2 Onboarding

export type ChatStep =
    // Shadow v2 Onboarding (6 steps)
    | 'onb_1_mask'
    | 'onb_2_trigger'
    | 'onb_3_polarity'
    | 'onb_4_body'
    | 'onb_5_one_word'
    | 'onb_6_cost_agree'
    // Core EDEM flow
    | 'intro'
    | 'problem'
    | 'clarify_polarity'
    | 'locate_body'
    | 'name_one_word'
    | 'truth_cut'
    | 'paywall'
    | 'archetype'
    | 'today_step'
    | 'practice'
    | 'close'
    | 'error';

export type OnbStep =
    | 'onb_1_mask'
    | 'onb_2_trigger'
    | 'onb_3_polarity'
    | 'onb_4_body'
    | 'onb_5_one_word'
    | 'onb_6_cost_agree';

export type Polarity = 'loss' | 'control' | 'rejection' | 'guilt' | 'shame' | 'other';

export interface OnboardingData {
    mask?: string;        // роль/маска пользователя
    trigger?: string;     // когда срабатывает маска
    polarity?: Polarity;  // доминирующее чувство
    body?: string;        // где в теле ощущается
    oneWord?: string;     // одно слово-суть
    costAgree?: boolean;  // согласие работать с ценой маски
}

export interface SessionState {
    sessionId: string;
    userId?: string;
    guestId?: string;
    voice: 'soft' | 'hard' | 'therapist';
    mode: 'demo' | 'pro';
    currentStep: ChatStep;

    // Onboarding data (Shadow v2)
    onb?: OnboardingData;

    // Core EDEM data
    problem?: string;
    polarity?: Polarity;
    body?: string;
    oneWord?: string;
    truthCut?: string;

    // PRO features
    archetype?: string;
    todayStep?: string;
    practice?: string;

    // Timestamps
    startedAt: Date;
    updatedAt: Date;
}

// FSM transition logic
export function getNextStep(currentStep: ChatStep, inputs: any): ChatStep {
    switch (currentStep) {
        // Onboarding flow
        case 'onb_1_mask':
            return inputs.mask ? 'onb_2_trigger' : 'onb_1_mask';
        case 'onb_2_trigger':
            return inputs.trigger ? 'onb_3_polarity' : 'onb_2_trigger';
        case 'onb_3_polarity':
            return inputs.polarity ? 'onb_4_body' : 'onb_3_polarity';
        case 'onb_4_body':
            return inputs.body ? 'onb_5_one_word' : 'onb_4_body';
        case 'onb_5_one_word':
            return inputs.oneWord ? 'onb_6_cost_agree' : 'onb_5_one_word';
        case 'onb_6_cost_agree':
            if (inputs.costAgree === false) return 'close';
            return inputs.costAgree ? 'truth_cut' : 'onb_6_cost_agree';

        // Core flow (after onboarding or direct entry)
        case 'intro':
            return 'onb_1_mask'; // Start with onboarding
        case 'truth_cut':
            return inputs.mode === 'demo' ? 'paywall' : 'archetype';
        case 'paywall':
            return 'close'; // Demo ends here unless user upgrades
        case 'archetype':
            return 'today_step';
        case 'today_step':
            return 'practice';
        case 'practice':
            return 'close';
        case 'close':
        case 'error':
            return 'close';
        default:
            return 'error';
    }
}

// Validate step transitions
export function isValidTransition(from: ChatStep, to: ChatStep): boolean {
    const validTransitions: Record<ChatStep, ChatStep[]> = {
        'intro': ['onb_1_mask'],
        'onb_1_mask': ['onb_2_trigger'],
        'onb_2_trigger': ['onb_3_polarity'],
        'onb_3_polarity': ['onb_4_body'],
        'onb_4_body': ['onb_5_one_word'],
        'onb_5_one_word': ['onb_6_cost_agree'],
        'onb_6_cost_agree': ['truth_cut', 'close'], // close if costAgree=false
        'problem': [],
        'clarify_polarity': [],
        'locate_body': [],
        'name_one_word': [],
        'truth_cut': ['paywall', 'archetype'],
        'paywall': ['close', 'archetype'], // archetype if user upgrades
        'archetype': ['today_step'],
        'today_step': ['practice'],
        'practice': ['close'],
        'close': [],
        'error': []
    };

    return validTransitions[from]?.includes(to) ?? false;
}

// Get current step progress (for UI)
export function getStepProgress(step: ChatStep): { current: number; total: number; label: string } {
    const onboardingSteps: Record<OnbStep, number> = {
        'onb_1_mask': 1,
        'onb_2_trigger': 2,
        'onb_3_polarity': 3,
        'onb_4_body': 4,
        'onb_5_one_word': 5,
        'onb_6_cost_agree': 6
    };

    if (step in onboardingSteps) {
        return {
            current: onboardingSteps[step as OnbStep],
            total: 6,
            label: 'Знакомство с тенью'
        };
    }

    // For core steps after onboarding
    return {
        current: 6,
        total: 6,
        label: 'Работа с тенью'
    };
}