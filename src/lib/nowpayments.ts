// NOWPayments криптоплатежи интеграция
import crypto from 'crypto';

export interface CryptoPayment {
    id: string;
    payment_status: string;
    pay_address: string;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    pay_currency: string;
    payment_url: string;
    created_at: string;
}

export interface CreatePaymentRequest {
    price_amount: number;
    price_currency: string;
    pay_currency?: string;
    order_id: string;
    order_description: string;
    success_url: string;
    cancel_url: string;
}

class NOWPaymentsClient {
    private apiKey: string;
    private apiUrl = 'https://api.nowpayments.io/v1';
    private isDemo: boolean;

    constructor() {
        this.apiKey = process.env.NOWPAYMENTS_API_KEY!;
        this.isDemo = !this.apiKey || this.apiKey.startsWith('NPM_DEMO') || this.apiKey.startsWith('demo');

        if (!this.apiKey) {
            console.warn('NOWPAYMENTS_API_KEY not configured, running in demo mode');
            this.apiKey = 'demo_key';
        }
    }

    // Создание платежа
    async createPayment(data: CreatePaymentRequest): Promise<CryptoPayment> {
        // Демо-режим: возвращаем мок-данные
        if (this.isDemo) {
            console.log('🧪 NOWPayments Demo Mode: Creating mock payment');
            return {
                id: `demo_payment_${Date.now()}`,
                payment_status: 'waiting',
                pay_address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
                price_amount: data.price_amount,
                price_currency: data.price_currency,
                pay_amount: data.price_amount * 0.000017, // Mock BTC rate
                pay_currency: data.pay_currency || 'btc',
                payment_url: `https://nowpayments.io/payment/?iid=demo_${Date.now()}`,
                created_at: new Date().toISOString()
            };
        }

        const response = await fetch(`${this.apiUrl}/payment`, {
            method: 'POST',
            headers: {
                'x-api-key': this.apiKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`NOWPayments error: ${error}`);
        }

        return await response.json();
    }

    // Получение статуса платежа
    async getPaymentStatus(paymentId: string): Promise<CryptoPayment> {
        const response = await fetch(`${this.apiUrl}/payment/${paymentId}`, {
            headers: {
                'x-api-key': this.apiKey,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get payment status');
        }

        return await response.json();
    }

    // Проверка webhook подписи
    verifyWebhook(payload: string, signature: string): boolean {
        const secret = process.env.NOWPAYMENTS_IPN_SECRET!;

        if (!secret) {
            console.error('NOWPAYMENTS_IPN_SECRET not configured');
            return false;
        }

        const expectedSignature = crypto
            .createHmac('sha512', secret)
            .update(payload)
            .digest('hex');

        const isValid = signature === expectedSignature;

        if (!isValid) {
            console.error('IPN signature mismatch:', {
                received: signature?.substring(0, 10) + '...',
                expected: expectedSignature?.substring(0, 10) + '...'
            });
        }

        return isValid;
    }

    // Получение доступных валют
    async getAvailableCurrencies(): Promise<string[]> {
        // Демо-режим: возвращаем поддерживаемые валюты
        if (this.isDemo) {
            console.log('🧪 NOWPayments Demo Mode: Returning supported currencies');
            return ['btc', 'eth', 'usdt', 'usdc', 'ltc', 'xmr'];
        }

        try {
            const response = await fetch(`${this.apiUrl}/currencies`, {
                headers: {
                    'x-api-key': this.apiKey,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data.currencies || [];
        } catch (error) {
            console.error('NOWPayments get currencies error:', error);
            throw error;
        }
    }

    // Проверка статуса API
    async checkStatus(): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}/status`, {
                headers: {
                    'x-api-key': this.apiKey,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('NOWPayments status check error:', error);
            return false;
        }
    }
}

export const nowpaymentsClient = new NOWPaymentsClient();

// Тарифные планы в USD (удобнее для крипты)
export const CRYPTO_PLANS = {
    '24h': {
        amount: 5.99, // $5.99
        currency: 'USD',
        description: 'EDEM PRO - доступ на 24 часа',
        duration: 24 * 60 * 60 * 1000, // 24 часа в миллисекундах
    },
    '30d': {
        amount: 19.99, // $19.99
        currency: 'USD',
        description: 'EDEM PRO - доступ на 30 дней',
        duration: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
    },
} as const;

export type CryptoPlan = keyof typeof CRYPTO_PLANS;