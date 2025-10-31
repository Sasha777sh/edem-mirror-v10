import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import ProgressCharts from '@/components/ProgressCharts';

export default async function ProgressPage() {
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

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userPlan} />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress</h1>
                    <p className="text-gray-600">
                        Analysis of your emotional state and activity
                    </p>
                </div>

                <ProgressCharts isProUser={isProUser} />
            </main>
        </div>
    );
}