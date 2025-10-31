'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import SessionFeedback from '@/components/SessionFeedback';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    stage: 'shadow' | 'truth' | 'integration';
    timestamp: Date;
}

export default function MultiLevelChatV2() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStage, setCurrentStage] = useState<'shadow' | 'truth' | 'integration'>('shadow');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [sessionCompleted, setSessionCompleted] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize session
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // In a real app, this would create or fetch a session from the backend
                const newSessionId = 'session_' + Date.now().toString();
                setSessionId(newSessionId);

                // Add initial message
                const initialMessage: Message = {
                    id: 'initial_' + Date.now().toString(),
                    content: 'Привет. Расскажи, что тебя беспокоит?',
                    role: 'assistant',
                    stage: 'shadow',
                    timestamp: new Date()
                };

                setMessages([initialMessage]);
            } catch (error) {
                console.error('Failed to initialize session:', error);
            }
        };

        initializeSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !sessionId) return;

        // Add user message
        const userMessage: Message = {
            id: 'user_' + Date.now().toString(),
            content: input,
            role: 'user',
            stage: currentStage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Call API to process message
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: input,
                    sessionId: sessionId,
                    symptom: 'anxiety', // In a real app, this would come from onboarding
                    lang: 'ru'
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add assistant message
            const assistantMessage: Message = {
                id: 'assistant_' + Date.now().toString(),
                content: data.answer,
                role: 'assistant',
                stage: data.stage,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setCurrentStage(data.stage);

            // If we've reached the integration stage, show feedback
            if (data.stage === 'integration') {
                setSessionCompleted(true);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: Message = {
                id: 'error_' + Date.now().toString(),
                content: 'Извините, произошла ошибка. Попробуйте еще раз.',
                role: 'assistant',
                stage: currentStage,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Stage indicator component
    const StageIndicator = () => {
        const stageInfo = {
            shadow: { title: 'Тень', color: 'bg-purple-500', bgColor: 'bg-purple-100' },
            truth: { title: 'Правда', color: 'bg-blue-500', bgColor: 'bg-blue-100' },
            integration: { title: 'Интеграция', color: 'bg-green-500', bgColor: 'bg-green-100' }
        };

        const currentStageInfo = stageInfo[currentStage];

        return (
            <div className="flex items-center justify-center mb-4">
                <div className={`flex items-center px-3 py-1 rounded-full ${currentStageInfo.bgColor}`}>
                    <div className={`w-2 h-2 rounded-full ${currentStageInfo.color} mr-2`} />
                    <span className="text-sm font-medium text-gray-800">
                        {currentStageInfo.title}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                <h2 className="text-xl font-bold">EDEM Mirror v2</h2>
                <StageIndicator />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.role === 'user'
                                    ? 'bg-purple-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                                    }`}
                            >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                {message.role === 'assistant' && (
                                    <div className="mt-1 text-xs opacity-70 capitalize">
                                        {message.stage === 'shadow' ? 'Тень' :
                                            message.stage === 'truth' ? 'Правда' : 'Интеграция'}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start mb-4"
                    >
                        <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
                            <div className="flex items-center">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Думаю...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && sessionId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    >
                        <SessionFeedback
                            sessionId={sessionId}
                            onClose={() => setShowFeedback(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input or Completion Message */}
            {sessionCompleted ? (
                <div className="border-t border-gray-200 p-4 bg-white text-center">
                    <p className="text-gray-700 mb-3">Сессия завершена. Помогла ли она вам?</p>
                    <button
                        onClick={() => setShowFeedback(true)}
                        className="bg-purple-500 text-white rounded-full px-6 py-2 hover:bg-purple-600 transition-colors"
                    >
                        Оставить отзыв
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Введите ваш ответ..."
                            disabled={isLoading}
                            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-purple-500 text-white rounded-full p-2 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}