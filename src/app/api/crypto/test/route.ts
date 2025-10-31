import { NextRequest, NextResponse } from 'next/server';
import { nowpaymentsClient } from '@/lib/nowpayments';

// Тестовый эндпоинт для проверки NOWPayments конфигурации
export async function GET(req: NextRequest) {
    try {
        // Проверяем что API ключ настроен
        if (!process.env.NOWPAYMENTS_API_KEY) {
            return NextResponse.json({
                success: false,
                error: 'NOWPAYMENTS_API_KEY не настроен',
                details: 'Добавьте ключ в .env файл'
            }, { status: 500 });
        }

        if (!process.env.NOWPAYMENTS_IPN_SECRET) {
            return NextResponse.json({
                success: false,
                error: 'NOWPAYMENTS_IPN_SECRET не настроен',
                details: 'Добавьте IPN секрет в .env файл'
            }, { status: 500 });
        }

        // Тестируем получение доступных валют
        const currencies = await nowpaymentsClient.getAvailableCurrencies();

        // Фильтруем поддерживаемые EDEM валюты
        const supportedCryptos = ['btc', 'eth', 'usdt', 'usdc', 'ltc', 'xmr'];
        const availableCryptos = currencies.filter(c =>
            supportedCryptos.includes(c.toLowerCase())
        );

        // Создаём тестовый платёж (без сохранения)
        const testOrderId = `test_${Date.now()}`;

        return NextResponse.json({
            success: true,
            message: 'NOWPayments API работает корректно',
            data: {
                api_key_configured: true,
                ipn_secret_configured: true,
                available_currencies: availableCryptos,
                test_order_id: testOrderId,
                supported_plans: {
                    '24h': '$5.99 USD',
                    '30d': '$19.99 USD'
                }
            }
        });

    } catch (error) {
        console.error('NOWPayments test error:', error);

        return NextResponse.json({
            success: false,
            error: 'Ошибка подключения к NOWPayments API',
            details: error instanceof Error ? error.message : 'Неизвестная ошибка',
            help: {
                check_api_key: 'Проверьте правильность API ключа',
                check_network: 'Убедитесь что есть доступ к интернету',
                check_status: 'Проверьте статус NOWPayments сервиса'
            }
        }, { status: 500 });
    }
}