import { sql } from '@/lib/db';

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'streak' | 'practice' | 'journal' | 'ritual' | 'special';
    condition: string;
    requiredValue: number;
    rewardPoints?: number;
    isSecret?: boolean;
}

// Определение всех достижений
export const ACHIEVEMENTS: Achievement[] = [
    // Стрики
    {
        id: 'streak_3',
        name: 'Первые шаги',
        description: '3 дня подряд',
        icon: '🌱',
        type: 'streak',
        condition: 'consecutive_days',
        requiredValue: 3,
        rewardPoints: 10
    },
    {
        id: 'streak_7',
        name: 'Неделя силы',
        description: '7 дней подряд',
        icon: '🔥',
        type: 'streak',
        condition: 'consecutive_days',
        requiredValue: 7,
        rewardPoints: 30
    },
    {
        id: 'streak_30',
        name: 'Месяц трансформации',
        description: '30 дней подряд',
        icon: '👑',
        type: 'streak',
        condition: 'consecutive_days',
        requiredValue: 30,
        rewardPoints: 100
    },
    {
        id: 'streak_100',
        name: 'Мастер EDEM',
        description: '100 дней подряд',
        icon: '🏆',
        type: 'streak',
        condition: 'consecutive_days',
        requiredValue: 100,
        rewardPoints: 500,
        isSecret: true
    },

    // Практики
    {
        id: 'practice_week',
        name: 'Практик недели',
        description: 'Все практики недели завершены',
        icon: '⭐',
        type: 'practice',
        condition: 'week_practices_complete',
        requiredValue: 7,
        rewardPoints: 25
    },
    {
        id: 'practice_50',
        name: 'Адепт практик',
        description: '50 практик завершено',
        icon: '🧘',
        type: 'practice',
        condition: 'total_practices',
        requiredValue: 50,
        rewardPoints: 75
    },

    // Ритуалы
    {
        id: 'ritual_first',
        name: 'Первое прозрение',
        description: 'Первый ритуал завершён',
        icon: '✨',
        type: 'ritual',
        condition: 'total_rituals',
        requiredValue: 1,
        rewardPoints: 5
    },
    {
        id: 'ritual_10',
        name: 'Искатель истины',
        description: '10 ритуалов завершено',
        icon: '🔍',
        type: 'ritual',
        condition: 'total_rituals',
        requiredValue: 10,
        rewardPoints: 20
    },
    {
        id: 'ritual_100',
        name: 'Мудрец',
        description: '100 ритуалов завершено',
        icon: '🧙‍♂️',
        type: 'ritual',
        condition: 'total_rituals',
        requiredValue: 100,
        rewardPoints: 200
    },

    // Дневник
    {
        id: 'journal_first',
        name: 'Первая запись',
        description: 'Первая запись в дневнике',
        icon: '📝',
        type: 'journal',
        condition: 'total_journal_entries',
        requiredValue: 1,
        rewardPoints: 5
    },
    {
        id: 'journal_week',
        name: 'Хроникёр недели',
        description: 'Запись каждый день недели',
        icon: '📚',
        type: 'journal',
        condition: 'week_journal_complete',
        requiredValue: 7,
        rewardPoints: 20
    },
    {
        id: 'journal_50',
        name: 'Автор истории',
        description: '50 записей в дневнике',
        icon: '✍️',
        type: 'journal',
        condition: 'total_journal_entries',
        requiredValue: 50,
        rewardPoints: 60
    },

    // Специальные
    {
        id: 'voices_explorer',
        name: 'Исследователь голосов',
        description: 'Попробовал все 3 голоса',
        icon: '🎭',
        type: 'special',
        condition: 'all_voices_used',
        requiredValue: 3,
        rewardPoints: 15
    },
    {
        id: 'polarities_master',
        name: 'Мастер полярностей',
        description: 'Исследовал все полярности',
        icon: '🌈',
        type: 'special',
        condition: 'all_polarities_explored',
        requiredValue: 7,
        rewardPoints: 40
    },
    {
        id: 'perfect_week',
        name: 'Идеальная неделя',
        description: 'Все чек-листы недели выполнены',
        icon: '💎',
        type: 'special',
        condition: 'perfect_week',
        requiredValue: 21, // 7 дней × 3 задачи
        rewardPoints: 50
    }
];

// Функции для работы с достижениями
export async function getUserAchievements(userId: string): Promise<{
    unlocked: string[];
    total_points: number;
}> {
    try {
        const result = await sql`
            select achievement_id, unlocked_at, points_earned
            from user_achievements 
            where user_id = ${userId}
            order by unlocked_at desc
        `;

        const unlocked = result.map(r => r.achievement_id);
        const total_points = result.reduce((sum, r) => sum + (r.points_earned || 0), 0);

        return { unlocked, total_points };
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return { unlocked: [], total_points: 0 };
        }
        throw error;
    }
}

export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    try {
        const newAchievements: Achievement[] = [];

        // Получаем текущие достижения пользователя
        const { unlocked } = await getUserAchievements(userId);

        // Получаем статистику пользователя
        const stats = await getUserStats(userId);

        for (const achievement of ACHIEVEMENTS) {
            // Пропускаем уже разблокированные
            if (unlocked.includes(achievement.id)) continue;

            // Проверяем условие
            if (await checkAchievementCondition(userId, achievement, stats)) {
                await unlockAchievement(userId, achievement);
                newAchievements.push(achievement);
            }
        }

        return newAchievements;
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return [];
        }
        throw error;
    }
}

