#!/bin/bash

echo "🚀 EDEM - Настройка криптоплатежей NOWPayments"
echo "=============================================="

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo "📋 Создаём .env файл из шаблона..."
    cp .env.example .env
    echo "✅ .env файл создан"
else
    echo "✅ .env файл уже существует"
fi

echo ""
echo "🔑 Для настройки NOWPayments вам нужно:"
echo "1. Зарегистрироваться на https://account.nowpayments.io/"
echo "2. Получить API Key в разделе Settings → API Keys"
echo "3. Создать IPN Secret в разделе Settings → IPN Settings"
echo ""

read -p "📝 Введите ваш NOWPayments API Key: " NOWPAYMENTS_API_KEY
read -p "📝 Введите ваш NOWPayments IPN Secret: " NOWPAYMENTS_IPN_SECRET

echo ""
echo "💾 Обновляем .env файл..."

# Обновляем переменные в .env
if grep -q "NOWPAYMENTS_API_KEY" .env; then
    sed -i.bak "s/NOWPAYMENTS_API_KEY=.*/NOWPAYMENTS_API_KEY=\"$NOWPAYMENTS_API_KEY\"/" .env
else
    echo "NOWPAYMENTS_API_KEY=\"$NOWPAYMENTS_API_KEY\"" >> .env
fi

if grep -q "NOWPAYMENTS_IPN_SECRET" .env; then
    sed -i.bak "s/NOWPAYMENTS_IPN_SECRET=.*/NOWPAYMENTS_IPN_SECRET=\"$NOWPAYMENTS_IPN_SECRET\"/" .env
else
    echo "NOWPAYMENTS_IPN_SECRET=\"$NOWPAYMENTS_IPN_SECRET\"" >> .env
fi

echo "✅ Переменные окружения обновлены"
echo ""

echo "🔍 Тестируем подключение..."
node scripts/test-nowpayments.js

echo ""
echo "🎯 Настройка завершена!"
echo ""
echo "📋 Следующие шаги:"
echo "1. В NOWPayments дашборде укажите Callback URL:"
echo "   https://ваш-домен.com/api/crypto/webhook"
echo ""
echo "2. Запустите проект и протестируйте:"
echo "   npm run dev"
echo "   Откройте http://localhost:3000/admin/crypto"
echo ""
echo "3. Создайте тестовый платёж для проверки"