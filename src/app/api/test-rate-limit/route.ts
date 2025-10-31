import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'Rate limit test endpoint',
        timestamp: new Date().toISOString(),
        note: 'Make 60+ requests per minute to this endpoint to test rate limiting'
    });
}