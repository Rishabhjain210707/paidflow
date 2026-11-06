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

  // 1. Unauthenticated Check
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

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('error', 'unauthenticated');
    return NextResponse.redirect(loginUrl);
  }

  // 2. Cryptographic Token Verification (HMAC-SHA256 signature & expiration)
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
    loginUrl.searchParams.set('callbackUrl', pathname);
    loginUrl.searchParams.set('error', 'session_expired');

    const response = NextResponse.redirect(loginUrl);
    // Clear corrupted / expired cookie
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  // 3. Strict Role-Based Content Access Control & 403 Forbidden Interception

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

  // 4. Authorized Access -> Propagate verified user identity in request headers
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

// Protect all freelancer, client routes and their corresponding APIs
export const config = {
  matcher: [
    '/freelancer/:path*',
    '/client/:path*',
    '/api/freelancer/:path*',
    '/api/client/:path*',
  ],
};

