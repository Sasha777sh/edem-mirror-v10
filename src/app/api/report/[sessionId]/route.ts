import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { generatePDFReport, createFullReport } from '@/lib/pdf-generator';

export async function GET(
    request: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Проверяем PRO подписку
        const subscription = await sql`
      select plan, status from subscriptions 
      where user_id = ${user.id} and status = 'active'
    `;

        if (subscription.length === 0 || subscription[0].plan !== 'pro') {
            return NextResponse.json({ error: 'PRO subscription required' }, { status: 403 });
        }

        // Получаем данные сессии
        const session = await sql`
      select * from sessions 
      where id = ${params.sessionId} and user_id = ${user.id}
    `;

        if (session.length === 0) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const sessionData = session[0];

        // Проверяем, что сессия завершена
        if (!sessionData.finished_at) {
            return NextResponse.json({ error: 'Session not completed' }, { status: 400 });
        }

        // Создаём полный отчёт
        const reportData = await createFullReport(sessionData, user.id, user.name);
        const pdf = generatePDFReport(reportData);

        // Возвращаем PDF как blob
        const pdfOutput = pdf.output('arraybuffer');

        return new NextResponse(pdfOutput, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="EDEM-Report-${params.sessionId}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
