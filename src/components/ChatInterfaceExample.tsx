import React, { useState } from 'react';
import { FeatureGate } from '@/components/FeatureGate';
import { Disclaimer } from '@/components/Disclaimer';

// This is an example component showing how to use the FeatureGate in a chat interface
export function ChatInterfaceExample({ userRole }: { userRole: 'public' | 'registered' | 'guardian' }) {
    const [selectedFeature, setSelectedFeature] = useState<'light' | 'truth' | 'shadow'>('light');

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">EDEM Living LLM Chat</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Depth Level:</label>
                <div className="space-x-2">
                    <FeatureGate role={userRole} feature="light" fallback={
                        <button
                            className="px-4 py-2 bg-gray-200 rounded cursor-not-allowed"
                            disabled
                        >
                            Light (Public)
                        </button>
                    }>
                        <button
                            className={`px-4 py-2 rounded ${selectedFeature === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedFeature('light')}
                        >
                            Light (Public)
                        </button>
                    </FeatureGate>

                    <FeatureGate role={userRole} feature="truth" fallback={
                        <button
                            className="px-4 py-2 bg-gray-200 rounded cursor-not-allowed"
                            disabled
                        >
                            Truth (Registered)
                        </button>
                    }>
                        <button
                            className={`px-4 py-2 rounded ${selectedFeature === 'truth' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedFeature('truth')}
                        >
                            Truth (Registered)
                        </button>
                    </FeatureGate>

                    <FeatureGate role={userRole} feature="shadow" fallback={
                        <button
                            className="px-4 py-2 bg-gray-200 rounded cursor-not-allowed"
                            disabled
                        >
                            Shadow (Guardian)
                        </button>
                    }>
                        <button
                            className={`px-4 py-2 rounded ${selectedFeature === 'shadow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => setSelectedFeature('shadow')}
                        >
                            Shadow (Guardian)
                        </button>
                    </FeatureGate>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Your Message:</label>
                    <textarea
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="Type your message here..."
                    />
                </div>

                <FeatureGate
                    role={userRole}
                    feature={selectedFeature}
                    fallback={
                        <div className="text-yellow-700 bg-yellow-100 p-3 rounded">
                            Недостаточно доступа. Включаю безопасный режим (свет).
                        </div>
                    }
                >
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Send to EDEM Living LLM ({selectedFeature})
                    </button>
                </FeatureGate>
            </div>

            <Disclaimer />
        </div>
    );
}