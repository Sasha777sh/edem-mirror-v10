import { NextResponse } from 'next/server';
import { getUserAndRole } from './auth';
import { hasAccess, type Feature } from '@/lib/access';

export function withAccess(feature: Feature, handler: Function) {
    return async (req: Request, ctx: any) => {
        const { role } = await getUserAndRole();
        if (!hasAccess(feature, role)) {
            // мягкое поведение: даём свет вместо ошибки
            return NextResponse.json({
                ok: false,
                reason: 'forbidden',
                message: 'Недостаточно доступа. Включаю безопасный режим (свет).',
                fallbackFeature: 'light'
            }, { status: 403 });
        }
        return handler(req, ctx, role);
    };
}