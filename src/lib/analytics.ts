import { PostHog } from 'posthog-node';
import React from 'react';

// Server-side PostHog client
let posthogServer: PostHog | null = null;

if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthogServer = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    });
}

// Event types for EDEM analytics
export interface EDEMEvents {
    // Landing page events
    'landing_page_viewed': {
        referrer?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    };
    'hero_cta_clicked': {
        cta_text: string;
        position: 'hero' | 'nav' | 'footer' | 'sidebar';
    };
    'demo_started': {
        voice_preference?: string;
        source: 'hero' | 'cta' | 'direct';
    };

    // Demo flow events
    'demo_step_completed': {
        step: string;
        voice: string;
        session_id: string;
        time_spent_seconds: number;
    };
    'demo_abandoned': {
        last_step: string;
        voice: string;
        session_id: string;
        time_spent_seconds: number;
        reason?: 'timeout' | 'user_exit' | 'error';
    };
    'demo_completed': {
        voice: string;
        session_id: string;
        total_time_seconds: number;
        truth_cut?: string;
        archetype?: string;
    };

    // Paywall events
    'paywall_viewed': {
        trigger: 'demo_limit' | 'pro_feature' | 'manual';
        plan_viewed: '24h' | '30d';
        voice: string;
    };
    'buy_button_clicked': {
        plan: '24h' | '30d';
        price: string;
        payment_method: 'crypto' | 'yookassa' | 'stripe';
        voice: string;
    };
    'payment_started': {
        plan: '24h' | '30d';
        price: string;
        payment_method: string;
    };
    'payment_completed': {
        plan: '24h' | '30d';
        price: string;
        payment_method: string;
        transaction_id?: string;
    };
    'payment_failed': {
        plan: '24h' | '30d';
        payment_method: string;
        error_reason?: string;
    };

    // User journey events
    'user_registered': {
        method: 'email' | 'google' | 'apple';
        referrer?: string;
    };
    'user_login': {
        method: 'email' | 'google' | 'apple';
    };
    'profile_completed': {
        voice_preference: string;
        notification_settings: boolean;
    };

    // App usage events
    'dashboard_viewed': {
        plan: 'free' | 'pro';
        streak_days: number;
    };
    'word_of_day_viewed': {
        voice: string;
        word: string;
    };
    'ritual_started': {
        voice: string;
        trigger: 'dashboard' | 'word_of_day' | 'telegram';
    };
    'journal_entry_created': {
        content_length: number;
        has_tags: boolean;
        mood_rating?: number;
    };
    'journal_exported': {
        format: 'csv' | 'json';
        entries_count: number;
    };
    'achievement_unlocked': {
        achievement_id: string;
        achievement_name: string;
        user_level: number;
    };

    // Telegram bot events
    'telegram_bot_started': {
        user_id: string;
        voice_preference?: string;
    };
    'telegram_notification_sent': {
        type: 'daily_word' | 'streak_reminder' | 'custom';
        success: boolean;
    };
    'telegram_command_used': {
        command: string;
        user_id: string;
    };

    // Feature usage
    'feature_flag_evaluated': {
        flag_id: string;
        enabled: boolean;
        user_group?: string;
    };
    'export_button_clicked': {
        format: 'csv' | 'json' | 'pdf';
        data_type: 'journal' | 'sessions' | 'progress';
    };

    // Error tracking
    'error_occurred': {
        error_type: 'api' | 'client' | 'payment' | 'auth';
        error_message: string;
        error_code?: string;
        page?: string;
        user_agent?: string;
    };

    // Referral system events
    'referral_used': {
        referrer_id: string;
        referee_id: string;
        referral_code: string;
        bonus_type: string;
        bonus_value: number;
    };
    'referral_created': {
        user_id: string;
        referral_code: string;
    };
    'referral_bonus_applied': {
        user_id: string;
        bonus_days: number;
        bonus_type: 'referrer' | 'referee';
    };
    'referral_landing': {
        referral_code: string;
        source: string;
    };
    'referral_validated': {
        referral_code: string;
    };
    'referral_signup_success': {
        user_id: string;
        referral_code: string;
    };
    'referral_signup_failed': {
        user_id: string;
        referral_code: string;
        reason: string;
    };
    'referral_signup_error': {
        user_id: string;
        referral_code: string;
        error: string;
    };

    // Free trial events
    'free_trial_started': {
        user_id: string;
        trial_days: number;
        auto_upgrade: boolean;
        payment_method?: string;
    };
    'free_trial_ended': {
        user_id: string;
        reason: 'expired' | 'upgraded' | 'cancelled';
    };
    'trial_auto_upgraded': {
        user_id: string;
        subscription_id: string;
    };
    'trial_expired': {
        user_id: string;
    };
    'trial_extended': {
        user_id: string;
        additional_days: number;
    };

