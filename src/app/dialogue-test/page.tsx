'use client';

import MultiLevelChat from '@/components/MultiLevelChat';
import StageIndicator from '@/components/StageIndicator';
import { useState } from 'react';

export default function DialogueTestPage() {
    const [showInfo, setShowInfo] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">EDEM Multi-Level Dialogue Test</h1>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="text-sm text-purple-600 hover:text-purple-800"
                    >
                        {showInfo ? 'Скрыть инструкции' : 'Показать инструкции'}
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                {showInfo && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-2">Инструкции по тестированию</h2>
                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                            <li>Система имеет три уровня: Тень → Правда → Интеграция</li>
                            <li>Используйте маркеры для перехода между уровнями:
                                <ul className="list-circle pl-5 mt-1">
                                    <li>Для перехода к Правде: используйте признание ("да", "узнаю", "понимаю")</li>
                                    <li>Для перехода к Интеграции: покажите готовность ("готов", "хочу", "попробую")</li>
                                    <li>Для возврата к Тени: используйте защиту ("но", "это не про меня")</li>
                                </ul>
                            </li>
                            <li>На уровне Интеграции система предложит микро-практики</li>
                            <li>Попробуйте разные типы ответов, чтобы проверить переходы</li>
                        </ul>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <MultiLevelChat />
                </div>

                <div className="mt-6 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-2">О системе</h2>
                    <p className="text-gray-600 mb-3">
                        Это демонстрация многоуровневой диалоговой системы EDEM с тремя стадиями:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border border-purple-200 rounded-lg p-4">
                            <StageIndicator stage="shadow" className="mb-2" />
                            <h3 className="font-medium text-purple-700">Тень (Shadow)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Отзеркаливание паттерна без советов. Цель: показать защитный механизм.
                            </p>
                        </div>
                        <div className="border border-blue-200 rounded-lg p-4">
                            <StageIndicator stage="truth" className="mb-2" />
                            <h3 className="font-medium text-blue-700">Правда (Truth)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Корневая потребность и контекст выбора. Цель: осознать истинную потребность.
                            </p>
                        </div>
                        <div className="border border-green-200 rounded-lg p-4">
                            <StageIndicator stage="integration" className="mb-2" />
                            <h3 className="font-medium text-green-700">Интеграция (Integration)</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Микро-шаг и закрепление в теле. Цель: применить осознание на практике.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}