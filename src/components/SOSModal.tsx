'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Heart } from 'lucide-react';

interface SOSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (truthCard: string) => void;
}

export default function SOSModal({ isOpen, onClose, onSave }: SOSModalProps) {
    const [phase, setPhase] = useState<'breathing' | 'truth' | 'complete'>('breathing');
    const [timeLeft, setTimeLeft] = useState(90);
    const [breathCount, setBreatheCount] = useState(0);
    const [truthText, setTruthText] = useState('');
    const [isBreathing, setIsBreathing] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setPhase('breathing');
            setTimeLeft(90);
            setBreatheCount(0);
            setTruthText('');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (phase === 'breathing') {
                        setPhase('truth');
                        return 45; // 45 секунд на правду
                    } else if (phase === 'truth') {
                        setPhase('complete');
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, phase]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startBreathing = () => {
        setIsBreathing(true);
        const breathCycle = () => {
            // Вдох 4 сек, задержка 7 сек, выдох 8 сек = 19 сек цикл
            setBreatheCount(prev => prev + 1);
            setTimeout(() => setIsBreathing(false), 19000);
        };
        breathCycle();
    };

    const handleSaveTruth = () => {
        if (truthText.trim()) {
            onSave?.(truthText);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-red-900 bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                {/* Заголовок с таймером */}
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <h2 className="text-xl font-bold text-gray-900">SOS Режим</h2>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Фаза дыхания */}
                {phase === 'breathing' && (
                    <div className="text-center space-y-6">
                        <div className="space-y-2">
                            <p className="text-gray-700 font-medium">Дышим по технике 4-7-8</p>
                            <p className="text-sm text-gray-600">
                                Вдох 4 сек → задержка 7 сек → выдох 8 сек
                            </p>
                        </div>

                        <div className="relative">
                            <div className={`w-24 h-24 mx-auto rounded-full transition-all duration-1000 ${isBreathing
                                    ? 'bg-blue-200 scale-110'
                                    : 'bg-blue-100 scale-100'
                                } flex items-center justify-center`}>
                                <Heart className={`w-8 h-8 text-blue-600 transition-all duration-1000 ${isBreathing ? 'scale-125' : 'scale-100'
                                    }`} />
                            </div>
                            <div className="mt-4 text-sm text-gray-600">
                                Циклов: {breathCount}
                            </div>
                        </div>

                        {!isBreathing && (
                            <button
                                onClick={startBreathing}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                Начать дыхание
                            </button>
                        )}

                        <button
                            onClick={() => setPhase('truth')}
                            className="w-full py-2 text-gray-600 text-sm hover:text-gray-800"
                        >
                            Пропустить к правде →
                        </button>
                    </div>
                )}

                {/* Фаза правды */}
                {phase === 'truth' && (
                    <div className="space-y-4">
                        <div className="text-center space-y-2">
                            <p className="text-gray-700 font-medium">Одна строчка правды</p>
                            <p className="text-sm text-gray-600">
                                Что реально происходит прямо сейчас?
                            </p>
                        </div>

                        <textarea
                            value={truthText}
                            onChange={(e) => setTruthText(e.target.value)}
                            placeholder="Например: Боюсь, что не справлюсь и всё рухнет..."
                            className="w-full h-24 p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                            maxLength={140}
                        />

                        <div className="text-right text-xs text-gray-500">
                            {truthText.length}/140
                        </div>

                        <button
                            onClick={handleSaveTruth}
                            disabled={!truthText.trim()}
                            className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            Сохранить как карточку
                        </button>
                    </div>
                )}

                {/* Завершение */}
                {phase === 'complete' && (
                    <div className="text-center space-y-6">
                        <div className="text-green-600 space-y-2">
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <Heart className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Ты справился</h3>
                            <p className="text-sm text-gray-600">
                                90 секунд — это победа над пустотой
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleSaveTruth}
                                className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                            >
                                Сохранить карточку правды
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-2 text-gray-600 hover:text-gray-800"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}

                {/* Экстренный выход */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                    <button
                        onClick={onClose}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        ✕ Выйти
                    </button>
                </div>
            </div>
        </div>
    );
}