'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserClient as getUser } from '@/lib/auth-client';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import { History, Clock, ChevronDown, Download } from 'lucide-react';

interface Session {
    id: string;
    voice: string;
    step: string;
    inputs: any;
    output: any;
    started_at: string;
    finished_at: string | null;
    completed: boolean;
    truth_cut?: string;
    archetype?: string;
    todays_step?: string;
}

export default function HistoryPage() {
    const [user, setUser] = useState<any>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [userPlan, setUserPlan] = useState<string>('free');
    const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getUser();
                if (!userData) {
                    redirect('/?signin=1');
                }
                setUser(userData);

                // Fetch history data from API
                const response = await fetch('/api/history');
                if (!response.ok) {
                    throw new Error('Failed to fetch history');
                }

                const data = await response.json();
                setSessions(data.sessions);
                setUserPlan(data.plan);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleSession = (sessionId: string) => {
        const newExpanded = new Set(expandedSessions);
        if (newExpanded.has(sessionId)) {
            newExpanded.delete(sessionId);
        } else {
            newExpanded.add(sessionId);
        }
        setExpandedSessions(newExpanded);
    };

    const downloadPDF = async (sessionId: string) => {
        try {
            const response = await fetch(`/api/report/${sessionId}`);
            if (!response.ok) throw new Error('Failed to generate PDF');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `edem-report-${sessionId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Error downloading PDF');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        );
    }

    const isProUser = userPlan === 'pro';

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userPlan} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <History className="w-8 h-8 text-violet-600" />
                        Ritual History
                    </h1>
                    <p className="text-gray-600">
                        Your self-discovery sessions for the last {isProUser ? '30 days' : '24 hours'}
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-3">
                        {sessions.length === 0 ? (
                            <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                                <div className="text-gray-400 mb-4">
                                    <Clock className="w-12 h-12 mx-auto" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No rituals yet
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Start your first self-discovery ritual
                                </p>
                                <a
                                    href="/#demo"
                                    className="inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                >
                                    Start Ritual
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sessions.map((session) => (
                                    <div key={session.id} className="bg-white rounded-xl shadow-sm">
                                        <div
                                            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => toggleSession(session.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 capitalize">
                                                        {session.voice} voice
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(session.started_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 rounded-full hover:bg-gray-100">
                                                        <ChevronDown
                                                            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSessions.has(session.id) ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {session.completed ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        Completed
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                                        In Progress
                                                    </span>
                                                )}
                                                {session.archetype && (
                                                    <span className="px-2 py-1 bg-violet-100 text-violet-800 rounded-full text-xs">
                                                        {session.archetype}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {expandedSessions.has(session.id) && (
                                            <div className="px-6 pb-6 border-t">
                                                <div className="pt-4 space-y-4">
                                                    {session.truth_cut && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Root Truth</h4>
                                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                {session.truth_cut}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {session.archetype && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Archetype</h4>
                                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                {session.archetype}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {session.todays_step && (
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 mb-2">Today's Step</h4>
                                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                                {session.todays_step}
                                                            </p>
                                                        </div>
                                                    )}

                                                    {isProUser && (
                                                        <div className="flex justify-end pt-2">
                                                            <button
                                                                onClick={() => downloadPDF(session.id)}
                                                                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download PDF
                                                            </button>
                                                        </div>
                                                    )}

                                                    {!isProUser && (
                                                        <div className="bg-violet-50 rounded-lg p-4">
                                                            <p className="text-violet-700 text-sm">
                                                                PRO access is needed for PDF downloads and full results.
                                                                <a href="/app/billing" className="font-medium underline ml-1">
                                                                    Unlock PRO
                                                                </a>
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total sessions:</span>
                                    <span className="font-medium">{sessions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Completed:</span>
                                    <span className="font-medium">{sessions.filter(s => s.completed).length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade prompt for free users */}
                        {!isProUser && (
                            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white">
                                <h3 className="font-semibold mb-2">Expand Access</h3>
                                <p className="text-sm text-violet-100 mb-4">
                                    PRO gives you 30 days of history, full reports with archetypes, and PDF downloads.
                                </p>
                                <a
                                    href="/app/billing"
                                    className="inline-flex items-center px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                                >
                                    Unlock PRO
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}