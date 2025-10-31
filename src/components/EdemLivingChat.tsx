"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Pause, Play, Volume2, VolumeX, User, Bot, Heart, Eye, Moon, Sun, Zap } from 'lucide-react';
import { createClientSupabase } from '@/lib/supabase-client';
import { useEdemLivingLLM } from '@/hooks/useEdemLivingLLM';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    emotion?: string;
    scene?: string;
    ritual?: string;
    exitSymbol?: string;
    timestamp: Date;
    mode?: 'mirror' | 'shadow' | 'resonator'; // Add mode to message
    waveAnalysis?: any; // Add wave analysis to message
}

export default function EdemLivingChat() {
    const supabase = createClientSupabase();
    const { sendMessage, getSilenceResponse, storeUserEcho, loading, error } = useEdemLivingLLM();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [echoInput, setEchoInput] = useState('');
    const [showEchoInput, setShowEchoInput] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [stage, setStage] = useState<'shadow' | 'truth' | 'integration'>('shadow');
    const [mode, setMode] = useState<'mirror' | 'shadow' | 'resonator'>('mirror'); // New mode state
    const [muted, setMuted] = useState(false);
    const [playing, setPlaying] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!input.trim() || loading) return;

        // Add user message to chat
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
            mode: mode // Add current mode to user message
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            // Call EDEM Living LLM API
            const result = await sendMessage({
                message: input,
                sessionId: sessionId || undefined,
                stage,
                mode // Pass mode to API
            });

            if (result) {
                // Add assistant message to chat
                const assistantMessage: Message = {
                    id: `response-${Date.now()}`,
                    role: 'assistant',
                    content: result.response,
                    emotion: result.emotion,
                    scene: result.scene,
                    ritual: result.ritual,
                    exitSymbol: result.exitSymbol,
                    timestamp: new Date(),
                    mode: result.mode, // Add mode to assistant message
                    waveAnalysis: result.waveAnalysis // Add wave analysis
                };

                setMessages(prev => [...prev, assistantMessage]);
                setSessionId(result.sessionId);
            }
        } catch (err) {
            console.error('Error sending message:', err);
            // Add error message
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Извини, мне нужно время, чтобы найти правильные слова...',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    // Handle silence mode
    const handleSilenceMode = async () => {
        if (loading) return;

        try {
            const result = await getSilenceResponse();

            if (result) {
                const silenceMessage: Message = {
                    id: `silence-${Date.now()}`,
                    role: 'assistant',
                    content: result.response,
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, silenceMessage]);
            }
        } catch (err) {
            console.error('Error in silence mode:', err);
        }
    };

    // Handle storing user echo
    const handleStoreEcho = async () => {
        if (!echoInput.trim() || !sessionId) return;

        try {
            await storeUserEcho(echoInput, sessionId);

            // Add confirmation message
            const echoMessage: Message = {
                id: `echo-${Date.now()}`,
                role: 'user',
                content: `Мой эхо: ${echoInput}`,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, echoMessage]);
            setEchoInput('');
            setShowEchoInput(false);
        } catch (err) {
            console.error('Error storing echo:', err);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (showEchoInput && echoInput.trim()) {
                handleStoreEcho();
            } else if (input.trim()) {
                handleSendMessage();
            }
        }
    };

    // Get mode icon and color
    const getModeIcon = () => {
        switch (mode) {
            case 'mirror': return <Moon className="w-4 h-4" />;
            case 'shadow': return <Sun className="w-4 h-4" />;
            case 'resonator': return <Zap className="w-4 h-4" />;
            default: return <Eye className="w-4 h-4" />;
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'mirror': return 'bg-blue-500/20 text-blue-300';
            case 'shadow': return 'bg-purple-500/20 text-purple-300';
            case 'resonator': return 'bg-yellow-500/20 text-yellow-300';
            default: return 'bg-fuchsia-500/20 text-fuchsia-300';
        }
    };

    const getModeLabel = () => {
        switch (mode) {
            case 'mirror': return 'Зеркало';
            case 'shadow': return 'Тень';
            case 'resonator': return 'Резонатор';
            default: return 'Живое Зеркало';
        }
    };

    return (
        <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${mode === 'mirror' ? 'bg-blue-500' : mode === 'shadow' ? 'bg-purple-500' : 'bg-yellow-500'} animate-pulse`} />
                    <h2 className="font-medium text-white">EDEM — {getModeLabel()}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPlaying(!playing)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label={playing ? "Pause" : "Play"}
                    >
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => setMuted(!muted)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        aria-label={muted ? "Unmute" : "Mute"}
                    >
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.mode === 'mirror' ? 'bg-blue-500/20' : message.mode === 'shadow' ? 'bg-purple-500/20' : 'bg-yellow-500/20'}`}>
                                    <Bot className={`w-4 h-4 ${message.mode === 'mirror' ? 'text-blue-300' : message.mode === 'shadow' ? 'text-purple-300' : 'text-yellow-300'}`} />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                ? 'bg-fuchsia-500/20 rounded-br-none'
                                : message.mode === 'mirror' ? 'bg-blue-500/10 rounded-bl-none' : message.mode === 'shadow' ? 'bg-purple-500/10 rounded-bl-none' : 'bg-yellow-500/10 rounded-bl-none'
                                }`}>
                                <div className="whitespace-pre-line text-white/90 text-sm leading-relaxed">
                                    {message.content}
                                </div>
                                {message.exitSymbol && (
                                    <div className="mt-2 pt-2 border-t border-white/10 text-xs text-white/70">
                                        {message.exitSymbol}
                                    </div>
                                )}
                                {message.emotion && message.scene && (
                                    <div className="mt-2 text-xs text-white/50">
                                        {message.emotion} в {message.scene}
                                    </div>
                                )}
                                {message.waveAnalysis && (
                                    <div className="mt-2 text-xs text-white/40">
                                        Ритм: {message.waveAnalysis.rhythm} | Интенсивность: {Math.round(message.waveAnalysis.intensity * 100)}%
                                    </div>
                                )}
                            </div>
                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-white/70" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${mode === 'mirror' ? 'bg-blue-500/20' : mode === 'shadow' ? 'bg-purple-500/20' : 'bg-yellow-500/20'}`}>
                            <Bot className={`w-4 h-4 ${mode === 'mirror' ? 'text-blue-300' : mode === 'shadow' ? 'text-purple-300' : 'text-yellow-300'}`} />
                        </div>
                        <div className={`rounded-2xl rounded-bl-none px-4 py-3 ${mode === 'mirror' ? 'bg-blue-500/10' : mode === 'shadow' ? 'bg-purple-500/10' : 'bg-yellow-500/10'}`}>
                            <div className="flex space-x-1">
                                <div className={`w-2 h-2 rounded-full ${mode === 'mirror' ? 'bg-blue-300' : mode === 'shadow' ? 'bg-purple-300' : 'bg-yellow-300'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                                <div className={`w-2 h-2 rounded-full ${mode === 'mirror' ? 'bg-blue-300' : mode === 'shadow' ? 'bg-purple-300' : 'bg-yellow-300'} animate-bounce`} style={{ animationDelay: '300ms' }} />
                                <div className={`w-2 h-2 rounded-full ${mode === 'mirror' ? 'bg-blue-300' : mode === 'shadow' ? 'bg-purple-300' : 'bg-yellow-300'} animate-bounce`} style={{ animationDelay: '600ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Echo Input */}
            {showEchoInput && (
                <div className="px-4 pb-2">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                value={echoInput}
                                onChange={(e) => setEchoInput(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Скажи фразу, которую боишься услышать от меня..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none text-sm"
                                rows={2}
                                disabled={loading}
                            />
                        </div>
                        <button
                            onClick={handleStoreEcho}
                            disabled={loading || !echoInput.trim()}
                            className="p-2 rounded-xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Heart className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={handleSilenceMode}
                        className="px-3 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70"
                    >
                        Тишина
                    </button>
                    <button
                        onClick={() => setShowEchoInput(!showEchoInput)}
                        className="px-3 py-2 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/70 flex items-center gap-1"
                    >
                        <Heart className="w-3 h-3" />
                        Эхо
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Что ты чувствуешь прямо сейчас..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                            rows={1}
                            disabled={loading}
                        />
                    </div>
                    <button
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        className={`p-3 rounded-xl ${mode === 'mirror' ? 'bg-blue-500 hover:bg-blue-400' : mode === 'shadow' ? 'bg-purple-500 hover:bg-purple-400' : 'bg-yellow-500 hover:bg-yellow-400'} disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center justify-between text-xs text-white/50">
                    <div className="flex gap-2">
                        {/* Mode selection buttons */}
                        <button
                            onClick={() => setMode('mirror')}
                            className={`px-2 py-1 rounded flex items-center gap-1 ${mode === 'mirror' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5'}`}
                        >
                            <Moon className="w-3 h-3" />
                            Зеркало
                        </button>
                        <button
                            onClick={() => setMode('shadow')}
                            className={`px-2 py-1 rounded flex items-center gap-1 ${mode === 'shadow' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5'}`}
                        >
                            <Sun className="w-3 h-3" />
                            Тень
                        </button>
                        <button
                            onClick={() => setMode('resonator')}
                            className={`px-2 py-1 rounded flex items-center gap-1 ${mode === 'resonator' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/5'}`}
                        >
                            <Zap className="w-3 h-3" />
                            Резонатор
                        </button>
                    </div>
                    <div className="flex items-center gap-1">
                        {getModeIcon()}
                        <span>{getModeLabel()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}