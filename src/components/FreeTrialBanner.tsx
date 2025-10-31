'use client';

import { useState, useEffect } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { Clock, Gift, Star, CheckCircle } from 'lucide-react';

interface FreeTrialBannerProps {
    className?: string;
}

interface TrialStatus {
    has_trial: boolean;
    is_active: boolean;
    days_remaining: number;
    ends_at?: string;
    can_start_trial: boolean;
    auto_upgrade: boolean;
}

export default function FreeTrialBanner({ className = '' }: FreeTrialBannerProps) {
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const freeTrialEnabled = useFeatureFlag('free_trial');

    useEffect(() => {
        if (freeTrialEnabled) {
            fetchTrialStatus();
        }
    }, [freeTrialEnabled]);

    const fetchTrialStatus = async () => {
        try {
            setError(null);
            const response = await fetch('/api/trial');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setTrialStatus(data);
        } catch (err) {
            console.error('Failed to fetch trial status:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const startTrial = async () => {
        try {
            setStarting(true);
            setError(null);

            const response = await fetch('/api/trial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'start',
                    auto_upgrade: false
                }),
            });

            const data = await response.json();

            if (response.ok) {
                await fetchTrialStatus();
                // Reload page to update subscription status
                window.location.reload();
            } else {
                setError(data.message || 'Не удалось активировать пробный период');
            }
        } catch (err) {
            console.error('Failed to start trial:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setStarting(false);
        }
    };

    // Don't render if feature is disabled
    if (!freeTrialEnabled) {
        return null;
    }

    if (loading) {
        return (
            <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white ${className}`}>
                <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (!trialStatus) {
        return null;
    }

    // Active trial banner
    if (trialStatus.is_active) {
        return (
            <div className={`bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">PRO активен</h3>
                            <p className="text-sm text-green-100">
                                Пробный период: осталось {trialStatus.days_remaining} {trialStatus.days_remaining === 1 ? 'день' : 'дней'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold">{trialStatus.days_remaining}</div>
                        <div className="text-xs text-green-100">дней</div>
                    </div>
                </div>

                {trialStatus.days_remaining <= 2 && (
                    <div className="mt-3 p-3 bg-white bg-opacity-20 rounded-lg">
                        <p className="text-sm mb-2">Пробный период скоро закончится</p>
                        <a
                            href="/app/billing"
                            className="inline-flex items-center px-3 py-1 bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
                        >
                            Продлить PRO
                        </a>
                    </div>
                )}
            </div>
        );
    }

    // Can start trial
    if (trialStatus.can_start_trial) {
        return (
            <div className={`bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white ${className}`}>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Gift className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">
                            🎁 7 дней PRO бесплатно!
                        </h3>
                        <p className="text-purple-100 mb-4">
                            Получите полный доступ ко всем возможностям EDEM без ограничений
                        </p>

                        {/* Features list */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            {[
                                'Безлимитные ритуалы',
                                'Архетипы и анализ',
                                '5-минутные практики',
                                'PDF отчёты',
                                'История за 30 дней',
                                'Экспорт журнала'
                            ].map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-300" />
                                    <span className="text-purple-100">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={startTrial}
                            disabled={starting}
                            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50"
                        >
                            {starting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Активация...
                                </>
                            ) : (
                                <>
                                    <Gift className="w-5 h-5 mr-2" />
                                    Начать бесплатно
                                </>
                            )}
                        </button>

                        <p className="text-xs text-purple-200 mt-2">
                            Без автопродления. Отменить можно в любой момент.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Trial used but not active
    if (trialStatus.has_trial && !trialStatus.is_active) {
        return (
            <div className={`bg-gray-100 border border-gray-200 rounded-xl p-4 ${className}`}>
                <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-gray-500" />
                    <div>
                        <h3 className="font-medium text-gray-900">Пробный период завершён</h3>
                        <p className="text-sm text-gray-600">
                            Оформите подписку для продолжения использования PRO функций
                        </p>
                    </div>
                </div>
                <div className="mt-3">
                    <a
                        href="/app/billing"
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                        Купить PRO
                    </a>
                </div>
            </div>
        );
    }

    return null;
}

// Compact version for sidebar
interface TrialStatusWidgetProps {
    className?: string;
}

export function TrialStatusWidget({ className = '' }: TrialStatusWidgetProps) {
    const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const freeTrialEnabled = useFeatureFlag('free_trial');

    useEffect(() => {
        if (freeTrialEnabled) {
            fetchTrialStatus();
        }
    }, [freeTrialEnabled]);

    const fetchTrialStatus = async () => {
        try {
            const response = await fetch('/api/trial');
            if (response.ok) {
                const data = await response.json();
                setTrialStatus(data);
            }
        } catch (err) {
            console.error('Failed to fetch trial status:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!freeTrialEnabled || loading || !trialStatus?.is_active) {
        return null;
    }

    return (
        <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">PRO Trial</span>
            </div>
            <p className="text-xs text-green-700">
                {trialStatus.days_remaining} {trialStatus.days_remaining === 1 ? 'день' : 'дней'} осталось
            </p>
        </div>
    );
}