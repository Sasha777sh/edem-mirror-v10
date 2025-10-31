export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-16 max-w-4xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Пользовательское соглашение</h1>

                <div className="bg-white rounded-xl p-8 shadow-sm space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <h2 className="font-semibold text-yellow-800 mb-2">⚠️ Важное уведомление</h2>
                        <p className="text-yellow-700 text-sm">
                            EDEM не является медицинской услугой, психотерапией или лечением.
                            При серьёзных проблемах обратитесь к квалифицированным специалистам.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">1. Описание сервиса</h2>
                        <p className="text-gray-700 leading-relaxed">
                            EDEM — это цифровой инструмент самопомощи, использующий искусственный интеллект
                            для анализа эмоционального состояния и предоставления персонализированных рекомендаций
                            для личностного роста.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">2. Ограничения использования</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li><strong>Не медицинская помощь:</strong> EDEM не заменяет профессиональную медицинскую или психологическую помощь</li>
                            <li><strong>Кризисные ситуации:</strong> При суицидальных мыслях обращайтесь в экстренные службы</li>
                            <li><strong>Возрастное ограничение:</strong> Сервис предназначен для лиц старше 18 лет</li>
                            <li><strong>Личное использование:</strong> Запрещено коммерческое использование без согласия</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">3. Тарифы и оплата</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                            <li>Демо-версия: 1 сессия в 24 часа для незарегистрированных пользователей</li>
                            <li>Free план: 2 сессии в день, история на 24 часа</li>
                            <li>PRO план: безлимитные сессии, полные отчёты, история на 30 дней</li>
                            <li>Возврат средств в течение 24 часов после покупки</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">4. Ответственность</h2>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">
                                <strong>Отказ от ответственности:</strong> Мы не несём ответственность за решения,
                                принятые на основе рекомендаций EDEM. Сервис предоставляется "как есть" без гарантий.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">5. Экстренные контакты</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-800 mb-2">При кризисе обращайтесь:</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>🚨 <strong>Скорая помощь:</strong> 112, 103</li>
                                <li>📞 <strong>Телефон доверия:</strong> 8-800-2000-122</li>
                                <li>🆘 <strong>Психологическая помощь:</strong> 051 (МЧС)</li>
                                <li>💬 <strong>Чат поддержки:</strong> https://telefon-doveria.ru</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">6. Модерация контента</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Мы автоматически сканируем сообщения на предмет опасного контента и можем
                            приостановить сессию для вашей безопасности. При обнаружении суицидальных
                            мыслей система переключается в режим кризисного вмешательства.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-4">7. Изменения условий</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Мы можем обновлять эти условия. Существенные изменения будут отправлены
                            на ваш email за 30 дней до вступления в силу.
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