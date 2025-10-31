'use client';

import { useState } from 'react';

export default function RAGTestPage() {
    const [query, setQuery] = useState('');
    const [stage, setStage] = useState('shadow');
    const [symptom, setSymptom] = useState('anxiety');
    const [language, setLanguage] = useState('ru');
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResponse(null);

        try {
            const res = await fetch('/api/mirror_rag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    stage,
                    symptom,
                    lang: language,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to get response');
            }

            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setError('Failed to get RAG response. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">EDEM RAG Test</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                                Your Query
                            </label>
                            <input
                                type="text"
                                id="query"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                placeholder="Enter your psychological concern..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">
                                    Stage
                                </label>
                                <select
                                    id="stage"
                                    value={stage}
                                    onChange={(e) => setStage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="shadow">Shadow</option>
                                    <option value="truth">Truth</option>
                                    <option value="integration">Integration</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="symptom" className="block text-sm font-medium text-gray-700 mb-1">
                                    Symptom
                                </label>
                                <select
                                    id="symptom"
                                    value={symptom}
                                    onChange={(e) => setSymptom(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="anxiety">Anxiety</option>
                                    <option value="sleep">Sleep Issues</option>
                                    <option value="relationship">Relationship</option>
                                    <option value="breakup">Breakup</option>
                                    <option value="confidence">Confidence</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                    Language
                                </label>
                                <select
                                    id="language"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="ru">Russian</option>
                                    <option value="en">English</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Get RAG Response'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {response && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 mb-2">Response</h2>
                            <div className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{response.response}</p>
                            </div>

                            {response.context && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <h3 className="text-sm font-medium text-blue-800">Context</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Title: {response.context.title}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Similarity: {(response.context.similarity * 100).toFixed(2)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}