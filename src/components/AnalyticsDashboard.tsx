'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface AnalyticsData {
    // User engagement data
    dailyActiveUsers: { date: string; count: number }[];
    userRetention: { period: string; rate: number }[];
    sessionDuration: { date: string; duration: number }[];

    // Conversion funnel
    funnelData: {
        step: string;
        count: number;
        percentage: number;
    }[];

    // Revenue metrics
    revenueData: { month: string; revenue: number; subscriptions: number }[];

    // Feature usage
    featureUsage: { feature: string; usage: number }[];
}

// Mock data for demonstration
const MOCK_DATA: AnalyticsData = {
    dailyActiveUsers: [
        { date: '2023-01-01', count: 120 },
        { date: '2023-01-02', count: 145 },
        { date: '2023-01-03', count: 132 },
        { date: '2023-01-04', count: 168 },
        { date: '2023-01-05', count: 185 },
        { date: '2023-01-06', count: 172 },
        { date: '2023-01-07', count: 190 },
    ],
    userRetention: [
        { period: 'Day 1', rate: 65 },
        { period: 'Day 7', rate: 42 },
        { period: 'Day 30', rate: 28 },
        { period: 'Day 90', rate: 18 },
    ],
    sessionDuration: [
        { date: '2023-01-01', duration: 3.2 },
        { date: '2023-01-02', duration: 4.1 },
        { date: '2023-01-03', duration: 3.8 },
        { date: '2023-01-04', duration: 4.5 },
        { date: '2023-01-05', duration: 5.2 },
        { date: '2023-01-06', duration: 4.8 },
        { date: '2023-01-07', duration: 5.0 },
    ],
    funnelData: [
        { step: 'Посетили сайт', count: 10000, percentage: 100 },
        { step: 'Начали демо', count: 3500, percentage: 35 },
        { step: 'Просмотрели paywall', count: 1800, percentage: 18 },
        { step: 'Нажали купить', count: 450, percentage: 4.5 },
        { step: 'Оплатили', count: 320, percentage: 3.2 },
    ],
    revenueData: [
        { month: 'Янв', revenue: 45000, subscriptions: 120 },
        { month: 'Фев', revenue: 52000, subscriptions: 145 },
        { month: 'Мар', revenue: 61000, subscriptions: 168 },
        { month: 'Апр', revenue: 68000, subscriptions: 185 },
        { month: 'Май', revenue: 75000, subscriptions: 202 },
        { month: 'Июн', revenue: 82000, subscriptions: 220 },
    ],
    featureUsage: [
        { feature: 'Ритуалы', usage: 85 },
        { feature: 'Дневник', usage: 72 },
        { feature: 'Архетипы', usage: 68 },
        { feature: 'Практики', usage: 55 },
        { feature: 'Экспорт', usage: 32 },
    ]
};

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

interface AnalyticsDashboardProps {
    className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        // In a real implementation, you would fetch data from your analytics API
        // For now, we'll use mock data
        setTimeout(() => {
            setData(MOCK_DATA);
            setLoading(false);
        }, 500);
    }, [timeRange]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className={`text-center py-8 ${className}`}>
                <p className="text-gray-500">Нет данных для отображения</p>
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Аналитика</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('7d')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === '7d'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        7 дней
                    </button>
                    <button
                        onClick={() => setTimeRange('30d')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === '30d'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        30 дней
                    </button>
                    <button
                        onClick={() => setTimeRange('90d')}
                        className={`px-3 py-1 rounded-lg text-sm ${timeRange === '90d'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        90 дней
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Активные пользователи</p>
                            <p className="text-2xl font-bold text-gray-900">1,248</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12% за месяц</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Конверсия</p>
                            <p className="text-2xl font-bold text-gray-900">3.2%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>+0.8% за месяц</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Средняя сессия</p>
                            <p className="text-2xl font-bold text-gray-900">4.8 мин</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>+0.5 мин за месяц</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Доход</p>
                            <p className="text-2xl font-bold text-gray-900">₽82,000</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>+12% за месяц</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* User Activity Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Активные пользователи</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.dailyActiveUsers}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value) => [value, 'Пользователи']}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString('ru-RU')}
                                />
                                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Conversion Funnel */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Воронка конверсии</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.funnelData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    dataKey="step"
                                    type="category"
                                    tick={{ fontSize: 12 }}
                                    width={100}
                                />
                                <Tooltip formatter={(value) => [value, 'Пользователи']} />
                                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                                    {data.funnelData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`rgba(59, 130, 246, ${1 - (index * 0.15)})`}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Доход и подписки</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10B981"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Доход (₽)"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="subscriptions"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="Подписки"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature Usage */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Использование функций</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.featureUsage}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="usage"
                                    label={({ feature, percent }) => `${feature}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {data.featureUsage.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, 'Использование']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}