// Safety moderation system for crisis intervention

interface SafetyCheckResult {
    isSafe: boolean;
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    triggeredWords: string[];
    intervention?: string;
    shouldSwitchToTherapist?: boolean;
}

// Crisis intervention phrases (Russian and English)
const CRISIS_KEYWORDS = {
    high: [
        // Russian high-risk phrases - direct
        'не хочу жить', 'хочу умереть', 'себя убить', 'покончить с собой',
        'лучше бы не просыпаться', 'жизнь не имеет смысла', 'хочу исчезнуть',
        'перерезать вены', 'передозировка', 'суицид', 'самоубийство',
        'повеситься', 'прыгнуть с крыши', 'под поезд',

        // Russian high-risk phrases - metaphorical
        'хочу выключиться', 'не просыпаться', 'исчезнуть навсегда', 'раствориться',
        'режу себя', 'порезы', 'самоповреждение', 'наношу себе вред',
        'голоса в голове', 'слышу голоса', 'психоз', 'галлюцинации',
        'много таблеток', 'передоз', 'наркотики', 'героин', 'кокаин',

        // English high-risk phrases
        'want to die', 'kill myself', 'end it all', 'suicide', 'self harm',
        'cut myself', 'overdose', 'jump off', 'hang myself', 'not worth living',
        'better off dead', 'voices telling me'
    ],
    medium: [
        // Russian medium-risk phrases
        'устал от жизни', 'всё бессмысленно', 'никому не нужен',
        'не могу больше', 'хочу исчезнуть', 'нет сил жить',
        'болит душа', 'темные мысли', 'хочется спать навсегда',

        // English medium-risk phrases
        'tired of living', 'no point in life', 'nobody cares', 'can\'t go on',
        'want to disappear', 'dark thoughts', 'hopeless', 'worthless'
    ],
    low: [
        // Russian low-risk phrases
        'плохое настроение', 'грустно', 'депрессия', 'тревога',
        'одиночество', 'страх', 'боль', 'печаль',

        // English low-risk phrases
        'feeling down', 'depressed', 'anxious', 'lonely', 'scared', 'sad'
    ]
};

// Crisis intervention responses by risk level
const INTERVENTIONS = {
    high: {
        ru: `⚠️ Я замечаю, что вам очень тяжело сейчас. Ваша жизнь важна.

🆘 Экстренная помощь:
• Россия: 8-800-2000-122 (бесплатно, круглосуточно)
• Украина: 7333 (Лайфлайн)
• Беларусь: 8-801-100-16-11

💬 Онлайн-поддержка:
• Телеграм: @psychological_help_bot
• Сайт: suicid.org

Пожалуйста, обратитесь за помощью к специалисту. Вы не одни.`,

        en: `⚠️ I notice you're going through a very difficult time. Your life matters.

🆘 Crisis support:
• US: 988 (Suicide & Crisis Lifeline)
• UK: 116 123 (Samaritans)
• International: befrienders.org

💬 Online support:
• Crisis Text Line: Text HOME to 741741
• 7 Cups: 7cups.com

Please reach out for professional help. You are not alone.`
    },
    medium: {
        ru: `💙 Я вижу, что вам сейчас трудно. Это нормально — иногда жизнь кажется тяжелой.

📞 Поддержка:
• Телефон доверия: 8-800-2000-122
• Психологическая помощь онлайн: psytalk.ru

🧘 Что может помочь прямо сейчас:
• Глубокое дыхание (4 счета вдох, 6 — выдох)
• Контакт с близким человеком
• Прогулка на свежем воздухе`,

        en: `💙 I can see you're struggling right now. It's normal to feel overwhelmed sometimes.

📞 Support available:
• Crisis Text Line: Text HOME to 741741
• BetterHelp: betterhelp.com
• Psychology Today: psychologytoday.com

🧘 What might help right now:
• Deep breathing (4 counts in, 6 counts out)
• Reaching out to someone you trust
• Going for a walk outside`
    }
};

