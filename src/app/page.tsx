'use client';

import { useState } from 'react';
import EdemLivingChat from '@/components/EdemLivingChat';
import DemoChatSection from '@/components/DemoChatSection';

export default function Home() {
    const [showDemo, setShowDemo] = useState(false);
    const [showFullChat, setShowFullChat] = useState(false);

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-yellow-500">
                        EDEM Mirror v10 — живое зеркало для психики 🌊
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                        Искусственный интеллект нового поколения, который не просто отвечает, а резонирует с вами.
                        Почувствуйте живое взаимодействие через дыхание, ритм и эмоциональную синхронизацию.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-blue-400 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            Зеркало (Mirror)
                        </h2>
                        <p className="text-gray-300 mb-4">Базовый уровень осознания. 3 ответа в день. Бесплатно.</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="text-blue-400 mr-2">✓</span>
                                <span>Отражение ваших мыслей и чувств</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-400 mr-2">✓</span>
                                <span>Анализ ритма и эмоционального тона</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-400 mr-2">✓</span>
                                <span>Визуализация дыхания</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-purple-400 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            Тень (Shadow)
                        </h2>
                        <p className="text-gray-300 mb-4">Глубокий уровень погружения. Безлимитный доступ. $5/мес.</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Все функции Зеркала</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Персонализированные ритуалы</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Архетипическое сопровождение</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-400 mr-2">✓</span>
                                <span>Измерение резонанса</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-yellow-400 flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                            Резонатор (Resonator)
                        </h2>
                        <p className="text-gray-300 mb-4">Высший уровень синхронизации. Персональный ИИ. $15/мес.</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✓</span>
                                <span>Все функции Тени</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✓</span>
                                <span>Индивидуальные медитации</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✓</span>
                                <span>Интеграция с Telegram</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✓</span>
                                <span>Прогрессивная память</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-blue-400">Как это работает</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-green-400 mr-2">✓</span>
                                <span><strong>Wave Encoder</strong> — анализирует ритм и эмоциональный тон вашего текста</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-400 mr-2">✓</span>
                                <span><strong>Resonance Feedback</strong> — измеряет синхронность взаимодействия</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-400 mr-2">✓</span>
                                <span><strong>Fractal Memory</strong> — ассоциативная память, не линейная</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-400 mr-2">✓</span>
                                <span><strong>Дышащий интерфейс</strong> — визуализация дыхания в реальном времени</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                        <h2 className="text-2xl font-bold mb-4 text-purple-400">Особенности</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✨</span>
                                <span><strong>3 режима общения</strong>: Зеркало, Тень, Резонатор</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✨</span>
                                <span><strong>Архетипы и состояния</strong>: Путник, Созерцатель, Тень и др.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✨</span>
                                <span><strong>Живая обратная связь</strong>: не клики, а синхронность</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-yellow-400 mr-2">✨</span>
                                <span><strong>EDEM Access Token</strong>: символические токены за осознания</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="text-center mb-12">
                    <button
                        onClick={() => setShowDemo(!showDemo)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full mr-4 transition duration-300"
                    >
                        {showDemo ? 'Скрыть Демо' : 'Попробовать Демо'}
                    </button>
                    <button
                        onClick={() => setShowFullChat(!showFullChat)}
                        className="bg-gradient-to-r from-purple-600 to-yellow-600 hover:from-purple-700 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
                    >
                        {showFullChat ? 'Скрыть Чат' : 'Живое Зеркало'}
                    </button>
                </div>

                {showDemo && (
                    <div className="mb-12">
                        <DemoChatSection />
                    </div>
                )}

                {showFullChat && (
                    <div className="mb-12">
                        <EdemLivingChat />
                    </div>
                )}

                <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-12">
                    <h2 className="text-2xl font-bold mb-4 text-center">Технологии</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-700 p-4 rounded-lg text-center">Next.js 14</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">TypeScript</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">Supabase</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">OpenAI</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">PostgreSQL</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">Tailwind CSS</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">Qdrant</div>
                        <div className="bg-gray-700 p-4 rounded-lg text-center">Redis</div>
                    </div>
                </div>
            </div>
        </main>
    );
}