'use client';

import { useEffect, useRef } from 'react';
import { clientAnalytics } from '@/lib/analytics-client';

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
        // Using a simplified tracking approach for client-side
        clientAnalytics.track('landing_page_viewed' as any, {
            ...metadata,
            timestamp: new Date().toISOString(),
            page_url: typeof window !== 'undefined' ? window.location.href : '',
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
        if (trigger === 'view' && elementRef.current && typeof window !== 'undefined') {
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
        clientAnalytics.track('hero_cta_clicked' as any, {
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