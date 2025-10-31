import { hasAccess, normalizeFeature } from '@/lib/access';

describe('Access Control System', () => {
    describe('hasAccess', () => {
        it('should allow public users to access light features', () => {
            expect(hasAccess('light', 'public')).toBe(true);
        });

        it('should allow registered users to access light and truth features', () => {
            expect(hasAccess('light', 'registered')).toBe(true);
            expect(hasAccess('truth', 'registered')).toBe(true);
            expect(hasAccess('shadow', 'registered')).toBe(false);
        });

        it('should allow guardian users to access all features', () => {
            expect(hasAccess('light', 'guardian')).toBe(true);
            expect(hasAccess('truth', 'guardian')).toBe(true);
            expect(hasAccess('shadow', 'guardian')).toBe(true);
        });

        it('should default to public role when role is null or undefined', () => {
            expect(hasAccess('light', null)).toBe(true);
            expect(hasAccess('truth', null)).toBe(false);
            expect(hasAccess('shadow', undefined)).toBe(false);
        });
    });

    describe('normalizeFeature', () => {
        it('should normalize valid features', () => {
            expect(normalizeFeature('light')).toBe('light');
            expect(normalizeFeature('truth')).toBe('truth');
            expect(normalizeFeature('shadow')).toBe('shadow');
        });

        it('should default to light feature for invalid inputs', () => {
            expect(normalizeFeature('invalid')).toBe('light');
            expect(normalizeFeature('')).toBe('light');
            expect(normalizeFeature(undefined)).toBe('light');
        });
    });
});