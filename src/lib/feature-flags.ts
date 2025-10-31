import { sql } from './db';

export interface FeatureFlag {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
    percentage?: number; // For gradual rollout
    user_groups?: string[]; // For targeting specific user groups
}

// Default feature flags
export const DEFAULT_FLAGS: Partial<FeatureFlag>[] = [
    {
        id: 'telegram_notifications',
        name: 'Telegram уведомления',
        description: 'Включить ежедневные уведомления через Telegram бота',
        enabled: true
    },
    {
        id: 'achievements_system',
        name: 'Система достижений',
        description: 'Показывать значки и прогресс достижений',
        enabled: true
    },
    {
        id: 'journal_export',
        name: 'Экспорт журнала',
        description: 'Кнопки скачивания CSV/JSON для журнала',
        enabled: true
    },
    {
        id: 'hero_video_preview',
        name: 'Hero видео превью',
        description: 'Интерактивное видео превью на главной странице',
        enabled: true
    },
    {
        id: 'music_playlists',
        name: 'Музыкальные плейлисты',
        description: 'Интеграция с плейлистами для практик',
        enabled: false
    },
    {
        id: 'referral_system',
        name: 'Реферальная система',
        description: 'Личные ссылки и бонусы за приглашения',
        enabled: true
    },
    {
        id: 'ab_testing_paywall',
        name: 'A/B тестирование paywall',
        description: 'Разные варианты текстов по голосам',
        enabled: false
    },
    {
        id: 'journal_search',
        name: 'Поиск в журнале',
        description: 'Быстрый поиск по записям дневника',
        enabled: false
    },
    {
        id: 'free_trial',
        name: 'Бесплатный пробный период',
        description: '7 дней PRO бесплатно для новых пользователей',
        enabled: true
    }
];

