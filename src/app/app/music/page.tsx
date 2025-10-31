import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import MusicPlaylists from '@/components/MusicPlaylists';
import { Music } from 'lucide-react';

export default async function MusicPage() {
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Music className="w-8 h-8 text-violet-600" />
                        Music Playlists
                    </h1>
                    <p className="text-gray-600">
                        Curated music collections for different states and practices
                    </p>
                </div>

                {!isProUser && (
                    <div className="mb-8 p-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white">
                        <h2 className="text-xl font-semibold mb-2">Available with PRO Only</h2>
                        <p className="mb-4">
                            Music playlists are available exclusively to EDEM PRO subscribers
                        </p>
                        <a
                            href="/app/billing"
                            className="inline-flex items-center px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors"
                        >
                            Unlock PRO
                        </a>
                    </div>
                )}

                {isProUser && (
                    <MusicPlaylists />
                )}
            </main>
        </div>
    );
}