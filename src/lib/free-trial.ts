import { sql } from './db';
import { analytics } from './analytics';

export interface FreeTrial {
    id: string;
    user_id: string;
    started_at: Date;
    ends_at: Date;
    is_active: boolean;
    trial_days: number;
    auto_upgrade: boolean;
    payment_method?: string;
    stripe_subscription_id?: string;
}

export interface TrialStatus {
    has_trial: boolean;
    is_active: boolean;
    days_remaining: number;
    ends_at?: Date;
    can_start_trial: boolean;
    auto_upgrade: boolean;
}

// Trial configuration
export const TRIAL_CONFIG = {
    DURATION_DAYS: 7,
    FEATURES: [
        'Безлимитные ритуалы',
        'Архетипы и анализ',
        '5-минутные практики',
        'Скачивание PDF отчётов',
        'История за 30 дней',
        'Экспорт журнала'
    ]
};

class FreeTrialService {
    // Initialize trial tables
    async initializeTables(): Promise<void> {
        try {
            await sql`
                CREATE TABLE IF NOT EXISTS free_trials (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ends_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    trial_days INTEGER DEFAULT 7,
                    auto_upgrade BOOLEAN DEFAULT false,
                    payment_method VARCHAR(50),
                    stripe_subscription_id VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id)
                )
            `;

            // Create index for performance
            await sql`
                CREATE INDEX IF NOT EXISTS idx_free_trials_user_id ON free_trials(user_id);
                CREATE INDEX IF NOT EXISTS idx_free_trials_ends_at ON free_trials(ends_at);
                CREATE INDEX IF NOT EXISTS idx_free_trials_active ON free_trials(is_active);
            `;

        } catch (error) {
            console.error('Failed to initialize free trial tables:', error);
            throw error;
        }
    }

    // Check if user can start free trial
    async canStartTrial(userId: string): Promise<boolean> {
        try {
            // Check if user already had a trial
            const existingTrial = await sql`
                SELECT id FROM free_trials WHERE user_id = ${userId} LIMIT 1
            `;

            // Check if user has any subscriptions
            const existingSubscription = await sql`
                SELECT id FROM subscriptions 
                WHERE user_id = ${userId} 
                AND status IN ('active', 'trialing')
                LIMIT 1
            `;

            return existingTrial.length === 0 && existingSubscription.length === 0;

        } catch (error) {
            console.error('Failed to check trial eligibility:', error);
            return false;
        }
    }

    // Start free trial for user
    async startTrial(userId: string, autoUpgrade: boolean = false, paymentMethod?: string): Promise<FreeTrial | null> {
        try {
            const canStart = await this.canStartTrial(userId);
            if (!canStart) {
                return null;
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + TRIAL_CONFIG.DURATION_DAYS);

            // Create trial record
            const trial = await sql`
                INSERT INTO free_trials (
                    user_id, started_at, ends_at, trial_days, 
                    auto_upgrade, payment_method
                ) VALUES (
                    ${userId}, ${startDate.toISOString()}, ${endDate.toISOString()}, 
                    ${TRIAL_CONFIG.DURATION_DAYS}, ${autoUpgrade}, ${paymentMethod || null}
                )
                RETURNING *
            `;

            // Create subscription with trial status
            await sql`
                INSERT INTO subscriptions (
                    user_id, plan, status, current_period_start, current_period_end,
                    is_trial, trial_days
                ) VALUES (
                    ${userId}, 'pro', 'trialing', ${startDate.toISOString()}, ${endDate.toISOString()},
                    true, ${TRIAL_CONFIG.DURATION_DAYS}
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    plan = 'pro',
                    status = 'trialing',
                    current_period_start = ${startDate.toISOString()},
                    current_period_end = ${endDate.toISOString()},
                    is_trial = true,
                    trial_days = ${TRIAL_CONFIG.DURATION_DAYS}
            `;

            // Track analytics
            analytics.track('free_trial_started', {
                user_id: userId,
                trial_days: TRIAL_CONFIG.DURATION_DAYS,
                auto_upgrade: autoUpgrade,
                payment_method: paymentMethod
            });

            return {
                id: trial[0].id,
                user_id: trial[0].user_id,
                started_at: trial[0].started_at,
                ends_at: trial[0].ends_at,
                is_active: trial[0].is_active,
                trial_days: trial[0].trial_days,
                auto_upgrade: trial[0].auto_upgrade,
                payment_method: trial[0].payment_method,
                stripe_subscription_id: trial[0].stripe_subscription_id
            };

        } catch (error) {
            console.error('Failed to start trial:', error);
            throw error;
        }
    }

