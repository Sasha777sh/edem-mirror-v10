'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface JournalEntryProps {
    userId: string;
}

export default function JournalEntry({ userId }: JournalEntryProps) {
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [energy, setEnergy] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text.trim(),
                    tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
                    energy: energy
                }),
            });

            if (response.ok) {
                // Reset form
                setText('');
                setTags('');
                setEnergy(5);
                // Refresh the page to show new entry
                window.location.reload();
            } else {
                console.error('Failed to save journal entry');
            }
        } catch (error) {
            console.error('Error saving journal entry:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="О чём вы думаете? Что чувствуете?"
                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    rows={4}
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Теги (через запятую)
                    </label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="настроение, работа, отношения"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Уровень энергии: {energy}/10
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={energy}
                        onChange={(e) => setEnergy(Number(e.target.value))}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !text.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </div>
        </form>
    );
}