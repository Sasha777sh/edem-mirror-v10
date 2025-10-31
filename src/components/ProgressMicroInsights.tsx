'use client';

import React, { useState } from 'react';
import { TrendingUp, Target, Zap, Award } from 'lucide-react';

interface MicroInsight {
    id: string;
    text: string;
    shadowType: string;
    confidence: number;
    date: string;
    validated?: boolean;
}

interface ProgressMicroInsightsProps {
    insights: MicroInsight[];
    currentStreak: number;
    weeklyTarget: number;
    onValidateInsight: (id: string, isValid: boolean) => void;
}

export default function ProgressMicroInsights({
    insights,
    currentStreak,
    weeklyTarget,
    onValidateInsight
}: ProgressMicroInsightsProps) {
    const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

    const streakProgress = Math.min((currentStreak / weeklyTarget) * 100, 100);
    const recentInsights = insights.slice(-3);

    const shadowColors: Record<string, string> = {
        shame: '#8b5cf6',
        rejection: '#ef4444',
        control: '#10b981',
        loss: '#f59e0b',
        guilt: '#3b82f6'
    };

    const getStreakEmoji = (streak: number) => {
        if (streak >= 7) return '🔥';
        if (streak >= 5) return '⚡';
        if (streak >= 3) return '✨';
        if (streak >= 1) return '🌱';
        return '💤';
    };

    const generateMicroFeedback = (insight: MicroInsight) => {
        const feedbacks: Record<string, string[]> = {
            shame: [
                "Заметил как желание становится чище?",
                "Меньше оправданий в речи — прогресс!",
                "Дыхание ровнее = стыд отступает"
            ],
            rejection: [
                "Границы крепнут — видишь разницу?",
                "Честное 'нет' = самоуважение растет",
                "Отказы проще переносить?"
            ],
            control: [
                "Отпускаешь — мир не рушится",
                "Доверие дается — напряжение уходит",
                "Ладони расслаблены = контроль отпущен"
            ],
            loss: [
                "Освобождаешь место — что пришло?",
                "Отпускание = пространство для нового",
                "Легче становится?"
            ],
            guilt: [
                "Энергия возвращается — чувствуешь?",
                "Чужие ноши отданы = сила твоя",
                "Ответственность вместо вины работает?"
            ]
        };

        const options = feedbacks[insight.shadowType] || ["Как ощущения от практики?"];
        return options[Math.floor(Math.random() * options.length)];
    };

    return (
        <div className="grid md:grid-cols-2 gap-4">
            {/* Прогресс стрик */}
            <div className="border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-gray-500">Стрик практик</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            {getStreakEmoji(currentStreak)} {currentStreak} дней
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-gray-500">Цель недели</div>
                        <div className="text-sm font-semibold">{weeklyTarget} дней</div>
                    </div>
                </div>

                {/* Прогресс бар */}
                <div className="relative">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                            style={{ width: `${streakProgress}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                        {Math.round(streakProgress)}% от цели
                    </div>
                </div>

                {/* Быстрая статистика */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />
                        <div className="text-xs text-gray-500 mt-1">Тренд</div>
                        <div className="text-sm font-semibold">↗ Рост</div>
                    </div>
                    <div className="text-center">
                        <Target className="w-4 h-4 text-violet-500 mx-auto" />
                        <div className="text-xs text-gray-500 mt-1">Фокус</div>
                        <div className="text-sm font-semibold">Стыд</div>
                    </div>
                    <div className="text-center">
                        <Award className="w-4 h-4 text-yellow-500 mx-auto" />
                        <div className="text-xs text-gray-500 mt-1">Достижение</div>
                        <div className="text-sm font-semibold">
                            {currentStreak >= 7 ? 'Мастер' : currentStreak >= 3 ? 'Стабильно' : 'Начало'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Микро-инсайты */}
            <div className="border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="text-sm text-gray-500">AI заметил</div>
                        <div className="text-lg font-semibold">Микро-инсайты</div>
                    </div>
                    <Zap className="w-5 h-5 text-violet-500" />
                </div>

                <div className="space-y-3">
                    {recentInsights.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <div className="text-xs">Пока инсайтов нет</div>
                            <div className="text-xs mt-1">Продолжай практики!</div>
                        </div>
                    ) : (
                        recentInsights.map(insight => (
                            <div
                                key={insight.id}
                                className={`border rounded-xl p-3 cursor-pointer transition-all ${selectedInsight === insight.id ? 'border-violet-500 bg-violet-50' : 'hover:border-gray-300'
                                    }`}
                                onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm text-gray-800 leading-relaxed">
                                            {insight.text}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: shadowColors[insight.shadowType] }}
                                            />
                                            <div className="text-xs text-gray-500">
                                                {new Date(insight.date).toLocaleDateString('ru')}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                • {Math.round(insight.confidence * 100)}% уверенности
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Развернутая информация */}
                                {selectedInsight === insight.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        <div className="text-sm text-gray-700 mb-3">
                                            {generateMicroFeedback(insight)}
                                        </div>

                                        {insight.validated === undefined && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onValidateInsight(insight.id, true);
                                                    }}
                                                    className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200"
                                                >
                                                    👍 Точно
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onValidateInsight(insight.id, false);
                                                    }}
                                                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200"
                                                >
                                                    👎 Не совсем
                                                </button>
                                            </div>
                                        )}

                                        {insight.validated !== undefined && (
                                            <div className={`text-xs px-2 py-1 rounded-lg inline-block ${insight.validated
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {insight.validated ? '✅ Подтверждено' : '⚠️ Требует уточнения'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}