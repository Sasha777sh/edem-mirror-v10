'use client';

import { useState } from 'react';
import { Bitcoin, CheckCircle, ExternalLink, Loader } from 'lucide-react';

export default function DemoCryptoPage() {
    const [step, setStep] = useState<'select' | 'payment' | 'success'>('select');
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    const createPayment = async (plan: '24h' | '30d', crypto: string) => {
        setLoading(true);

        try {
            const response = await fetch('/api/crypto/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    crypto_currency: crypto
                })
            });

            const data = await response.json();

            if (data.payment_url) {
                setPaymentData(data);
                setStep('payment');
            } else {
                throw new Error(data.error || 'Ошибка создания платежа');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
        } finally {
            setLoading(false);
        }
    };

    const simulateSuccess = () => {
        setStep('success');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🚀 EDEM Криптоплатежи
                    </h1>
                    <p className="text-xl text-gray-600">
                        Демо-тестирование NOWPayments интеграции
                    </p>
                </div>

                {step === 'select' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <h2 className="text-2xl font-semibold mb-6 text-center">
                            Выберите план и криптовалюту
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            {/* 24h план */}
                            <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-violet-300 transition-colors">
                                <h3 className="text-xl font-semibold mb-2">24 часа PRO</h3>
                                <div className="text-3xl font-bold text-violet-600 mb-4">$5.99</div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                    <li>✓ Все голоса EDEM</li>
                                    <li>✓ Безлимитные сообщения</li>
                                    <li>✓ История на 24 часа</li>
                                </ul>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Выберите криптовалюту:</div>
                                    {['btc', 'eth', 'usdt'].map(crypto => (
                                        <button
                                            key={crypto}
                                            onClick={() => createPayment('24h', crypto)}
                                            disabled={loading}
                                            className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <Bitcoin className="w-5 h-5" />
                                            <span className="font-medium">{crypto.toUpperCase()}</span>
                                            {loading && <Loader className="w-4 h-4 animate-spin ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 30d план */}
                            <div className="border-2 border-violet-300 rounded-xl p-6 bg-violet-50">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-semibold">30 дней PRO</h3>
                                    <span className="bg-violet-600 text-white text-xs px-2 py-1 rounded">ПОПУЛЯРНЫЙ</span>
                                </div>
                                <div className="text-3xl font-bold text-violet-600 mb-4">$19.99</div>
                                <ul className="text-sm text-gray-600 space-y-2 mb-6">
                                    <li>✓ Полные отчёты с архетипами</li>
                                    <li>✓ PDF экспорт</li>
                                    <li>✓ История на 30 дней</li>
                                    <li>✓ Практики и шаги</li>
                                </ul>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Выберите криптовалюту:</div>
                                    {['btc', 'eth', 'usdt'].map(crypto => (
                                        <button
                                            key={crypto}
                                            onClick={() => createPayment('30d', crypto)}
                                            disabled={loading}
                                            className="w-full flex items-center gap-3 p-3 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-50"
                                        >
                                            <Bitcoin className="w-5 h-5" />
                                            <span className="font-medium">{crypto.toUpperCase()}</span>
                                            {loading && <Loader className="w-4 h-4 animate-spin ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'payment' && paymentData && (
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold mb-2">Платёж создан!</h2>
                            <p className="text-gray-600">Отправьте точную сумму на указанный адрес</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600">Сумма к оплате:</div>
                                <div className="text-2xl font-bold">
                                    {paymentData.pay_amount} {paymentData.pay_currency?.toUpperCase()}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-2">Адрес для оплаты:</div>
                                <code className="block bg-white p-2 rounded border text-sm break-all">
                                    {paymentData.pay_address}
                                </code>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-600">Payment ID:</div>
                                <div className="font-mono text-sm">{paymentData.payment_id}</div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <a
                                href={paymentData.payment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Открыть страницу оплаты
                            </a>

                            <button
                                onClick={simulateSuccess}
                                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700"
                            >
                                🧪 Симулировать успех
                            </button>
                        </div>

                        <div className="text-xs text-gray-500 text-center mt-4">
                            После отправки средств подписка активируется автоматически
                        </div>
                    </div>
                )}

                {step === 'success' && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-3xl font-bold text-green-600 mb-4">Платёж успешен!</h2>
                        <p className="text-xl text-gray-600 mb-6">
                            Ваша PRO подписка активирована
                        </p>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-green-800 mb-2">Что теперь доступно:</h3>
                            <ul className="text-sm text-green-700 space-y-1">
                                <li>✓ Все голоса EDEM</li>
                                <li>✓ Полные отчёты с архетипами</li>
                                <li>✓ PDF экспорт</li>
                                <li>✓ Практики и шаги на день</li>
                                <li>✓ История без ограничений</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => window.location.href = '/app'}
                            className="bg-violet-600 text-white py-3 px-8 rounded-lg hover:bg-violet-700 text-lg font-medium"
                        >
                            Перейти в приложение
                        </button>
                    </div>
                )}

                {/* Индикатор демо-режима */}
                <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-yellow-600">🧪</span>
                        <span className="font-medium text-yellow-800">Демо-режим</span>
                    </div>
                    <div className="text-yellow-700 text-xs mt-1">
                        Реальные платежи не обрабатываются
                    </div>
                </div>
            </div>
        </div>
    );
}