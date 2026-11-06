'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '../../components/ui/Icons';

/**
 * /dashboard
 * Unified redirector that dynamically detects the authenticated user's role
 * and routes them to their corresponding protected workspace:
 * - Freelancer -> /freelancer/dashboard
 * - Client -> /client/dashboard
 * - Unauthenticated -> /login
 */
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login?error=unauthenticated');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated && data.user) {
          if (data.user.role === 'freelancer') {
            router.push('/freelancer/dashboard');
          } else if (data.user.role === 'client') {
            router.push('/client/dashboard');
          } else {
            router.push('/login');
          }
        } else {
          router.push('/login?error=unauthenticated');
        }
      })
      .catch(() => {
        router.push('/login?error=unauthenticated');
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
      <div className="flex flex-col items-center gap-3 animate-in fade-in">
        <Icons.RotateCw className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="text-xs font-semibold text-slate-400">Verifying session credentials...</span>
      </div>
    </div>
  );
}
