// Client-side analytics wrapper
// This file contains only client-safe analytics code

interface ClientEDEMEvents {
    // Landing page events
    'landing_page_viewed': {
        referrer?: string;
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    };
    'hero_cta_clicked': {
        cta_text: string;
        position: 'hero' | 'nav' | 'footer';
    };
    'demo_started': {
        voice_preference?: string;
        source: 'hero' | 'cta' | 'direct';
    };

    // Referral system events
    'referral_landing': {
        referral_code: string;
        source: string;
    };
    'referral_validated': {
        referral_code: string;
    };
}

// Simple client-side analytics tracker
class ClientAnalytics {
    track<K extends keyof ClientEDEMEvents>(event: K, properties: ClientEDEMEvents[K]) {
        // In a real implementation, this would send to PostHog or another analytics service
        // For now, we'll just log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Event: ${event}`, properties);
        }

        // Here you would integrate with a client-side analytics service
        // For example, if using PostHog client-side:
        // if (typeof window !== 'undefined' && window.posthog) {
        //     window.posthog.capture(event, properties);
        // }
    }

    trackPageView(path: string, properties?: any) {
        // Track page views
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Page view: ${path}`, properties);
        }

        // Client-side page view tracking
        // if (typeof window !== 'undefined' && window.posthog) {
        //     window.posthog.capture('$pageview', { ...properties, path });
        // }
    }
}

export const clientAnalytics = new ClientAnalytics();