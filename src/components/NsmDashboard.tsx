"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

interface NsmMetrics {
    totalSessions: number;
    positiveFeedback: number;
    negativeFeedback: number;
    nsmScore: number;
    averageShiftScore: number | null;
    trend: Array<{ date: string, nsm: number }>;
}

export default function NsmDashboard() {
    const [metrics, setMetrics] = useState<NsmMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState(30);
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchMetrics();
    }, [timeRange]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/analytics/nsm?days=${timeRange}`);
            const data = await response.json();
            setMetrics(data);
        } catch (error) {
            console.error("Failed to fetch NSM metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-center text-gray-500">
                    Unable to load metrics
                </div>
            </div>
        );
    }

    const nsmPercentage = metrics.totalSessions > 0
        ? Math.round((metrics.positiveFeedback / metrics.totalSessions) * 100)
        : 0;

    // Format trend data for chart
    const chartData = metrics.trend.map(point => ({
        date: new Date(point.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        nsm: point.nsm
    }));

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Total Sessions</div>
                    <div className="text-2xl font-bold text-gray-900">{metrics.totalSessions}</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Positive Feedback</div>
                    <div className="text-2xl font-bold text-green-600">{metrics.positiveFeedback}</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">Negative Feedback</div>
                    <div className="text-2xl font-bold text-red-600">{metrics.negativeFeedback}</div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-sm mb-1">NSM Score</div>
                    <div className={`text-2xl font-bold ${metrics.nsmScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metrics.nsmScore}%
                    </div>
                </div>
            </div>

            {/* NSM Gauge */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Net Satisfaction Metric</h3>
                <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                        {/* Gauge background */}
                        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                        {/* Gauge fill */}
                        <div
                            className="absolute inset-0 rounded-full border-8 border-green-500"
                            style={{
                                clipPath: `inset(0 0 0 ${50 - (metrics.nsmScore / 2)}%)`
                            }}
                        ></div>

                        {/* Center text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className={`text-3xl font-bold ${metrics.nsmScore >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metrics.nsmScore}%
                            </div>
                            <div className="text-gray-500 text-sm">NSM Score</div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <div className="text-gray-600">
                        {nsmPercentage}% of users reported feeling better after sessions
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">NSM Trend</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTimeRange(7)}
                            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 7 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            7 days
                        </button>
                        <button
                            onClick={() => setTimeRange(30)}
                            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 30 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            30 days
                        </button>
                        <button
                            onClick={() => setTimeRange(90)}
                            className={`px-3 py-1 text-sm rounded-lg ${timeRange === 90 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            90 days
                        </button>
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[-100, 100]} />
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'NSM']}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="nsm"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                        No data available for the selected period
                    </div>
                )}
            </div>
        </div>
    );
}