'use client';

import { useState } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, ExternalLink } from 'lucide-react';

interface Subscription {
    id: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    plan: string;
    status: string;
    period_end: string | null;
    created_at: string;
}

interface BillingCardProps {
    subscription: Subscription | null;
    isProUser: boolean;
    userId: string;
}

export default function BillingCard({ subscription, isProUser, userId }: BillingCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async (priceId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Error opening customer portal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            case 'past_due': return 'bg-yellow-100 text-yellow-800';
            case 'incomplete': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Активна';
            case 'canceled': return 'Отменена';
            case 'past_due': return 'Просрочена';
            case 'incomplete': return 'Неполная';
            default: return status;
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm">
            {isProUser && subscription ? (
                // PRO User Card
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Crown className="w-6 h-6 text-yellow-500" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">PRO подписка</h2>
                                <p className="text-gray-600">Полный доступ ко всем возможностям</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)
                            }`}>
                            {getStatusText(subscription.status)}
                        </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Следующее списание</span>
                                </div>
                                <p className="font-semibold">
                                    {subscription.period_end ? formatDate(subscription.period_end) : 'Не указано'}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                    <CreditCard className="w-4 h-4" />
                                    <span className="text-sm">План</span>
                                </div>
                                <p className="font-semibold capitalize">{subscription.plan}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="text-gray-600 text-sm mb-1">Подписка с</div>
                                <p className="font-semibold">
                                    {formatDate(subscription.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {subscription.status === 'past_due' && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h3 className="font-medium text-yellow-800">Требуется обновление способа оплаты</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Последний платёж не прошёл. Обновите данные карты в портале управления.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                    >
                        <CreditCard className="w-4 h-4" />
                        {isLoading ? 'Загрузка...' : 'Управлять подпиской'}
                        <ExternalLink className="w-3 h-3" />
                    </button>
                </div>
            ) : (
                // Free User Card
                <div>
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Crown className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Free план</h2>
                        <p className="text-gray-600">
                            У вас базовый доступ. Открыйте PRO для полных возможностей.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-violet-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-violet-900 mb-1">499₽</div>
                            <div className="text-sm text-violet-700">24 часа</div>
                        </div>
                        <div className="bg-violet-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-violet-900 mb-1">1 499₽</div>
                            <div className="text-sm text-violet-700">30 дней</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_24H!)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isLoading ? 'Загрузка...' : 'Попробовать 24 часа'}
                        </button>

                        <button
                            onClick={() => handleUpgrade(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_30D!)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 border border-violet-600 text-violet-600 rounded-lg hover:bg-violet-50 disabled:opacity-50 transition-colors font-medium"
                        >
                            {isLoading ? 'Загрузка...' : 'Взять на месяц'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}