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

  // Strict Role Check: Must be Client!
  if (payload.role !== 'client') {
    return NextResponse.json(
      {
        error: '403 Forbidden: Access Denied. Freelancer accounts are strictly prohibited from reading Client treasury and corporate billing data.',
        authenticatedUser: payload.name,
        userRole: payload.role,
        requiredRole: 'client',
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  // Authorized response
  return NextResponse.json({
    status: 200,
    success: true,
    message: 'Authorized access to Client enterprise corporate billing data.',
    data: {
      accountHolder: payload.name,
      role: 'client',
      company: 'CRED Technologies',
      corporateTreasuryLimit: 2500000,
      activeContractSpend: 1250000,
      approvedHires: ['Arjun Verma (Lead Motion)', 'Riya (Video Editor)'],
      internalProcurementNotes: 'Next quarterly retainer approval scheduled with CRED CFO on Nov 15.',
    },
  });
}
