import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { checkSafetyContent, logSafetyIncident } from '@/lib/safety';
import { z } from 'zod';

const JournalEntrySchema = z.object({
    text: z.string().min(1).max(5000),
    tags: z.array(z.string()).optional(),
    polarity: z.string().nullable().optional(),
    energy: z.number().min(1).max(10).optional()
});

export async function POST(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = JournalEntrySchema.parse(body);

        // Safety check on journal content
        const safetyResult = checkSafetyContent(validatedData.text, 'ru');

        if (!safetyResult.isSafe) {
            // Log the safety incident
            await logSafetyIncident(user.id, null, validatedData.text, safetyResult.riskLevel, safetyResult.triggeredWords);

            // Still allow the journal entry but flag for review
            console.warn(`Journal entry with safety concern from user ${user.id}`);
        }

        // Insert journal entry
        const result = await sql`
      insert into journal (user_id, text, tags, polarity, energy, ts)
      values (
        ${user.id}, 
        ${validatedData.text}, 
        ${validatedData.tags ? JSON.stringify(validatedData.tags) : null},
        ${validatedData.polarity || null},
        ${validatedData.energy || null},
        now()
      )
      returning id, ts
    `;

        return NextResponse.json({
            success: true,
            entry: result[0],
            safetyAlert: !safetyResult.isSafe ? safetyResult.intervention : null
        });

    } catch (error) {
        console.error('Journal API error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                error: 'Invalid input',
                details: error.errors
            }, { status: 400 });
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const tag = url.searchParams.get('tag');

        let query = sql`
      select id, text, tags, polarity, energy, ts
      from journal
      where user_id = ${user.id}
    `;

        if (tag) {
            query = sql`
        select id, text, tags, polarity, energy, ts
        from journal
        where user_id = ${user.id}
        and tags @> ${JSON.stringify([tag])}
      `;
        }

        const entries = await sql`
      ${query}
      order by ts desc
      limit ${limit}
      offset ${offset}
    `;

        return NextResponse.json({ entries });

    } catch (error) {
        console.error('Journal GET API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}