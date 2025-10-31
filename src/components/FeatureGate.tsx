import { hasAccess, type Feature } from '@/lib/access';

export function FeatureGate({
    role, feature, children, fallback
}: { role: 'public' | 'registered' | 'guardian', feature: Feature, children: React.ReactNode, fallback?: React.ReactNode }) {
    return hasAccess(feature, role) ? <>{children}</> : (fallback ?? null);
}