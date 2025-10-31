'use client';

import { useState, useEffect } from 'react';
import CryptoTestPanel from '@/components/CryptoTestPanel';
import { Copy, ExternalLink, Settings } from 'lucide-react';

export default function CryptoAdminPage() {
    const [envStatus, setEnvStatus] = useState({
        api_key: false,
        ipn_secret: false,
        app_url: false
    });

    useEffect(() => {
        // Проверяем статус переменных окружения (на клиенте это ограничено)
        setEnvStatus({
            api_key: !!process.env.NEXT_PUBLIC_NOWPAYMENTS_API_KEY,
            ipn_secret: true, // Не можем проверить на клиенте
            app_url: !!process.env.NEXT_PUBLIC_APP_URL
        });
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🔧 Настройка NOWPayments
                    </h1>
                    <p className="text-gray-600">
                        Панель для настройки и тестирования криптоплатежей
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Статус конфигурации */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Статус конфигурации
                        </h3>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">NOWPAYMENTS_API_KEY</span>
                                <span className={`px-2 py-1 rounded text-sm ${envStatus.api_key
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {envStatus.api_key ? '✓ Настроен' : '✗ Не настроен'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">NOWPAYMENTS_IPN_SECRET</span>
                                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                                    ℹ Проверяется на сервере
                                </span>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium">NEXT_PUBLIC_APP_URL</span>
                                <span className={`px-2 py-1 rounded text-sm ${envStatus.app_url
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {envStatus.app_url ? '✓ Настроен' : '✗ Не настроен'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Панель тестирования */}
                    <CryptoTestPanel />

                    {/* Инструкции по настройке */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            📋 Пошаговая настройка
                        </h3>

                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-medium text-blue-900">1. Получение API ключей</h4>
                                <p className="text-sm text-blue-700 mt-1">
                                    Зарегистрируйтесь на NOWPayments и получите API ключи
                                </p>
                                <a
                                    href="https://account.nowpayments.io/"
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-blue-600 text-sm hover:underline mt-2"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Открыть NOWPayments дашборд
                                </a>
                            </div>

                            <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-medium text-green-900">2. Настройка .env</h4>
                                <p className="text-sm text-green-700 mt-1">
                                    Добавьте ключи в файл .env
                                </p>
                                <div className="bg-gray-100 p-3 rounded mt-2 text-sm font-mono">
                                    <div>NOWPAYMENTS_API_KEY="ваш_api_ключ"</div>
                                    <div>NOWPAYMENTS_IPN_SECRET="ваш_ipn_секрет"</div>
                                </div>
                            </div>

                            <div className="border-l-4 border-violet-500 pl-4">
                                <h4 className="font-medium text-violet-900">3. Настройка IPN webhook</h4>
                                <p className="text-sm text-violet-700 mt-1">
                                    Укажите URL для уведомлений в NOWPayments дашборде
                                </p>
                                <div className="bg-violet-50 p-3 rounded mt-2 text-sm space-y-2">
                                    <div>
                                        <strong>IPN Secret:</strong> <code className="bg-white px-2 py-1 rounded">saEE3zaJr+LKolEKwqLmZ2gUB1Lrhiuv</code> ✅
                                    </div>
                                    <div>
                                        <strong>Webhook URL:</strong>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="bg-white px-2 py-1 rounded text-xs">
                                                https://miror.vercel.app/api/crypto/ipn
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard('https://miror.vercel.app/api/crypto/ipn')}
                                                className="p-1 hover:bg-violet-200 rounded"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <strong>Повторяющиеся уведомления:</strong> 3 уведомления через 5 минут
                                    </div>
                                    <div>
                                        <strong>Формат:</strong> Классический способ (рекомендуем)
                                    </div>
                                </div>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-medium text-orange-900">4. Тестирование</h4>
                                <p className="text-sm text-orange-700 mt-1">
                                    Используйте кнопки выше для проверки настроек и создания тестового платежа
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Поддерживаемые валюты */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            💰 Поддерживаемые криптовалюты
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                                { code: 'BTC', name: 'Bitcoin', icon: '₿' },
                                { code: 'ETH', name: 'Ethereum', icon: 'Ξ' },
                                { code: 'USDT', name: 'Tether', icon: '₮' },
                                { code: 'USDC', name: 'USD Coin', icon: '$' },
                                { code: 'LTC', name: 'Litecoin', icon: 'Ł' },
                                { code: 'XMR', name: 'Monero', icon: 'ɱ' }
                            ].map(crypto => (
                                <div key={crypto.code} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-2xl">{crypto.icon}</span>
                                    <div>
                                        <div className="font-medium">{crypto.code}</div>
                                        <div className="text-sm text-gray-600">{crypto.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}