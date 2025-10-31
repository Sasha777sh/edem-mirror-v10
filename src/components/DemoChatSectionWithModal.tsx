"use client"

import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaTelegram } from "react-icons/fa"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"

export default function DemoChatSectionWithModal() {
    const [showModal, setShowModal] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const supabase = createClientComponentClient()

    const mockMessages = [
        { role: "user", text: "У меня тревога по вечерам..." },
        { role: "assistant", text: "Зеркало: ты прячешь страх под контроль. Цена — усталость и бессонница.", stage: "shadow" },
        { role: "assistant", text: "Правда: тебе важно чувство безопасности. Ты ищешь его через контроль, но это не работает.", stage: "truth" },
        { role: "assistant", text: "Практика (3 минуты): положи руку на грудь, замедли дыхание. Завтра спроси себя: стало ли легче на 1 балл?", stage: "integration" },
    ]

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            if (data.session) {
                // User is already logged in
                router.push("/dashboard")
            } else {
                // Email verification required
                alert("Проверьте вашу почту для подтверждения регистрации")
                setShowModal(false)
            }
        } catch (error: any) {
            setError(error.message || "Произошла ошибка при регистрации")
        } finally {
            setLoading(false)
        }
    }

    // Social login handlers
    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
        }
    }

    const handleAppleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'apple',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
        }
    }

    const handleTelegramSignIn = () => {
        // Telegram sign in would require additional setup
        alert("Telegram sign in would be implemented here")
    }

    return (
        <>
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
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-lg font-medium"
                            >
                                Продолжить живой чат →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Registration Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md text-gray-900 relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            <h3 className="text-xl font-bold mb-4 text-center">Регистрация в EDEM</h3>

                            {/* Social Login Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={handleGoogleSignIn}
                                    className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    disabled={loading}
                                >
                                    <FcGoogle className="text-xl" />
                                    <span>Продолжить с Google</span>
                                </button>
                                <button
                                    onClick={handleAppleSignIn}
                                    className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    disabled={loading}
                                >
                                    <FaApple className="text-xl" />
                                    <span>Продолжить с Apple</span>
                                </button>
                                <button
                                    onClick={handleTelegramSignIn}
                                    className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    disabled={loading}
                                >
                                    <FaTelegram className="text-xl text-blue-500" />
                                    <span>Продолжить с Telegram</span>
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">или email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSignUp} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium mb-1">
                                        Пароль
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-500 text-sm">{error}</div>
                                )}

                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-4 text-center text-sm text-gray-600">
                                Уже есть аккаунт?{" "}
                                <button
                                    onClick={() => {
                                        setShowModal(false)
                                        // Here you would typically show a login modal or redirect
                                        alert("Функция входа будет реализована в следующей версии")
                                    }}
                                    className="text-indigo-600 hover:underline"
                                >
                                    Войти
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}