'use client'

import DemoChatSection from '@/components/DemoChatSection'
import DemoChatSectionWithSocial from '@/components/DemoChatSectionWithSocial'

export default function TestAllDemoChatsPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Тест всех вариантов демонстрационных чатов</h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Базовый демо-чат</h2>
                        <DemoChatSection />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-center">Демо-чат с социальными сетями</h2>
                        <DemoChatSectionWithSocial />
                    </div>
                </div>
            </div>
        </div>
    )
}