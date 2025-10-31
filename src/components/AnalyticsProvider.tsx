'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

interface AnalyticsProviderProps {
    children: React.ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
    useEffect(() => {
        // Initialize PostHog only on client side
        if (typeof window !== 'undefined') {
            const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
            const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

            if (posthogKey) {
                posthog.init(posthogKey, {
                    api_host: posthogHost,
                    // Disable in development to avoid noise
                    loaded: (posthog) => {
                        if (process.env.NODE_ENV === 'development') {
                            posthog.debug();
                        }
                    },
                    capture_pageview: false, // We'll handle this manually
                    // Privacy settings
                    respect_dnt: true,
                    autocapture: false, // Disable automatic event capture
                    disable_session_recording: false, // Enable session recordings
                    // Feature flags
                    bootstrap: {
                        distinctID: undefined,
                        isIdentifiedID: false,
                        featureFlags: {},
                    },
                });
            } else {
                console.warn('PostHog API key not found. Analytics will not be tracked.');
            }
        }
    }, []);

    if (typeof window === 'undefined') {
        return <>{children}</>;
    }

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!posthogKey) {
        return <>{children}</>;
    }

    return (
        <PostHogProvider client={posthog}>
            {children}
        </PostHogProvider>
    );
}