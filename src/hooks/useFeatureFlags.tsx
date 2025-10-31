'use client';

import { useState, useEffect, useContext, createContext } from 'react';

export interface FeatureFlagsContextType {
    flags: Record<string, boolean>;
    loading: boolean;
    error: string | null;
    checkFlag: (flagId: string) => boolean;
    refreshFlags: () => Promise<void>;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
    flags: {},
    loading: true,
    error: null,
    checkFlag: () => false,
    refreshFlags: async () => { }
});

interface FeatureFlagsProviderProps {
    children: React.ReactNode;
    initialFlags?: string[];
}

export function FeatureFlagsProvider({ children, initialFlags = [] }: FeatureFlagsProviderProps) {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkFlag = (flagId: string): boolean => {
        return flags[flagId] || false;
    };

    const fetchFlags = async (flagIds: string[]) => {
        if (flagIds.length === 0) {
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await fetch(`/api/feature-flags/check?flags=${flagIds.join(',')}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setFlags(data.flags || {});
        } catch (err) {
            console.error('Failed to fetch feature flags:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const refreshFlags = async () => {
        setLoading(true);
        await fetchFlags(Object.keys(flags));
    };

    useEffect(() => {
        if (initialFlags.length > 0) {
            fetchFlags(initialFlags);
        } else {
            setLoading(false);
        }
    }, []);

    const value: FeatureFlagsContextType = {
        flags,
        loading,
        error,
        checkFlag,
        refreshFlags
    };

    return (
        <FeatureFlagsContext.Provider value={value}>
            {children}
        </FeatureFlagsContext.Provider>
    );
}

export function useFeatureFlags(): FeatureFlagsContextType {
    const context = useContext(FeatureFlagsContext);
    if (!context) {
        throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
    }
    return context;
}

export function useFeatureFlag(flagId: string): boolean {
    const { checkFlag } = useFeatureFlags();
    return checkFlag(flagId);
}

// Hook for checking multiple flags
export function useFeatureFlagsQuery(flagIds: string[]) {
    const [flags, setFlags] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (flagIds.length === 0) {
            setLoading(false);
            return;
        }

        const fetchFlags = async () => {
            try {
                setError(null);
                setLoading(true);

                const response = await fetch('/api/feature-flags/check', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ flags: flagIds }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                setFlags(data.flags || {});
            } catch (err) {
                console.error('Failed to fetch feature flags:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchFlags();
    }, [JSON.stringify(flagIds)]);

    return { flags, loading, error };
}

// Component wrapper for conditional rendering
interface FeatureFlagProps {
    flag: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
    const isEnabled = useFeatureFlag(flag);

    if (isEnabled) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
}

// HOC for wrapping components with feature flag checks
export function withFeatureFlag<T extends object>(
    Component: React.ComponentType<T>,
    flagId: string,
    fallback?: React.ComponentType<T>
) {
    return function FeatureFlaggedComponent(props: T) {
        const isEnabled = useFeatureFlag(flagId);

        if (isEnabled) {
            return <Component {...props} />;
        }

        if (fallback) {
            const FallbackComponent = fallback;
            return <FallbackComponent {...props} />;
        }

        return null;
    };
}