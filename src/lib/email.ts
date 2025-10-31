// Email notification service

interface EmailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

// Mock email service (in production, you would use something like Nodemailer or SendGrid)
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        // In a real implementation, you would integrate with an email service
        console.log('📧 Sending email:', {
            to: options.to,
            subject: options.subject,
            text: options.text.substring(0, 100) + '...'
        });

        // Simulate email sending delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // For now, we'll just log the email
        // In production, you would use:
        // - Nodemailer with SMTP
        // - SendGrid API
        // - Amazon SES
        // - Mailgun API
        // - etc.

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

// Subscription event notifications
export async function sendSubscriptionNotification(
    userEmail: string,
    eventType: 'trial_started' | 'trial_ending' | 'subscription_activated' | 'subscription_cancelled' | 'payment_failed',
    data?: any
): Promise<boolean> {
    let subject = '';
    let text = '';
    let html = '';

    switch (eventType) {
        case 'trial_started':
            subject = 'Добро пожаловать в EDEM PRO! Ваш пробный период активирован';
            text = `Здравствуйте!

Ваш 7-дневный пробный период EDEM PRO успешно активирован. В течение этого времени у вас есть полный доступ ко всем функциям платформы.

Что входит в PRO:
• Безлимитные ритуалы
• Архетипы и глубинный анализ
• 5-минутные практики каждый день
• Скачивание PDF отчётов
• История за 30 дней
• Экспорт журнала

Если у вас есть вопросы, не стесняйтесь обращаться в поддержку.

С уважением,
Команда EDEM`;
            break;

        case 'trial_ending':
            subject = 'Ваш пробный период EDEM PRO скоро заканчивается';
            text = `Здравствуйте!

Ваш пробный период EDEM PRO заканчивается через 24 часа. Мы надеемся, что вам понравилось использовать платформу!

Если вы хотите продолжить пользоваться PRO функциями, вы можете оформить подписку прямо сейчас.

С уважением,
Команда EDEM`;
            break;

        case 'subscription_activated':
            subject = 'Ваша подписка EDEM PRO активирована!';
            text = `Здравствуйте!

Ваша подписка EDEM PRO успешно активирована. Теперь у вас есть постоянный доступ ко всем функциям платформы.

Спасибо, что выбрали EDEM!

С уважением,
Команда EDEM`;
            break;

        case 'subscription_cancelled':
            subject = 'Ваша подписка EDEM PRO отменена';
            text = `Здравствуйте!

Ваша подписка EDEM PRO была отменена. Вы можете продолжить пользоваться PRO функциями до окончания оплаченного периода.

Если вы передумали, вы всегда можете возобновить подписку в личном кабинете.

С уважением,
Команда EDEM`;
            break;

        case 'payment_failed':
            subject = 'Проблема с оплатой подписки EDEM PRO';
            text = `Здравствуйте!

Мы не смогли обработать оплату вашей подписки EDEM PRO. Пожалуйста, проверьте платежные данные в личном кабинете.

Если проблема сохраняется, свяжитесь с нашей службой поддержки.

С уважением,
Команда EDEM`;
            break;

        default:
            return false;
    }

    return await sendEmail({
        to: userEmail,
        subject,
        text,
        html
    });
}

// Ritual completion notifications
export async function sendRitualNotification(
    userEmail: string,
    ritualType: string,
    data?: any
): Promise<boolean> {
    const subject = `Ваш ритуал "${ritualType}" завершён`;
    const text = `Здравствуйте!

Вы успешно завершили ритуал "${ritualType}". Отличная работа!

Не забывайте регулярно практиковаться для достижения лучших результатов.

С уважением,
Команда EDEM`;

    return await sendEmail({
        to: userEmail,
        subject,
        text
    });
}