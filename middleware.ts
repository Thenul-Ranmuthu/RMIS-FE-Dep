// RMIS-FE/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protect all /ministry/quota-requests routes
    if (pathname.startsWith('/ministry/quota-requests')) {
        const token = request.cookies.get('accessToken')?.value;

        // If no token cookie → redirect to ministry login
        if (!token) {
            return NextResponse.redirect(new URL('/ministry', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/ministry/quota-requests/:path*'],
};
