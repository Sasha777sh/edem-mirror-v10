import { sql } from './db';
import { analytics } from './analytics';

export interface ReferralCode {
    id: string;
    user_id: string;
    code: string;
    created_at: Date;
    expires_at?: Date;
    is_active: boolean;
    usage_count: number;
    max_uses?: number;
}

export interface ReferralUsage {
    id: string;
    referral_code: string;
    referrer_id: string;
    referee_id: string;
    created_at: Date;
    bonus_applied: boolean;
    bonus_type: 'days' | 'discount' | 'credit';
    bonus_value: number;
}

export interface ReferralStats {
    total_referrals: number;
    successful_conversions: number;
    total_bonus_earned: number;
    conversion_rate: number;
    last_referral_date?: Date;
}

// Referral bonus configurations
export const REFERRAL_BONUSES = {
    REFERRER: {
        type: 'days' as const,
        value: 7, // 7 дней PRO за каждого приведённого пользователя
        description: '7 дней PRO за каждого друга'
    },
    REFEREE: {
        type: 'days' as const,
        value: 3, // 3 дня PRO для нового пользователя
        description: '3 дня PRO в подарок'
    }
};

class ReferralService {
    // Initialize referral tables
    async initializeTables(): Promise<void> {
        try {
            // Create referral_codes table
            await sql`
                CREATE TABLE IF NOT EXISTS referral_codes (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    code VARCHAR(20) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT true,
                    usage_count INTEGER DEFAULT 0,
                    max_uses INTEGER DEFAULT 100,
                    UNIQUE(user_id)
                )
            `;

            // Create referral_usage table
            await sql`
                CREATE TABLE IF NOT EXISTS referral_usage (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    referral_code VARCHAR(20) NOT NULL REFERENCES referral_codes(code),
                    referrer_id UUID NOT NULL REFERENCES users(id),
                    referee_id UUID NOT NULL REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    bonus_applied BOOLEAN DEFAULT false,
                    bonus_type VARCHAR(20) DEFAULT 'days',
                    bonus_value INTEGER DEFAULT 0,
                    UNIQUE(referee_id) -- Каждый пользователь может быть приглашён только один раз
                )
            `;

            // Create indexes for performance
            await sql`
                CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
                CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
                CREATE INDEX IF NOT EXISTS idx_referral_usage_referrer ON referral_usage(referrer_id);
                CREATE INDEX IF NOT EXISTS idx_referral_usage_referee ON referral_usage(referee_id);
            `;

        } catch (error) {
            console.error('Failed to initialize referral tables:', error);
            throw error;
        }
    }

    // Generate unique referral code
    private generateReferralCode(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    // Create or get referral code for user
    async getOrCreateReferralCode(userId: string): Promise<ReferralCode> {
        try {
            // Check if user already has a referral code
            const existing = await sql`
                SELECT * FROM referral_codes 
                WHERE user_id = ${userId} AND is_active = true
                LIMIT 1
            `;

            if (existing.length > 0) {
                return {
                    id: existing[0].id,
                    user_id: existing[0].user_id,
                    code: existing[0].code,
                    created_at: existing[0].created_at,
                    expires_at: existing[0].expires_at,
                    is_active: existing[0].is_active,
                    usage_count: existing[0].usage_count,
                    max_uses: existing[0].max_uses
                };
            }

            // Generate new unique code
            let code: string;
            let attempts = 0;
            do {
                code = this.generateReferralCode();
                attempts++;

                const duplicate = await sql`
                    SELECT id FROM referral_codes WHERE code = ${code} LIMIT 1
                `;

                if (duplicate.length === 0) break;

                if (attempts > 10) {
                    throw new Error('Unable to generate unique referral code');
                }
            } while (true);

            // Create new referral code
            const result = await sql`
                INSERT INTO referral_codes (user_id, code)
                VALUES (${userId}, ${code})
                RETURNING *
            `;

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                code: result[0].code,
                created_at: result[0].created_at,
                expires_at: result[0].expires_at,
                is_active: result[0].is_active,
                usage_count: result[0].usage_count,
                max_uses: result[0].max_uses
            };

        } catch (error) {
            console.error('Failed to create referral code:', error);
            throw error;
        }
    }

    // Validate and use referral code
    async useReferralCode(code: string, newUserId: string): Promise<boolean> {
        try {
            // Check if code exists and is valid
            const referralCode = await sql`
                SELECT rc.*, u.email as referrer_email
                FROM referral_codes rc
                JOIN users u ON rc.user_id = u.id
                WHERE rc.code = ${code} 
                AND rc.is_active = true
                AND (rc.expires_at IS NULL OR rc.expires_at > CURRENT_TIMESTAMP)
                AND (rc.max_uses IS NULL OR rc.usage_count < rc.max_uses)
                AND rc.user_id != ${newUserId}
                LIMIT 1
            `;

            if (referralCode.length === 0) {
                return false;
            }

            const referrerId = referralCode[0].user_id;

            // Check if user was already referred
            const existingUsage = await sql`
                SELECT id FROM referral_usage WHERE referee_id = ${newUserId} LIMIT 1
            `;

            if (existingUsage.length > 0) {
                return false; // User already used a referral code
            }

            // Record referral usage
            await sql`
                INSERT INTO referral_usage (
                    referral_code, referrer_id, referee_id, 
                    bonus_type, bonus_value
                ) VALUES (
                    ${code}, ${referrerId}, ${newUserId},
                    ${REFERRAL_BONUSES.REFEREE.type}, ${REFERRAL_BONUSES.REFEREE.value}
                )
            `;

            // Update usage count
            await sql`
                UPDATE referral_codes 
                SET usage_count = usage_count + 1
                WHERE code = ${code}
            `;

            // Apply bonuses
            await this.applyReferralBonuses(referrerId, newUserId);

            // Track analytics
            analytics.track('referral_used', {
                referrer_id: referrerId,
                referee_id: newUserId,
                referral_code: code,
                bonus_type: REFERRAL_BONUSES.REFEREE.type,
                bonus_value: REFERRAL_BONUSES.REFEREE.value
            });

            return true;

        } catch (error) {
            console.error('Failed to use referral code:', error);
            return false;
        }
    }

