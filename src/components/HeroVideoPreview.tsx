'use client';

import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface PreviewStep {
    id: string;
    title: string;
    content: string;
    visual: 'question' | 'word' | 'step' | 'checklist';
    duration: number; // в секундах
}

const PREVIEW_STEPS: PreviewStep[] = [
    {
        id: 'question',
        title: '❓ Вопрос',
        content: 'Что мешает тебе прямо сейчас?',
        visual: 'question',
        duration: 2.5
    },
    {
        id: 'word',
        title: '💫 Слово',
        content: 'Страх',
        visual: 'word',
        duration: 2
    },
    {
        id: 'step',
        title: '🎯 Шаг на день',
        content: 'Написать 3 вещи, которые контролируешь',
        visual: 'step',
        duration: 3
    },
    {
        id: 'checklist',
        title: '✅ Чек-лист',
        content: 'Отметить выполнение практики',
        visual: 'checklist',
        duration: 2.5
    }
];

export default function HeroVideoPreview() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [autoStarted, setAutoStarted] = useState(false);

    // Автоплей при загрузке
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!autoStarted) {
                setIsPlaying(true);
                setAutoStarted(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [autoStarted]);

    // Управление прогрессом
    useEffect(() => {
        if (!isPlaying) return;

        const currentStepData = PREVIEW_STEPS[currentStep];
        const stepDuration = currentStepData.duration * 1000; // в миллисекундах
        const interval = 50; // обновление каждые 50мс

        const timer = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + (interval / stepDuration) * 100;

                if (newProgress >= 100) {
                    // Переход к следующему шагу
                    if (currentStep < PREVIEW_STEPS.length - 1) {
                        setCurrentStep(curr => curr + 1);
                        return 0;
                    } else {
                        // Конец превью - перезапуск
                        setCurrentStep(0);
                        setIsPlaying(false);
                        return 0;
                    }
                }
                return newProgress;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [isPlaying, currentStep]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleRestart = () => {
        setCurrentStep(0);
        setProgress(0);
        setIsPlaying(true);
    };

    const getVisualContent = (step: PreviewStep) => {
        switch (step.visual) {
            case 'question':
                return (
                    <div className="space-y-3">
                        <div className="bg-gray-100 p-4 rounded-lg border-l-4 border-blue-500">
                            <div className="text-sm text-gray-600 mb-1">EDEM спрашивает:</div>
                            <div className="font-medium">{step.content}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span>Ввод пользователя...</span>
                        </div>
                    </div>
                );

            case 'word':
                return (
                    <div className="text-center space-y-4">
                        <div className="inline-block px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl shadow-lg transform scale-110 transition-transform">
                            <div className="text-lg font-bold">{step.content}</div>
                            <div className="text-xs opacity-90">Ключевое слово</div>
                        </div>
                        <div className="text-sm text-gray-600">
                            ИИ анализирует эмоцию и находит корень
                        </div>
                    </div>
                );

            case 'step':
                return (
                    <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                                <span>🎯</span>
                                Твой шаг на сегодня:
                            </div>
                            <div className="text-gray-800">{step.content}</div>
                            <div className="text-xs text-green-600 mt-2">⏱ 15 минут</div>
                        </div>
                    </div>
                );

            case 'checklist':
                return (
                    <div className="space-y-3">
                        <div className="text-sm font-medium text-gray-700 mb-3">Завершение дня:</div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <input type="checkbox" checked className="w-4 h-4 text-green-600 rounded" readOnly />
                                <span className="text-sm line-through text-gray-500">Выполнил шаг</span>
                                <span className="text-xs text-green-600">✓</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <input type="checkbox" checked className="w-4 h-4 text-green-600 rounded" readOnly />
                                <span className="text-sm line-through text-gray-500">Сделал практику</span>
                                <span className="text-xs text-green-600">✓</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                <input type="checkbox" checked className="w-4 h-4 text-green-600 rounded" readOnly />
                                <span className="text-sm line-through text-gray-500">Записал в дневник</span>
                                <span className="text-xs text-green-600">✓</span>
                            </label>
                        </div>
                        <div className="text-center mt-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                                🔥 Стрик: 5 дней подряд
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const currentStepData = PREVIEW_STEPS[currentStep];

    return (
        <div className="bg-white rounded-2xl border shadow-lg overflow-hidden">
            {/* Заголовок с контролами */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 ml-2">
                        EDEM Demo Preview
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePlayPause}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleRestart}
                        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                        aria-label="Перезапустить"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Прогресс-бар */}
            <div className="h-1 bg-gray-200">
                <div
                    className="h-full bg-violet-600 transition-all duration-100 ease-linear"
                    style={{
                        width: `${((currentStep * 100) + progress) / PREVIEW_STEPS.length}%`
                    }}
                />
            </div>

            {/* Индикаторы шагов */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                {PREVIEW_STEPS.map((step, index) => (
                    <div
                        key={step.id}
                        className={`flex items-center gap-2 text-xs transition-colors ${index === currentStep
                                ? 'text-violet-600 font-medium'
                                : index < currentStep
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${index === currentStep
                                ? 'bg-violet-600'
                                : index < currentStep
                                    ? 'bg-green-600'
                                    : 'bg-gray-300'
                            }`} />
                        <span className="hidden sm:inline">{step.title}</span>
                    </div>
                ))}
            </div>

            {/* Основной контент */}
            <div className="p-6 min-h-[280px]">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {currentStepData.title}
                    </h3>
                </div>

                <div className="transition-all duration-500 ease-in-out">
                    {getVisualContent(currentStepData)}
                </div>
            </div>

            {/* Футер с CTA */}
            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-t">
                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">
                        Весь процесс занимает 3 минуты
                    </div>
                    <button className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm font-medium">
                        Попробовать бесплатно
                    </button>
                </div>
            </div>
        </div>
    );
}