'use client'

import DemoChatSectionWithSocial from '@/components/DemoChatSectionWithSocial'

export default function TestDemoChatSocialPage() {
    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Тест демонстрационного чата с социальными сетями</h1>
                <DemoChatSectionWithSocial />
            </div>
        </div>
    )
}