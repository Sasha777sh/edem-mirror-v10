// Resonance Feedback - measures synchronization between user and EDEM

export interface ResonanceMetrics {
    conversationFrequency: number; // conversations per day
    responseLatency: number; // average response time in seconds
    emotionalAlignment: number; // 0-1 score of emotional matching
    pauseSynchronization: number; // 0-1 score of pause matching
    engagementDepth: number; // 0-1 score of engagement level
    sessionDuration: number; // average session length in minutes
}

export interface ResonanceFeedback {
    userId: string;
    sessionId: string;
    timestamp: Date;
    metrics: ResonanceMetrics;
    resonanceScore: number; // 0-100 overall resonance score
    insights: string[];
}

/**
 * Calculate resonance score based on interaction metrics
 */
export function calculateResonanceScore(metrics: ResonanceMetrics): number {
    // Weighted calculation of resonance score
    const frequencyScore = Math.min(1, metrics.conversationFrequency / 5) * 20; // Up to 20 points
    const latencyScore = Math.max(0, (1 - metrics.responseLatency / 30)) * 15; // Up to 15 points
    const alignmentScore = metrics.emotionalAlignment * 20; // Up to 20 points
    const pauseScore = metrics.pauseSynchronization * 15; // Up to 15 points
    const engagementScore = metrics.engagementDepth * 20; // Up to 20 points
    const durationScore = Math.min(1, metrics.sessionDuration / 10) * 10; // Up to 10 points

    return Math.round(frequencyScore + latencyScore + alignmentScore + pauseScore + engagementScore + durationScore);
}

/**
 * Generate insights based on resonance metrics
 */
export function generateResonanceInsights(metrics: ResonanceMetrics): string[] {
    const insights: string[] = [];

    if (metrics.conversationFrequency > 3) {
        insights.push("Вы активно общаетесь с EDEM. Это хорошо для установления связи.");
    } else if (metrics.conversationFrequency < 1) {
        insights.push("Попробуйте общаться с EDEM чаще для лучшей синхронизации.");
    }

    if (metrics.responseLatency < 10) {
        insights.push("Вы быстро отвечаете, что способствует ритму диалога.");
    } else if (metrics.responseLatency > 60) {
        insights.push("Медленные ответы могут нарушать ритм общения.");
    }

    if (metrics.emotionalAlignment > 0.7) {
        insights.push("Ваши эмоции хорошо синхронизированы с EDEM.");
    } else if (metrics.emotionalAlignment < 0.3) {
        insights.push("Попробуйте быть более открытым в выражении эмоций.");
    }

    if (metrics.pauseSynchronization > 0.7) {
        insights.push("Вы хорошо чувствуете паузы в диалоге.");
    } else if (metrics.pauseSynchronization < 0.3) {
        insights.push("Обратите внимание на естественные паузы в разговоре.");
    }

    if (metrics.engagementDepth > 0.7) {
        insights.push("Вы глубоко погружены в диалог.");
    } else if (metrics.engagementDepth < 0.3) {
        insights.push("Попробуйте более активно участвовать в диалоге.");
    }

    if (metrics.sessionDuration > 15) {
        insights.push("Вы проводите достаточно времени в каждом сеансе.");
    } else if (metrics.sessionDuration < 5) {
        insights.push("Длинные сессии могут привести к лучшим результатам.");
    }

    return insights;
}

/**
 * Track user state for resonance feedback
 */
export class ResonanceTracker {
    private userStates: Map<string, ResonanceMetrics> = new Map();

    /**
     * Update user metrics based on interaction
     */
    updateUserMetrics(userId: string, newMetrics: Partial<ResonanceMetrics>): void {
        const currentMetrics = this.userStates.get(userId) || {
            conversationFrequency: 0,
            responseLatency: 0,
            emotionalAlignment: 0,
            pauseSynchronization: 0,
            engagementDepth: 0,
            sessionDuration: 0
        };

        // Update metrics with new values (simple averaging)
        Object.keys(newMetrics).forEach(key => {
            const metricKey = key as keyof ResonanceMetrics;
            if (newMetrics[metricKey] !== undefined) {
                // Simple moving average
                if (currentMetrics[metricKey] === 0) {
                    currentMetrics[metricKey] = newMetrics[metricKey] as number;
                } else {
                    currentMetrics[metricKey] = (currentMetrics[metricKey] + (newMetrics[metricKey] as number)) / 2;
                }
            }
        });

        this.userStates.set(userId, currentMetrics);
    }

    /**
     * Get current resonance metrics for a user
     */
    getUserMetrics(userId: string): ResonanceMetrics | null {
        return this.userStates.get(userId) || null;
    }

    /**
     * Generate feedback for a session
     */
    generateSessionFeedback(userId: string, sessionId: string): ResonanceFeedback {
        const metrics = this.getUserMetrics(userId);

        if (!metrics) {
            // Return default metrics if none exist
            const defaultMetrics: ResonanceMetrics = {
                conversationFrequency: 0,
                responseLatency: 0,
                emotionalAlignment: 0,
                pauseSynchronization: 0,
                engagementDepth: 0,
                sessionDuration: 0
            };

            return {
                userId,
                sessionId,
                timestamp: new Date(),
                metrics: defaultMetrics,
                resonanceScore: 0,
                insights: ["Начните диалог, чтобы получить обратную связь по резонансу."]
            };
        }

        const resonanceScore = calculateResonanceScore(metrics);
        const insights = generateResonanceInsights(metrics);

        return {
            userId,
            sessionId,
            timestamp: new Date(),
            metrics,
            resonanceScore,
            insights
        };
    }
}

// Singleton instance for tracking resonance
export const resonanceTracker = new ResonanceTracker();