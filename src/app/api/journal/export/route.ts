import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);
        const format = searchParams.get('format') || 'csv';

        // Get all journal entries for the user
        const entries = await sql`
            SELECT 
                j.id,
                j.content,
                j.polarity,
                j.voice,
                j.tags,
                j.mood,
                j.created_at,
                s.truth_cut,
                s.archetype,
                s.todays_step,
                u.email
            FROM journal j
            LEFT JOIN sessions s ON j.session_id = s.id
            LEFT JOIN users u ON j.user_id = u.id
            WHERE j.user_id = ${userId}
            ORDER BY j.created_at DESC
        `;

        const formattedEntries = entries.map(entry => ({
            id: entry.id,
            date: new Date(entry.created_at).toISOString().split('T')[0],
            time: new Date(entry.created_at).toTimeString().split(' ')[0],
            content: entry.content || '',
            polarity: entry.polarity || '',
            voice: entry.voice || '',
            tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
            mood: entry.mood || '',
            truth_cut: entry.truth_cut || '',
            archetype: entry.archetype || '',
            todays_step: entry.todays_step || '',
            email: entry.email || ''
        }));

        if (format === 'json') {
            return NextResponse.json({
                export_date: new Date().toISOString(),
                total_entries: formattedEntries.length,
                user_email: session.user.email,
                entries: formattedEntries
            }, {
                headers: {
                    'Content-Disposition': `attachment; filename="edem-journal-${new Date().toISOString().split('T')[0]}.json"`,
                    'Content-Type': 'application/json'
                }
            });
        }

        if (format === 'csv') {
            const csvHeaders = [
                'ID',
                'Дата',
                'Время',
                'Содержание',
                'Полярность',
                'Голос',
                'Теги',
                'Настроение',
                'Корень правды',
                'Архетип',
                'Шаг на сегодня'
            ];

            const csvRows = formattedEntries.map(entry => [
                entry.id,
                entry.date,
                entry.time,
                `"${entry.content.replace(/"/g, '""')}"`,
                entry.polarity,
                entry.voice,
                `"${entry.tags}"`,
                entry.mood,
                `"${entry.truth_cut.replace(/"/g, '""')}"`,
                entry.archetype,
                `"${entry.todays_step.replace(/"/g, '""')}"`
            ]);

            const csvContent = [
                csvHeaders.join(','),
                ...csvRows.map(row => row.join(','))
            ].join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Disposition': `attachment; filename="edem-journal-${new Date().toISOString().split('T')[0]}.csv"`,
                    'Content-Type': 'text/csv; charset=utf-8'
                }
            });
        }

        return NextResponse.json({ error: 'Invalid format' }, { status: 400 });

    } catch (error) {
        console.error('Journal export error:', error);
        return NextResponse.json({
            error: 'Failed to export journal',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}