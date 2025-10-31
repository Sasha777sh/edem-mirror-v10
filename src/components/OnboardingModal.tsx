'use client';

import { useState } from 'react';
import { AlertTriangle, Heart, DollarSign, ArrowRight } from 'lucide-react';
import { generateOnboardingPrompt, TRUTH_REVEAL_TEMPLATES } from '@/lib/onboarding-prompts';

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (scenario: string, prefilledText: string) => void;
}

type OnboardingStage = 'problem_capture' | 'pain_amplification' | 'future_vision' | 'truth_reveal' | 'complete';
type VoiceType = 'soft' | 'hard' | 'therapist';
type ValidOnboardingStage = 'problem_capture' | 'pain_amplification' | 'future_vision' | 'truth_reveal';

export default function OnboardingModal({ isOpen, onClose, onSelect }: OnboardingModalProps) {
    const [currentStage, setCurrentStage] = useState<OnboardingStage>('problem_capture');
    const [selectedVoice, setSelectedVoice] = useState<VoiceType>('soft');
    const [answers, setAnswers] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    if (!isOpen) return null;

    // Only generate prompt for valid stages
    const currentPrompt = (currentStage !== 'complete') 
        ? generateOnboardingPrompt(currentStage as ValidOnboardingStage, selectedVoice, answers)
        : null;

    const handleOptionSelect = async (option: string) => {
        setSelectedOption(option);
        setIsTransitioning(true);

        const newAnswers = [...answers, option];
        setAnswers(newAnswers);

        // Аналитика
        await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'onboarding_step',
                properties: { stage: currentStage, answer: option, voice: selectedVoice }
            })
        });

        setTimeout(() => {
            if (currentStage === 'problem_capture') {
                setCurrentStage('pain_amplification');
            } else if (currentStage === 'pain_amplification') {
                setCurrentStage('future_vision');
            } else if (currentStage === 'future_vision') {
                setCurrentStage('truth_reveal');
            } else if (currentStage === 'truth_reveal') {
                setCurrentStage('complete');
            }
            setIsTransitioning(false);
            setSelectedOption(null);
        }, 800);
    };

    const handleComplete = () => {
        // Генерируем финальный текст для чата на основе ответов
        const problemCategory = answers[0]?.toLowerCase().includes('тревог') ? 'anxiety' :
            answers[0]?.toLowerCase().includes('отношен') ? 'relationships' : 'money';

        const finalText = `${answers[0]} ${answers[1]} ${answers[2]} Помоги разобраться в корне проблемы.`;

        // Аналитика завершения онбординга
        fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'onboarding_complete',
                properties: {
                    category: problemCategory,
                    voice: selectedVoice,
                    answers: answers
                }
            })
        });

        onSelect(problemCategory, finalText);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                {/* Прогресс-бар */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Шаг {['problem_capture', 'pain_amplification', 'future_vision', 'truth_reveal', 'complete'].indexOf(currentStage) + 1} из 5</span>
                        <span>Голос: {selectedVoice === 'soft' ? '🌑 Мягкий' : selectedVoice === 'hard' ? '⚡ Жёсткий' : '🧠 Психотерапевт'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                            className="bg-violet-600 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${(['problem_capture', 'pain_amplification', 'future_vision', 'truth_reveal', 'complete'].indexOf(currentStage) + 1) * 20}%` }}
                        />
                    </div>
                </div>

                {/* Выбор голоса (только на первом шаге) */}
                {currentStage === 'problem_capture' && answers.length === 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Выбери стиль общения:</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {(['soft', 'hard', 'therapist'] as VoiceType[]).map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => setSelectedVoice(voice)}
                                    className={`p-2 text-xs rounded-lg border transition-all ${selectedVoice === voice
                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {voice === 'soft' ? '🌑 Мягко' :
                                        voice === 'hard' ? '⚡ Прямо' : '🧠 Структурно'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Основной контент */}
                {currentStage === 'complete' ? (
                    <div className="text-center space-y-6">
                        <div className="text-green-600 space-y-2">
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <ArrowRight className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold">Первый слой снят</h3>
                            <p className="text-sm text-gray-600">
                                Теперь дойдём до корня за 90 секунд
                            </p>
                        </div>

                        <button
                            onClick={handleComplete}
                            className="w-full py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                        >
                            Начать анализ →
                        </button>
                    </div>
                ) : currentPrompt ? (
                    <div className="space-y-6">
                        {/* Вопрос */}
                        <div className="text-center space-y-3">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {currentPrompt.question}
                            </h2>
                            {currentPrompt.followUp && answers.length > 0 && (
                                <p className="text-sm text-violet-600 italic">
                                    {currentPrompt.followUp}
                                </p>
                            )}
                        </div>

                        {/* Опции ответов */}
                        {currentPrompt.options && (
                            <div className="space-y-3">
                                {currentPrompt.options.map((option, index) => {
                                    const isSelected = selectedOption === option;
                                    const isDisabled = isTransitioning;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => !isDisabled && handleOptionSelect(option)}
                                            disabled={isDisabled}
                                            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${isSelected
                                                ? 'border-violet-500 bg-violet-50 transform scale-105'
                                                : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                                    : 'border-gray-200 hover:border-violet-300 hover:bg-violet-25'
                                                }`}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {option}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Truth reveal — особый формат */}
                        {currentStage === 'truth_reveal' && (
                            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200">
                                <p className="text-violet-800 font-medium leading-relaxed">
                                    {currentPrompt.question}
                                </p>
                                <button
                                    onClick={() => handleOptionSelect('Принято')}
                                    className="mt-4 w-full py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                >
                                    {currentPrompt.followUp}
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Кнопка закрытия */}
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="text-gray-500 text-sm hover:text-gray-700"
                    >
                        ✕ Закрыть
                    </button>
                </div>
            </div>
        </div>
    );
}