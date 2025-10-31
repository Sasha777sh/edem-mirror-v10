'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, Zap, Moon, Sun, Clock } from 'lucide-react';

interface SmartNotification {
    id: string;
    type: 'morning' | 'practice' | 'evening' | 'shadow_detected';
    message: string;
    shadowType?: string;
    time: string;
    priority: 'low' | 'medium' | 'high';
    actionable?: boolean;
}

interface NotificationSystemProps {
    currentShadow: string;
    practicesDone: boolean;
    onTriggerPractice: (shadowType: string) => void;
}

export default function NotificationSystem({
    currentShadow,
    practicesDone,
    onTriggerPractice
}: NotificationSystemProps) {
    const [notifications, setNotifications] = useState<SmartNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Генерируем умные уведомления
    useEffect(() => {
        const shadowMessages: Record<string, any> = {
            shame: {
                morning: "Сегодня практикуем подлинность. Одно честное желание?",
                practice: "Стыд сжимает грудь. 4-7-8 дыхание — и мягкий шаг к желанию",
                evening: "Что стало честнее сегодня? Запиши одну строку",
                detected: "🔍 Замечен маркер стыда. Готов к 5-минутной практике?"
            },
            rejection: {
                morning: "День для границ. Где сегодня скажешь честное 'нет'?",
                practice: "Отвержение — это совпадение, не оценка. Скан тела 2 мин",
                evening: "Где выбрал себя вместо угождения?",
                detected: "💔 Триггер отвержения. Помнишь: отказ не про тебя"
            },
            control: {
                morning: "Сегодня отпускаем. Что можно доверить другим?",
                practice: "Хватка создает напряжение. Ощути ладони → делегируй задачу",
                evening: "Что выдержало без твоего контроля?",
                detected: "🤏 Режим контроля активен. Время для доверия?"
            },
            loss: {
                morning: "День отпускания. Что можно освободить для нового?",
                practice: "Отпуская малое, освобождаешь место большему",
                evening: "Что пришло вместо старого?",
                detected: "😔 Страх потери. Помнишь про место для большего?"
            },
            guilt: {
                morning: "Возвращаем свою энергию. Какую чужую ношу сегодня отдашь?",
                practice: "Вина останавливает. Ответственность возвращает силу",
                evening: "Какую энергию вернул себе?",
                detected: "😰 Вина включилась. Время вернуть свою силу"
            }
        };

        const current = shadowMessages[currentShadow];
        if (!current) return;

        const now = new Date();
        const hour = now.getHours();

        const newNotifications: SmartNotification[] = [];

        // Утреннее уведомление (8-10)
        if (hour >= 8 && hour <= 10) {
            newNotifications.push({
                id: 'morning',
                type: 'morning',
                message: current.morning,
                shadowType: currentShadow,
                time: '09:00',
                priority: 'medium'
            });
        }

        // Практика (если не сделана и 14-16)
        if (!practicesDone && hour >= 14 && hour <= 16) {
            newNotifications.push({
                id: 'practice',
                type: 'practice',
                message: current.practice,
                shadowType: currentShadow,
                time: '15:00',
                priority: 'high',
                actionable: true
            });
        }

        // Вечернее (20-22)
        if (hour >= 20 && hour <= 22) {
            newNotifications.push({
                id: 'evening',
                type: 'evening',
                message: current.evening,
                shadowType: currentShadow,
                time: '21:00',
                priority: 'medium'
            });
        }

        setNotifications(newNotifications);
    }, [currentShadow, practicesDone]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'morning': return <Sun className="w-4 h-4" />;
            case 'practice': return <Zap className="w-4 h-4" />;
            case 'evening': return <Moon className="w-4 h-4" />;
            case 'shadow_detected': return <Bell className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'border-red-500 bg-red-50';
            case 'medium': return 'border-violet-500 bg-violet-50';
            case 'low': return 'border-gray-300 bg-gray-50';
            default: return 'border-gray-300 bg-white';
        }
    };

    return (
        <div className="relative">
            {/* Кнопка уведомлений */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-lg border transition-colors ${notifications.length > 0
                        ? 'border-violet-500 bg-violet-50 text-violet-600'
                        : 'border-gray-300 bg-white text-gray-600'
                    }`}
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                    </div>
                )}
            </button>

            {/* Панель уведомлений */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b flex items-center justify-between">
                        <div className="font-semibold">Умные напоминания</div>
                        <button onClick={() => setIsOpen(false)}>
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Пока все спокойно ✨
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif.id}
                                    className={`p-3 border-b last:border-b-0 ${getPriorityColor(notif.priority)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{notif.message}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {notif.time} • {notif.shadowType}
                                            </div>
                                            {notif.actionable && (
                                                <button
                                                    onClick={() => {
                                                        onTriggerPractice(notif.shadowType!);
                                                        setIsOpen(false);
                                                    }}
                                                    className="mt-2 px-3 py-1 bg-violet-600 text-white text-xs rounded-lg hover:bg-violet-700"
                                                >
                                                    Начать практику
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}