'use client';

import { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Flame, Play } from 'lucide-react';

interface WordOfDay {
    word: string;
    meaning: string;
    meditation: string;
    voice: 'soft' | 'hard' | 'therapist';
}

interface TodoStatus {
    ritual_completed: boolean;
    journal_written: boolean;
    practice_done: boolean;
    streak: number;
}

interface EnhancedDashboardContentProps {
    userVoice?: 'soft' | 'hard' | 'therapist';
    isProUser: boolean;
}

export default function EnhancedDashboardContent({ userVoice = 'soft', isProUser }: EnhancedDashboardContentProps) {
    const [wordOfDay, setWordOfDay] = useState<WordOfDay | null>(null);
    const [todoStatus, setTodoStatus] = useState<TodoStatus | null>(null);
    const [selectedVoice, setSelectedVoice] = useState<'soft' | 'hard' | 'therapist'>(userVoice);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWordOfDay();
        fetchTodoStatus();
    }, [selectedVoice]);

    const fetchWordOfDay = async () => {
        try {
            const response = await fetch(`/api/reco/day?voice=${selectedVoice}`);
            if (response.ok) {
                const data = await response.json();
                setWordOfDay(data);
            }
        } catch (error) {
            console.error('Error fetching word of day:', error);
        }
    };

    const fetchTodoStatus = async () => {
        try {
            const response = await fetch('/api/todos/check');
            if (response.ok) {
                const data = await response.json();
                setTodoStatus(data);
            }
        } catch (error) {
            console.error('Error fetching todo status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStreakEmoji = (streak: number) => {
        if (streak >= 7) return '🔥';
        if (streak >= 5) return '⚡';
        if (streak >= 3) return '✨';
        if (streak >= 1) return '🌱';
        return '💤';
    };

    const getVoiceColor = (voice: 'soft' | 'hard' | 'therapist') => {
        switch (voice) {
            case 'soft': return 'from-purple-500 to-pink-500';
            case 'hard': return 'from-red-500 to-orange-500';
            case 'therapist': return 'from-blue-500 to-teal-500';
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="bg-gray-200 rounded-xl h-32"></div>
                <div className="bg-gray-200 rounded-xl h-40"></div>
                <div className="bg-gray-200 rounded-xl h-48"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Word of the Day */}
            {wordOfDay && (
                <div className={`bg-gradient-to-r ${getVoiceColor(selectedVoice)} rounded-xl p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Слово дня
                        </h2>

                        {/* Voice Selector */}
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value as any)}
                            className="text-sm bg-white/20 text-white rounded px-2 py-1 border-0 focus:bg-white/30"
                        >
                            <option value="soft">🌑 Мягкий</option>
                            <option value="hard">⚡ Жёсткий</option>
                            <option value="therapist">🧠 Терапевт</option>
                        </select>
                    </div>

                    <div className="text-2xl font-bold mb-2">{wordOfDay.word}</div>
                    <p className="text-white/90 text-sm mb-3">{wordOfDay.meaning}</p>
                    <p className="text-white/80 text-sm italic">{wordOfDay.meditation}</p>
                </div>
            )}

            {/* Continue Ritual Button */}
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
                <h3 className="font-semibold mb-4">Готов к новому ритуалу?</h3>
                <button
                    onClick={() => window.location.href = '/#demo'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                    <Play className="w-5 h-5" />
                    Продолжить ритуал
                </button>
            </div>

            {/* Progress Checklist */}
            {todoStatus && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Прогресс дня</h3>
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-bold text-lg">
                                {getStreakEmoji(todoStatus.streak)} {todoStatus.streak}
                            </span>
                            <span className="text-sm text-gray-600">дней подряд</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            {todoStatus.ritual_completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className={todoStatus.ritual_completed ? 'text-gray-900' : 'text-gray-500'}>
                                Ритуал завершён
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {todoStatus.practice_done ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className={todoStatus.practice_done ? 'text-gray-900' : 'text-gray-500'}>
                                5-минутная практика
                            </span>
                            {!isProUser && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                                    PRO
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {todoStatus.journal_written ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                            <span className={todoStatus.journal_written ? 'text-gray-900' : 'text-gray-500'}>
                                Запись в дневнике
                            </span>
                            <button
                                onClick={() => window.location.href = '/app/journal'}
                                className="ml-auto text-sm text-violet-600 hover:text-violet-700"
                            >
                                {todoStatus.journal_written ? 'Посмотреть' : 'Написать'}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Прогресс дня</span>
                            <span>
                                {[todoStatus.ritual_completed, todoStatus.practice_done, todoStatus.journal_written].filter(Boolean).length}/3
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${([todoStatus.ritual_completed, todoStatus.practice_done, todoStatus.journal_written].filter(Boolean).length / 3) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}