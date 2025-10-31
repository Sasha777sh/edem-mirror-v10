'use client';

import React, { useState } from 'react';

interface EmotionData {
    date: string;
    shadows: Record<string, number>;
    totalIntensity: number;
}

interface EmotionChartProps {
    data: EmotionData[];
    shadows: Array<{ id: string; name: string; color: string }>;
}

export default function EmotionChart({ data, shadows }: EmotionChartProps) {
    const [hoveredDay, setHoveredDay] = useState<number | null>(null);
    const [selectedShadow, setSelectedShadow] = useState<string | null>(null);

    const maxIntensity = Math.max(...data.map(d => d.totalIntensity));

    return (
        <div className="border rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <div className="text-sm text-gray-500">Динамика теней</div>
                    <div className="text-lg font-semibold">7 дней · интенсивность</div>
                </div>
                <div className="flex gap-1">
                    {shadows.map(shadow => (
                        <button
                            key={shadow.id}
                            onClick={() => setSelectedShadow(selectedShadow === shadow.id ? null : shadow.id)}
                            className={`w-4 h-4 rounded-full border-2 transition-all ${selectedShadow === shadow.id ? 'scale-125 border-gray-900' : 'border-gray-300'
                                }`}
                            style={{ backgroundColor: shadow.color }}
                        />
                    ))}
                </div>
            </div>

            {/* График */}
            <div className="relative h-32 flex items-end justify-between gap-1">
                {data.map((day, index) => (
                    <div
                        key={index}
                        className="relative flex-1 flex flex-col items-center"
                        onMouseEnter={() => setHoveredDay(index)}
                        onMouseLeave={() => setHoveredDay(null)}
                    >
                        {/* Столбик */}
                        <div className="w-full flex flex-col justify-end h-24 gap-0.5 bg-gray-100 rounded-t">
                            {shadows.map(shadow => {
                                const value = day.shadows[shadow.id] || 0;
                                const height = (value / maxIntensity) * 100;
                                const isVisible = !selectedShadow || selectedShadow === shadow.id;

                                return (
                                    <div
                                        key={shadow.id}
                                        className={`w-full transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-20'
                                            }`}
                                        style={{
                                            height: `${height}%`,
                                            backgroundColor: shadow.color,
                                            minHeight: value > 0 ? '2px' : '0px'
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* День недели */}
                        <div className="text-xs text-gray-500 mt-1">
                            {new Date(day.date).toLocaleDateString('ru', { weekday: 'short' })}
                        </div>

                        {/* Тултип при ховере */}
                        {hoveredDay === index && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                                <div className="font-semibold">{new Date(day.date).toLocaleDateString('ru')}</div>
                                {shadows.map(shadow => {
                                    const value = day.shadows[shadow.id] || 0;
                                    if (value === 0) return null;
                                    return (
                                        <div key={shadow.id} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shadow.color }} />
                                            {shadow.name}: {value}%
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Инсайт */}
            <div className="mt-4 text-xs text-gray-600">
                {selectedShadow ? (
                    <span>Фокус на <b>{shadows.find(s => s.id === selectedShadow)?.name}</b></span>
                ) : (
                    <span>Тренд: {data[data.length - 1]?.totalIntensity > data[0]?.totalIntensity ? '📈 Растет' : '📉 Снижается'}</span>
                )}
            </div>
        </div>
    );
}