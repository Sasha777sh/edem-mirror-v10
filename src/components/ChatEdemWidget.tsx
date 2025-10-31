"use client"

import { useState, useEffect, useRef } from "react"

interface Message {
    role: "user" | "assistant"
    text: string
    stage?: "shadow" | "truth" | "integration"
}

interface ChatEdemWidgetProps {
    userId?: string
    sessionId?: string
    initialSymptom?: string
    language?: "ru" | "en"
}

export default function ChatEdemWidget({
    userId = "demoUser",
    sessionId,
    initialSymptom = "anxiety",
    language = "ru"
}: ChatEdemWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            text: language === "ru"
                ? "Привет. Расскажи, что тебя беспокоит?"
                : "Hi. Tell me what's bothering you?",
            stage: "shadow"
        }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [currentStage, setCurrentStage] = useState<"shadow" | "truth" | "integration">("shadow")
    const [selectedSymptom, setSelectedSymptom] = useState(initialSymptom)
    const [currentLanguage, setCurrentLanguage] = useState(language)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Симптомы для фильтрации
    const symptoms = [
        { id: "anxiety", ru: "Тревога", en: "Anxiety" },
        { id: "sleep", ru: "Сон", en: "Sleep" },
        { id: "breakup", ru: "Расставание", en: "Breakup" },
        { id: "anger", ru: "Злость", en: "Anger" },
        { id: "jealousy", ru: "Ревность", en: "Jealousy" }
    ]

    // Прокрутка к последнему сообщению
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        // Добавляем сообщение пользователя
        const userMessage: Message = { role: "user", text: inputValue }
        setMessages(prev => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)

        try {
            // В демонстрационном режиме имитируем API вызов
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Генерируем ответ в зависимости от стадии
            let responseText = ""
            let nextStage: "shadow" | "truth" | "integration" = currentStage

            if (currentStage === "shadow") {
                responseText = currentLanguage === "ru"
                    ? "Зеркало: вижу защиту через обесценивание. Триггер: критика со стороны. Цена: отсутствие поддержки и понимания со стороны близких."
                    : "Mirror: I see protection through devaluation. Trigger: criticism from others. Price: lack of support and understanding from loved ones."
                nextStage = "truth"
            } else if (currentStage === "truth") {
                responseText = currentLanguage === "ru"
                    ? "Правда: на самом деле тебе важно чувствовать себя значимым. Сейчас ты закрываешь это через обесценивание, потому что боишься быть уязвимым. Место выбора: принять свою уязвимость как силу."
                    : "Truth: actually, it's important for you to feel significant. You're closing this through devaluation because you're afraid to be vulnerable. Choice point: accept your vulnerability as strength."
                nextStage = "integration"
            } else {
                responseText = currentLanguage === "ru"
                    ? "Шаг на сегодня (3 минуты): вспомни ситуацию, где ты чувствовал обесценивание. Напиши одно предложение о том, что ты в ней чувствовал. Якорь в теле: ощути это чувство в груди. Завтра спрошу: «Сделал ли? Что изменилось по шкале 0–10?»"
                    : "Today's step (3 minutes): remember a situation where you felt devalued. Write one sentence about what you felt in it. Body anchor: feel this sensation in your chest. Tomorrow I'll ask: \"Did you do it? What changed on a scale of 0-10?\""
                nextStage = "integration"
            }

            const assistantMessage: Message = {
                role: "assistant",
                text: responseText,
                stage: nextStage
            }

            setMessages(prev => [...prev, assistantMessage])
            setCurrentStage(nextStage)
        } catch (error) {
            const errorMessage: Message = {
                role: "assistant",
                text: currentLanguage === "ru"
                    ? "Извините, произошла ошибка. Попробуйте еще раз."
                    : "Sorry, an error occurred. Please try again."
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="flex flex-col h-[500px] max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
                <h2 className="text-xl font-bold">EDEM Mirror</h2>
                <div className="flex flex-wrap gap-2 mt-2">
                    <select
                        value={selectedSymptom}
                        onChange={(e) => setSelectedSymptom(e.target.value)}
                        className="text-xs bg-white/20 text-white rounded px-2 py-1"
                    >
                        {symptoms.map(symptom => (
                            <option key={symptom.id} value={symptom.id} className="text-gray-800">
                                {currentLanguage === "ru" ? symptom.ru : symptom.en}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => setCurrentLanguage(currentLanguage === "ru" ? "en" : "ru")}
                        className="text-xs bg-white/20 text-white rounded px-2 py-1"
                    >
                        {currentLanguage === "ru" ? "EN" : "RU"}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-xl max-w-[85%] ${message.role === "user"
                                    ? "bg-blue-500 text-white ml-auto"
                                    : message.stage === "shadow"
                                        ? "bg-gray-800 text-white border-l-4 border-red-500"
                                        : message.stage === "truth"
                                            ? "bg-gray-800 text-white border-l-4 border-yellow-500"
                                            : "bg-gray-800 text-white border-l-4 border-green-500"
                                }`}
                        >
                            {message.text}
                            {message.stage && (
                                <div className="text-xs opacity-70 mt-1">
                                    {currentLanguage === "ru"
                                        ? `стадия: ${message.stage === "shadow" ? "Тень" : message.stage === "truth" ? "Правда" : "Интеграция"}`
                                        : `stage: ${message.stage}`}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="p-3 rounded-xl bg-gray-800 text-white border-l-4 border-purple-500 max-w-[85%]">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full mr-1 animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={currentLanguage === "ru" ? "Введите ваш ответ..." : "Enter your response..."}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={2}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {currentLanguage === "ru" ? "Отправить" : "Send"}
                    </button>
                </div>
            </div>
        </div>
    )
}