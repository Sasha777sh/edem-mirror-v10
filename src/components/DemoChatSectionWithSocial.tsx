"use client"

import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { FaApple, FaTelegram } from "react-icons/fa"

export default function DemoChatSectionWithSocial() {
    const [open, setOpen] = useState(false)

    const mockMessages = [
        { role: "user", text: "У меня тревога по вечерам..." },
        { role: "assistant", text: "Зеркало: ты прячешь страх под контроль. Цена — усталость и бессонница.", stage: "shadow" },
        { role: "assistant", text: "Правда: тебе важно чувство безопасности. Ты ищешь его через контроль, но это не работает.", stage: "truth" },
        { role: "assistant", text: "Практика (3 минуты): положи руку на грудь, замедли дыхание. Завтра спроси себя: стало ли легче на 1 балл?", stage: "integration" },
    ]

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

                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            <button className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                <FcGoogle className="text-xl" />
                                <span>Продолжить с Google</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                <FaApple className="text-xl" />
                                <span>Продолжить с Apple</span>
                            </button>
                            <button className="w-full flex items-center justify-center gap-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
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

                        <form className="space-y-4">
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="password"
                                placeholder="Пароль"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
                            >
                                Зарегистрироваться
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