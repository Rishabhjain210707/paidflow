'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons } from '../../../components/ui/Icons';
import { formatINR } from '../../../utils/formatters';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  title?: string;
  upiId?: string;
}

export default function FreelancerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<any | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  useEffect(() => {
    // Load current authenticated user session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login?error=unauthenticated&callbackUrl=/freelancer/dashboard');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.authenticated) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
    router.refresh();
  };

  // Test calling cross-role API: /api/client/data (Should return 403 Forbidden!)
  const testClientApiCrossRole = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch('/api/client/data');
      const json = await res.json();
      setApiTestResult({
        endpoint: '/api/client/data',
        status: res.status,
        statusText: res.statusText,
        body: json,
        isBlockedAsExpected: res.status === 403,
      });
    } catch (e: any) {
      setApiTestResult({
        endpoint: '/api/client/data',
        status: 'Network Error',
        body: { error: e.message },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Test calling authorized API: /api/freelancer/data (Should return 200 OK!)
  const testFreelancerApiAuthorized = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);
    try {
      const res = await fetch('/api/freelancer/data');
      const json = await res.json();
      setApiTestResult({
        endpoint: '/api/freelancer/data',
        status: res.status,
        statusText: res.statusText,
        body: json,
        isBlockedAsExpected: false,
      });
    } catch (e: any) {
      setApiTestResult({
        endpoint: '/api/freelancer/data',
        status: 'Network Error',
        body: { error: e.message },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <Icons.RotateCw className="w-5 h-5 animate-spin text-indigo-500" />
          <span>Verifying role credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/30">
                ₹
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Metron</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>FREELANCER ZONE</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.name || 'Arjun Verma'}</div>
              <div className="text-[10px] text-indigo-400 font-mono">Role: Freelancer</div>
            </div>
            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              <Icons.LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner with Role Verification Info */}
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/40 rounded-3xl border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 mb-3">
                <Icons.ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Protected Route: /freelancer/dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {user?.name || 'Arjun'} ⚡
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                You are authenticated with full Freelancer privileges. Middleware validates your HMAC-SHA256 session token and restricts clients from inspecting your internal financials.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Full Metron Suite</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SECURITY & ACCESS CONTROL TEST HARNESS */}
        <div className="bg-slate-950/90 rounded-3xl border border-rose-500/30 p-6 sm:p-7 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Icons.ShieldAlert className="w-5 h-5 text-rose-400" />
                <h2 className="text-base font-bold text-white">
                  Content Access Control & 403 Security Testing
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify that route guards and middleware block cross-role access (Client ⇄ Freelancer).
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Penetration & RBAC Guard Test
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Test 1: URL Manipulation -> /client/dashboard */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">1. URL Manipulation Test</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                  Target: /client/dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                As a logged-in Freelancer, attempting to navigate directly to the Client Dashboard must be intercepted by Next.js middleware and return a <strong>403 Forbidden</strong> error.
              </p>
              <Link
                href="/client/dashboard"
                className="inline-flex items-center gap-2 py-2 px-3.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Icons.AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate URL Hack: Navigate to /client/dashboard</span>
              </Link>
            </div>

            {/* Test 2: API Protection -> /api/client/data */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">2. Cross-Role API Guard Test</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                  Target: /api/client/data
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Call the client corporate billing API using this Freelancer session token. The API must respond with <strong>HTTP 403 Forbidden</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testClientApiCrossRole}
                  disabled={isTestingApi}
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Icons.Lock className="w-3.5 h-3.5" />
                  <span>Call /api/client/data (Expect 403)</span>
                </button>
                <button
                  type="button"
                  onClick={testFreelancerApiAuthorized}
                  disabled={isTestingApi}
                  className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Icons.Check className="w-3.5 h-3.5" />
                  <span>Call /api/freelancer/data (200 OK)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live API Response Output */}
          {apiTestResult && (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Response from {apiTestResult.endpoint}:</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    apiTestResult.status === 403
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  HTTP {apiTestResult.status} {apiTestResult.statusText}
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                {JSON.stringify(apiTestResult.body, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Freelancer Pulse & Gigs Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Settled Milestone Revenue</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {formatINR(500000)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Cleared via instant UPI intent</span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Pending Invoices / Escrow</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              {formatINR(750000)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">Locked behind deliverable sign-offs</span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Verified Freelancer VPA</span>
            <span className="text-sm font-bold text-indigo-300 font-mono mt-1.5 block">
              {user?.upiId || '9079879010@fam'}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block">✓ Auto-settle enabled</span>
          </div>
        </div>

        {/* Deliverables in Progress */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Active Deliverables & Version Cuts</h3>
            <span className="text-xs text-indigo-400 font-semibold bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800">
              Project: CRED Pulse 30s Brand Video
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">Hero 30s Ad Cut & Color Grade</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Version v2 (Submitted)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned Editor: Riya | Submitted for client Kunal Shah review
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://youtu.be/unlisted_cred_hero_v2"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono"
                >
                  drive.link/hero-v2.mp4
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">FX Conversion Calculator Component</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Version v2 (Approved)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Milestone tranche ₹1,45,000 ready for instant invoice generation
                </p>
              </div>
              <Link
                href="/"
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
              >
                Generate UPI Invoice →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
