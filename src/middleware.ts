import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME, extractTokenFromRequest } from './lib/auth';

// Define route patterns protected by role
const FREELANCER_ROUTE_PREFIX = '/freelancer';
const CLIENT_ROUTE_PREFIX = '/client';
const FREELANCER_API_PREFIX = '/api/freelancer';
const CLIENT_API_PREFIX = '/api/client';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract session token from HttpOnly cookie or Authorization Bearer header
  const token =
    request.cookies.get(AUTH_COOKIE_NAME)?.value ||
    extractTokenFromRequest(request);

  const isApiRoute = pathname.startsWith('/api/');

  // 1. If user is accessing /login:
  if (pathname === '/login') {
    if (token) {
      const session = await verifyToken(token);
      if (session) {
        // User already has an active, valid session -> send directly to their role dashboard
        const destination =
          session.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      }
    }
    // Allow unauthenticated users to view the login screen
    return NextResponse.next();
  }

  // 2. Unauthenticated Check for Protected Routes (/, /dashboard, /freelancer/*, /client/*)
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          error: '401 Unauthorized',
          message: 'Authentication session token is required to access this endpoint.',
        },
        { status: 401 }
      );
    }

    // Default Landing Route: unauthenticated visits to root or dashboards go to /login
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
      loginUrl.searchParams.set('error', 'unauthenticated');
    }
    return NextResponse.redirect(loginUrl);
  }

  // 3. Cryptographic Token Verification (HMAC-SHA256 signature & expiration)
  const session = await verifyToken(token);

  if (!session) {
    if (isApiRoute) {
      return NextResponse.json(
        {
          error: '401 Unauthorized',
          message: 'Your session token is invalid, forged, or has expired.',
        },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    loginUrl.searchParams.set('error', 'session_expired');

    const response = NextResponse.redirect(loginUrl);
    // Clear corrupted / expired cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // 4. Role-based routing for generic /dashboard and root /
  if (pathname === '/dashboard') {
    const destination =
      session.role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (pathname === '/') {
    // If a Client visits root, redirect to Client Dashboard (Clients cannot access Freelancer suite)
    if (session.role === 'client') {
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
    // Freelancers continue to root
  }

  // 5. Strict Role-Based Content Access Control & 403 Forbidden Interception

  // A. FREELANCER ZONE: Freelancer role strictly required
  const isFreelancerTarget =
    pathname.startsWith(FREELANCER_ROUTE_PREFIX) ||
    pathname.startsWith(FREELANCER_API_PREFIX);

  if (isFreelancerTarget && session.role !== 'freelancer') {
    if (isApiRoute) {
      return NextResponse.json(
        {
          status: 403,
          error: '403 Forbidden',
          message: 'Access Denied: Client role cannot access Freelancer routes or APIs.',
          userRole: session.role,
          requiredRole: 'freelancer',
          attemptedPath: pathname,
        },
        { status: 403 }
      );
    }

    // Rewrite to /forbidden so the URL remains what the user typed and returns HTTP 403
    const forbiddenUrl = new URL('/forbidden', request.url);
    forbiddenUrl.searchParams.set('attempted', pathname);
    forbiddenUrl.searchParams.set('userRole', session.role);
    forbiddenUrl.searchParams.set('requiredRole', 'freelancer');
    forbiddenUrl.searchParams.set('userName', session.name);

    return NextResponse.rewrite(forbiddenUrl, {
      status: 403,
      headers: {
        'x-forbidden-reason': 'freelancer_role_required',
      },
    });
  }

  // B. CLIENT ZONE: Client role strictly required
  const isClientTarget =
    pathname.startsWith(CLIENT_ROUTE_PREFIX) ||
    pathname.startsWith(CLIENT_API_PREFIX);

  if (isClientTarget && session.role !== 'client') {
    if (isApiRoute) {
      return NextResponse.json(
        {
          status: 403,
          error: '403 Forbidden',
          message: 'Access Denied: Freelancer role cannot access Client routes or APIs.',
          userRole: session.role,
          requiredRole: 'client',
          attemptedPath: pathname,
        },
        { status: 403 }
      );
    }

    // Rewrite to /forbidden so the URL remains what the user typed and returns HTTP 403
    const forbiddenUrl = new URL('/forbidden', request.url);
    forbiddenUrl.searchParams.set('attempted', pathname);
    forbiddenUrl.searchParams.set('userRole', session.role);
    forbiddenUrl.searchParams.set('requiredRole', 'client');
    forbiddenUrl.searchParams.set('userName', session.name);

    return NextResponse.rewrite(forbiddenUrl, {
      status: 403,
      headers: {
        'x-forbidden-reason': 'client_role_required',
      },
    });
  }

  // 6. Authorized Access -> Propagate verified user identity in request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.id);
  requestHeaders.set('x-user-role', session.role);
  requestHeaders.set('x-user-email', session.email);
  requestHeaders.set('x-user-name', session.name);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Intercept entry points, dashboards, role-specific zones, and auth endpoints
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/freelancer/:path*',
    '/client/:path*',
    '/api/freelancer/:path*',
    '/api/client/:path*',
    '/login',
  ],
};
