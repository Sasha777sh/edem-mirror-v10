import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import { Crown, CheckCircle, Clock } from 'lucide-react';

export default async function BillingPage() {
    const user = await getUser();

    if (!user) {
        redirect('/?signin=1');
    }

    // Get user subscription
    const userSub = await sql`
        select plan, status, period_end, stripe_customer_id 
        from subscriptions 
        where user_id = ${user.id}
    `;

    const isProUser = userSub[0]?.plan === 'pro' && userSub[0]?.status === 'active';

    // Get usage stats
    const usage = await sql`
        select demos_today, last_demo_date 
        from usage_counters 
        where user_id = ${user.id}
    `;

    const sessionCount = await sql`
        select count(*) as total 
        from sessions 
        where user_id = ${user.id}
    `;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userSub[0]?.plan || 'free'} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
                    <p className="text-gray-600">
                        Manage your subscription and track usage
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2">
                        {/* Current Plan */}
                        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <Crown className="w-6 h-6 text-yellow-500" />
                                {isProUser ? 'PRO Subscription' : 'Free Plan'}
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-medium mb-3">Subscription Status</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        {isProUser ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                <span className="text-green-600 font-medium">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <Clock className="w-5 h-5 text-gray-400" />
                                                <span className="text-gray-600">Free Plan</span>
                                            </>
                                        )}
                                    </div>
                                    {isProUser && userSub[0]?.period_end && (
                                        <p className="text-sm text-gray-600">
                                            Valid until: {new Date(userSub[0].period_end).toLocaleDateString('en-US')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-medium mb-3">Usage</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Total sessions:</span>
                                            <span>{sessionCount[0]?.total || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Demos today:</span>
                                            <span>{usage[0]?.demos_today || 0}/2</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isProUser && userSub[0]?.stripe_customer_id && (
                                <div className="mt-6 pt-6 border-t">
                                    <button
                                        onClick={() => fetch('/api/stripe/portal', { method: 'POST' }).then(r => r.json()).then(data => window.location.href = data.url)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Manage Subscription
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Plan Benefits */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-500" />
                                {isProUser ? 'Your PRO Features' : 'What PRO Offers'}
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${isProUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Unlimited rituals</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${isProUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Archetype analysis</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${isProUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">Personal practices</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${isProUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">30-day history</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full ${isProUser ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm">PDF export</span>
                                </div>
                            </div>

                            {!isProUser && (
                                <div className="mt-4 pt-4 border-t">
                                    <a
                                        href="/#pricing"
                                        className="block w-full text-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                                    >
                                        Unlock PRO
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}