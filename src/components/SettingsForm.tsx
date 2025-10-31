'use client';

import { useState, useEffect } from 'react';
import { Save, User, Globe, Bell, MessageCircle, Check } from 'lucide-react';

interface UserSettings {
    voice_preference: 'soft' | 'hard' | 'therapist';
    language: 'ru' | 'en';
    telegram_notifications: boolean;
    email_notifications: boolean;
}

interface SettingsFormProps {
    userId: string;
    initialSettings: UserSettings;
    telegramChatId?: string;
}

export default function SettingsForm({ userId, initialSettings, telegramChatId }: SettingsFormProps) {
    const [settings, setSettings] = useState<UserSettings>(initialSettings);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [telegramLinking, setTelegramLinking] = useState(false);
    const [telegramLinked, setTelegramLinked] = useState(false);

    // Handle Telegram linking on page load
    useEffect(() => {
        if (telegramChatId) {
            handleTelegramLink();
        }
    }, [telegramChatId]);

    const handleTelegramLink = async () => {
        if (!telegramChatId) return;

        setTelegramLinking(true);
        try {
            // Use API route instead of direct function call
            const response = await fetch('/api/telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: telegramChatId })
            });

            if (response.ok) {
                setTelegramLinked(true);
                setSettings(prev => ({ ...prev, telegram_notifications: true }));
                await handleSave(); // Auto-save after linking
            }
        } catch (error) {
            console.error('Error linking Telegram:', error);
        } finally {
            setTelegramLinking(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Voice Preference */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-violet-600" />
                    Голос по умолчанию
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Выберите стиль общения, который вам ближе
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { value: 'soft', label: '🌑 Мягкий', desc: 'Поддержка без давления' },
                        { value: 'hard', label: '⚡ Жёсткий', desc: 'Правда без прикрас' },
                        { value: 'therapist', label: '🧠 Психотерапевт', desc: 'Структурированный подход' }
                    ].map((voice) => (
                        <label key={voice.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name="voice"
                                value={voice.value}
                                checked={settings.voice_preference === voice.value}
                                onChange={(e) => setSettings({ ...settings, voice_preference: e.target.value as any })}
                                className="sr-only"
                            />
                            <div className={`border-2 rounded-lg p-4 transition-colors ${settings.voice_preference === voice.value
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <div className="font-medium text-sm">{voice.label}</div>
                                <div className="text-xs text-gray-600 mt-1">{voice.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-violet-600" />
                    Язык интерфейса
                </h3>
                <div className="flex gap-4">
                    {[
                        { value: 'ru', label: '🇷🇺 Русский' },
                        { value: 'en', label: '🇺🇸 English' }
                    ].map((lang) => (
                        <label key={lang.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name="language"
                                value={lang.value}
                                checked={settings.language === lang.value}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
                                className="sr-only"
                            />
                            <div className={`border-2 rounded-lg px-4 py-2 transition-colors ${settings.language === lang.value
                                ? 'border-violet-500 bg-violet-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                {lang.label}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Telegram Integration */}
            {telegramChatId && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800">Telegram успешно подключен!</h3>
                    </div>
                    <p className="text-green-700 text-sm">
                        Теперь вы будете получать ежедневные слова и напоминания в Telegram.
                    </p>
                </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-violet-600" />
                    Уведомления
                </h3>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="w-5 h-5 text-blue-500" />
                                <div>
                                    <div className="font-medium">Telegram</div>
                                    <div className="text-sm text-gray-600">Ежедневные слова и напоминания</div>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.telegram_notifications}
                                onChange={(e) => setSettings({ ...settings, telegram_notifications: e.target.checked })}
                                className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
                            />
                        </div>
                        {!telegramLinked && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <div className="text-sm text-blue-800 mb-2">
                                    Чтобы получать уведомления в Telegram:
                                </div>
                                <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                                    <li>Найдите бота <code>@edem_bot</code> в Telegram</li>
                                    <li>Напишите <code>/start</code></li>
                                    <li>Следуйте инструкциям для связывания аккаунта</li>
                                </ol>
                            </div>
                        )}
                    </div>

                    <label className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <div className="font-medium">Email</div>
                            <div className="text-sm text-gray-600">Еженедельные отчёты и важные обновления</div>
                        </div>
                        <input
                            type="checkbox"
                            checked={settings.email_notifications}
                            onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                            className="w-5 h-5 text-violet-600 rounded focus:ring-violet-500"
                        />
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${saved
                        ? 'bg-green-600 text-white'
                        : 'bg-violet-600 text-white hover:bg-violet-700'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save className="w-4 h-4" />
                    {saved ? 'Сохранено!' : saving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </div>
    );
}