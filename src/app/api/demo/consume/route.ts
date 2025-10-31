import { NextRequest, NextResponse } from 'next/server';
import { consumeDemo } from '@/lib/demo';

export async function POST(req: NextRequest) {
    try {
        const success = await consumeDemo(req);
        return NextResponse.json({ ok: success });
    } catch (error) {
        console.error('Demo consume error:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to consume demo' },
            { status: 500 }
        );
    }
}