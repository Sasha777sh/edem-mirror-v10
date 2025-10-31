"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface ResonanceDataPoint {
    date: string;
    score: number;
    frequency: number;
    alignment: number;
    engagement: number;
}

interface ResonanceMetrics {
    currentScore: number;
    averageScore: number;
    trend: 'up' | 'down' | 'stable';
    insights: string[];
    history: ResonanceDataPoint[];
}

export default function ResonanceDashboard({
    metrics
}: {
    metrics: ResonanceMetrics
}) {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

    // Filter data based on time range
    const filteredData = metrics.history.filter((_, index) => {
        if (timeRange === 'week') return index < 7;
        if (timeRange === 'month') return index < 30;
        return true;
    });

    // Prepare data for radar chart
    const radarData = [
        { subject: 'Частота', A: metrics.history[0]?.frequency || 0, fullMark: 10 },
        { subject: 'Согласование', A: metrics.history[0]?.alignment || 0, fullMark: 10 },
        { subject: 'Вовлеченность', A: metrics.history[0]?.engagement || 0, fullMark: 10 },
        { subject: 'Резонанс', A: Math.round((metrics.history[0]?.frequency || 0 + metrics.history[0]?.alignment || 0 + metrics.history[0]?.engagement || 0) / 3), fullMark: 10 },
    ];

    return (
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Панель Резонанса</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('week')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Неделя
                    </button>
                    <button
                        onClick={() => setTimeRange('month')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'month' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Месяц
                    </button>
                    <button
                        onClick={() => setTimeRange('all')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                    >
                        Все время
                    </button>
                </div>
            </div>

            {/* Main resonance score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-900/50 to-purple-700/50 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{metrics.currentScore}</div>
                    <div className="text-purple-300">Текущий резонанс</div>
                    <div className={`text-sm mt-2 ${metrics.trend === 'up' ? 'text-green-400' : metrics.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                        {metrics.trend === 'up' ? '↑ Улучшение' : metrics.trend === 'down' ? '↓ Снижение' : '→ Стабильно'}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/50 to-blue-700/50 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{metrics.averageScore}</div>
                    <div className="text-blue-300">Средний резонанс</div>
                    <div className="text-sm text-gray-400 mt-2">за все время</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-700/50 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-white mb-2">{filteredData.length}</div>
                    <div className="text-yellow-300">Сессий</div>
                    <div className="text-sm text-gray-400 mt-2">за период</div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Line chart for resonance over time */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Динамика резонанса</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    stroke="#9CA3AF"
                                    domain={[0, 100]}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                                    labelStyle={{ color: 'white' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#A78BFA"
                                    strokeWidth={2}
                                    dot={{ stroke: '#A78BFA', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#A78BFA' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar chart for metrics comparison */}
                <div className="bg-gray-900/50 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Метрики резонанса</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <Radar
                                    name="Метрики"
                                    dataKey="A"
                                    stroke="#A78BFA"
                                    fill="#A78BFA"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: 'white' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Инсайты резонанса</h3>
                <div className="space-y-3">
                    {metrics.insights.map((insight, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start p-3 bg-gray-800/50 rounded-lg"
                        >
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 mr-3 flex-shrink-0"></div>
                            <div className="text-gray-300 text-sm">{insight}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}