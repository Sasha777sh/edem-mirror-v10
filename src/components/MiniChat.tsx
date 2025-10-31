'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatState {
    step: 'intro' | 'problem' | 'clarify_polarity' | 'locate_body' | 'name_one_word' | 'truth_cut' | 'archetype' | 'today_step' | 'practice_5min' | 'close';
    voice: 'soft' | 'hard' | 'therapist';
    mode: 'demo' | 'pro';
    inputs: {
        problem: string;
        polarity: string;
        body: string;
        oneWord: string;
    };
    output: {
        truthCut?: string;
        archetype?: string;
        todayStep?: string;
        practice?: { name: string; how: string; durationMin: number };
        disclaimer?: string;
    };
    sessionId?: string;
    demoUsed: boolean;
    canGoBack: boolean;
    retryCount: number;
    startedAt: number;
    messagesCount: number;
}

interface MiniChatProps {
    selectedScenario?: string | null;
    prefilledText?: string;
    onScenarioComplete?: () => void;
}

export default function MiniChat({ selectedScenario, prefilledText, onScenarioComplete }: MiniChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [showPolarity, setShowPolarity] = useState(false);
    const [placeholder, setPlaceholder] = useState('Что мешает тебе сейчас?');
    const [demoLimitReached, setDemoLimitReached] = useState(false);
    const [state, setState] = useState<ChatState>({
        step: 'intro',
        voice: 'soft',
        mode: 'demo',
        inputs: { problem: '', polarity: '', body: '', oneWord: '' },
        output: {},
        demoUsed: false,
        canGoBack: false,
        retryCount: 0,
        startedAt: Date.now(),
        messagesCount: 0
    });

    const chatScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Check demo availability on component mount
        checkDemoLimit();
        // Initial message
        pushAssistant(getIntroMessage());
    }, []);

    // Handle prefilled scenario from onboarding
    useEffect(() => {
        if (selectedScenario && prefilledText && state.step === 'intro') {
            setInput(prefilledText);
            // Auto-submit after a short delay
            setTimeout(() => {
                handleSend();
                onScenarioComplete?.();
            }, 1000);
        }
    }, [selectedScenario, prefilledText]);

    const checkDemoLimit = async () => {
        try {
            const response = await fetch('/api/demo/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (!data.ok) {
                setDemoLimitReached(true);
                if (data.reason === 'guest_limit') {
                    pushAssistant('Лимит демо достигнут (1 раз в 24 часа). Зарегистрируйтесь для 2 попыток в день.');
                } else if (data.reason === 'limit') {
                    pushAssistant('Лимит дня достигнут (2 сессии). Обновится завтра в 00:00 или перейдите на PRO.');
                }
                return;
            }
        } catch (error) {
            console.error('Error checking demo limit:', error);
        }
    };

    const consumeDemo = async () => {
        try {
            await fetch('/api/demo/consume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            setState(prev => ({ ...prev, demoUsed: true }));
        } catch (error) {
            console.error('Error consuming demo:', error);
        }
    };

    const getIntroMessage = () => {
        const intros = {
            soft: 'Ты здесь не случайно. Я помогу увидеть корень. Скажи одной фразой: что мешает тебе сейчас?',
            hard: 'Без кружев. Что мешает двигаться — одной фразой.',
            therapist: 'Пойдём шаг за шагом. Сформулируй, что мешает прямо сейчас.'
        };
        return intros[state.voice];
    };

    const pushAssistant = (text: string) => {
        setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    };

    const pushUser = (text: string) => {
        setMessages(prev => [...prev, { role: 'user', content: text }]);
    };

    const setVoice = (voice: 'soft' | 'hard' | 'therapist') => {
        setState(prev => ({ ...prev, voice }));
        setMessages([]);
        pushAssistant(getIntroMessage());
    };

    const handleSend = async () => {
        const val = input.trim();
        if (!val || isLoading || demoLimitReached) return;

        pushUser(val);
        setInput('');
        setIsLoading(true);

        try {
            // Use EDEM API for processing steps
            const response = await fetch('/api/edem/step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: state.sessionId,
                    mode: 'demo',
                    voice: state.voice,
                    step: state.step,
                    payload: {
                        [state.step === 'intro' ? 'problem' :
                            state.step === 'locate_body' ? 'body' :
                                state.step === 'name_one_word' ? 'oneWord' : state.step]: val,
                        ...state.inputs
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 429) {
                    pushAssistant('Лимит демо достигнут. Попробуйте завтра или перейдите на PRO.');
                    setDemoLimitReached(true);
                    return;
                }
                throw new Error('Ошибка сервера');
            }

            const data = await response.json();

            // Update session ID if provided
            if (data.sessionId && !state.sessionId) {
                setState(prev => ({ ...prev, sessionId: data.sessionId }));
            }

            // Handle response based on step
            if (state.step === 'intro') {
                setState(prev => ({
                    ...prev,
                    step: 'clarify_polarity',
                    inputs: { ...prev.inputs, problem: val }
                }));
                pushAssistant(data.utterance);
                setShowPolarity(true);
                setPlaceholder('...');

            } else if (state.step === 'locate_body') {
                setState(prev => ({
                    ...prev,
                    step: 'name_one_word',
                    inputs: { ...prev.inputs, body: val }
                }));
                pushAssistant(data.utterance);
                setPlaceholder('Одно слово');

            } else if (state.step === 'name_one_word') {
                // Consume demo immediately when reaching truth_cut
                if (!state.demoUsed) {
                    await consumeDemo();
                }

                setState(prev => ({
                    ...prev,
                    step: 'truth_cut',
                    inputs: { ...prev.inputs, oneWord: val }
                }));
                pushAssistant(data.utterance);

                // If this was demo mode, show paywall after truth_cut
                if (state.mode === 'demo') {
                    setShowPaywall(true);
                }
                setPlaceholder('...');

            } else if (state.step === 'truth_cut') {
                // Handle truth_cut step
                setState(prev => ({
                    ...prev,
                    step: data.nextStep || 'close'
                }));
                pushAssistant(data.utterance);
            } else {
                pushAssistant(data.utterance);
            }

            // Show paywall if this is demo mode
            if (data.paywall) {
                setTimeout(() => {
                    setShowPaywall(true);
                }, 1000);
            }

        } catch (error) {
            console.error('Error:', error);
            pushAssistant('Произошла ошибка. Попробуйте ещё раз.');
        } finally {
            setIsLoading(false);
        }
    };

    const getTruthCut = () => {
        const { voice, inputs } = state;
        const polarity = inputs.polarity;

        const responses = {
            loss: {
                soft: 'Это не про «потерю». Это про контроль. Страшно отпустить хватку — будто всё развалится.',
                hard: 'Ты боишься не потери. Ты боишься отпустить контроль. Деньги/люди — лишь ширма.',
                therapist: 'Вижу страх потери. Под ним — контроль. Заметим его мягко и дадим телу опору.'
            },
            control: {
                soft: 'Ты держишь слишком много. Можно опереться и отпустить на 1 шаг — не на всё сразу.',
                hard: 'Тебя держит не мир, а твоя хватка. Сними палец с курка хотя бы на одном участке.',
                therapist: 'Контроль — способ снизить тревогу. Дадим телу регулировку, потом — маленькое делегирование.'
            },
            rejection: {
                soft: 'Отказ — это не приговор ценности. Это «не сейчас/не мне».',
                hard: 'Ты читаешь «я — никто» там, где написано «не в этот раз».',
                therapist: 'Отказ — событие, не идентичность. Отметим чувство, сохраним уважение к себе.'
            },
            guilt: {
                soft: 'Вина удерживает на месте. Пока «искупляешься» — можешь не жить.',
                hard: 'Вина — удобная тюрьма без дверей. Хватит сидеть добровольно.',
                therapist: 'Проверим границу: где реальная ответственность, а где избыточная вина.'
            },
            shame: {
                soft: 'Стыд — чужой взгляд внутри. Вернём свой.',
                hard: 'Ты живёшь витриной. Закрой шоу на сегодня.',
                therapist: 'Стыд — про взгляд наблюдателя. Переведём фокус в тело и действие.'
            },
            other: {
                soft: 'Под этим тоже, скорее всего, контроль/страх/стыд. Я рядом.',
                hard: 'Назвал по‑своему — но корень тот же. Дальше — к телу.',
                therapist: 'Сформулировал иначе — ок. Посмотрим, где это в теле.'
            }
        };

        return responses[polarity as keyof typeof responses]?.[voice] || responses.other[voice];
    };

    const handlePolaritySelect = (polarity: string) => {
        setState(prev => ({
            ...prev,
            step: 'locate_body',
            inputs: { ...prev.inputs, polarity }
        }));

        setShowPolarity(false);

        const bodyMessages = {
            soft: 'Где это в теле сильнее всего? Грудь, горло, живот, спина…',
            hard: 'Где сидит? Грудь/горло/живот?',
            therapist: 'Отмечаем место в теле. Где ощущение плотнее всего?'
        };

        pushAssistant(bodyMessages[state.voice]);
        setPlaceholder('Например: в груди');
    };

    const polarityOptions = [
        ['loss', 'Потеря'],
        ['control', 'Контроль'],
        ['rejection', 'Отвержение'],
        ['guilt', 'Вина'],
        ['shame', 'Стыд'],
        ['other', 'Другое']
    ];

    return (
        <div className="border border-gray-200 rounded-2xl shadow-lg bg-white">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b">
                <div className="inline-flex items-center gap-2 px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-600">
                    Демо-чат · 5 шагов
                </div>
                <div className="flex gap-2">
                    {[
                        ['soft', '🌑 Мягкий'],
                        ['hard', '⚡ Жёсткий'],
                        ['therapist', '🧠 Психотерапевт']
                    ].map(([voice, label]) => (
                        <button
                            key={voice}
                            onClick={() => setVoice(voice as any)}
                            className={`px-3 py-2 text-xs rounded-full border transition-colors ${state.voice === voice
                                ? 'border-violet-600 text-violet-600 bg-violet-50'
                                : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatScrollRef} className="h-80 overflow-y-auto p-4 space-y-3">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${message.role === 'user'
                            ? 'ml-auto bg-gray-900 text-white rounded-tr-sm'
                            : 'bg-gray-50 border border-gray-100 rounded-tl-sm'
                            }`}
                    >
                        {message.content}
                    </div>
                ))}

                {isLoading && (
                    <div className="max-w-[85%] p-3 rounded-xl bg-gray-50 border border-gray-100 rounded-tl-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Polarity Selection */}
            {showPolarity && (
                <div className="px-4 pb-3">
                    <div className="flex flex-wrap gap-2">
                        {polarityOptions.map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => handlePolaritySelect(key)}
                                className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={placeholder}
                        disabled={isLoading || state.step === 'truth_cut'}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim() || state.step === 'truth_cut'}
                        className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Paywall Modal */}
            {showPaywall && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="w-full max-w-md mx-4 bg-white rounded-2xl border shadow-xl p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            {state.voice === 'soft' && 'Я показал корень. Хочешь план и 5-мин практику?'}
                            {state.voice === 'hard' && 'Корень вскрыт. Доводим до дела?'}
                            {state.voice === 'therapist' && 'Я вижу основу. Дальше — шаг на 24 часа и безопасная практика.'}
                        </h3>
                        <p className="text-gray-600 mb-4">Открой полный отчёт: архетип, шаг на 24 часа и 5‑минутная практика.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/api/crypto/checkout', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ plan: '30d', crypto_currency: 'btc' })
                                        });
                                        const data = await response.json();
                                        if (data.payment_url) {
                                            window.open(data.payment_url, '_blank');
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        // Падбэк к секции прайсинга
                                        setShowPaywall(false);
                                        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                            >
                                Открыть PRO
                            </button>
                            <button
                                onClick={() => setShowPaywall(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                                Потом
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}