    // Cron job events
    'cron_trials_processed': {
        processed: number;
        errors: number;
        timestamp: string;
    };
    'cron_trials_error': {
        error: string;
        timestamp: string;
    };

    // Practice events
    'practice_completed': {
        practice_id: string;
        user_id?: string;
        completion_time?: string;
        self_report?: number;
        has_note?: boolean;
    };

    // Check-in events
    'cron_checkin_reminders_sent': {
        users_count: number;
        timestamp: string;
    };
    'cron_checkin_error': {
        error: string;
        timestamp: string;
    };

    // Dialogue system events
    'stage_changed': {
        user_id: string;
        session_id: string;
        from_stage: string;
        to_stage: string;
    };
    'practice_assigned': {
        user_id: string;
        session_id: string;
        practice_key: string;
    };
}

class AnalyticsService {
    private isInitialized = false;
    private userId: string | null = null;
    private userProperties: Record<string, any> = {};

    // Initialize analytics with user data
    identify(userId: string, properties: Record<string, any> = {}) {
        this.userId = userId;
        this.userProperties = { ...this.userProperties, ...properties };
        this.isInitialized = true;

        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.identify(userId, properties);
        }

        if (posthogServer) {
            posthogServer.identify({
                distinctId: userId,
                properties
            });
        }
    }

    // Track events with proper typing
    track<K extends keyof EDEMEvents>(
        event: K,
        properties: EDEMEvents[K] & { user_id?: string; timestamp?: string }
    ) {
        const eventProperties = {
            ...properties,
            user_id: this.userId || properties.user_id || 'anonymous',
            timestamp: new Date().toISOString(),
            ...this.userProperties
        };

        // Client-side tracking
        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.capture(event as string, eventProperties);
        }

        // Server-side tracking
        if (posthogServer) {
            posthogServer.capture({
                distinctId: this.userId || 'anonymous',
                event: event as string,
                properties: eventProperties
            });
        }

        // Console log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${event}:`, eventProperties);
        }
    }

    // Update user properties
    setUserProperties(properties: Record<string, any>) {
        this.userProperties = { ...this.userProperties, ...properties };

        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.people.set(properties);
        }

        if (posthogServer && this.userId) {
            posthogServer.identify({
                distinctId: this.userId,
                properties
            });
        }
    }

    // Track page views
    trackPageView(path: string, properties: Record<string, any> = {}) {
        this.track('landing_page_viewed', {
            ...properties,
            page_path: path,
            referrer: typeof window !== 'undefined' ? document.referrer : undefined
        } as any);
    }

    // Track errors with context
    trackError(error: Error | string, context: Record<string, any> = {}) {
        const errorMessage = error instanceof Error ? error.message : error;
        const errorStack = error instanceof Error ? error.stack : undefined;

        this.track('error_occurred', {
            error_message: errorMessage,
            error_stack: errorStack,
            error_type: context.type || 'client',
            page: typeof window !== 'undefined' ? window.location.pathname : undefined,
            user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
            ...context
        } as any);
    }

    // Track conversion funnel
    trackFunnelStep(step: string, metadata: Record<string, any> = {}) {
        const funnelEvents = {
            'landing': 'landing_page_viewed',
            'demo_start': 'demo_started',
            'demo_complete': 'demo_completed',
            'paywall_view': 'paywall_viewed',
            'payment_start': 'payment_started',
            'payment_complete': 'payment_completed'
        };

        const eventName = funnelEvents[step as keyof typeof funnelEvents];
        if (eventName) {
            this.track(eventName as keyof EDEMEvents, metadata as any);
        }
    }

    // Reset analytics (for logout)
    reset() {
        this.userId = null;
        this.userProperties = {};
        this.isInitialized = false;

        if (typeof window !== 'undefined' && window.posthog) {
            window.posthog.reset();
        }
    }

    // Flush events (useful for server-side)
    async flush() {
        if (posthogServer) {
            await posthogServer.shutdown();
        }
    }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Type declarations for PostHog on window
declare global {
    interface Window {
        posthog?: any;
    }
}

// Helper hooks for React components
export function useAnalytics() {
    return analytics;
}

// Higher-order component for tracking page views
export function withPageTracking<T extends object>(
    Component: React.ComponentType<T>,
    pageName: string
) {
    return function TrackedComponent(props: T) {
        React.useEffect(() => {
            analytics.trackPageView(pageName);
        }, []);

        // Используем React.createElement вместо JSX
        return React.createElement(Component, props);
    };
}

// Custom hook for tracking events
export function useTrackEvent() {
    return function trackEvent<K extends keyof EDEMEvents>(event: K, properties: EDEMEvents[K]) {
        analytics.track(event, properties);
    };
}