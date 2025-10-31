'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Activity, BookOpen, Calendar, Flame } from 'lucide-react';

interface ProgressData {
    emotionData: Array<{
        date: string;
        rituals: number;
        polarities: string[];
    }>;
    stats: {
        total_sessions: number;
        total_journal_entries: number;
        total_active_days: number;
    };
    polarityStats: Array<{
        polarity: string;
        count: number;
    }>;
    streak: number;
}

interface ProgressChartsProps {
    isProUser: boolean;
}

export default function ProgressCharts({ isProUser }: ProgressChartsProps) {
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);

    useEffect(() => {
        fetchProgressData();
    }, [timeRange]);

    const fetchProgressData = async () => {
        try {
            const response = await fetch(`/api/progress?days=${timeRange}`);
            if (response.ok) {
                const progressData = await response.json();
                setData(progressData);
            }
        } catch (error) {
            console.error('Error fetching progress data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPolarityColor = (polarity: string) => {
        const colors: Record<string, string> = {
            shame: '#8b5cf6',
            rejection: '#ef4444',
            control: '#10b981',
            loss: '#f59e0b',
            guilt: '#3b82f6',
            fear: '#9333ea',
            anger: '#dc2626'
        };
        return colors[polarity] || '#6b7280';
    };

    const getPolarityName = (polarity: string) => {
        const names: Record<string, string> = {
            shame: 'Стыд',
            rejection: 'Отвержение',
            control: 'Контроль',
            loss: 'Утрата',
            guilt: 'Вина',
            fear: 'Страх',
            anger: 'Гнев'
        };
        return names[polarity] || polarity;
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="grid md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
                    ))}
                </div>
                <div className="bg-gray-200 rounded-xl h-64"></div>
                <div className="bg-gray-200 rounded-xl h-48"></div>
            </div>
        );
    }

    if (!data) {
        return <div>Ошибка загрузки данных</div>;
    }

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex justify-end">
                <div className="flex bg-white rounded-lg border">
                    {[7, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setTimeRange(days)}
                            className={`px-4 py-2 text-sm transition-colors ${timeRange === days
                                    ? 'bg-violet-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-50'
                                } ${days === 7 ? 'rounded-l-lg' : days === 90 ? 'rounded-r-lg' : ''}`}
                        >
                            {days} дней
                        </button>
                    ))}
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Activity className="w-8 h-8 text-violet-600" />
                        <div>
                            <div className="text-2xl font-bold">{data.stats.total_sessions}</div>
                            <div className="text-sm text-gray-600">Ритуалов</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <div>
                            <div className="text-2xl font-bold">{data.stats.total_journal_entries}</div>
                            <div className="text-sm text-gray-600">Записей</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                        <div>
                            <div className="text-2xl font-bold">{data.stats.total_active_days}</div>
                            <div className="text-sm text-gray-600">Активных дней</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Flame className="w-8 h-8 text-orange-600" />
                        <div>
                            <div className="text-2xl font-bold">{data.streak}</div>
                            <div className="text-sm text-gray-600">Стрик дней</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                    Активность по дням
                </h3>

                {!isProUser && (
                    <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg p-4 text-white mb-4">
                        <div className="text-sm font-medium mb-1">🔒 Расширенная аналитика в PRO</div>
                        <div className="text-xs opacity-90">Графики эмоций, детальная статистика, экспорт данных</div>
                    </div>
                )}

                <div className="space-y-3">
                    {data.emotionData.slice(0, isProUser ? data.emotionData.length : 5).map((day, index) => (
                        <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="font-medium">
                                    {new Date(day.date).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {day.rituals} ритуал{day.rituals === 1 ? '' : day.rituals < 5 ? 'а' : 'ов'}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                {day.polarities.filter(p => p).slice(0, 3).map((polarity, idx) => (
                                    <div
                                        key={idx}
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getPolarityColor(polarity) }}
                                        title={getPolarityName(polarity)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {!isProUser && data.emotionData.length > 5 && (
                    <div className="text-center mt-4">
                        <a
                            href="/app/billing"
                            className="text-sm text-violet-600 hover:text-violet-700"
                        >
                            Показать все дни в PRO →
                        </a>
                    </div>
                )}
            </div>

            {/* Polarity Breakdown */}
            {data.polarityStats.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Анализ эмоций</h3>
                    <div className="space-y-3">
                        {data.polarityStats.slice(0, isProUser ? data.polarityStats.length : 3).map((stat) => (
                            <div key={stat.polarity} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded"
                                        style={{ backgroundColor: getPolarityColor(stat.polarity) }}
                                    />
                                    <span>{getPolarityName(stat.polarity)}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    {stat.count} раз
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isProUser && (
                        <div className="mt-4 pt-4 border-t">
                            <a
                                href="/app/billing"
                                className="text-sm text-violet-600 hover:text-violet-700"
                            >
                                Полный анализ эмоций в PRO →
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}