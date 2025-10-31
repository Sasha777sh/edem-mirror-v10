'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getStepProgress, ChatStep } from '@/lib/chat-fsm';
import { processShadowStep } from '@/lib/demo-shadow-api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    hasButtons?: boolean;
    buttons?: string[];
}

interface ShadowMiniChatProps {
    onComplete?: (sessionData: any) => void;
}

export default function ShadowMiniChat({ onComplete }: ShadowMiniChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voice, setVoice] = useState<'soft' | 'hard' | 'therapist'>('soft');
    const [currentStep, setCurrentStep] = useState<ChatStep>('intro');
    const [sessionId, setSessionId] = useState<string>('');
    const [showPaywall, setShowPaywall] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const progress = getStepProgress(currentStep);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Auto-start with intro
        handleStart();
    }, []);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            // Используем простой demo API
            const response = await fetch('/api/shadow-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: 'intro',
                    voice,
                    payload: {}
                })
            });

            const data = await response.json();

            if (data.utterance) {
                setMessages([{ role: 'assistant', content: data.utterance, hasButtons: data.hasButtons, buttons: data.buttons }]);
                setCurrentStep(data.nextStep);
                if (data.sessionId) setSessionId(data.sessionId);
            }
        } catch (error) {
            console.error('Start error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (userInput?: string) => {
        const messageText = userInput || input.trim();
        if (!messageText || isLoading) return;

        // Add user message
        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setInput('');
        setIsLoading(true);

        try {
            // Используем простой demo API
            const response = await fetch('/api/shadow-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    voice,
                    payload: getPayloadForStep(currentStep, messageText)
                })
            });

            const data = await response.json();

            if (data.utterance) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.utterance,
                    hasButtons: data.hasButtons,
                    buttons: data.buttons
                }]);
                setCurrentStep(data.nextStep);

                // Handle paywall
                if (data.paywall) {
                    setShowPaywall(true);
                }

                // Handle completion
                if (data.nextStep === 'close') {
                    onComplete?.(data);
                }
            }
        } catch (error) {
            console.error('Send error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Произошла ошибка. Попробуйте ещё раз.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const getPayloadForStep = (step: ChatStep, input: string) => {
        switch (step) {
            case 'onb_1_mask':
                return { mask: input };
            case 'onb_2_trigger':
                return { trigger: input };
            case 'onb_3_polarity':
                return { polarity: input };
            case 'onb_4_body':
                return { body: input };
            case 'onb_5_one_word':
                return { oneWord: input };
            case 'onb_6_cost_agree':
                return { costAgree: input };
            default:
                return { text: input };
        }
    };

    const handleButtonClick = (buttonText: string) => {
        handleSend(buttonText);
    };

    if (showPaywall) {
        return (
            <div className="bg-white rounded-xl border p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">Истина найдена</h3>
                <p className="text-gray-600 mb-4">
                    Откройте полный анализ: архетип, план действий и практику на сегодня.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.href = '/#pricing'}
                        className="flex-1 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700"
                    >
                        Открыть PRO
                    </button>
                    <button
                        onClick={() => setShowPaywall(false)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Позже
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border shadow-sm max-w-md mx-auto">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold">EDEM · Работа с тенью</h3>
                        {progress.current <= 6 && (
                            <div className="text-sm text-gray-500">
                                {progress.label} • Шаг {progress.current} из {progress.total}
                            </div>
                        )}
                    </div>

                    {/* Voice Selector */}
                    <select
                        value={voice}
                        onChange={(e) => setVoice(e.target.value as any)}
                        className="text-sm border rounded px-2 py-1"
                        disabled={messages.length > 0}
                    >
                        <option value="soft">🌑 Мягкий</option>
                        <option value="hard">⚡ Жёсткий</option>
                        <option value="therapist">🧠 Психотерапевт</option>
                    </select>
                </div>

                {/* Progress Bar */}
                {progress.current <= 6 && (
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${(progress.current / progress.total) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${msg.role === 'user'
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}>
                            {msg.content}

                            {/* Buttons */}
                            {msg.hasButtons && msg.buttons && (
                                <div className="mt-3 space-y-2">
                                    {msg.buttons.map((button, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleButtonClick(button)}
                                            className="block w-full text-left px-3 py-2 bg-white text-gray-700 rounded border hover:bg-gray-50 text-sm"
                                            disabled={isLoading}
                                        >
                                            {button}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {!showPaywall && messages.length > 0 && !messages[messages.length - 1]?.hasButtons && (
                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ваш ответ..."
                            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 disabled:opacity-50"
                        >
                            →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}