class FeatureFlagsService {
    private cache = new Map<string, FeatureFlag>();
    private lastCacheUpdate = 0;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    async initializeFlags(): Promise<void> {
        try {
            // Create table if not exists
            await sql`
                CREATE TABLE IF NOT EXISTS feature_flags (
                    id VARCHAR(100) PRIMARY KEY,
                    name VARCHAR(200) NOT NULL,
                    description TEXT,
                    enabled BOOLEAN DEFAULT false,
                    percentage INTEGER DEFAULT 100,
                    user_groups TEXT[],
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Insert default flags if they don't exist
            for (const flag of DEFAULT_FLAGS) {
                if (flag.id && flag.name) {
                    await sql`
                        INSERT INTO feature_flags (
                            id, name, description, enabled, percentage, user_groups
                        ) VALUES (
                            ${flag.id},
                            ${flag.name},
                            ${flag.description || ''},
                            ${flag.enabled !== undefined ? flag.enabled : false},
                            ${flag.percentage !== undefined ? flag.percentage : 100},
                            ${flag.user_groups || []}
                        )
                        ON CONFLICT (id) DO NOTHING
                    `;
                }
            }

            // Update cache
            await this.refreshCache();
        } catch (error) {
            console.error('Failed to initialize feature flags:', error);
        }
    }

    private async refreshCache(): Promise<void> {
        try {
            const flags = await sql`
                SELECT * FROM feature_flags ORDER BY name
            `;

            this.cache.clear();
            for (const flag of flags) {
                this.cache.set(flag.id, {
                    id: flag.id,
                    name: flag.name,
                    description: flag.description,
                    enabled: flag.enabled,
                    percentage: flag.percentage,
                    user_groups: flag.user_groups,
                    created_at: flag.created_at,
                    updated_at: flag.updated_at
                });
            }

            this.lastCacheUpdate = Date.now();
        } catch (error) {
            console.error('Failed to refresh feature flags cache:', error);
        }
    }

    private async ensureFreshCache(): Promise<void> {
        if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL) {
            await this.refreshCache();
        }
    }

    async isEnabled(flagId: string, userId?: string, userPlan?: string): Promise<boolean> {
        await this.ensureFreshCache();

        const flag = this.cache.get(flagId);
        if (!flag) {
            console.warn(`Feature flag '${flagId}' not found`);
            return false;
        }

        if (!flag.enabled) {
            return false;
        }

        // Check percentage rollout
        if (flag.percentage && flag.percentage < 100) {
            const hash = userId ? this.hashUserId(userId, flagId) : Math.random();
            if (hash * 100 > flag.percentage) {
                return false;
            }
        }

        // Check user groups (if specified)
        if (flag.user_groups && flag.user_groups.length > 0 && userPlan) {
            return flag.user_groups.includes(userPlan);
        }

        return true;
    }

    async getFlag(flagId: string): Promise<FeatureFlag | null> {
        await this.ensureFreshCache();
        return this.cache.get(flagId) || null;
    }

    async getAllFlags(): Promise<FeatureFlag[]> {
        await this.ensureFreshCache();
        return Array.from(this.cache.values());
    }

    async updateFlag(flagId: string, updates: Partial<FeatureFlag>): Promise<FeatureFlag | null> {
        try {
            // For now, let's use a simpler approach that works with the sql template literals
            // We'll build the query dynamically but use proper template literals

            // Start with a base query
            let query;

            if (updates.name !== undefined && updates.description !== undefined && updates.enabled !== undefined && updates.percentage !== undefined && updates.user_groups !== undefined) {
                // All fields are updated
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        name = ${updates.name},
                        description = ${updates.description},
                        enabled = ${updates.enabled},
                        percentage = ${updates.percentage},
                        user_groups = ${updates.user_groups},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else if (updates.name !== undefined) {
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        name = ${updates.name},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else if (updates.description !== undefined) {
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        description = ${updates.description},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else if (updates.enabled !== undefined) {
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        enabled = ${updates.enabled},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else if (updates.percentage !== undefined) {
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        percentage = ${updates.percentage},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else if (updates.user_groups !== undefined) {
                query = sql`
                    UPDATE feature_flags 
                    SET 
                        user_groups = ${updates.user_groups},
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ${flagId}
                    RETURNING *
                `;
            } else {
                // No valid updates
                return null;
            }

            const result = await query;

            if (result.length === 0) {
                return null;
            }

            // Refresh cache immediately
            await this.refreshCache();

            return result[0] as FeatureFlag;
        } catch (error) {
            console.error('Failed to update feature flag:', error);
            throw error;
        }
    }

    async createFlag(flag: Omit<FeatureFlag, 'created_at' | 'updated_at'>): Promise<FeatureFlag> {
        try {
            const result = await sql`
                INSERT INTO feature_flags (
                    id, name, description, enabled, percentage, user_groups
                ) VALUES (
                    ${flag.id},
                    ${flag.name},
                    ${flag.description || ''},
                    ${flag.enabled},
                    ${flag.percentage !== undefined ? flag.percentage : 100},
                    ${flag.user_groups || []}
                )
                RETURNING *
            `;

            // Refresh cache immediately
            await this.refreshCache();

            return result[0] as FeatureFlag;
        } catch (error) {
            console.error('Failed to create feature flag:', error);
            throw error;
        }
    }

    async deleteFlag(flagId: string): Promise<boolean> {
        try {
            const result = await sql`
                DELETE FROM feature_flags WHERE id = ${flagId}
            `;

            if (result.count > 0) {
                // Refresh cache immediately
                await this.refreshCache();
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to delete feature flag:', error);
            throw error;
        }
    }

    // Simple hash function for consistent user-based percentage rollouts
    private hashUserId(userId: string, flagId: string): number {
        const str = `${userId}-${flagId}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) / Math.pow(2, 31);
    }

    // Helper method to get multiple flags at once
    async getFlags(flagIds: string[], userId?: string, userPlan?: string): Promise<Record<string, boolean>> {
        const results: Record<string, boolean> = {};

        for (const flagId of flagIds) {
            results[flagId] = await this.isEnabled(flagId, userId, userPlan);
        }

        return results;
    }
}

// Singleton instance
export const featureFlags = new FeatureFlagsService();

// Helper hook for React components
export function useFeatureFlag(flagId: string): boolean {
    // This would need to be implemented with React context or SWR
    // For now, return false as placeholder
    return false;
}