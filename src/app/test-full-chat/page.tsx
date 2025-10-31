'use client'

import ChatEdemWidget from '@/components/ChatEdemWidget'

export default function TestFullChatPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Тест полноценного чата EDEM</h1>
                <ChatEdemWidget />
            </div>
        </div>
    )
}