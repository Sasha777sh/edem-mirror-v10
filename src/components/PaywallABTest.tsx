'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { Star, CheckCircle, ArrowRight, Users, Heart, Shield } from 'lucide-react';

// Declare gtag type
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

interface PaywallVariantProps {
    variant: 'soft' | 'hard' | 'therapist';
    onUpgrade: () => void;
    loading?: boolean;
}

function PaywallVariant({ variant, onUpgrade, loading }: PaywallVariantProps) {
    const getContent = () => {
        switch (variant) {
            case 'soft':
                return {
                    title: ' gentle support',
                    subtitle: 'Мягкое сопровождение к себе',
                    features: [
                        'Безлимитные ритуалы с поддержкой',
                        'Архетипы и глубинный анализ',
                        '5-минутные практики каждый день',
                        'Скачивание PDF отчётов',
                        'История за 30 дней',
                        'Экспорт журнала в CSV/JSON'
                    ],
                    cta: 'Открыть gentle support',
                    price: '490 ₽/мес'
                };
            case 'hard':
                return {
                    title: ' tough love',
                    subtitle: 'Жёсткая правда о себе',
                    features: [
                        'Безлимитные ритуалы с вызовом',
                        'Архетипы и трансформация',
                        '5-минутные практики с вызовом',
                        'Скачивание PDF отчётов',
                        'История за 30 дней',
                        'Экспорт журнала в CSV/JSON'
                    ],
                    cta: 'Принять tough love',
                    price: '590 ₽/мес'
                };
            case 'therapist':
                return {
                    title: ' professional help',
                    subtitle: 'Профессиональная помощь себе',
                    features: [
                        'Безлимитные ритуалы с терапией',
                        'Архетипы и профессиональный анализ',
                        '5-минутные практики с терапией',
                        'Скачивание PDF отчётов',
                        'История за 30 дней',
                        'Экспорт журнала в CSV/JSON'
                    ],
                    cta: 'Получить professional help',
                    price: '790 ₽/мес'
                };
        }
    };

    const content = getContent();

    return (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    EDEM PRO
                    <span className="text-violet-600">{content.title}</span>
                </h2>
                <p className="text-gray-600 text-lg">{content.subtitle}</p>
            </div>

            <div className="mb-8">
                <div className="text-4xl font-bold text-gray-900 mb-2">{content.price}</div>
                <p className="text-gray-500">Без автопродления. Отменить можно в любой момент.</p>
            </div>

            <ul className="space-y-4 mb-8">
                {content.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                onClick={onUpgrade}
                disabled={loading}
                className="w-full py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Обработка...
                    </>
                ) : (
                    <>
                        {content.cta}
                        <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </div>
    );
}

interface PaywallABTestProps {
    userId?: string;
    onUpgrade: (variant: 'soft' | 'hard' | 'therapist') => void;
    loading?: boolean;
}

export default function PaywallABTest({ userId, onUpgrade, loading }: PaywallABTestProps) {
    const [selectedVariant, setSelectedVariant] = useState<'soft' | 'hard' | 'therapist'>('soft');
    const [isLoading, setIsLoading] = useState(false);
    const abTestingEnabled = useFeatureFlag('ab_testing_paywall');

    // Don't render if feature is disabled
    if (!abTestingEnabled) {
        return null;
    }

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Track which variant was chosen
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', 'paywall_variant_chosen', {
                    event_category: 'engagement',
                    event_label: selectedVariant,
                    value: 1
                });
            }

            await onUpgrade(selectedVariant);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Выберите свой путь к себе
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Три подхода к самопознанию. Один результат — глубокое понимание себя.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div
                    className={`cursor-pointer p-6 rounded-2xl transition-all ${selectedVariant === 'soft'
                            ? 'bg-violet-50 border-2 border-violet-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    onClick={() => setSelectedVariant('soft')}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Мягкий</h3>
                        <p className="text-gray-600">
                            Поддержка и принятие. Для тех, кто ищет деликатное сопровождение.
                        </p>
                    </div>
                </div>

                <div
                    className={`cursor-pointer p-6 rounded-2xl transition-all ${selectedVariant === 'hard'
                            ? 'bg-violet-50 border-2 border-violet-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    onClick={() => setSelectedVariant('hard')}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Жёсткий</h3>
                        <p className="text-gray-600">
                            Вызов и правда. Для тех, кто готов к честному разговору с собой.
                        </p>
                    </div>
                </div>

                <div
                    className={`cursor-pointer p-6 rounded-2xl transition-all ${selectedVariant === 'therapist'
                            ? 'bg-violet-50 border-2 border-violet-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    onClick={() => setSelectedVariant('therapist')}
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Терапевт</h3>
                        <p className="text-gray-600">
                            Профессиональный подход. Для тех, кто ищет глубокую проработку.
                        </p>
                    </div>
                </div>
            </div>

            <PaywallVariant
                variant={selectedVariant}
                onUpgrade={handleUpgrade}
                loading={loading || isLoading}
            />

            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                        12,482 человека уже выбрали свой путь
                    </span>
                </div>
            </div>
        </div>
    );
}