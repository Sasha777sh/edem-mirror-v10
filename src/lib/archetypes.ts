// Архетипы для PRO-версии (длинные описания для PDF-отчётов)

export interface Archetype {
    id: string;
    name: string;
    shortDescription: string; // для чата (30-40 символов)
    strength: string;
    distortion: string;
    manifestation: string;
    howToRestore: string;
    emoji: string;
}

export const ARCHETYPES: Archetype[] = [
    {
        id: 'guardian',
        name: 'Страж',
        shortDescription: 'Хранитель порядка и стабильности',
        strength: 'держать, сохранять порядок',
        distortion: 'держишь всё, даже то, что разрушает',
        manifestation: 'контроль над людьми, деньгами, деталями, невозможность отпустить',
        howToRestore: 'доверие к себе и способность отпускать то, что не твоё',
        emoji: '🛡️'
    },
    {
        id: 'refugee',
        name: 'Беглец',
        shortDescription: 'Мастер быстрых перемен и новых начал',
        strength: 'способность быстро уходить из опасного',
        distortion: 'убегаешь даже от того, что важно',
        manifestation: 'избегание близости, постоянные новые старты без завершения',
        howToRestore: 'смелость оставаться, когда страшно',
        emoji: '🏃'
    },
    {
        id: 'hero',
        name: 'Герой',
        shortDescription: 'Воин, берущий ответственность на себя',
        strength: 'действовать, брать на себя',
        distortion: 'геройствуешь там, где нужна честность, а не подвиг',
        manifestation: 'выгорание, спасательство, игнор своих потребностей',
        howToRestore: 'умение быть обычным и выбирать себя',
        emoji: '⚔️'
    },
    {
        id: 'orphan',
        name: 'Сирота',
        shortDescription: 'Чувствительный к боли других и себя',
        strength: 'чувствовать других, видеть слабое',
        distortion: 'вечное чувство брошенности',
        manifestation: 'ожидание предательства, обида на «мир, который не поддержал»',
        howToRestore: 'способность строить доверие и искать опору внутри',
        emoji: '🥺'
    },
    {
        id: 'ruler',
        name: 'Правитель',
        shortDescription: 'Организатор пространства и людей',
        strength: 'создавать структуру и правила',
        distortion: 'превращается в контроль ради контроля',
        manifestation: 'всё должно быть «по-моему», нет гибкости',
        howToRestore: 'умение править через доверие, а не страх',
        emoji: '👑'
    },
    {
        id: 'seeker',
        name: 'Искатель',
        shortDescription: 'Исследователь смыслов и глубин',
        strength: 'идти за новым, искать глубину',
        distortion: 'вечная неудовлетворённость, «здесь не то»',
        manifestation: 'вечный поиск смыслов, но ничего не доводится',
        howToRestore: 'способность остановиться и углубиться в одно',
        emoji: '🔍'
    },
    {
        id: 'lover',
        name: 'Любовник',
        shortDescription: 'Мастер связи и эмоциональной близости',
        strength: 'связь, страсть, чувствование',
        distortion: 'растворение в другом, зависимость от признания',
        manifestation: 'ревность, страх потерять любовь, жертвенность',
        howToRestore: 'любовь к себе как источник, а не отражение',
        emoji: '💕'
    },
    {
        id: 'magician',
        name: 'Маг',
        shortDescription: 'Трансформатор реальности и видящий связи',
        strength: 'трансформировать, видеть связи',
        distortion: 'манипуляция, иллюзия контроля через знания',
        manifestation: '«я знаю, как должно быть» — и потеря контакта с реальностью',
        howToRestore: 'смирение перед процессом и использование силы для созидания',
        emoji: '🔮'
    }
];

// Функция для определения архетипа по полярности и словам
export function detectArchetype(polarity: string, oneWord: string, problem: string): Archetype {
    const problemLower = problem.toLowerCase();
    const wordLower = oneWord.toLowerCase();

    // Логика определения архетипа на основе паттернов
    if (polarity === 'control' || wordLower.includes('контроль') || problemLower.includes('контрол')) {
        if (problemLower.includes('порядок') || problemLower.includes('правил')) {
            return ARCHETYPES.find(a => a.id === 'ruler') || ARCHETYPES[0];
        }
        return ARCHETYPES.find(a => a.id === 'guardian') || ARCHETYPES[0];
    }

    if (polarity === 'rejection' || wordLower.includes('одиноч') || problemLower.includes('брос')) {
        return ARCHETYPES.find(a => a.id === 'orphan') || ARCHETYPES[0];
    }

    if (polarity === 'loss' || wordLower.includes('потер') || problemLower.includes('ушёл')) {
        if (problemLower.includes('любов') || problemLower.includes('отношен')) {
            return ARCHETYPES.find(a => a.id === 'lover') || ARCHETYPES[0];
        }
        return ARCHETYPES.find(a => a.id === 'refugee') || ARCHETYPES[0];
    }

    if (wordLower.includes('ответств') || problemLower.includes('помог') || problemLower.includes('спас')) {
        return ARCHETYPES.find(a => a.id === 'hero') || ARCHETYPES[0];
    }

    if (wordLower.includes('смысл') || problemLower.includes('поиск') || problemLower.includes('понимай')) {
        return ARCHETYPES.find(a => a.id === 'seeker') || ARCHETYPES[0];
    }

    if (wordLower.includes('знан') || problemLower.includes('понимай') || problemLower.includes('объясн')) {
        return ARCHETYPES.find(a => a.id === 'magician') || ARCHETYPES[0];
    }

    // Fallback к случайному архетипу на основе хеша
    const hash = (oneWord + problem).split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return ARCHETYPES[hash % ARCHETYPES.length];
}

// Функция для получения архетипа по ID
export function getArchetypeById(id: string): Archetype | undefined {
    return ARCHETYPES.find(a => a.id === id);
}

// Функция для получения случайного архетипа
export function getRandomArchetype(): Archetype {
    const randomIndex = Math.floor(Math.random() * ARCHETYPES.length);
    return ARCHETYPES[randomIndex];
}