import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials } from '../../../../lib/users';
import { signToken, AUTH_COOKIE_NAME, DEFAULT_TOKEN_EXPIRY, getRoleDashboardPath } from '../../../../lib/auth';
import { AuthRole } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: AuthRole;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required fields.' },
        { status: 400 }
      );
    }

    const { user, error } = await authenticateCredentials(email, password, role);

    if (error || !user) {
      return NextResponse.json(
        { error: error || 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate cryptographically signed JWT token with role claim
    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const destination = getRoleDashboardPath(user.role);

    const response = NextResponse.json({
      success: true,
      message: `Successfully authenticated as ${user.name} (${user.role})`,
      user,
      token, // Also return token in body for client API/header usage if desired
      redirectTo: destination,
    });

    // Set secure HttpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: DEFAULT_TOKEN_EXPIRY,
    });

    return response;
  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: 'Internal server error processing authentication.' },
      { status: 500 }
    );
  }
}
