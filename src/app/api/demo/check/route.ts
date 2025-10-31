import { NextRequest, NextResponse } from 'next/server';
import { checkDemoLimit } from '@/lib/demo';

export async function POST(req: NextRequest) {
    try {
        const result = await checkDemoLimit(req);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Demo check error:', error);
        return NextResponse.json(
            { ok: false, reason: 'error' },
            { status: 500 }
        );
    }
}