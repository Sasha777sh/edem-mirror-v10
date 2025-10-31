'use client';

import { BarChart3, Clock, Zap } from 'lucide-react';

interface UsageStatsProps {
    usage: {
        demos_today: number;
        words_today: number;
        last_demo_date: string | null;
        last_word_date: string | null;
    };
    sessionCount: number;
    isProUser: boolean;
}

export default function UsageStats({ usage, sessionCount, isProUser }: UsageStatsProps) {
    const today = new Date().toISOString().slice(0, 10);
    const isToday = usage.last_demo_date === today;

    const demosLimit = isProUser ? '∞' : '2';
    const demosUsed = isToday ? usage.demos_today : 0;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Статистика использования
            </h3>

            <div className="space-y-4">
                {/* Daily Demos */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">Ритуалы сегодня</span>
                    </div>
                    <div className="text-sm">
                        <span className={`font-bold ${demosUsed >= (isProUser ? 999 : 2) ? 'text-red-500' : 'text-green-600'}`}>
                            {demosUsed}
                        </span>
                        <span className="text-gray-500">/{demosLimit}</span>
                    </div>
                </div>

                {/* Sessions this month */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">За 30 дней</span>
                    </div>
                    <div className="text-sm">
                        <span className="font-bold text-blue-600">{sessionCount}</span>
                        <span className="text-gray-500"> сессий</span>
                    </div>
                </div>

                {/* Usage Progress */}
                {!isProUser && (
                    <div>
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Лимит дня</span>
                            <span>{demosUsed}/2</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all ${demosUsed >= 2 ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${Math.min((demosUsed / 2) * 100, 100)}%` }}
                            ></div>
                        </div>
                        {demosUsed >= 2 && (
                            <p className="text-xs text-red-600 mt-1">
                                Дневной лимит достигнут. Завтра сбросится в 00:00.
                            </p>
                        )}
                    </div>
                )}

                {isProUser && (
                    <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg">
                        <p className="text-sm text-violet-700 font-medium">
                            ✨ PRO активен — безлимитное использование
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}