    // Apply bonuses to both referrer and referee
    private async applyReferralBonuses(referrerId: string, refereeId: string): Promise<void> {
        try {
            const bonusEndDate = new Date();
            bonusEndDate.setDate(bonusEndDate.getDate() + 30); // Бонус действует 30 дней

            // Give bonus to referee (new user)
            await sql`
                INSERT INTO subscriptions (
                    user_id, plan, status, current_period_start, current_period_end,
                    created_at, is_trial, trial_days
                ) VALUES (
                    ${refereeId}, 'pro', 'active', CURRENT_TIMESTAMP, ${bonusEndDate.toISOString()},
                    CURRENT_TIMESTAMP, true, ${REFERRAL_BONUSES.REFEREE.value}
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    current_period_end = GREATEST(subscriptions.current_period_end, ${bonusEndDate.toISOString()})
            `;

            // Give bonus to referrer
            await sql`
                INSERT INTO subscriptions (
                    user_id, plan, status, current_period_start, current_period_end,
                    created_at
                ) VALUES (
                    ${referrerId}, 'pro', 'active', CURRENT_TIMESTAMP, ${bonusEndDate.toISOString()},
                    CURRENT_TIMESTAMP
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    current_period_end = GREATEST(
                        subscriptions.current_period_end, 
                        CURRENT_TIMESTAMP + INTERVAL '${REFERRAL_BONUSES.REFERRER.value} days'
                    )
            `;

            // Mark bonuses as applied
            await sql`
                UPDATE referral_usage 
                SET bonus_applied = true
                WHERE referrer_id = ${referrerId} AND referee_id = ${refereeId}
            `;

        } catch (error) {
            console.error('Failed to apply referral bonuses:', error);
            throw error;
        }
    }

    // Get referral statistics for user
    async getReferralStats(userId: string): Promise<ReferralStats> {
        try {
            const stats = await sql`
                SELECT 
                    COUNT(*) as total_referrals,
                    COUNT(CASE WHEN ru.bonus_applied = true THEN 1 END) as successful_conversions,
                    SUM(CASE WHEN ru.bonus_applied = true THEN ru.bonus_value ELSE 0 END) as total_bonus_earned,
                    MAX(ru.created_at) as last_referral_date
                FROM referral_usage ru
                WHERE ru.referrer_id = ${userId}
            `;

            const totalReferrals = parseInt(stats[0]?.total_referrals || '0');
            const successfulConversions = parseInt(stats[0]?.successful_conversions || '0');
            const conversionRate = totalReferrals > 0 ? (successfulConversions / totalReferrals) * 100 : 0;

            return {
                total_referrals: totalReferrals,
                successful_conversions: successfulConversions,
                total_bonus_earned: parseInt(stats[0]?.total_bonus_earned || '0'),
                conversion_rate: Math.round(conversionRate * 100) / 100,
                last_referral_date: stats[0]?.last_referral_date || undefined
            };

        } catch (error) {
            console.error('Failed to get referral stats:', error);
            return {
                total_referrals: 0,
                successful_conversions: 0,
                total_bonus_earned: 0,
                conversion_rate: 0
            };
        }
    }

    // Get referral history for user
    async getReferralHistory(userId: string, limit: number = 50): Promise<ReferralUsage[]> {
        try {
            const history = await sql`
                SELECT 
                    ru.*,
                    u.email as referee_email
                FROM referral_usage ru
                JOIN users u ON ru.referee_id = u.id
                WHERE ru.referrer_id = ${userId}
                ORDER BY ru.created_at DESC
                LIMIT ${limit}
            `;

            return history.map(row => ({
                id: row.id,
                referral_code: row.referral_code,
                referrer_id: row.referrer_id,
                referee_id: row.referee_id,
                created_at: row.created_at,
                bonus_applied: row.bonus_applied,
                bonus_type: row.bonus_type,
                bonus_value: row.bonus_value
            }));

        } catch (error) {
            console.error('Failed to get referral history:', error);
            return [];
        }
    }

    // Generate referral link
    generateReferralLink(code: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://edem.app'): string {
        return `${baseUrl}/?ref=${code}`;
    }

    // Check if code is valid (for validation before signup)
    async validateReferralCode(code: string): Promise<{ valid: boolean, referrerEmail?: string }> {
        try {
            const result = await sql`
                SELECT u.email
                FROM referral_codes rc
                JOIN users u ON rc.user_id = u.id
                WHERE rc.code = ${code}
                AND rc.is_active = true
                AND (rc.expires_at IS NULL OR rc.expires_at > CURRENT_TIMESTAMP)
                AND (rc.max_uses IS NULL OR rc.usage_count < rc.max_uses)
                LIMIT 1
            `;

            if (result.length > 0) {
                return {
                    valid: true,
                    referrerEmail: result[0].email
                };
            }

            return { valid: false };

        } catch (error) {
            console.error('Failed to validate referral code:', error);
            return { valid: false };
        }
    }
}

// Singleton instance
export const referralService = new ReferralService();