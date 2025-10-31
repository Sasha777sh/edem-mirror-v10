'use client';

import { useState, useEffect } from 'react';
import NsmDashboard from '@/components/NsmDashboard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function NsmAnalyticsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setIsLoading(false);
        };

        getUser();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-600">Please log in to view analytics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">NSM Analytics</h1>
                    <p className="text-gray-600">Net Satisfaction Metric Dashboard</p>
                </div>

                <NsmDashboard />
            </div>
        </div>
    );
}