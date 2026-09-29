import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/') && !isAuthRoute;

  // Protect /admin routes (except /admin/login)
  if (isAdminRoute && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    try {
      const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only';
      const key = new TextEncoder().encode(secretKey);
      await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Protect mutating API routes
  if (isApiRoute && request.method !== 'GET') {
    const sessionCookie = request.cookies.get('admin_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const secretKey = process.env.JWT_SECRET || 'fallback-secret-key-for-dev-only';
      const key = new TextEncoder().encode(secretKey);
      await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
