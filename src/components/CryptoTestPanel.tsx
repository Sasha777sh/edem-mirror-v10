'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader, RefreshCw, Activity } from 'lucide-react';

interface TestResult {
    success: boolean;
    message: string;
    data?: any;
    error?: string;
    details?: string;
    help?: any;
}

interface IPNEvent {
    id: string;
    event_type: string;
    properties: any;
    timestamp: string;
    user_id?: string;
}

export default function CryptoTestPanel() {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);
    const [ipnEvents, setIpnEvents] = useState<IPNEvent[]>([]);
    const [showIPN, setShowIPN] = useState(false);

    const loadIPNEvents = async () => {
        try {
            const response = await fetch('/api/crypto/ipn-monitor');
            const data = await response.json();
            if (data.success) {
                setIpnEvents(data.data.recent_events || []);
            }
        } catch (error) {
            console.error('Failed to load IPN events:', error);
        }
    };

    useEffect(() => {
        if (showIPN) {
            loadIPNEvents();
            // Обновляем каждые 30 секунд
            const interval = setInterval(loadIPNEvents, 30000);
            return () => clearInterval(interval);
        }
    }, [showIPN]);

    const runTest = async () => {
        setTesting(true);
        setResult(null);

        try {
            const response = await fetch('/api/crypto/test');
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({
                success: false,
                message: 'Ошибка',
                error: 'Ошибка сети',
                details: 'Не удалось подключиться к тестовому API'
            });
        } finally {
            setTesting(false);
        }
    };

    const createTestPayment = async () => {
        setTesting(true);

        try {
            const response = await fetch('/api/crypto/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: '24h',
                    crypto_currency: 'btc'
                })
            });

            const data = await response.json();

            if (data.payment_url) {
                // Открываем в новой вкладке
                window.open(data.payment_url, '_blank');
                setResult({
                    success: true,
                    message: 'Тестовый платёж создан!',
                    data: {
                        payment_id: data.payment_id,
                        amount: `${data.pay_amount} ${data.pay_currency.toUpperCase()}`,
                        address: data.pay_address
                    }
                });
            } else {
                throw new Error(data.error || 'Неизвестная ошибка');
            }
        } catch (error) {
            setResult({
                success: false,
                message: 'Ошибка',
                error: 'Ошибка создания платежа',
                details: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🔧 Тестирование NOWPayments API
            </h3>

            <div className="space-y-4">
                {/* Кнопки тестирования */}
                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={runTest}
                        disabled={testing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {testing ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        Проверить API
                    </button>

                    <button
                        onClick={createTestPayment}
                        disabled={testing || (result ? !result.success : false)}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
                    >
                        {testing ? <Loader className="w-4 h-4 animate-spin" /> : '💰'}
                        Создать тестовый платёж
                    </button>

                    <button
                        onClick={() => setShowIPN(!showIPN)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Activity className="w-4 h-4" />
                        {showIPN ? 'Скрыть' : 'Мониторинг'} IPN
                    </button>
                </div>

                {/* Результаты */}
                {result && (
                    <div className={`p-4 rounded-lg border ${result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            )}

                            <div className="flex-1">
                                <h4 className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'
                                    }`}>
                                    {result.message || (result.success ? 'Успешно' : 'Ошибка')}
                                </h4>

                                {result.error && (
                                    <p className="text-red-700 text-sm mt-1">
                                        {result.error}
                                    </p>
                                )}

                                {result.details && (
                                    <p className="text-gray-600 text-sm mt-1">
                                        {result.details}
                                    </p>
                                )}

                                {/* Данные успешного теста */}
                                {result.success && result.data && (
                                    <div className="mt-3 space-y-2">
                                        {result.data.available_currencies && (
                                            <div>
                                                <span className="text-sm font-medium text-green-800">
                                                    Доступные валюты:
                                                </span>
                                                <div className="flex gap-2 mt-1">
                                                    {result.data.available_currencies.map((currency: string) => (
                                                        <span
                                                            key={currency}
                                                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                                        >
                                                            {currency.toUpperCase()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {result.data.payment_id && (
                                            <div className="bg-green-100 p-3 rounded text-sm">
                                                <div><strong>Payment ID:</strong> {result.data.payment_id}</div>
                                                <div><strong>Сумма:</strong> {result.data.amount}</div>
                                                <div><strong>Адрес:</strong>
                                                    <code className="ml-2 bg-white px-2 py-1 rounded text-xs">
                                                        {result.data.address}
                                                    </code>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Советы по устранению ошибок */}
                                {!result.success && result.help && (
                                    <div className="mt-3 p-3 bg-red-100 rounded text-sm">
                                        <div className="font-medium text-red-800 mb-2">💡 Возможные решения:</div>
                                        <ul className="text-red-700 space-y-1">
                                            {Object.entries(result.help).map(([key, value]) => (
                                                <li key={key}>• {value as string}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Инструкции */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Что проверяется
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>✓ Корректность NOWPAYMENTS_API_KEY</li>
                        <li>✓ Наличие NOWPAYMENTS_IPN_SECRET</li>
                        <li>✓ Доступность API и поддерживаемых валют</li>
                        <li>✓ Создание реального тестового платежа</li>
                    </ul>
                </div>

                {/* IPN Мониторинг */}
                {showIPN && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-green-900 flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                IPN События (последние 50)
                            </h4>
                            <button
                                onClick={loadIPNEvents}
                                className="text-green-600 hover:text-green-800 text-sm"
                            >
                                Обновить
                            </button>
                        </div>

                        {ipnEvents.length === 0 ? (
                            <p className="text-green-700 text-sm">
                                🔍 Пока нет IPN событий. Создайте тестовый платёж.
                            </p>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {ipnEvents.slice(0, 10).map(event => (
                                    <div key={event.id} className="bg-white p-3 rounded border text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-green-800">
                                                {event.event_type}
                                            </span>
                                            <span className="text-green-600 text-xs">
                                                {new Date(event.timestamp).toLocaleString('ru-RU')}
                                            </span>
                                        </div>
                                        {event.properties && (
                                            <div className="text-green-700 text-xs">
                                                Payment ID: {event.properties.payment_id || 'Нет'} |
                                                Status: {event.properties.payment_status || 'Нет'}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}