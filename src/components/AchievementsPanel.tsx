'use client';

import { useState, useEffect } from 'react';
import { Trophy, Award, Target, Star, Lock } from 'lucide-react';
import { Achievement } from '@/lib/achievements';

interface AchievementProgress {
    achievement: Achievement;
    current: number;
    required: number;
    progress: number;
    unlocked: boolean;
}

interface UserAchievements {
    unlocked: string[];
    total_points: number;
}

export default function AchievementsPanel() {
    const [achievements, setAchievements] = useState<UserAchievements>({ unlocked: [], total_points: 0 });
    const [progress, setProgress] = useState<AchievementProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const [achievementsRes, progressRes] = await Promise.all([
                fetch('/api/achievements'),
                fetch('/api/achievements?action=progress')
            ]);

            if (achievementsRes.ok && progressRes.ok) {
                const achievementsData = await achievementsRes.json();
                const progressData = await progressRes.json();

                setAchievements(achievementsData);
                setProgress(progressData.progress);
            }
        } catch (error) {
            console.error('Error fetching achievements:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', name: 'Все', icon: Trophy },
        { id: 'streak', name: 'Стрики', icon: Target },
        { id: 'practice', name: 'Практики', icon: Star },
        { id: 'ritual', name: 'Ритуалы', icon: Award },
        { id: 'journal', name: 'Дневник', icon: Award },
        { id: 'special', name: 'Особые', icon: Trophy }
    ];

    const filteredProgress = selectedCategory === 'all'
        ? progress
        : progress.filter(p => p.achievement.type === selectedCategory);

    const unlockedCount = progress.filter(p => p.unlocked).length;
    const totalCount = progress.length;

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="bg-gray-200 rounded-xl h-24"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded-xl h-32"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Заголовок и статистика */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Достижения</h2>
                        <p className="opacity-90">
                            {unlockedCount} из {totalCount} разблокировано
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold">{achievements.total_points}</div>
                        <div className="text-sm opacity-90">очков</div>
                    </div>
                </div>

                {/* Прогресс-бар */}
                <div className="mt-4">
                    <div className="bg-white/20 rounded-full h-2">
                        <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                    <div className="text-sm mt-2 opacity-90">
                        {Math.round((unlockedCount / totalCount) * 100)}% завершено
                    </div>
                </div>
            </div>

            {/* Фильтры категорий */}
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category.id
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {category.name}
                        </button>
                    );
                })}
            </div>

            {/* Список достижений */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProgress.map((item) => (
                    <AchievementCard
                        key={item.achievement.id}
                        achievement={item.achievement}
                        current={item.current}
                        required={item.required}
                        progress={item.progress}
                        unlocked={item.unlocked}
                    />
                ))}
            </div>
        </div>
    );
}

interface AchievementCardProps {
    achievement: Achievement;
    current: number;
    required: number;
    progress: number;
    unlocked: boolean;
}

function AchievementCard({ achievement, current, required, progress, unlocked }: AchievementCardProps) {
    return (
        <div className={`p-4 rounded-xl border-2 transition-all ${unlocked
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <div className={`text-2xl ${unlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                </div>

                {unlocked && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <Trophy className="w-3 h-3" />
                        Получено
                    </div>
                )}

                {achievement.isSecret && !unlocked && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        <Lock className="w-3 h-3" />
                        Тайное
                    </div>
                )}
            </div>

            <h3 className={`font-semibold mb-1 ${unlocked ? 'text-green-800' : 'text-gray-900'}`}>
                {achievement.name}
            </h3>

            <p className={`text-sm mb-3 ${unlocked ? 'text-green-600' : 'text-gray-600'}`}>
                {achievement.description}
            </p>

            {!unlocked && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Прогресс</span>
                        <span className="font-medium">
                            {current}/{required}
                        </span>
                    </div>

                    <div className="bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-violet-600 rounded-full h-2 transition-all duration-500"
                            style={{ width: `${Math.min(100, progress)}%` }}
                        />
                    </div>
                </div>
            )}

            {achievement.rewardPoints && (
                <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Награда:</span>
                    <span className={`font-medium ${unlocked ? 'text-green-600' : 'text-violet-600'}`}>
                        +{achievement.rewardPoints} очков
                    </span>
                </div>
            )}
        </div>
    );
}