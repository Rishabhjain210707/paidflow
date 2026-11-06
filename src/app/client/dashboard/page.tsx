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
  company?: string;
}

interface ApiTestResult {
  endpoint: string;
  status: number | string;
  statusText?: string;
  body: Record<string, unknown>;
  isBlockedAsExpected?: boolean;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiTestResult, setApiTestResult] = useState<ApiTestResult | null>(null);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load current authenticated user session
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/login?error=unauthenticated&callbackUrl=/client/dashboard');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    router.push('/login');
    router.refresh();
  };

  // Test calling cross-role API: /api/freelancer/data (Should return 403 Forbidden!)
  const testFreelancerApiCrossRole = async () => {
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
        isBlockedAsExpected: res.status === 403,
      });
    } catch (e: unknown) {
      setApiTestResult({
        endpoint: '/api/freelancer/data',
        status: 'Network Error',
        body: { error: e instanceof Error ? e.message : 'Unknown network error' },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Test calling authorized API: /api/client/data (Should return 200 OK!)
  const testClientApiAuthorized = async () => {
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
        isBlockedAsExpected: false,
      });
    } catch (e: unknown) {
      setApiTestResult({
        endpoint: '/api/client/data',
        status: 'Network Error',
        body: { error: e instanceof Error ? e.message : 'Unknown network error' },
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-2">
          <Icons.RotateCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span>Verifying role credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <Icons.CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="bg-slate-950/80 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-emerald-600/30">
                ₹
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Metron</span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CLIENT ENTERPRISE PORTAL</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{user?.name || 'Kunal Shah'}</div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {user?.company || 'CRED Technologies'} (Client)
              </div>
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
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/40 rounded-3xl border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 mb-3">
                <Icons.ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected Route: /client/dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Enterprise Client Desk: {user?.name || 'Kunal Shah'} 🏢
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                You are authenticated as an Enterprise Client. Middleware protects your corporate hiring limits and restricts unauthorized freelancer access to your procurement controls.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
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
            {/* Test 1: URL Manipulation -> /freelancer/dashboard */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">1. URL Manipulation Test</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                  Target: /freelancer/dashboard
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                As a logged-in Client, attempting to navigate directly to the Freelancer Dashboard must be intercepted by Next.js middleware and return a <strong>403 Forbidden</strong> error.
              </p>
              <Link
                href="/freelancer/dashboard"
                className="inline-flex items-center gap-2 py-2 px-3.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Icons.AlertTriangle className="w-3.5 h-3.5" />
                <span>Simulate URL Hack: Navigate to /freelancer/dashboard</span>
              </Link>
            </div>

            {/* Test 2: API Protection -> /api/freelancer/data */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">2. Cross-Role API Guard Test</span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-900">
                  Target: /api/freelancer/data
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Call the freelancer private internal finance API using this Client session token. The API must respond with <strong>HTTP 403 Forbidden</strong>.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={testFreelancerApiCrossRole}
                  disabled={isTestingApi}
                  className="py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Icons.Lock className="w-3.5 h-3.5" />
                  <span>Call /api/freelancer/data (Expect 403)</span>
                </button>
                <button
                  type="button"
                  onClick={testClientApiAuthorized}
                  disabled={isTestingApi}
                  className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Icons.Check className="w-3.5 h-3.5" />
                  <span>Call /api/client/data (200 OK)</span>
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

        {/* Client Budget & Review Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Total Contract Allocation</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {formatINR(1250000)}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">CRED Pulse 30s Brand Video</span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Settled Tranches (UPI)</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1 block">
              {formatINR(500000)}
            </span>
            <span className="text-[11px] text-emerald-400 mt-1 block">✓ Paid to Arjun Verma (9079879010@fam)</span>
          </div>

          <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-400 block">Pending Sign-off Tranche</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              {formatINR(145000)}
            </span>
            <span className="text-[11px] text-amber-300 mt-1 block">Awaiting DaVinci v2 review</span>
          </div>
        </div>

        {/* Client Deliverables Review Desk */}
        <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Deliverable Approval Desk (Client View)</h3>
              <p className="text-xs text-slate-400">
                Sign off cuts or request revisions. Notice: "Submit New Version" button is hidden for Clients.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
              1 Cut Awaiting Review
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-sm block">
                  Hero 30s Ad Cut & DaVinci Color Grade
                </span>
                <span className="text-xs text-slate-400">
                  Cut v2 submitted by Arjun Verma & Riya | Revisions: 0/2 used
                </span>
              </div>
              <a
                href="https://youtu.be/unlisted_cred_hero_v2"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center gap-1"
              >
                <Icons.ExternalLink className="w-3.5 h-3.5" />
                <span>Open Video Link</span>
              </a>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => showToast('Approved DaVinci Cut v2! Milestone tranche unlocked.')}
                className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.Check className="w-3.5 h-3.5" />
                <span>Approve Cut v2</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Revision note sent to Arjun: color contrast tweak requested.')}
                className="py-1.5 px-3.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Icons.AlertCircle className="w-3.5 h-3.5" />
                <span>Request Revision</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

