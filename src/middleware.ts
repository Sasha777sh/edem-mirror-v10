import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    // Create a Supabase client configured to use cookies
    const res = NextResponse.next();
    const supabase = createMiddlewareSupabaseClient({ req, res });

    // Refresh session if expired - required for Server Components
    const { data: { session } } = await supabase.auth.getSession();

    // Protected routes that require authentication
    const protectedPaths = [
        '/app',
        '/dashboard',
        '/journal',
        '/progress',
        '/profile',
        '/api/edem-living-llm',
        '/api/edem-living-llm/echo'
    ];

    // Check if the current path is protected
    const isProtectedRoute = protectedPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
    );

    // If accessing a protected route without a session, redirect to login
    if (isProtectedRoute && !session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/signin';
        redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};