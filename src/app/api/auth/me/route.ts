import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken } from '../../../../lib/auth';
import { findUserById } from '../../../../lib/users';

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get('metron_auth_token')?.value ||
    extractTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { authenticated: false, error: 'No active session token found' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { authenticated: false, error: 'Invalid or expired session token' },
      { status: 401 }
    );
  }

  const user = findUserById(payload.id);
  const safeUser = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
        company: user.company,
        avatar: user.avatar,
        upiId: user.upiId,
      }
    : payload;

  return NextResponse.json({
    authenticated: true,
    user: safeUser,
  });
}
