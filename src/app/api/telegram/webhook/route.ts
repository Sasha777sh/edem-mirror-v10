import { NextRequest, NextResponse } from 'next/server';
import {
    createTelegramBot,
    saveTelegramUser,
    getTelegramUser,
    disableTelegramUser,
    BOT_COMMANDS,
    BOT_RESPONSES
} from '@/lib/telegram';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const bot = createTelegramBot();
        if (!bot) {
            return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
        }

        const update = await req.json();

        // Handle regular messages
        if (update.message) {
            const { message } = update;
            const chatId = message.chat.id.toString();
            const text = message.text || '';
            const user = message.from;

            console.log(`Telegram message from ${chatId}: ${text}`);

            // Save/update user in database
            await saveTelegramUser(chatId, null, {
                username: user.username,
                firstName: user.first_name
            });

            // Handle commands
            if (text.startsWith('/')) {
                await handleCommand(bot, chatId, text, user);
            } else {
                // Handle regular text as truth input for SOS mode
                if (text.length > 10) {
                    await bot.sendMessage(chatId, `💝 Записал твою правду:

"${text}"

Молодец, что не убежал от себя.`, {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '📊 Получить анализ', url: `${process.env.NEXT_PUBLIC_APP_URL}/?truth=${encodeURIComponent(text)}` }],
                                [{ text: '📝 В дневник', url: `${process.env.NEXT_PUBLIC_APP_URL}/app/journal` }]
                            ]
                        }
                    });
                } else {
                    await bot.sendMessage(chatId, BOT_RESPONSES.unknownCommand);
                }
            }
        }

        // Handle callback queries (inline keyboard presses)
        if (update.callback_query) {
            const { callback_query } = update;
            const chatId = callback_query.from.id.toString();
            const data = callback_query.data;

            await handleCallbackQuery(bot, chatId, data);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

async function handleCommand(
    bot: any,
    chatId: string,
    command: string,
    user: any
): Promise<void> {
    const cmd = command.split(' ')[0];

    switch (cmd) {
        case BOT_COMMANDS.start:
            await bot.sendMessage(chatId, BOT_RESPONSES.welcome, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔗 Связать аккаунт', callback_data: 'link_account' }],
                        [{ text: '💫 Слово дня', callback_data: 'get_word' }],
                        [{ text: '⚙️ Настройки', callback_data: 'settings' }]
                    ]
                }
            });
            break;

        case BOT_COMMANDS.link:
            const linkText = BOT_RESPONSES.linkInstructions.replace('{chatId}', chatId);
            await bot.sendMessage(chatId, linkText, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🌐 Открыть EDEM', url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?telegram=${chatId}` }]
                    ]
                }
            });
            break;

        case BOT_COMMANDS.word:
            await sendWordOfDay(bot, chatId);
            break;

        case '/sos':
            await bot.sendMessage(chatId, `🆘 SOS-режим активирован

Дышим 90 секунд:
⏱️ Вдох 4 сек → задержка 7 сек → выдох 8 сек

После дыхания напиши одну строчку правды.`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🫁 SOS 90 секунд', url: `${process.env.NEXT_PUBLIC_APP_URL}/?sos=1` }]
                    ]
                }
            });
            break;

        case '/step':
            // Get user's current session
            const session = await sql`
                select id, step, voice from sessions 
                where guest_id = ${chatId} or user_id in (
                    select user_id from telegram_users where chat_id = ${chatId}
                )
                order by started_at desc limit 1
            `;

            if (session.length > 0) {
                const s = session[0];
                await bot.sendMessage(chatId, `🎯 Твой текущий шаг: **${getStepName(s.step)}**\n\nГолос: ${getVoiceName(s.voice)}`, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '▶️ Продолжить', url: `${process.env.NEXT_PUBLIC_APP_URL}/?session=${s.id}` }]
                        ]
                    }
                });
            } else {
                await bot.sendMessage(chatId, 'Активных сессий нет. Начнём новую?', {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🚀 Начать', url: `${process.env.NEXT_PUBLIC_APP_URL}` }]
                        ]
                    }
                });
            }
            break;

        case '/app':
            await bot.sendMessage(chatId, 'Открыть EDEM:', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📱 Личный кабинет', url: `${process.env.NEXT_PUBLIC_APP_URL}/app` }],
                        [{ text: '🧠 Новая сессия', url: `${process.env.NEXT_PUBLIC_APP_URL}` }]
                    ]
                }
            });
            break;

        case BOT_COMMANDS.settings:
            await bot.sendMessage(chatId, BOT_RESPONSES.settingsMenu, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🌑 Мягкий голос', callback_data: 'voice_soft' }, { text: '⚡ Жёсткий голос', callback_data: 'voice_hard' }],
                        [{ text: '🧠 Психотерапевт', callback_data: 'voice_therapist' }],
                        [{ text: '⏰ Время уведомлений', callback_data: 'set_time' }],
                        [{ text: '🔕 Отключить', callback_data: 'disable' }]
                    ]
                }
            });
            break;

        case BOT_COMMANDS.stop:
            await disableTelegramUser(chatId);
            await bot.sendMessage(chatId, BOT_RESPONSES.stopped);
            break;

        case BOT_COMMANDS.help:
            await bot.sendMessage(chatId, BOT_RESPONSES.help);
            break;

        default:
            await bot.sendMessage(chatId, BOT_RESPONSES.unknownCommand);
    }
}

