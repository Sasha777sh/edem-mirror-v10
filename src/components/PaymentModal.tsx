'use client';

import { useState } from 'react';
import { X, CreditCard, Bitcoin, Zap } from 'lucide-react';
import CryptoPaymentModal from './CryptoPaymentModal';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: '24h' | '30d';
    price: string;
    title: string;
}

export default function PaymentModal({ isOpen, onClose, plan, price, title }: PaymentModalProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [showCrypto, setShowCrypto] = useState(false);

    const handleYooKassaPayment = async () => {
        setLoading('yookassa');

        try {
            const response = await fetch('/api/yookassa/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа. Попробуйте ещё раз.');
        } finally {
            setLoading(null);
        }
    };

    if (!isOpen) return null;

    const cryptoPrices = {
        '24h': '$5.99',
        '30d': '$19.99'
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl max-w-md w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <h2 className="text-xl font-semibold">Выберите способ оплаты</h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        {/* План */}
                        <div className="bg-violet-50 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-violet-900">{title}</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-violet-900">{cryptoPrices[plan]}</span>
                                <span className="text-sm text-violet-600 line-through">{price}</span>
                            </div>
                            <div className="mt-2 text-sm text-violet-700">
                                {plan === '24h' ? (
                                    'Все голоса, безлимитные сообщения на сутки'
                                ) : (
                                    'Полный отчёт, архетип, план и практики на месяц'
                                )}
                            </div>
                        </div>

                        {/* Способы оплаты */}
                        <div className="space-y-3">
                            {/* Криптовалюты */}
                            <button
                                onClick={() => setShowCrypto(true)}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors"
                            >
                                <Bitcoin className="w-6 h-6 text-orange-500" />
                                <div className="text-left">
                                    <div className="font-medium">Криптовалюта</div>
                                    <div className="text-sm text-gray-600">Bitcoin, Ethereum, USDT и другие</div>
                                </div>
                            </button>

                            {/* YooKassa для России */}
                            <button
                                onClick={handleYooKassaPayment}
                                disabled={loading === 'yookassa'}
                                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CreditCard className="w-6 h-6 text-blue-500" />
                                <div className="text-left">
                                    <div className="font-medium">
                                        {loading === 'yookassa' ? 'Создание платежа...' : 'Банковская карта (РФ)'}
                                    </div>
                                    <div className="text-sm text-gray-600">ЮKassa - рубли, быстро</div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-4 text-xs text-gray-500 text-center">
                            Безопасные платежи. Автоматическая активация.
                        </div>
                    </div>
                </div>
            </div>

            {/* Модал криптоплатежей */}
            <CryptoPaymentModal
                isOpen={showCrypto}
                onClose={() => setShowCrypto(false)}
                plan={plan}
            />
        </>
    );
}