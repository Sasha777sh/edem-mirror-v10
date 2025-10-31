# 🚀 НАСТРОЙКА КРИПТОПЛАТЕЖЕЙ NOWPAYMENTS

## 📋 Пошаговая инструкция

### 1. **Регистрация в NOWPayments**

1. Перейдите на <https://account.nowpayments.io/>
2. Создайте аккаунт
3. Пройдите верификацию

### 2. **Получение API-ключей**

В дашборде NOWPayments:

1. **API Key**:
   - Settings → API Keys → Create New Key
   - Скопируйте ключ для `NOWPAYMENTS_API_KEY`

2. **IPN Secret**:
   - Settings → IPN Settings → Generate Secret
   - Скопируйте для `NOWPAYMENTS_IPN_SECRET`

3. **Callback URL**:
   - Укажите: `https://ваш-домен.com/api/crypto/webhook`

### 3. **Настройка переменных окружения**

В файле `.env`:

```env
# NOWPayments криптоплатежи
NOWPAYMENTS_API_KEY="ваш_api_ключ"
NOWPAYMENTS_IPN_SECRET="ваш_ipn_секрет"

# URL приложения
NEXT_PUBLIC_APP_URL="https://ваш-домен.com"
```

### 4. **Тестирование**

#### Sandbox режим

1. В дашборде NOWPayments включите Sandbox mode
2. Используйте тестовые криптоадреса для проверки
3. Проверьте что webhook получает уведомления

#### Production

1. Отключите Sandbox mode
2. Настройте реальные криптокошельки
3. Проверьте с минимальными суммами

### 5. **Поддерживаемые криптовалюты**

Система поддерживает:

- **Bitcoin (BTC)** - основная валюта
- **Ethereum (ETH)** - популярная альтернатива  
- **USDT** - стабильная монета
- **USDC** - альтернативный стейблкоин
- **Litecoin (LTC)** - быстрые переводы
- **Monero (XMR)** - приватность

### 6. **Тарифы в USD**

```typescript
CRYPTO_PLANS = {
    '24h': {
        amount: 5.99, // $5.99 = ~499₽
        description: 'EDEM PRO - доступ на 24 часа'
    },
    '30d': {
        amount: 19.99, // $19.99 = ~1499₽  
        description: 'EDEM PRO - доступ на 30 дней'
    }
}
```

### 7. **Workflow платежа**

1. **Пользователь выбирает план** → кнопка "Криптовалюта"
2. **Выбор криптовалюты** → BTC, ETH, USDT и др.
3. **Создание платежа** → `POST /api/crypto/checkout`
4. **NOWPayments возвращает**:
   - Адрес для оплаты
   - Точную сумму в выбранной валюте
   - Ссылку на страницу оплаты
5. **Пользователь отправляет крипту** → на указанный адрес
6. **NOWPayments подтверждает** → webhook → `POST /api/crypto/webhook`
7. **Активация подписки** → автоматически в базе данных

### 8. **Безопасность**

✅ **Проверка webhook подписи**:

```typescript
verifyWebhook(payload: string, signature: string): boolean {
    const secret = process.env.NOWPAYMENTS_IPN_SECRET!;
    const expectedSignature = crypto
        .createHmac('sha512', secret)
        .update(payload)
        .digest('hex');
    return signature === expectedSignature;
}
```

✅ **Проверка статусов**:

- `finished` / `confirmed` → активация
- `failed` / `expired` → отмена
- `partially_paid` → ожидание доплаты

### 9. **Мониторинг**

В дашборде NOWPayments отслеживайте:

- Успешные платежи
- Неудачные транзакции  
- Комиссии
- Конверсию валют

### 10. **Поддержка**

- **Документация**: <https://documenter.getpostman.com/view/7907941/S1a32n38>
- **Поддержка**: <support@nowpayments.io>
- **Telegram**: @nowpaymentsbot

## 🎯 **Готово!**

После настройки пользователи смогут:

- Выбирать из 6 популярных криптовалют
- Видеть точную сумму к оплате
- Получать автоматическую активацию
- Использовать безопасные платежи

Криптоплатежи особенно важны для:

- **Международных пользователей**
- **Анонимных платежей**
- **Стран с ограничениями** на банковские карты
- **Web3 аудитории**
