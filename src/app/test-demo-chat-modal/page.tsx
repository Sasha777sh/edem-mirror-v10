'use client'

import DemoChatSectionWithModal from '@/components/DemoChatSectionWithModal'

export default function TestDemoChatModalPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Тест демонстрационного чата с модальным окном</h1>
                <DemoChatSectionWithModal />
            </div>
        </div>
    )
}