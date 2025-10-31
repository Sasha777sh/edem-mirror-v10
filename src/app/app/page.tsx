import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import EnhancedDashboardContent from '@/components/EnhancedDashboardContent';
import FreeTrialBanner, { TrialStatusWidget } from '@/components/FreeTrialBanner';
import { Calendar, BookOpen, TrendingUp, Target } from 'lucide-react';

export default async function DashboardPage({ searchParams }: { searchParams: { referral?: string } }) {
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

    // Get user preferred voice (default to soft)
    const userSettings = await sql`
        select voice_preference from user_settings 
        where user_id = ${user.id}
    `;
    const preferredVoice = userSettings[0]?.voice_preference || 'soft';

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userPlan} />

            <main className="container mx-auto px-4 py-8">
                {/* Referral Success Notification */}
                {searchParams.referral === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-lg">🎉</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-800">Congratulations!</h3>
                                <p className="text-green-700 text-sm">
                                    Referral code applied. You've received 3 days of PRO as a gift!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Free Trial Banner */}
                        <FreeTrialBanner />

                        {/* Welcome Section */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome, {user.name || 'friend'}!
                            </h1>
                            <p className="text-gray-600">
                                {isProUser ? (
                                    'Your PRO subscription is active. Full access to all features.'
                                ) : (
                                    'Start your journey of self-discovery with rituals and journaling.'
                                )}
                            </p>
                        </div>

                        {/* Enhanced Dashboard Content */}
                        <EnhancedDashboardContent
                            userVoice={preferredVoice as 'soft' | 'hard' | 'therapist'}
                            isProUser={isProUser}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trial Status Widget */}
                        <TrialStatusWidget />

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <a
                                    href="/app/journal"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <BookOpen className="w-5 h-5 text-violet-600" />
                                    <span>Journal</span>
                                </a>
                                <a
                                    href="/app/history"
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Calendar className="w-5 h-5 text-violet-600" />
                                    <span>History</span>
                                </a>
                            </div>
                        </div>

                        {/* Upgrade prompt for free users */}
                        {!isProUser && (
                            <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-6 text-white">
                                <h3 className="font-semibold mb-2">Unlock PRO</h3>
                                <p className="text-sm text-violet-100 mb-4">
                                    Unlimited rituals, archetypes, practices, and 30-day history.
                                </p>
                                <a
                                    href="/app/billing"
                                    className="inline-flex items-center px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                                >
                                    Try PRO
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}