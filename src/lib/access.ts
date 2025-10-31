export type Role = 'public' | 'registered' | 'guardian';
export type Feature = 'light' | 'truth' | 'shadow';

const matrix: Record<Feature, Role[]> = {
    light: ['public', 'registered', 'guardian'],      // доступно всем
    truth: ['registered', 'guardian'],               // нужен аккаунт
    shadow: ['guardian'],                           // только хранители
};

export function hasAccess(feature: Feature, role: Role | null | undefined) {
    const r: Role = role ?? 'public';
    return matrix[feature].includes(r);
}

/** Валидация запроса «режима сцены» из клиента */
export function normalizeFeature(input?: string): Feature {
    if (input === 'truth' || input === 'shadow') return input;
    return 'light';
}