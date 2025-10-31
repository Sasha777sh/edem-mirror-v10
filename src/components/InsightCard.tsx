'use client';

import { useState } from 'react';
import { Share2, Download, Sparkles, Copy } from 'lucide-react';

interface InsightCardProps {
    truthCut: string;
    voice: 'soft' | 'hard' | 'therapist';
    onGetPlan?: () => void;
    onShare?: () => void;
}

export default function InsightCard({ truthCut, voice, onGetPlan, onShare }: InsightCardProps) {
    const [isCopied, setIsCopied] = useState(false);

    const gradients = {
        soft: 'from-purple-400 via-pink-400 to-red-400',
        hard: 'from-gray-700 via-gray-800 to-black',
        therapist: 'from-blue-400 via-purple-500 to-purple-600'
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`"${truthCut}" — EDEM зеркало психики. Попробуй бесплатно: edem.app`);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const downloadCard = () => {
        // Создаём canvas для генерации изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = 600;
        canvas.height = 600;

        // Фон градиент
        const gradient = ctx.createLinearGradient(0, 0, 600, 600);
        switch (voice) {
            case 'soft':
                gradient.addColorStop(0, '#a855f7');
                gradient.addColorStop(0.5, '#ec4899');
                gradient.addColorStop(1, '#ef4444');
                break;
            case 'hard':
                gradient.addColorStop(0, '#374151');
                gradient.addColorStop(0.5, '#1f2937');
                gradient.addColorStop(1, '#000000');
                break;
            case 'therapist':
                gradient.addColorStop(0, '#60a5fa');
                gradient.addColorStop(0.5, '#8b5cf6');
                gradient.addColorStop(1, '#a855f7');
                break;
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 600);

        // Текст
        ctx.fillStyle = 'white';
        ctx.font = 'bold 36px system-ui';
        ctx.textAlign = 'center';

        // Разбиваем текст на строки
        const words = truthCut.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > 500 && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word + ' ';
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine.trim());

        // Рисуем текст
        const startY = 250;
        lines.forEach((line, index) => {
            ctx.fillText(line, 300, startY + (index * 50));
        });

        // Логотип/подпись
        ctx.font = '20px system-ui';
        ctx.fillText('EDEM — зеркало психики', 300, 520);

        // Скачиваем
        const link = document.createElement('a');
        link.download = 'edem-insight.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="max-w-md mx-auto">
            {/* Превью карточки */}
            <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${gradients[voice]} text-white shadow-2xl mb-6`}>
                <div className="absolute top-4 right-4">
                    <Sparkles className="w-6 h-6 opacity-70" />
                </div>

                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-lg font-medium leading-relaxed">
                            "{truthCut}"
                        </p>
                    </div>

                    <div className="text-center text-sm opacity-90">
                        <p>EDEM — зеркало психики</p>
                        <p className="text-xs opacity-75">edem.app</p>
                    </div>
                </div>
            </div>

            {/* Действия */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={downloadCard}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Сохранить</span>
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors ${isCopied
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                    >
                        <Copy className="w-4 h-4" />
                        <span className="text-sm font-medium">
                            {isCopied ? 'Скопировано!' : 'Копировать'}
                        </span>
                    </button>
                </div>

                <button
                    onClick={onShare}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Поделиться</span>
                </button>

                <button
                    onClick={onGetPlan}
                    className="w-full py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                    Получить план и практику → PRO
                </button>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
                Карточка анонимна и не содержит личных данных
            </div>
        </div>
    );
}