    // Get trial status for user
    async getTrialStatus(userId: string): Promise<TrialStatus> {
        try {
            const trial = await sql`
                SELECT * FROM free_trials 
                WHERE user_id = ${userId} 
                ORDER BY created_at DESC 
                LIMIT 1
            `;

            if (trial.length === 0) {
                const canStart = await this.canStartTrial(userId);
                return {
                    has_trial: false,
                    is_active: false,
                    days_remaining: 0,
                    can_start_trial: canStart,
                    auto_upgrade: false
                };
            }

            const trialData = trial[0];
            const now = new Date();
            const endDate = new Date(trialData.ends_at);
            const isActive = trialData.is_active && endDate > now;
            const daysRemaining = isActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            return {
                has_trial: true,
                is_active: isActive,
                days_remaining: daysRemaining,
                ends_at: endDate,
                can_start_trial: false,
                auto_upgrade: trialData.auto_upgrade
            };

        } catch (error) {
            console.error('Failed to get trial status:', error);
            return {
                has_trial: false,
                is_active: false,
                days_remaining: 0,
                can_start_trial: false,
                auto_upgrade: false
            };
        }
    }

    // End trial (manual or automatic)
    async endTrial(userId: string, reason: 'expired' | 'upgraded' | 'cancelled' = 'expired'): Promise<boolean> {
        try {
            // Mark trial as inactive
            await sql`
                UPDATE free_trials 
                SET is_active = false
                WHERE user_id = ${userId}
            `;

            // Update subscription status
            if (reason === 'upgraded') {
                await sql`
                    UPDATE subscriptions 
                    SET status = 'active', is_trial = false
                    WHERE user_id = ${userId}
                `;
            } else {
                await sql`
                    UPDATE subscriptions 
                    SET status = 'cancelled', is_trial = false
                    WHERE user_id = ${userId}
                `;
            }

            // Track analytics
            analytics.track('free_trial_ended', {
                user_id: userId,
                reason
            });

            return true;

        } catch (error) {
            console.error('Failed to end trial:', error);
            return false;
        }
    }

    // Get expiring trials (for cron job)
    async getExpiringTrials(hoursBeforeExpiry: number = 24): Promise<FreeTrial[]> {
        try {
            const cutoffTime = new Date();
            cutoffTime.setHours(cutoffTime.getHours() + hoursBeforeExpiry);

            const trials = await sql`
                SELECT ft.*, u.email
                FROM free_trials ft
                JOIN users u ON ft.user_id = u.id
                WHERE ft.is_active = true
                AND ft.ends_at <= ${cutoffTime.toISOString()}
                AND ft.ends_at > CURRENT_TIMESTAMP
                ORDER BY ft.ends_at ASC
            `;

            return trials.map(trial => ({
                id: trial.id,
                user_id: trial.user_id,
                started_at: trial.started_at,
                ends_at: trial.ends_at,
                is_active: trial.is_active,
                trial_days: trial.trial_days,
                auto_upgrade: trial.auto_upgrade,
                payment_method: trial.payment_method,
                stripe_subscription_id: trial.stripe_subscription_id
            }));

        } catch (error) {
            console.error('Failed to get expiring trials:', error);
            return [];
        }
    }

    // Process expired trials (for cron job)
    async processExpiredTrials(): Promise<{ processed: number, errors: number }> {
        let processed = 0;
        let errors = 0;

        try {
            const expiredTrials = await sql`
                SELECT ft.*, u.email
                FROM free_trials ft
                JOIN users u ON ft.user_id = u.id
                WHERE ft.is_active = true
                AND ft.ends_at <= CURRENT_TIMESTAMP
            `;

            for (const trial of expiredTrials) {
                try {
                    if (trial.auto_upgrade && trial.stripe_subscription_id) {
                        // Auto-upgrade to paid subscription
                        await this.endTrial(trial.user_id, 'upgraded');

                        analytics.track('trial_auto_upgraded', {
                            user_id: trial.user_id,
                            subscription_id: trial.stripe_subscription_id
                        });
                    } else {
                        // End trial without upgrade
                        await this.endTrial(trial.user_id, 'expired');

                        analytics.track('trial_expired', {
                            user_id: trial.user_id
                        });
                    }

                    processed++;
                } catch (error) {
                    console.error(`Failed to process trial for user ${trial.user_id}:`, error);
                    errors++;
                }
            }

        } catch (error) {
            console.error('Failed to process expired trials:', error);
        }

        return { processed, errors };
    }

    // Extend trial (for special cases)
    async extendTrial(userId: string, additionalDays: number): Promise<boolean> {
        try {
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + additionalDays);

            await sql`
                UPDATE free_trials 
                SET ends_at = ${newEndDate.toISOString()},
                    trial_days = trial_days + ${additionalDays}
                WHERE user_id = ${userId} AND is_active = true
            `;

            await sql`
                UPDATE subscriptions 
                SET current_period_end = ${newEndDate.toISOString()},
                    trial_days = trial_days + ${additionalDays}
                WHERE user_id = ${userId} AND is_trial = true
            `;

            analytics.track('trial_extended', {
                user_id: userId,
                additional_days: additionalDays
            });

            return true;

        } catch (error) {
            console.error('Failed to extend trial:', error);
            return false;
        }
    }
}

// Singleton instance
export const freeTrialService = new FreeTrialService();