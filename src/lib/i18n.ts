import { translations, Locale } from './translations';

export function useTranslation(locale: Locale = 'ru') {
    const t = translations[locale];

    return {
        t,
        locale,
        // Helper function to get nested translations
        getText: (path: string) => {
            const keys = path.split('.');
            let result: any = t;

            for (const key of keys) {
                result = result?.[key];
                if (result === undefined) {
                    console.warn(`Translation missing for path: ${path}`);
                    return path;
                }
            }

            return result;
        }
    };
}

// Get locale from URL or browser
export function getLocaleFromRequest(pathname: string, headers?: Headers): Locale {
    // Check URL path for locale
    if (pathname.startsWith('/en')) return 'en';
    if (pathname.startsWith('/ru')) return 'ru';

    // Check Accept-Language header
    if (headers) {
        const acceptLanguage = headers.get('accept-language');
        if (acceptLanguage?.includes('en')) return 'en';
    }

    // Default to Russian
    return 'ru';
}