
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Debug logging for mobile API access
    if (pathname.startsWith('/api/orders/mobile')) {
      console.log('🔍 MOBILE API ACCESS:', pathname);
      console.log('📱 User-Agent:', req.headers.get('user-agent') || 'Unknown');
      console.log('🔑 Has token:', !!token);
      return NextResponse.next();
    }

    // Redirect root path to appropriate destination
    if (pathname === '/') {
      if (token?.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } else {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    // Check if accessing admin routes
    if (pathname.startsWith('/dashboard') ||
      (pathname.startsWith('/api') &&
        !pathname.startsWith('/api/auth') &&
        !pathname.startsWith('/api/orders/mobile'))) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages and home page without token
        if (pathname.startsWith('/auth') || pathname === '/') {
          return true;
        }

        // Require token for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    '/((?!api/auth|api/orders/mobile|_next/static|_next/image|favicon.ico|auth/signin|auth/signup).*)',
  ],
};
