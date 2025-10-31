"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import dynamic from "next/dynamic"

// Динамический импорт TelegramLoginButton для избежания проблем с SSR
const TelegramLoginButton = dynamic(() => import("@/components/TelegramLoginButton"), { ssr: false })

export default function DemoChatSection() {
    const [open, setOpen] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const supabase = createClientComponentClient()

    const mockMessages = [
        { role: "user", text: "У меня тревога по вечерам..." },
        { role: "assistant", text: "Зеркало: ты прячешь страх под контроль. Цена — усталость и бессонница.", stage: "shadow" },
        { role: "assistant", text: "Правда: тебе важно чувство безопасности. Ты ищешь его через контроль, но это не работает.", stage: "truth" },
        { role: "assistant", text: "Практика (3 минуты): положи руку на грудь, замедли дыхание. Завтра спроси себя: стало ли легче на 1 балл?", stage: "integration" },
    ]

    const handleOAuth = async (provider: "google" | "apple") => {
        setLoading(true)
        setError("")

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error
        } catch (error: any) {
            setError(error.message || "Произошла ошибка при входе")
        } finally {
            setLoading(false)
        }
    }

    const handleEmailSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            if (data.session) {
                // User is already logged in
                window.location.href = "/dashboard"
            } else {
                // Email verification required
                alert("Проверьте вашу почту для подтверждения регистрации")
                setOpen(false)
            }
        } catch (error: any) {
            setError(error.message || "Произошла ошибка при регистрации")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="py-20 bg-gray-950 text-white">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Попробуй EDEM прямо сейчас
                </h2>
                <div className="border border-gray-800 rounded-2xl shadow-xl p-6 bg-gray-900">
                    <div className="space-y-4">
                        {mockMessages.map((m, i) => (
                            <div
                                key={i}
                                className={`p-3 rounded-xl max-w-[80%] ${m.role === "user"
                                    ? "bg-blue-600 text-white ml-auto"
                                    : m.stage === "shadow"
                                        ? "bg-gray-800 border-l-4 border-red-500"
                                        : m.stage === "truth"
                                            ? "bg-gray-800 border-l-4 border-yellow-500"
                                            : "bg-gray-800 border-l-4 border-green-500"
                                    }`}
                            >
                                {m.text}
                                {m.stage && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        стадия: {m.stage}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => setOpen(true)}
                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-lg font-medium"
                        >
                            Продолжить живой чат →
                        </button>
                    </div>
                </div>
            </div>

            {/* Модалка регистрации */}
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-white text-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            onClick={() => setOpen(false)}
                        >
                            ✕
                        </button>
                        <h3 className="text-2xl font-bold mb-4 text-center">
                            Регистрация в EDEM
                        </h3>

                        {/* Кнопки соцсетей */}
                        <div className="space-y-3 mb-6">
                            <button
                                onClick={() => handleOAuth("google")}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-50"
                            >
                                🔵 Войти через Google
                            </button>
                            <button
                                onClick={() => handleOAuth("apple")}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 border rounded-lg py-2 hover:bg-gray-50 disabled:opacity-50"
                            >
                                ⚫ Войти через Apple
                            </button>

                            {/* Telegram Login Button */}
                            <div className="w-full">
                                <TelegramLoginButton botUsername={process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "your_bot_username_without_at"} />
                            </div>
                        </div>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">
                                    или email
                                </span>
                            </div>
                        </div>

                        {/* Форма email+пароль */}
                        <form onSubmit={handleEmailSignUp} className="space-y-4">
                            {error && (
                                <div className="text-red-500 text-sm">{error}</div>
                            )}
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? "Загрузка..." : "Зарегистрироваться"}
                            </button>
                        </form>

                        <p className="mt-4 text-center text-sm text-gray-600">
                            Уже есть аккаунт?{" "}
                            <a href="/login" className="text-indigo-600 hover:underline">
                                Войти
                            </a>
                        </p>
                    </div>
                </div>
            )}
        </section>
    )
}