async function handleCallbackQuery(bot: any, chatId: string, data: string): Promise<void> {
    switch (data) {
        case 'link_account':
            const linkText = BOT_RESPONSES.linkInstructions.replace('{chatId}', chatId);
            await bot.sendMessage(chatId, linkText, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🌐 Открыть EDEM', url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?telegram=${chatId}` }]
                    ]
                }
            });
            break;

        case 'get_word':
            await sendWordOfDay(bot, chatId);
            break;

        case 'voice_soft':
        case 'voice_hard':
        case 'voice_therapist':
            const voice = data.replace('voice_', '') as 'soft' | 'hard' | 'therapist';
            const voiceEmoji = voice === 'soft' ? '🌑' : voice === 'hard' ? '⚡' : '🧠';
            const voiceName = voice === 'soft' ? 'Мягкий' : voice === 'hard' ? 'Жёсткий' : 'Психотерапевт';

            await saveTelegramUser(chatId, null, { voicePreference: voice });
            await bot.sendMessage(chatId, `${voiceEmoji} Голос изменён на: ${voiceName}`);
            break;

        case 'disable':
            await disableTelegramUser(chatId);
            await bot.sendMessage(chatId, BOT_RESPONSES.stopped);
            break;

        case 'set_time':
            await bot.sendMessage(chatId, '⏰ Время уведомлений можно изменить в настройках на сайте EDEM.', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🌐 Открыть настройки', url: `${process.env.NEXT_PUBLIC_APP_URL}/settings` }]
                    ]
                }
            });
            break;
    }
}

async function sendWordOfDay(bot: any, chatId: string): Promise<void> {
    try {
        // Get user's voice preference
        const telegramUser = await getTelegramUser(chatId);
        const voice = telegramUser?.voice_preference || 'soft';

        // Fetch word of the day
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reco/day?voice=${voice}`);

        if (response.ok) {
            const wordData = await response.json();
            const message = BOT_RESPONSES.dailyWordTemplate(
                wordData.word,
                wordData.meaning,
                wordData.meditation,
                voice
            );

            await bot.sendMessage(chatId, message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🎯 Начать ритуал', url: `${process.env.NEXT_PUBLIC_APP_URL}` }],
                        [{ text: '⚙️ Настройки', callback_data: 'settings' }]
                    ]
                }
            });
        } else {
            await bot.sendMessage(chatId, BOT_RESPONSES.wordNotFound);
        }
    } catch (error) {
        console.error('Error sending word of day:', error);
        await bot.sendMessage(chatId, BOT_RESPONSES.wordNotFound);
    }
}

function getStepName(step: string): string {
    const names: Record<string, string> = {
        intro: 'Начало',
        problem: 'Описание проблемы',
        clarify_polarity: 'Выбор полярности',
        locate_body: 'Телесные ощущения',
        name_one_word: 'Одно слово',
        truth_cut: 'Анализ корня',
        archetype: 'Архетип',
        today_step: 'Шаг на сегодня',
        practice_5min: 'Практика'
    };
    return names[step] || step;
}

function getVoiceName(voice: string): string {
    const names: Record<string, string> = {
        soft: '🌑 Мягкий',
        hard: '⚡ Жёсткий',
        therapist: '🧠 Психотерапевт'
    };
    return names[voice] || voice;
}

// Health check endpoint
export async function GET(req: NextRequest) {
    const bot = createTelegramBot();
    if (!bot) {
        return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
    }

    try {
        const webhookInfo = await bot.getWebhookInfo();
        return NextResponse.json({
            status: 'ok',
            webhook: webhookInfo
        });
    } catch (error) {
        return NextResponse.json({
            error: 'Failed to get webhook info'
        }, { status: 500 });
    }
}

async function sendMessage(chatId: number, text: string) {
    const bot = createTelegramBot();
    if (!bot) {
        throw new Error('Telegram bot not configured');
    }
    return bot.sendMessage(chatId.toString(), text);
}

async function sendInlineKeyboard(chatId: number, text: string, keyboard: any[][]) {
    const bot = createTelegramBot();
    if (!bot) {
        throw new Error('Telegram bot not configured');
    }
    return bot.sendMessage(chatId.toString(), text, {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}

async function getDailyWord() {
    const words = [
        { word: 'Принятие', meaning: 'Не борьба с реальностью, а её признание', meditation: 'Что я сегодня не принимаю в себе?' },
        { word: 'Граница', meaning: 'Четкое "нет" чужим потребностям', meditation: 'Где я размываю свои границы?' },
        { word: 'Пустота', meaning: 'Пространство для нового', meditation: 'Что мне нужно отпустить?' },
        { word: 'Контроль', meaning: 'Иллюзия безопасности', meditation: 'Что я пытаюсь контролировать?' },
        { word: 'Страх', meaning: 'Сигнал о важном', meditation: 'О чём говорит мой страх?' }
    ];

    const today = new Date().getDate();
    return words[today % words.length];
}
