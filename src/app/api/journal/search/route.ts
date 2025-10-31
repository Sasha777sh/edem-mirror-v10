import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ entries: [] });
        }

        // Search in text content and tags
        const entries = await sql`
            SELECT id, text, tags, polarity, energy, ts
            FROM journal
            WHERE user_id = ${user.id}
            AND (
                text ILIKE ${`%${query}%`} 
                OR tags::text ILIKE ${`%${query}%`}
            )
            ORDER BY ts DESC
            LIMIT 20
        `;

        return NextResponse.json({ entries });

    } catch (error) {
        console.error('Journal search error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}