export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Политика конфиденциальности</h1>

                <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
                    <section>
                        <h2 className="text-xl font-semibold mb-4">1. Общие положения</h2>
                        <p className="text-gray-700 leading-relaxed">
                            EDEM — это сервис самопомощи, предназначенный для личностного развития и самопознания.
                            Мы обрабатываем минимальные персональные данные, необходимые для работы сервиса.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">2. Какие данные мы собираем</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Email адрес (для регистрации и восстановления доступа)</li>
                            <li>Имя (опционально, для персонализации)</li>
                            <li>Содержание ваших сессий и дневниковых записей</li>
                            <li>Технические данные (IP-адрес, браузер, для безопасности)</li>
                            <li>Данные об использовании (для улучшения сервиса)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">3. Как мы используем данные</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Предоставление персонализированных рекомендаций</li>
                            <li>Обеспечение безопасности (модерация контента)</li>
                            <li>Обработка платежей через Stripe</li>
                            <li>Улучшение качества ИИ-ответов (анонимно)</li>
                            <li>Техническая поддержка и уведомления</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">4. Анонимность</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Ваши личные сессии не связываются с вашей личностью при анализе данных.
                            Мы используем анонимизированную статистику для улучшения алгоритмов.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">5. Безопасность</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Все данные шифруются при передаче и хранении. Доступ к персональным данным
                            имеют только авторизованные сотрудники для технической поддержки.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">6. Ваши права</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Запросить копию ваших данных</li>
                            <li>Исправить неточные данные</li>
                            <li>Удалить аккаунт и все связанные данные</li>
                            <li>Отозвать согласие на обработку в любой момент</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">7. Контакты</h2>
                        <p className="text-gray-700 leading-relaxed">
                            По вопросам конфиденциальности: privacy@edem.ai<br />
                            Срок ответа: до 30 дней
                        </p>
                    </section>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}