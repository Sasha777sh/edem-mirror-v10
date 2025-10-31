'use client';

import { useState, useEffect } from 'react';
import { FeatureFlag } from '@/lib/feature-flags';

interface FeatureFlagsAdminProps {
    className?: string;
}

export default function FeatureFlagsAdmin({ className = '' }: FeatureFlagsAdminProps) {
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchFlags();
    }, []);

    const fetchFlags = async () => {
        try {
            setError(null);
            const response = await fetch('/api/feature-flags');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setFlags(data.flags || []);
        } catch (err) {
            console.error('Failed to fetch feature flags:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateFlag = async (flagId: string, updates: Partial<FeatureFlag>) => {
        try {
            const response = await fetch(`/api/feature-flags?flag=${flagId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchFlags();
            setEditingFlag(null);
        } catch (err) {
            console.error('Failed to update feature flag:', err);
            alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const createFlag = async (flag: Omit<FeatureFlag, 'created_at' | 'updated_at'>) => {
        try {
            const response = await fetch('/api/feature-flags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(flag),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchFlags();
            setShowCreateForm(false);
        } catch (err) {
            console.error('Failed to create feature flag:', err);
            alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const deleteFlag = async (flagId: string) => {
        if (!confirm('Удалить feature flag?')) {
            return;
        }

        try {
            const response = await fetch(`/api/feature-flags?flag=${flagId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            await fetchFlags();
        } catch (err) {
            console.error('Failed to delete feature flag:', err);
            alert(`Ошибка: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const toggleFlag = async (flag: FeatureFlag) => {
        await updateFlag(flag.id, { enabled: !flag.enabled });
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
                <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-4">Ошибка: {error}</p>
                    <button
                        onClick={fetchFlags}
                        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                        Повторить
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                    Добавить флаг
                </button>
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <CreateFlagForm
                    onSubmit={createFlag}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {/* Edit Form */}
            {editingFlag && (
                <EditFlagForm
                    flag={editingFlag}
                    onSubmit={(updates) => updateFlag(editingFlag.id, updates)}
                    onCancel={() => setEditingFlag(null)}
                />
            )}

            {/* Flags List */}
            <div className="space-y-4">
                {flags.map((flag) => (
                    <div
                        key={flag.id}
                        className="border border-gray-200 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-medium text-gray-900">{flag.name}</h3>
                                    <span
                                        className={`px-2 py-1 text-xs rounded-full ${flag.enabled
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {flag.enabled ? 'Включен' : 'Выключен'}
                                    </span>
                                    {flag.percentage && flag.percentage < 100 && (
                                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            {flag.percentage}%
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{flag.description}</p>
                                <p className="text-xs text-gray-400">ID: {flag.id}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleFlag(flag)}
                                    className={`px-3 py-1 text-sm rounded ${flag.enabled
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                        }`}
                                >
                                    {flag.enabled ? 'Выключить' : 'Включить'}
                                </button>
                                <button
                                    onClick={() => setEditingFlag(flag)}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                >
                                    Изменить
                                </button>
                                <button
                                    onClick={() => deleteFlag(flag.id)}
                                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {flags.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Нет feature flags
                </div>
            )}
        </div>
    );
}

interface CreateFlagFormProps {
    onSubmit: (flag: Omit<FeatureFlag, 'created_at' | 'updated_at'>) => void;
    onCancel: () => void;
}

function CreateFlagForm({ onSubmit, onCancel }: CreateFlagFormProps) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        enabled: false,
        percentage: 100,
        user_groups: [] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id || !formData.name) {
            alert('ID и название обязательны');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Создать новый флаг</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            ID *
                        </label>
                        <input
                            type="text"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="telegram_notifications"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Telegram уведомления"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="mr-2"
                            />
                            Включен
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Процент пользователей
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.percentage}
                            onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 100 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Создать
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}

interface EditFlagFormProps {
    flag: FeatureFlag;
    onSubmit: (updates: Partial<FeatureFlag>) => void;
    onCancel: () => void;
}

function EditFlagForm({ flag, onSubmit, onCancel }: EditFlagFormProps) {
    const [formData, setFormData] = useState({
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        percentage: flag.percentage || 100,
        user_groups: flag.user_groups || []
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-blue-50">
            <h3 className="text-lg font-medium mb-4">Редактировать флаг: {flag.id}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Название
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Описание
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.enabled}
                                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                className="mr-2"
                            />
                            Включен
                        </label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Процент пользователей
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.percentage}
                            onChange={(e) => setFormData({ ...formData, percentage: parseInt(e.target.value) || 100 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Сохранить
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}