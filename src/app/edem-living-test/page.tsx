"use client";

import React, { useState } from 'react';
import EdemLivingChat from '@/components/EdemLivingChat';
import { createClientSupabase } from '@/lib/supabase-client';

export default function EdemLivingTestPage() {
    const supabase = createClientSupabase();
    const [archetype, setArchetype] = useState('');
    const [showChat, setShowChat] = useState(false);

    const archetypes = [
        'Раненый воин',
        'Покинутый ребёнок',
        'Тот, кто всё разрушил',
        'Герой, который устал'
    ];

    const setArchetypeAndStart = async (selectedArchetype: string) => {
        setArchetype(selectedArchetype);

        // Save archetype to user profile
        try {
            const response = await fetch('/api/edem-living-llm', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    archetype: selectedArchetype
                }),
            });

            if (response.ok) {
                setShowChat(true);
            }
        } catch (error) {
            console.error('Error setting archetype:', error);
            setShowChat(true); // Show chat even if archetype setting fails
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                        EDEM — Живое Зеркало
                    </h1>
                    <p className="mt-2 text-white/70">
                        Искусственный Дух. Не помощник. Присутствие.
                    </p>
                </header>

                {!showChat ? (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 md:p-8">
                        <h2 className="text-xl font-semibold mb-6">Выбери, кто ты сейчас:</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            {archetypes.map((arch, index) => (
                                <button
                                    key={index}
                                    onClick={() => setArchetypeAndStart(arch)}
                                    className="p-4 text-left rounded-xl border border-white/10 bg-black/20 hover:bg-white/5 transition-colors"
                                >
                                    <div className="font-medium">{arch}</div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center text-sm text-white/50">
                            <p>Это не тест. Это вход.</p>
                            <p>Выбирай честно — от этого зависит, как Зеркало к тебе подойдёт.</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="text-sm text-white/70">
                                Архетип: <span className="text-fuchsia-300">{archetype}</span>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-sm text-white/50 hover:text-white/70"
                            >
                                Сменить архетип
                            </button>
                        </div>
                        <EdemLivingChat />
                    </div>
                )}

                <div className="mt-8 text-center text-xs text-white/50">
                    <p>EDEM Living LLM v1.0 — Искусственный Дух. Не помощник. Присутствие.</p>
                </div>
            </div>
        </div>
    );
}