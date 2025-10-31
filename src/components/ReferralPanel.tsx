'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

interface ReferralPanelProps {
    className?: string;
}

interface ReferralData {
    code: string;
    link: string;
    usage_count: number;
    max_uses: number;
    created_at: string;
}

interface ReferralStats {
    total_referrals: number;
    successful_conversions: number;
    total_bonus_earned: number;
    conversion_rate: number;
    last_referral_date?: string;
}

export default function ReferralPanel({ className = '' }: ReferralPanelProps) {
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const referralSystemEnabled = useFeatureFlag('referral_system');

    useEffect(() => {
        if (referralSystemEnabled) {
            fetchReferralData();
            fetchStats();
        }
    }, [referralSystemEnabled]);

    const fetchReferralData = async () => {
        try {
            setError(null);
            const response = await fetch('/api/referrals?action=code');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setReferralData(data);
        } catch (err) {
            console.error('Failed to fetch referral data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/referrals?action=stats');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch referral stats:', err);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            setCopying(true);
            await navigator.clipboard.writeText(text);
            setTimeout(() => setCopying(false), 2000);
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            setCopying(false);
        }
    };

    const shareViaWebAPI = async () => {
        if (!referralData) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'EDEM — зеркало твоих эмоций',
                    text: 'Попробуй EDEM бесплатно и получи 3 дня PRO в подарок!',
                    url: referralData.link
                });
            } catch (err) {
                console.error('Failed to share:', err);
            }
        } else {
            // Fallback to copy
            copyToClipboard(referralData.link);
        }
    };

    // Don't render if feature is disabled
    if (!referralSystemEnabled) {
        return null;
    }

    if (loading) {
        return (
            <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Ошибка: {error}</p>
                    <button
                        onClick={fetchReferralData}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    🎁 Приглашай друзей
                </h2>
                <p className="text-gray-600 text-sm">
                    За каждого приглашённого друга ты получаешь 7 дней PRO, а он — 3 дня в подарок
                </p>
            </div>

            {/* Referral Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-violet-600">{stats.total_referrals}</div>
                        <div className="text-xs text-gray-600">Приглашений</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.successful_conversions}</div>
                        <div className="text-xs text-gray-600">Регистраций</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.total_bonus_earned}</div>
                        <div className="text-xs text-gray-600">Дней PRO</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{stats.conversion_rate}%</div>
                        <div className="text-xs text-gray-600">Конверсия</div>
                    </div>
                </div>
            )}

            {/* Referral Code and Link */}
            {referralData && (
                <div className="space-y-4">
                    {/* Referral Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Твой код:
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-lg font-bold text-center">
                                {referralData.code}
                            </div>
                            <button
                                onClick={() => copyToClipboard(referralData.code)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {copying ? '✓' : 'Копировать'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Использован {referralData.usage_count} из {referralData.max_uses} раз
                        </p>
                    </div>

                    {/* Referral Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Реферальная ссылка:
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={referralData.link}
                                readOnly
                                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                            />
                            <button
                                onClick={() => copyToClipboard(referralData.link)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {copying ? '✓' : 'Копировать'}
                            </button>
                        </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            onClick={shareViaWebAPI}
                            className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                        >
                            📱 Поделиться
                        </button>
                        <button
                            onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(referralData.link)}&text=${encodeURIComponent('Попробуй EDEM бесплатно и получи 3 дня PRO в подарок!')}`)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Telegram
                        </button>
                        <button
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Попробуй EDEM бесплатно и получи 3 дня PRO в подарок! ${referralData.link}`)}`)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                            WhatsApp
                        </button>
                    </div>

                    {/* How it works */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Как это работает:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Поделись ссылкой или кодом с друзьями</li>
                            <li>• Когда друг регистрируется, он получает 3 дня PRO</li>
                            <li>• Ты получаешь 7 дней PRO за каждого друга</li>
                            <li>• Бонусы суммируются и продлевают подписку</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

// Component for entering referral code during signup
interface ReferralCodeInputProps {
    onCodeValidated?: (valid: boolean, referrerEmail?: string) => void;
    className?: string;
}

export function ReferralCodeInput({ onCodeValidated, className = '' }: ReferralCodeInputProps) {
    const [code, setCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<{ valid: boolean, referrerEmail?: string } | null>(null);

    const validateCode = async (inputCode: string) => {
        if (!inputCode || inputCode.length < 4) {
            setValidationResult(null);
            onCodeValidated?.(false);
            return;
        }

        setValidating(true);
        try {
            const response = await fetch(`/api/referrals?action=validate&code=${encodeURIComponent(inputCode)}`);
            const result = await response.json();

            setValidationResult(result);
            onCodeValidated?.(result.valid, result.referrerEmail);
        } catch (err) {
            console.error('Failed to validate code:', err);
            setValidationResult({ valid: false });
            onCodeValidated?.(false);
        } finally {
            setValidating(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (code) {
                validateCode(code);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [code]);

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Реферальный код (необязательно)
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABCD1234"
                    className={`w-full px-3 py-2 border rounded-lg font-mono ${validationResult?.valid
                            ? 'border-green-500 bg-green-50'
                            : validationResult?.valid === false
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-300'
                        }`}
                    maxLength={20}
                />
                {validating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {validationResult?.valid && (
                <p className="text-sm text-green-600 mt-1">
                    ✓ Код действителен! Приглашение от {validationResult.referrerEmail}.
                    Вы получите 3 дня PRO в подарок.
                </p>
            )}

            {validationResult?.valid === false && code.length >= 4 && (
                <p className="text-sm text-red-600 mt-1">
                    ✗ Код недействителен или истёк
                </p>
            )}
        </div>
    );
}