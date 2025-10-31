import React, { useState } from 'react';

export function Disclaimer() {
    const [showHelpModal, setShowHelpModal] = useState(false);

    return (
        <>
            <div className="text-xs text-gray-500 mt-4">
                <p>EDEM — пространство самопомощи. Это не медицинская и не психотерапевтическая услуга.</p>
                <p className="mt-1">
                    Если вы думаете о причинении вреда себе или другим — обратитесь за срочной помощью:
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="text-blue-500 hover:underline ml-1"
                    >
                        Мне плохо
                    </button>
                </p>
            </div>

            {showHelpModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Срочная помощь</h3>
                        <p className="mb-4">
                            Если вы испытываете кризис или думаете о причинении вреда себе или другим,
                            немедленно обратитесь за профессиональной помощью:
                        </p>
                        <ul className="list-disc pl-5 mb-4">
                            <li>Позвоните в службу спасения: 112</li>
                            <li>Обратитесь к врачу или в отделение скорой помощи</li>
                            <li>Свяжитесь с кризисной линией поддержки</li>
                        </ul>
                        <p className="mb-4">
                            Для модерации контента и получения дополнительной помощи:
                            <a href="mailto:support@edem-living-llm.com" className="text-blue-500 hover:underline ml-1">
                                support@edem-living-llm.com
                            </a>
                        </p>
                        <button
                            onClick={() => setShowHelpModal(false)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}