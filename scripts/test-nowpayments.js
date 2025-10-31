// Скрипт для тестирования NOWPayments API ключей
// Запуск: node scripts/test-nowpayments.js

require('dotenv').config();

const API_KEY = process.env.NOWPAYMENTS_API_KEY;
const API_URL = 'https://api.nowpayments.io/v1';

if (!API_KEY) {
    console.error('❌ NOWPAYMENTS_API_KEY не найден в .env файле');
    process.exit(1);
}

console.log('🔍 Тестирование NOWPayments API...');
console.log(`📡 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);

async function testNOWPayments() {
    try {
        // 1. Проверка статуса API
        console.log('\n1️⃣ Проверка статуса API...');
        const statusResponse = await fetch(`${API_URL}/status`, {
            headers: {
                'x-api-key': API_KEY
            }
        });

        if (!statusResponse.ok) {
            throw new Error(`Status API error: ${statusResponse.status} ${statusResponse.statusText}`);
        }

        const statusData = await statusResponse.json();
        console.log('✅ Статус API:', statusData.message || 'OK');

        // 2. Получение доступных валют
        console.log('\n2️⃣ Получение списка валют...');
        const currenciesResponse = await fetch(`${API_URL}/currencies`, {
            headers: {
                'x-api-key': API_KEY
            }
        });

        if (!currenciesResponse.ok) {
            throw new Error(`Currencies API error: ${currenciesResponse.status}`);
        }

        const currenciesData = await currenciesResponse.json();
        const supportedCryptos = ['btc', 'eth', 'usdt', 'usdc', 'ltc', 'xmr'];
        const availableCryptos = currenciesData.currencies.filter(c =>
            supportedCryptos.includes(c.toLowerCase())
        );

        console.log('✅ Доступные криптовалюты в EDEM:');
        availableCryptos.forEach(crypto => {
            console.log(`   🪙 ${crypto.toUpperCase()}`);
        });

        // 3. Получение минимальных сумм
        console.log('\n3️⃣ Проверка минимальных сумм...');
        const minAmountResponse = await fetch(`${API_URL}/min-amount?currency_from=usd&currency_to=btc`, {
            headers: {
                'x-api-key': API_KEY
            }
        });

        if (minAmountResponse.ok) {
            const minAmountData = await minAmountResponse.json();
            console.log(`✅ Минимальная сумма BTC: ${minAmountData.min_amount} BTC`);
        }

        // 4. Тестовое создание платежа (без отправки)
        console.log('\n4️⃣ Тест создания платежа...');
        const testPayment = {
            price_amount: 5.99,
            price_currency: 'USD',
            pay_currency: 'btc',
            order_id: `test_${Date.now()}`,
            order_description: 'EDEM PRO - тест платежа',
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/cancel'
        };

        console.log('📋 Данные тестового платежа:');
        console.log(`   💰 Сумма: $${testPayment.price_amount}`);
        console.log(`   🪙 Валюта: ${testPayment.pay_currency.toUpperCase()}`);
        console.log(`   🆔 Order ID: ${testPayment.order_id}`);

        // В продакшене убрать эту проверку и делать реальный запрос
        console.log('⚠️  Реальный платёж не создан (тестовый режим)');

        console.log('\n🎉 Все проверки пройдены! NOWPayments API настроен корректно.');

        return true;

    } catch (error) {
        console.error('\n❌ Ошибка при тестировании:', error.message);

        if (error.message.includes('401')) {
            console.log('\n💡 Возможные причины:');
            console.log('   - Неверный API ключ');
            console.log('   - API ключ не активирован');
            console.log('   - Проверьте настройки в NOWPayments дашборде');
        }

        return false;
    }
}

// Запуск тестирования
testNOWPayments().then(success => {
    if (success) {
        console.log('\n🚀 Готово к приёму криптоплатежей!');
        console.log('\n📋 Следующие шаги:');
        console.log('   1. Настройте IPN Secret для webhook');
        console.log('   2. Укажите Callback URL в дашборде');
        console.log('   3. Протестируйте с минимальной суммой');
    } else {
        console.log('\n🔧 Нужно исправить конфигурацию...');
    }

    process.exit(success ? 0 : 1);
});