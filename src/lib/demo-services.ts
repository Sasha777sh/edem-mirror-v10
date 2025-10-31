// Заглушки для демо-режима без реальных API ключей

// Mock OpenAI
export const mockOpenAI = {
    async chat(prompt: string): Promise<string> {
        console.log('🧠 Mock OpenAI response for:', prompt.substring(0, 50) + '...');

        const responses = [
            "Понимаю. Расскажи больше о том, что чувствуешь.",
            "Это важный шаг. Где в теле это ощущается?",
            "Вижу корень. Это не про потерю, а про контроль.",
            "Готов получить шаг на сегодня?"
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }
};

// Mock Redis
export const mockRedis = {
    async get(key: string) {
        console.log('📦 Mock Redis GET:', key);
        return null;
    },

    async set(key: string, value: any, ttl?: number) {
        console.log('📦 Mock Redis SET:', key, '(TTL:', ttl, 'sec)');
        return true;
    },

    async del(key: string) {
        console.log('📦 Mock Redis DEL:', key);
        return true;
    }
};

// Mock Supabase Auth
export const mockAuth = {
    async getUser() {
        return {
            id: 'demo_user_123',
            email: 'demo@example.com',
            name: 'Demo User'
        };
    },

    async signOut() {
        console.log('👤 Mock Auth: Sign out');
        return true;
    }
};

// Mock Database
export const mockDB = {
    async query(sql: string, params?: any[]) {
        console.log('🗄️ Mock DB Query:', sql.substring(0, 80) + '...');

        // Возвращаем разные моки в зависимости от запроса
        if (sql.includes('subscriptions')) {
            return [{ plan: 'free', status: 'active' }];
        }

        if (sql.includes('sessions')) {
            return [{
                id: 'demo_session_123',
                voice: 'soft',
                inputs: { problem: 'demo problem' },
                output: { truthCut: 'demo truth cut' }
            }];
        }

        return [];
    }
};