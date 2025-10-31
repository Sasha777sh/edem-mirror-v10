import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
    const user = await getUser();

    if (!user) {
        redirect('/?signin=1');
    }

    // Check if user is admin
    const isAdmin = user.email?.endsWith('@edem.admin');
    if (!isAdmin) {
        redirect('/app');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan="admin" />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-violet-600" />
                        Аналитика платформы
                    </h1>
                    <p className="text-gray-600">
                        Статистика пользователей, конверсии и доходов
                    </p>
                </div>

                <AnalyticsDashboard />
            </main>
        </div>
    );
}