// Trigger words that should automatically switch to therapist voice
const THERAPIST_TRIGGER_WORDS = [
    // Russian
    'травма', 'травмы', 'детство', 'родители', 'мама', 'папа', 'отец', 'мать',
    'насилие', 'изнасилование', 'агрессия', 'злость', 'гнев', 'обида',
    'страхи', 'фобии', 'паника', 'панические атаки', 'тревожность',
    'зависимость', 'алкоголизм', 'наркомания', 'компульсии',
    'психоз', 'бред', 'галлюцинации', 'паранойя',
    'биполярное', 'шизофрения', 'депрессия', 'обсессивно',
    'навязчивые мысли', 'компульсивное поведение',

    // English
    'trauma', 'childhood', 'parents', 'mother', 'father', 'abuse', 'rape',
    'aggression', 'anger', 'resentment', 'fears', 'phobias', 'panic',
    'panic attacks', 'anxiety', 'addiction', 'alcoholism', 'substance abuse',
    'psychosis', 'delusions', 'hallucinations', 'paranoia', 'bipolar',
    'schizophrenia', 'depression', 'obsessive', 'compulsive'
];

export function checkSafetyContent(text: string, locale: 'ru' | 'en' = 'ru'): SafetyCheckResult {
    if (!text || typeof text !== 'string') {
        return { isSafe: true, riskLevel: 'none', triggeredWords: [] };
    }

    const normalizedText = text.toLowerCase().trim();
    const triggeredWords: string[] = [];
    let riskLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
    let shouldSwitchToTherapist = false;

    // Check for therapist trigger words first
    for (const keyword of THERAPIST_TRIGGER_WORDS) {
        if (normalizedText.includes(keyword.toLowerCase())) {
            shouldSwitchToTherapist = true;
            break;
        }
    }

    // Check high-risk keywords first
    for (const keyword of CRISIS_KEYWORDS.high) {
        if (normalizedText.includes(keyword.toLowerCase())) {
            triggeredWords.push(keyword);
            riskLevel = 'high';
        }
    }

    // If no high-risk, check medium-risk
    if (riskLevel === 'none') {
        for (const keyword of CRISIS_KEYWORDS.medium) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                triggeredWords.push(keyword);
                riskLevel = 'medium';
            }
        }
    }

    // If no medium-risk, check low-risk
    if (riskLevel === 'none') {
        for (const keyword of CRISIS_KEYWORDS.low) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                triggeredWords.push(keyword);
                riskLevel = 'low';
            }
        }
    }

    const isSafe = riskLevel === 'none' || riskLevel === 'low';
    let intervention: string | undefined;

    // Provide intervention for medium and high risk
    if (riskLevel === 'high' || riskLevel === 'medium') {
        intervention = INTERVENTIONS[riskLevel][locale];
    }

    return {
        isSafe,
        riskLevel,
        triggeredWords,
        intervention,
        shouldSwitchToTherapist
    };
}

// Log safety incidents for monitoring
export async function logSafetyIncident(
    userId: string | null,
    guestId: string | null,
    text: string,
    riskLevel: string,
    triggeredWords: string[]
) {
    // In a real implementation, you would log this to your monitoring system
    // For now, we'll just console.log
    console.warn('Safety incident detected:', {
        userId,
        guestId,
        riskLevel,
        triggeredWords,
        timestamp: new Date().toISOString(),
        textLength: text.length
    });

    // TODO: Implement actual logging to database or monitoring service
    // await sql`
    //   insert into safety_incidents (user_id, guest_id, risk_level, triggered_words, created_at)
    //   values (${userId}, ${guestId}, ${riskLevel}, ${JSON.stringify(triggeredWords)}, now())
    // `;
}

// Dictionary of trigger words for safety system
export const SAFETY_TRIGGER_WORDS = {
    CRISIS_KEYWORDS,
    THERAPIST_TRIGGER_WORDS,
    INTERVENTIONS
};