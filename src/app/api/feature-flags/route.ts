import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { featureFlags } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const flagId = searchParams.get('flag');

        if (flagId) {
            // Get specific flag
            const flag = await featureFlags.getFlag(flagId);
            if (!flag) {
                return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
            }
            return NextResponse.json(flag);
        } else {
            // Get all flags
            const flags = await featureFlags.getAllFlags();
            return NextResponse.json({ flags });
        }

    } catch (error) {
        console.error('Feature flags API error:', error);
        return NextResponse.json({
            error: 'Failed to fetch feature flags',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin (you can implement your own admin check logic)
        const isAdmin = session.user.email?.endsWith('@edem.admin') || session.user.id === 'admin-user-id';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, name, description, enabled, percentage, user_groups } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
        }

        const flag = await featureFlags.createFlag({
            id,
            name,
            description: description || '',
            enabled: enabled || false,
            percentage: percentage || 100,
            user_groups: user_groups || []
        });

        return NextResponse.json(flag, { status: 201 });

    } catch (error) {
        console.error('Feature flags create error:', error);
        return NextResponse.json({
            error: 'Failed to create feature flag',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@edem.admin') || session.user.id === 'admin-user-id';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const flagId = searchParams.get('flag');

        if (!flagId) {
            return NextResponse.json({ error: 'Flag ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, enabled, percentage, user_groups } = body;

        const updatedFlag = await featureFlags.updateFlag(flagId, {
            name,
            description,
            enabled,
            percentage,
            user_groups
        });

        if (!updatedFlag) {
            return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
        }

        return NextResponse.json(updatedFlag);

    } catch (error) {
        console.error('Feature flags update error:', error);
        return NextResponse.json({
            error: 'Failed to update feature flag',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const isAdmin = session.user.email?.endsWith('@edem.admin') || session.user.id === 'admin-user-id';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const flagId = searchParams.get('flag');

        if (!flagId) {
            return NextResponse.json({ error: 'Flag ID is required' }, { status: 400 });
        }

        const deleted = await featureFlags.deleteFlag(flagId);

        if (!deleted) {
            return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Feature flags delete error:', error);
        return NextResponse.json({
            error: 'Failed to delete feature flag',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}