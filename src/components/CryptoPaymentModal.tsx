'use client';

import { useState } from 'react';
import { X, Bitcoin, DollarSign, Copy, ExternalLink } from 'lucide-react';

interface CryptoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: '24h' | '30d';
}

interface PaymentData {
    payment_url: string;
    payment_id: string;
    pay_address: string;
    pay_amount: number;
    pay_currency: string;
}

const CRYPTO_CURRENCIES = [
    { code: 'btc', name: 'Bitcoin', icon: '₿' },
    { code: 'eth', name: 'Ethereum', icon: 'Ξ' },
    { code: 'usdt', name: 'USDT', icon: '₮' },
    { code: 'usdc', name: 'USDC', icon: '$' },
    { code: 'ltc', name: 'Litecoin', icon: 'Ł' },
    { code: 'xmr', name: 'Monero', icon: 'ɱ' },
];

export default function CryptoPaymentModal({ isOpen, onClose, plan }: CryptoPaymentModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedCrypto, setSelectedCrypto] = useState('btc');
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [copied, setCopied] = useState(false);

    const planDetails = {
        '24h': {
            name: '24 часа PRO',
            price: '$5.99',
            description: 'Полный доступ ко всем функциям на сутки'
        },
        '30d': {
            name: '30 дней PRO',
            price: '$19.99',
            description: 'Месячная подписка с полным функционалом'
        }
    };

    const handleCreatePayment = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/crypto/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan,
                    crypto_currency: selectedCrypto
                })
            });

            const data = await response.json();

            if (data.payment_url) {
                setPaymentData(data);
            } else {
                throw new Error('Не удалось создать платёж');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Ошибка при создании платежа. Попробуйте ещё раз.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {paymentData ? 'Оплата криптовалютой' : 'Выберите криптовалюту'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {!paymentData ? (
                        <>
                            {/* План */}
                            <div className="bg-violet-50 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-violet-900">
                                    {planDetails[plan].name}
                                </h3>
                                <p className="text-sm text-violet-700 mb-2">
                                    {planDetails[plan].description}
                                </p>
                                <div className="text-2xl font-bold text-violet-900">
                                    {planDetails[plan].price}
                                </div>
                            </div>

                            {/* Выбор криптовалюты */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Выберите криптовалюту для оплаты:
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {CRYPTO_CURRENCIES.map((crypto) => (
                                        <button
                                            key={crypto.code}
                                            onClick={() => setSelectedCrypto(crypto.code)}
                                            className={`p-3 rounded-lg border text-left transition-colors ${selectedCrypto === crypto.code
                                                    ? 'border-violet-500 bg-violet-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{crypto.icon}</span>
                                                <div>
                                                    <div className="font-medium">{crypto.name}</div>
                                                    <div className="text-xs text-gray-500 uppercase">
                                                        {crypto.code}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Кнопка создания платежа */}
                            <button
                                onClick={handleCreatePayment}
                                disabled={loading}
                                className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Создание платежа...' : 'Создать платёж'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Данные для оплаты */}
                            <div className="space-y-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-green-800 mb-2">
                                        Платёж создан!
                                    </h3>
                                    <p className="text-sm text-green-700">
                                        Отправьте точную сумму на указанный адрес
                                    </p>
                                </div>

                                {/* Сумма */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600">Сумма к оплате:</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {paymentData.pay_amount} {paymentData.pay_currency.toUpperCase()}
                                    </div>
                                </div>

                                {/* Адрес */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 mb-2">
                                        Адрес для оплаты:
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 bg-white p-2 rounded border text-sm break-all">
                                            {paymentData.pay_address}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(paymentData.pay_address)}
                                            className="p-2 hover:bg-gray-200 rounded"
                                            title="Копировать адрес"
                                        >
                                            <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-gray-600'}`} />
                                        </button>
                                    </div>
                                    {copied && (
                                        <div className="text-xs text-green-600 mt-1">
                                            Адрес скопирован!
                                        </div>
                                    )}
                                </div>

                                {/* Кнопка открытия внешней страницы */}
                                <a
                                    href={paymentData.payment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-violet-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-violet-700 flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Открыть страницу оплаты
                                </a>

                                <div className="text-xs text-gray-500 text-center">
                                    После отправки средств подписка активируется автоматически
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}