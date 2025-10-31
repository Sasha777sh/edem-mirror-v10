'use client';

import { Clock, Tag, Zap, Lock } from 'lucide-react';

interface JournalEntry {
    id: string;
    text: string;
    tags: string[] | null;
    polarity: string | null;
    energy: number | null;
    ts: string;
}

interface JournalListProps {
    entries: JournalEntry[];
    isProUser: boolean;
    daysLimit: number;
}

export default function JournalList({ entries, isProUser, daysLimit }: JournalListProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Сегодня';
        if (diffDays === 2) return 'Вчера';
        if (diffDays <= 7) return `${diffDays - 1} дн. назад`;

        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    const getEnergyColor = (energy: number) => {
        if (energy <= 3) return 'text-red-500';
        if (energy <= 6) return 'text-yellow-500';
        return 'text-green-500';
    };

    const getPolarityColor = (polarity: string) => {
        switch (polarity) {
            case 'позитивная': return 'bg-green-100 text-green-800';
            case 'негативная': return 'bg-red-100 text-red-800';
            case 'нейтральная': return 'bg-gray-100 text-gray-800';
            case 'смешанная': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (entries.length === 0) {
        return (
            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                <div className="text-gray-400 mb-4">
                    <Clock className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет записей</h3>
                <p className="text-gray-600">
                    Начните вести дневник, чтобы отслеживать свой путь самопознания.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                    Записи за {daysLimit} {daysLimit === 7 ? 'дней' : 'дней'}
                </h2>
                {!isProUser && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Lock className="w-4 h-4" />
                        Ограничено 7 днями
                    </div>
                )}
            </div>

            {entries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(entry.ts)}
                        </span>

                        <div className="flex items-center gap-2">
                            {entry.energy && (
                                <span className={`text-sm font-medium flex items-center gap-1 ${getEnergyColor(entry.energy)}`}>
                                    <Zap className="w-4 h-4" />
                                    {entry.energy}/10
                                </span>
                            )}
                        </div>
                    </div>

                    <p className="text-gray-900 mb-3 leading-relaxed">
                        {entry.text}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {entry.polarity && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPolarityColor(entry.polarity)}`}>
                                {entry.polarity}
                            </span>
                        )}

                        {entry.tags && entry.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                                {entry.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-violet-100 text-violet-700 rounded-full text-xs"
                                    >
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}