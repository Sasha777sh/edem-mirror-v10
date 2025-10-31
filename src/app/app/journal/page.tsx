import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import JournalEntry from '@/components/JournalEntry';
import ExportButtons from '@/components/ExportButtons';
import JournalSearch from '@/components/JournalSearch';
import { BookOpen, Plus, Search } from 'lucide-react';

export default async function JournalPage() {
    const user = await getUser();

    if (!user) {
        redirect('/?signin=1');
    }

    // Get user subscription
    const subscription = await sql`
        select plan, status from subscriptions 
        where user_id = ${user.id}
    `;

    const userPlan = subscription[0]?.plan || 'free';
    const isProUser = userPlan === 'pro' && subscription[0]?.status === 'active';

    // Get journal entries (limit to last 7 days for free users, 30 days for PRO)
    const daysLimit = isProUser ? 30 : 7;
    const journalEntries = await sql`
        select id, text, tags, polarity, energy, ts
        from journal
        where user_id = ${user.id}
        and ts >= current_date - interval '${daysLimit} days'
        order by ts desc
        limit 50
    `;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userPlan} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-violet-600" />
                                Self-Discovery Journal
                            </h1>
                            <p className="text-gray-600">
                                Keep records of your thoughts, feelings, and insights
                            </p>
                        </div>
                        {journalEntries.length > 0 && (
                            <ExportButtons className="hidden sm:flex" />
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* New Entry Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-500" />
                                New Entry
                            </h2>
                            <JournalEntry userId={user.id} />
                        </div>

                        {/* Search */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-violet-500" />
                                Search Entries
                            </h2>
                            <JournalSearch />
                        </div>

                        {/* Journal Entries List */}
                        <div className="space-y-4">
                            {journalEntries.length === 0 ? (
                                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                                    <p className="text-gray-600">No journal entries yet</p>
                                </div>
                            ) : (
                                journalEntries.map((entry) => (
                                    <div key={entry.id} className="bg-white rounded-xl p-6 shadow-sm">
                                        <div className="flex items-start justify-between mb-3">
                                            <span className="text-sm text-gray-500">
                                                {new Date(entry.ts).toLocaleDateString('en-US')}
                                            </span>
                                            {entry.energy && (
                                                <span className="text-sm font-medium text-violet-600">
                                                    Energy: {entry.energy}/10
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-900 mb-3">{entry.text}</p>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {entry.tags.map((tag: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Export Buttons for Mobile */}
                        {journalEntries.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm sm:hidden">
                                <h3 className="font-semibold mb-4">Export Data</h3>
                                <ExportButtons />
                            </div>
                        )}

                        {/* Stats */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Entries:</span>
                                    <span className="font-medium">{journalEntries.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Upgrade prompt for free users */}
                        {!isProUser && (
                            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white">
                                <h3 className="font-semibold mb-2">Expand History</h3>
                                <p className="text-sm text-violet-100 mb-4">
                                    PRO gives you access to 30 days of entries and advanced analytics.
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