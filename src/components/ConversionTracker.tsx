'use client';

import { useEffect, useRef } from 'react';
import { analytics } from '@/lib/analytics';

interface ConversionTrackerProps {
    step: 'landing' | 'demo_start' | 'demo_complete' | 'paywall_view' | 'payment_start' | 'payment_complete';
    metadata?: Record<string, any>;
    trigger?: 'view' | 'click' | 'custom';
    children?: React.ReactNode;
    className?: string;
}

export default function ConversionTracker({
    step,
    metadata = {},
    trigger = 'view',
    children,
    className = ''
}: ConversionTrackerProps) {
    const hasTracked = useRef(false);
    const elementRef = useRef<HTMLDivElement>(null);

    const trackStep = () => {
        if (hasTracked.current) return;

        hasTracked.current = true;
        analytics.trackFunnelStep(step, {
            ...metadata,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            user_agent: navigator.userAgent
        });
    };

    useEffect(() => {
        if (trigger === 'view') {
            // Track on component mount
            trackStep();
        } else if (trigger === 'click') {
            // Will be handled by onClick
            return;
        }
    }, [step, trigger]);

    // Intersection Observer for viewport tracking
    useEffect(() => {
        if (trigger === 'view' && elementRef.current) {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        trackStep();
                        observer.disconnect();
                    }
                },
                { threshold: 0.5 }
            );

            observer.observe(elementRef.current);

            return () => observer.disconnect();
        }
    }, [trigger]);

    const handleClick = () => {
        if (trigger === 'click') {
            trackStep();
        }
    };

    if (!children) {
        return (
            <div
                ref={elementRef}
                className={className}
                onClick={handleClick}
            />
        );
    }

    return (
        <div
            ref={elementRef}
            className={className}
            onClick={handleClick}
        >
            {children}
        </div>
    );
}

// Hook for manual tracking
export function useConversionTracking() {
    return {
        trackStep: (step: string, metadata: Record<string, any> = {}) => {
            analytics.trackFunnelStep(step, metadata);
        },
        trackEvent: analytics.track.bind(analytics),
        trackError: analytics.trackError.bind(analytics)
    };
}

// Component for tracking CTA clicks
interface CTATrackerProps {
    ctaText: string;
    position: 'hero' | 'nav' | 'footer' | 'sidebar';
    children: React.ReactNode;
    className?: string;
    href?: string;
    onClick?: () => void;
}

export function CTATracker({
    ctaText,
    position,
    children,
    className = '',
    href,
    onClick
}: CTATrackerProps) {
    const handleClick = () => {
        analytics.track('hero_cta_clicked', {
            cta_text: ctaText,
            position,
            timestamp: new Date().toISOString()
        });

        if (onClick) {
            onClick();
        }
    };

    if (href) {
        return (
            <a
                href={href}
                className={className}
                onClick={handleClick}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            className={className}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}

// Component for tracking demo events
interface DemoTrackerProps {
    sessionId: string;
    voice: string;
    children: React.ReactNode;
}

export function DemoTracker({ sessionId, voice, children }: DemoTrackerProps) {
    const startTime = useRef(Date.now());

    useEffect(() => {
        // Track demo start
        analytics.track('demo_started', {
            voice_preference: voice,
            source: 'hero'
        });

        return () => {
            // Track demo abandon on unmount (if not completed)
            const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
            analytics.track('demo_abandoned', {
                last_step: 'unknown',
                voice,
                session_id: sessionId,
                time_spent_seconds: timeSpent,
                reason: 'user_exit'
            });
        };
    }, [sessionId, voice]);

    return <>{children}</>;
}

// Component for tracking paywall views
interface PaywallTrackerProps {
    trigger: 'demo_limit' | 'pro_feature' | 'manual';
    planViewed: '24h' | '30d';
    voice: string;
    children: React.ReactNode;
}

export function PaywallTracker({ trigger, planViewed, voice, children }: PaywallTrackerProps) {
    useEffect(() => {
        analytics.track('paywall_viewed', {
            trigger,
            plan_viewed: planViewed,
            voice
        });
    }, [trigger, planViewed, voice]);

    return <>{children}</>;
}

// Component for tracking payment events
interface PaymentTrackerProps {
    plan: '24h' | '30d';
    price: string;
    paymentMethod: 'crypto' | 'yookassa' | 'stripe';
    voice: string;
    children: React.ReactNode;
}

export function PaymentTracker({ plan, price, paymentMethod, voice, children }: PaymentTrackerProps) {
    const trackPaymentStart = () => {
        analytics.track('payment_started', {
            plan,
            price,
            payment_method: paymentMethod
        });
    };

    const trackBuyClick = () => {
        analytics.track('buy_button_clicked', {
            plan,
            price,
            payment_method: paymentMethod,
            voice
        });
    };

    return (
        <div onClick={() => { trackBuyClick(); trackPaymentStart(); }}>
            {children}
        </div>
    );
}