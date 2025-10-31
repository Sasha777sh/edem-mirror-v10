'use client';

import { useState } from 'react';

interface CalibrationFormProps {
    onComplete: (data: { symptom: string; intensity: number }) => void;
}

export default function CalibrationForm({ onComplete }: CalibrationFormProps) {
    const [symptom, setSymptom] = useState('');
    const [intensity, setIntensity] = useState(5);

    const symptoms = [
        { value: 'anxiety', label: 'Тревога' },
        { value: 'breakup', label: 'Расставание' },
        { value: 'sleep', label: 'Бессонница' },
        { value: 'anger', label: 'Гнев' },
        { value: 'emptiness', label: 'Пустота' },
        { value: 'guilt', label: 'Вина' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete({ symptom, intensity });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Калибровка</h2>
            <p className="text-gray-600 mb-6 text-center">
                Помогите системе лучше понять вас для более точных ответов
            </p>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Что вас больше всего беспокоит?
                    </label>
                    <select
                        value={symptom}
                        onChange={(e) => setSymptom(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        required
                    >
                        <option value="">Выберите состояние</option>
                        {symptoms.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Интенсивность ({intensity}/10)
                    </label>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Низкая</span>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={intensity}
                            onChange={(e) => setIntensity(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-500">Высокая</span>
                    </div>
                    <div className="text-center mt-1">
                        <span className="text-lg font-medium text-purple-600">{intensity}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    Начать сессию
                </button>
            </form>
        </div>
    );
}