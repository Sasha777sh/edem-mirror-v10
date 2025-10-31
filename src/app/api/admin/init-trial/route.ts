import { NextRequest, NextResponse } from 'next/server';
import { freeTrialService } from '@/lib/free-trial';
import { featureFlags } from '@/lib/feature-flags';

export async function POST(request: NextRequest) {
    try {
        // This endpoint should be protected in production
        const authHeader = request.headers.get('authorization');
        const adminSecret = process.env.ADMIN_SECRET;

        if (process.env.NODE_ENV === 'production' && (!adminSecret || authHeader !== `Bearer ${adminSecret}`)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize free trial system
        await freeTrialService.initializeTables();

        // Initialize feature flags
        await featureFlags.initializeFlags();

        return NextResponse.json({
            success: true,
            message: 'Free trial system initialized successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to initialize free trial system:', error);
        return NextResponse.json({
            error: 'Failed to initialize free trial system',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}