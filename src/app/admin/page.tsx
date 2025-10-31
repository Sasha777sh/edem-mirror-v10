import { getUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import FeatureFlagsAdmin from '@/components/FeatureFlagsAdmin';
import { featureFlags } from '@/lib/feature-flags';

export default async function AdminPage() {
    const user = await getUser();

    if (!user) {
        redirect('/?signin=1');
    }

    // Check if user is admin (implement your own logic)
    const isAdmin = user.email?.endsWith('@edem.admin') || user.id === 'admin-user-id';
    if (!isAdmin) {
        redirect('/app');
    }

    // Initialize feature flags
    await featureFlags.initializeFlags();

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            🔧 Админ панель EDEM
                        </h1>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user.email}
                            </span>
                            <a
                                href="/app"
                                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                            >
                                К приложению
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Feature Flags Section */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Feature Flags
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Управление функциональностью без деплоя. Включайте и выключайте функции,
                            настраивайте постепенный роллаут.
                        </p>
                        <FeatureFlagsAdmin />
                    </section>

                    {/* Quick Stats */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Быстрая статистика
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Активные флаги
                                </h3>
                                <p className="text-3xl font-bold text-green-600">
                                    {/* This would be fetched from the API */}
                                    5
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Отключенные флаги
                                </h3>
                                <p className="text-3xl font-bold text-gray-600">
                                    4
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Градуальный роллаут
                                </h3>
                                <p className="text-3xl font-bold text-blue-600">
                                    0
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Быстрые действия
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-violet-300 text-left">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    🚀 Включить все новые функции
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Активировать все функции в разработке
                                </p>
                            </button>

                            <button className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-orange-300 text-left">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    ⚠️ Режим обслуживания
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Показать баннер технических работ
                                </p>
                            </button>

                            <button className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-green-300 text-left">
                                <h3 className="font-medium text-gray-900 mb-2">
                                    📊 Экспорт конфигурации
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Скачать все настройки флагов
                                </p>
                            </button>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}