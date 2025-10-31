'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import StageIndicator from '@/components/StageIndicator';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    stage: 'shadow' | 'truth' | 'integration';
    timestamp: Date;
}

interface Practice {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

export default function MultiLevelChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentStage, setCurrentStage] = useState<'shadow' | 'truth' | 'integration'>('shadow');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [practices, setPractices] = useState<Practice[]>([]);
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
            const response = await fetch('/api/dialogue', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input,
                    sessionId: sessionId,
                    // In a real app, these would come from user profile or onboarding
                    symptoms: ['anxiety', 'sleep'],
                    archetypes: ['victim']
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Add assistant message
            const assistantMessage: Message = {
                id: 'assistant_' + Date.now().toString(),
                content: data.response,
                role: 'assistant',
                stage: data.stage,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            setCurrentStage(data.stage);

            // If we're in integration stage, fetch practices
            if (data.stage === 'integration') {
                fetchPractices();
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

    const fetchPractices = async () => {
        try {
            const response = await fetch(`/api/dialogue?action=practice`);
            if (response.ok) {
                const data = await response.json();
                // Mock practices for demo
                const mockPractices: Practice[] = [
                    {
                        id: '1',
                        title: 'Дыхательная практика',
                        description: '4 секунды вдох, 6 секунд выдох, 5 кругов',
                        completed: false
                    },
                    {
                        id: '2',
                        title: 'Телесная осознанность',
                        description: 'Ощутите напряжение в теле и мягко расслабьтесь',
                        completed: false
                    }
                ];
                setPractices(mockPractices);
            }
        } catch (error) {
            console.error('Failed to fetch practices:', error);
        }
    };

    const completePractice = (practiceId: string) => {
        setPractices(prev =>
            prev.map(p =>
                p.id === practiceId ? { ...p, completed: true } : p
            )
        );
    };



    return (
        <div className="flex flex-col h-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                <h2 className="text-xl font-bold">EDEM Mirror</h2>
                <StageIndicator stage={currentStage} className="mt-2" />
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

            {/* Practices (only shown in integration stage) */}
            {currentStage === 'integration' && practices.length > 0 && (
                <div className="border-t border-gray-200 p-4 bg-green-50">
                    <h3 className="font-medium text-green-800 mb-2">Практика дня</h3>
                    <div className="space-y-2">
                        {practices.map((practice) => (
                            <div
                                key={practice.id}
                                className={`flex items-center justify-between p-2 rounded-lg ${practice.completed ? 'bg-green-100' : 'bg-white border border-green-200'
                                    }`}
                            >
                                <div>
                                    <p className="font-medium text-sm">{practice.title}</p>
                                    <p className="text-xs text-gray-600">{practice.description}</p>
                                </div>
                                {!practice.completed ? (
                                    <button
                                        onClick={() => completePractice(practice.id)}
                                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                    >
                                        Сделано
                                    </button>
                                ) : (
                                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                                        ✓
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
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
        </div>
    );
}