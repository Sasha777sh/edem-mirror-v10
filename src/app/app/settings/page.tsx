import { getUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redirect } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import SettingsForm from '@/components/SettingsForm';
import ReferralPanel from '@/components/ReferralPanel';
import { referralService } from '@/lib/referrals';

interface UserSettings {
    voice_preference: 'soft' | 'hard' | 'therapist';
    language: 'ru' | 'en';
    telegram_notifications: boolean;
    email_notifications: boolean;
}

export default async function SettingsPage({ searchParams }: { searchParams: { telegram?: string } }) {
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

    // Get user settings
    const userSettings: any = await sql`
        select voice_preference, language, telegram_notifications, email_notifications 
        from user_settings 
        where user_id = ${user.id}
    `;

    // Check if there's a Telegram linking request
    const telegramChatId = searchParams.telegram;

    // Initialize referral system
    await referralService.initializeTables();

    const settings: UserSettings = {
        voice_preference: userSettings[0]?.voice_preference || 'soft',
        language: userSettings[0]?.language || 'en',
        telegram_notifications: userSettings[0]?.telegram_notifications ?? false,
        email_notifications: userSettings[0]?.email_notifications ?? true
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader user={user} plan={userPlan} />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                        <p className="text-gray-600">
                            Personalize your EDEM experience
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <SettingsForm
                                userId={user.id}
                                initialSettings={settings}
                                telegramChatId={telegramChatId}
                            />
                        </div>

                        <div>
                            <ReferralPanel className="mb-6" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}