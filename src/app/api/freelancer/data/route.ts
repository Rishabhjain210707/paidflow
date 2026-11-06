import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifyToken } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const token =
    request.cookies.get('metron_auth_token')?.value ||
    extractTokenFromRequest(request);

  if (!token) {
    return NextResponse.json(
      { error: '401 Unauthorized: Authentication token required.' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: '401 Unauthorized: Token is invalid or expired.' },
      { status: 401 }
    );
  }

  // Strict Role Check: Must be Freelancer!
  if (payload.role !== 'freelancer') {
    return NextResponse.json(
      {
        error: '403 Forbidden: Access Denied. Client accounts are strictly prohibited from reading Freelancer private financial records.',
        authenticatedUser: payload.name,
        userRole: payload.role,
        requiredRole: 'freelancer',
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  // Authorized response
  return NextResponse.json({
    status: 200,
    success: true,
    message: 'Authorized access to Freelancer internal financial data.',
    data: {
      accountHolder: payload.name,
      role: 'freelancer',
      taxId: 'PAN: ABCDE1234F',
      upiVpa: '9079879010@fam',
      monthlyRevenueTarget: 300000,
      settledThisMonth: 185000,
      pendingMilestonesCount: 3,
      privateNotes: 'DaVinci color export stems pending Kunal approval before releasing final 4K master.',
    },
  });
}
