'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

interface JournalEntry {
    id: string;
    text: string;
    tags: string[];
    polarity: string | null;
    energy: number | null;
    ts: string;
}

interface JournalSearchProps {
    onEntrySelect?: (entry: JournalEntry) => void;
    className?: string;
}

export default function JournalSearch({ onEntrySelect, className = '' }: JournalSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
    const journalSearchEnabled = useFeatureFlag('journal_search');

    // Don't render if feature is disabled
    if (!journalSearchEnabled) {
        return null;
    }

    const handleSearch = async (term: string) => {
        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/journal/search?q=${encodeURIComponent(term)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.entries || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchTerm) {
                handleSearch(searchTerm);
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    const handleEntryClick = (entry: JournalEntry) => {
        setSelectedEntry(entry);
        if (onEntrySelect) {
            onEntrySelect(entry);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setSelectedEntry(null);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Поиск по записям дневника..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
                {searchTerm && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Search Results */}
            {(searchResults.length > 0 || isLoading) && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center">
                            <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-2">Поиск...</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {searchResults.map((entry) => (
                                <div
                                    key={entry.id}
                                    onClick={() => handleEntryClick(entry)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs text-gray-500">
                                            {new Date(entry.ts).toLocaleDateString('ru-RU')}
                                        </span>
                                        {entry.energy && (
                                            <span className="text-xs font-medium text-violet-600">
                                                Энергия: {entry.energy}/10
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-900 line-clamp-2">
                                        {entry.text}
                                    </p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex gap-1 mt-2 flex-wrap">
                                            {entry.tags.slice(0, 3).map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                            {entry.tags.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                                                    +{entry.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {searchResults.length === 0 && searchTerm && (
                                <div className="p-4 text-center text-gray-500">
                                    Ничего не найдено
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Entry Detail */}
            {selectedEntry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Запись от {new Date(selectedEntry.ts).toLocaleDateString('ru-RU')}
                                </h3>
                                <button
                                    onClick={() => setSelectedEntry(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {selectedEntry.text}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedEntry.tags && selectedEntry.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-4 text-sm text-gray-600">
                                    {selectedEntry.polarity && (
                                        <span>Полярность: {selectedEntry.polarity}</span>
                                    )}
                                    {selectedEntry.energy && (
                                        <span>Энергия: {selectedEntry.energy}/10</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}