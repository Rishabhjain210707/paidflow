'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Icons } from '../../components/ui/Icons';

function ForbiddenContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const attemptedPath = searchParams.get('attempted') || 'Protected Dashboard Area';
  const userRole = searchParams.get('userRole') || 'unknown';
  const requiredRole = searchParams.get('requiredRole') || 'authorized role';
  const userName = searchParams.get('userName') || 'User';

  const userDashboard =
    userRole === 'freelancer'
      ? '/freelancer/dashboard'
      : userRole === 'client'
      ? '/client/dashboard'
      : '/login';

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/90 border border-rose-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 text-center">
        {/* Shield Icon with glowing ring */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 mb-6 shadow-inner">
          <Icons.Shield className="w-10 h-10 animate-pulse stroke-[2.2]" />
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mb-3">
          <Icons.AlertTriangle className="w-3.5 h-3.5" />
          <span>HTTP 403 Forbidden</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
          Strict Access Control: Role Restricted
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          You do not have authorization to view this area. Route guards and cryptographic token validation prevent unauthorized role crossing and URL manipulation.
        </p>

        {/* Security Incident Breakdown Box */}
        <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 text-left space-y-3 mb-8 text-xs font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-500 font-sans font-semibold">Security Guard:</span>
            <span className="text-emerald-400 font-bold">ACTIVE (Interception Successful)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Attempted Route:</span>
            <span className="text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900/50">
              {attemptedPath}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-sans">Required Role:</span>
            <span className="text-amber-300 font-bold uppercase tracking-wider">
              {requiredRole}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 font-sans">Authenticated As:</span>
            <span className="text-slate-200">
              {userName}{' '}
              <span className="text-indigo-400 uppercase font-bold">({userRole})</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href={userDashboard}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Icons.CheckCircle2 className="w-4 h-4" />
            <span>Go to Your {userRole === 'freelancer' ? 'Freelancer' : 'Client'} Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icons.LogOut className="w-4 h-4 text-slate-400" />
            <span>Switch Account</span>
          </button>
        </div>

        {/* Platform link */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Return to Metron Overview Suite</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Loading security guard...
        </div>
      }
    >
      <ForbiddenContent />
    </Suspense>
  );
}
