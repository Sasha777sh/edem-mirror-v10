import { sql } from '@/lib/db';

interface TelegramUser {
    chat_id: string;
    user_id: string | null;
    username?: string;
    first_name?: string;
    is_active: boolean;
    voice_preference: 'soft' | 'hard' | 'therapist';
    notification_time: string; // HH:MM format
    timezone: string;
    created_at: Date;
    updated_at: Date;
}

// Telegram Bot API wrapper
class TelegramBot {
    private token: string;
    private baseUrl: string;

    constructor(token: string) {
        this.token = token;
        this.baseUrl = `https://api.telegram.org/bot${token}`;
    }

    async sendMessage(chatId: string, text: string, options?: {
        parse_mode?: 'HTML' | 'Markdown';
        reply_markup?: any;
    }): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    ...options
                })
            });

            const result = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Telegram send message error:', error);
            return false;
        }
    }

    async setWebhook(url: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/setWebhook`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url,
                    allowed_updates: ['message', 'callback_query']
                })
            });

            const result = await response.json();
            return result.ok;
        } catch (error) {
            console.error('Telegram webhook setup error:', error);
            return false;
        }
    }

    async getWebhookInfo(): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/getWebhookInfo`);
            const result = await response.json();
            return result.result;
        } catch (error) {
            console.error('Telegram webhook info error:', error);
            return null;
        }
    }
}

// Telegram service functions
export async function saveTelegramUser(
    chatId: string,
    userId: string | null = null,
    userData: {
        username?: string;
        firstName?: string;
        voicePreference?: 'soft' | 'hard' | 'therapist';
        notificationTime?: string;
        timezone?: string;
    } = {}
): Promise<void> {
    const username = userData.username || null;
    const firstName = userData.firstName || null;
    const voicePreference = userData.voicePreference || 'soft';
    const notificationTime = userData.notificationTime || '09:00';
    const timezone = userData.timezone || 'Europe/Moscow';

    await sql`
        insert into telegram_users (
            chat_id, user_id, username, first_name, voice_preference, 
            notification_time, timezone, is_active
        ) values (
            ${chatId}, ${userId}, ${username}, 
            ${firstName}, ${voicePreference},
            ${notificationTime}, ${timezone}, true
        )
        on conflict (chat_id) do update set
            user_id = ${userId},
            username = COALESCE(${username}, EXCLUDED.username),
            first_name = COALESCE(${firstName}, EXCLUDED.first_name),
            voice_preference = COALESCE(${voicePreference}, EXCLUDED.voice_preference),
            notification_time = COALESCE(${notificationTime}, EXCLUDED.notification_time),
            timezone = COALESCE(${timezone}, EXCLUDED.timezone),
            is_active = true,
            updated_at = now()
    `;
}

export async function linkTelegramToUser(chatId: string, userId: string): Promise<void> {
    await sql`
        update telegram_users 
        set user_id = ${userId}, updated_at = now()
        where chat_id = ${chatId}
    `;
}

export async function getTelegramUser(chatId: string): Promise<TelegramUser | null> {
    const result: any = await sql`
        select * from telegram_users 
        where chat_id = ${chatId}
    `;
    return result[0] ? {
        chat_id: result[0].chat_id,
        user_id: result[0].user_id,
        username: result[0].username,
        first_name: result[0].first_name,
        voice_preference: result[0].voice_preference,
        notification_time: result[0].notification_time,
        timezone: result[0].timezone,
        is_active: result[0].is_active,
        created_at: result[0].created_at,
        updated_at: result[0].updated_at
    } : null;
}

export async function getActiveTelegramUsers(): Promise<TelegramUser[]> {
    const result: any = await sql`
        select * from telegram_users 
        where is_active = true
        order by notification_time
    `;
    return result.map((row: any) => ({
        chat_id: row.chat_id,
        user_id: row.user_id,
        username: row.username,
        first_name: row.first_name,
        voice_preference: row.voice_preference,
        notification_time: row.notification_time,
        timezone: row.timezone,
        is_active: row.is_active,
        created_at: row.created_at,
        updated_at: row.updated_at
    }));
}

export async function disableTelegramUser(chatId: string): Promise<void> {
    await sql`
        update telegram_users 
        set is_active = false, updated_at = now()
        where chat_id = ${chatId}
    `;
}

// Bot commands and responses
export const BOT_COMMANDS = {
    start: '/start',
    link: '/link',
    word: '/word',
    settings: '/settings',
    stop: '/stop',
    help: '/help'
};

export const BOT_RESPONSES = {
    welcome: `👋 Добро пожаловать в EDEM!

Я буду присылать тебе ежедневные слова для работы с эмоциями.

Команды:
/word - получить слово дня
/link - связать с аккаунтом EDEM
/settings - настройки уведомлений
/stop - отключить уведомления
/help - помощь`,

    linked: '✅ Telegram успешно связан с твоим аккаунтом EDEM!',

    linkInstructions: `🔗 Чтобы связать Telegram с аккаунтом EDEM:

1. Войди на сайт edem.app
2. Перейди в Настройки → Telegram
3. Введи свой Telegram ID: <code>{chatId}</code>
4. Нажми "Связать аккаунт"

Или используй ссылку: https://edem.app/settings?telegram={chatId}`,

    stopped: '⏸ Уведомления отключены. Напиши /start для возобновления.',

    help: `ℹ️ EDEM Telegram Bot

Команды:
/start - запустить бота
/word - слово дня
/link - связать с аккаунтом
/settings - настройки
/stop - отключить
/help - эта справка

Каждое утро я буду присылать персональное слово дня для работы с эмоциями.`,

    dailyWordTemplate: (word: string, meaning: string, meditation: string, voice: string) => {
        const voiceEmoji = voice === 'soft' ? '🌑' : voice === 'hard' ? '⚡' : '🧠';
        return `${voiceEmoji} Слово дня: <b>${word}</b>

💫 ${meaning}

🎯 Практика: ${meditation}

Хорошего дня! 🌅`;
    },

    wordNotFound: 'Слово дня пока не готово. Попробуй позже.',

    settingsMenu: `⚙️ Настройки EDEM бота:

Выбери что изменить:`,

    unknownCommand: 'Не понимаю команду. Напиши /help для справки.'
};

// Create bot instance
export function createTelegramBot(): TelegramBot | null {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
        console.warn('TELEGRAM_BOT_TOKEN not found');
        return null;
    }
    return new TelegramBot(token);
}

// Daily notification scheduler
export async function sendDailyNotifications(): Promise<void> {
    const bot = createTelegramBot();
    if (!bot) return;

    try {
        const users = await getActiveTelegramUsers();
        console.log(`Sending daily notifications to ${users.length} users`);

        for (const user of users) {
            try {
                // Get word of the day for user's voice preference
                const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reco/day?voice=${user.voice_preference}`);

                if (response.ok) {
                    const wordData = await response.json();
                    const message = BOT_RESPONSES.dailyWordTemplate(
                        wordData.word,
                        wordData.meaning,
                        wordData.meditation,
                        user.voice_preference
                    );

                    await bot.sendMessage(user.chat_id, message, {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[
                                { text: '🎯 Начать ритуал', url: `${process.env.NEXT_PUBLIC_APP_URL}` }
                            ]]
                        }
                    });

                    // Small delay to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                } else {
                    console.error(`Failed to get word for user ${user.chat_id}`);
                }
            } catch (error) {
                console.error(`Error sending notification to ${user.chat_id}:`, error);
            }
        }
    } catch (error) {
        console.error('Daily notifications error:', error);
    }
}