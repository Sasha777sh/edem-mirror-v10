'use client';

import { Calendar, Clock, CheckCircle, PlayCircle } from 'lucide-react';

interface Session {
    id: string;
    voice: string;
    step: string;
    inputs: any;
    output: any;
    started_at: string;
    finished_at: string | null;
    completed: boolean;
}

interface SessionCardProps {
    session: any; // More flexible typing to handle database Row type
    isProUser: boolean;
}

export default function SessionCard({ session, isProUser }: SessionCardProps) {
    const isCompleted = session.completed;
    const canViewDetails = isProUser || isCompleted;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                        {session.voice} голос
                    </h3>
                    <p className="text-sm text-gray-600">
                        {new Date(session.started_at).toLocaleDateString('ru-RU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isCompleted ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            Завершено
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-sm">
                            <PlayCircle className="w-4 h-4" />
                            В процессе
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Шаг: {session.step}</span>
                </div>

                {session.finished_at && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                            Длительность: {Math.round((new Date(session.finished_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)} мин
                        </span>
                    </div>
                )}

                {canViewDetails && session.output && (
                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Результаты</h4>
                        <div className="space-y-2 text-sm">
                            {session.output.truthCut && (
                                <div>
                                    <span className="font-medium">Инсайт:</span>
                                    <p className="text-gray-600 mt-1">{session.output.truthCut}</p>
                                </div>
                            )}
                            {session.output.archetype && (
                                <div>
                                    <span className="font-medium">Архетип:</span>
                                    <p className="text-gray-600 mt-1">{session.output.archetype}</p>
                                </div>
                            )}
                            {session.output.todayStep && (
                                <div>
                                    <span className="font-medium">Шаг на сегодня:</span>
                                    <p className="text-gray-600 mt-1">{session.output.todayStep}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!canViewDetails && (
                    <div className="mt-4 pt-4 border-t bg-violet-50 rounded-lg p-3">
                        <p className="text-sm text-violet-700">
                            PRO-доступ нужен для просмотра полных результатов
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