async function getUserStats(userId: string) {
    try {
        // Получаем различную статистику пользователя
        const [streakResult, practiceResult, ritualResult, journalResult, voicesResult, polaritiesResult] = await Promise.all([
            // Текущий стрик
            sql`
                select calculate_user_streak(${userId}) as current_streak
            `,

            // Практики
            sql`
                select count(*) as total_practices,
                       count(case when created_at >= date_trunc('week', now()) then 1 end) as week_practices
                from user_practices 
                where user_id = ${userId} and completed = true
            `,

            // Ритуалы
            sql`
                select count(*) as total_rituals
                from sessions 
                where user_id = ${userId} and finished_at is not null
            `,

            // Дневник
            sql`
                select count(*) as total_journal_entries,
                       count(case when created_at >= date_trunc('week', now()) then 1 end) as week_journal_entries
                from journal_entries 
                where user_id = ${userId}
            `,

            // Голоса
            sql`
                select count(distinct voice) as voices_used
                from sessions 
                where user_id = ${userId}
            `,

            // Полярности
            sql`
                select count(distinct polarity) as polarities_explored
                from sessions 
                where user_id = ${userId} and polarity is not null
            `
        ]);

        return {
            current_streak: streakResult[0]?.current_streak || 0,
            total_practices: parseInt(practiceResult[0]?.total_practices || '0'),
            week_practices: parseInt(practiceResult[0]?.week_practices || '0'),
            total_rituals: parseInt(ritualResult[0]?.total_rituals || '0'),
            total_journal_entries: parseInt(journalResult[0]?.total_journal_entries || '0'),
            week_journal_entries: parseInt(journalResult[0]?.week_journal_entries || '0'),
            voices_used: parseInt(voicesResult[0]?.voices_used || '0'),
            polarities_explored: parseInt(polaritiesResult[0]?.polarities_explored || '0')
        };
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return {
                current_streak: 0,
                total_practices: 0,
                week_practices: 0,
                total_rituals: 0,
                total_journal_entries: 0,
                week_journal_entries: 0,
                voices_used: 0,
                polarities_explored: 0
            };
        }
        throw error;
    }
}

async function checkAchievementCondition(userId: string, achievement: Achievement, stats: any): Promise<boolean> {
    try {
        switch (achievement.condition) {
            case 'consecutive_days':
                return stats.current_streak >= achievement.requiredValue;

            case 'total_practices':
                return stats.total_practices >= achievement.requiredValue;

            case 'week_practices_complete':
                return stats.week_practices >= achievement.requiredValue;

            case 'total_rituals':
                return stats.total_rituals >= achievement.requiredValue;

            case 'total_journal_entries':
                return stats.total_journal_entries >= achievement.requiredValue;

            case 'week_journal_complete':
                return stats.week_journal_entries >= achievement.requiredValue;

            case 'all_voices_used':
                return stats.voices_used >= achievement.requiredValue;

            case 'all_polarities_explored':
                return stats.polarities_explored >= achievement.requiredValue;

            case 'perfect_week':
                // Проверяем что все чек-листы недели выполнены
                const weeklyChecklistResult = await sql`
                    select count(*) as completed_tasks
                    from daily_checklist 
                    where user_id = ${userId} 
                    and completed = true 
                    and created_at >= date_trunc('week', now())
                `;
                const completedTasks = parseInt(weeklyChecklistResult[0]?.completed_tasks || '0');
                return completedTasks >= achievement.requiredValue;

            default:
                return false;
        }
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return false;
        }
        throw error;
    }
}

async function unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    try {
        await sql`
            insert into user_achievements (user_id, achievement_id, unlocked_at, points_earned)
            values (${userId}, ${achievement.id}, now(), ${achievement.rewardPoints || 0})
            on conflict (user_id, achievement_id) do nothing
        `;

        console.log(`Achievement unlocked for user ${userId}: ${achievement.name}`);
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return;
        }
        throw error;
    }
}

// Функция для получения прогресса к достижениям
export async function getAchievementProgress(userId: string): Promise<{
    achievement: Achievement;
    current: number;
    required: number;
    progress: number;
    unlocked: boolean;
}[]> {
    try {
        const { unlocked } = await getUserAchievements(userId);
        const stats = await getUserStats(userId);

        return ACHIEVEMENTS.map(achievement => {
            let current = 0;

            switch (achievement.condition) {
                case 'consecutive_days':
                    current = stats.current_streak;
                    break;
                case 'total_practices':
                    current = stats.total_practices;
                    break;
                case 'total_rituals':
                    current = stats.total_rituals;
                    break;
                case 'total_journal_entries':
                    current = stats.total_journal_entries;
                    break;
                case 'all_voices_used':
                    current = stats.voices_used;
                    break;
                case 'all_polarities_explored':
                    current = stats.polarities_explored;
                    break;
                default:
                    current = 0;
            }

            const progress = Math.min(100, (current / achievement.requiredValue) * 100);

            return {
                achievement,
                current,
                required: achievement.requiredValue,
                progress,
                unlocked: unlocked.includes(achievement.id)
            };
        });
    } catch (error: any) {
        // Handle database connection errors gracefully
        if (error.message && (error.message.includes('Invalid URL') || error.message.includes('DATABASE_URL'))) {
            console.warn('Database not configured for achievements system');
            return ACHIEVEMENTS.map(achievement => ({
                achievement,
                current: 0,
                required: achievement.requiredValue,
                progress: 0,
                unlocked: false
            }));
        }
        throw error;
    }
}