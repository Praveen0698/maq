import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/declaration', '/instructions', '/assignment', '/admin',];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const role = request.cookies.get('userRole')?.value;

  const { pathname } = request.nextUrl;
  console.log("session_token: ", token);


  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Role-based protection logic
    if (
      pathname.startsWith('/admin') && role !== 'admin'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (
      (pathname.startsWith('/instructions') ||
        pathname.startsWith('/declaration') ||
        pathname.startsWith('/assignment')) &&
      role !== 'user'
    ) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}
