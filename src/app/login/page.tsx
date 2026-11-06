'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Icons } from '../../components/ui/Icons';
import { AuthRole } from '../../types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get('callbackUrl');
  const errorParam = searchParams.get('error');

  const [selectedRole, setSelectedRole] = useState<AuthRole>('freelancer');
  const [email, setEmail] = useState('freelancer@metron.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'unauthenticated'
      ? 'Please sign in to access that protected dashboard.'
      : errorParam === 'session_expired'
      ? 'Your session expired. Please sign in again.'
      : null
  );

  // Quick fill demo helpers
  const handleSelectRole = (role: AuthRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'freelancer') {
      setEmail('freelancer@metron.io');
      setPassword('password123');
    } else {
      setEmail('client@cred.club');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please check credentials.');
        setIsLoading(false);
        return;
      }

      // Check if callbackUrl matches the user's role, otherwise use the role dashboard
      let targetPath = data.redirectTo;
      if (callbackUrl) {
        if (data.user.role === 'freelancer' && callbackUrl.startsWith('/freelancer')) {
          targetPath = callbackUrl;
        } else if (data.user.role === 'client' && callbackUrl.startsWith('/client')) {
          targetPath = callbackUrl;
        }
      }

      router.push(targetPath);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error during authentication. Please retry.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-600/15 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 mb-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-2xl">₹</span>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tight">Metron</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider">
                AUTH GUARD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Role-Based Freelance Security Portal</p>
          </div>
        </Link>
        <h2 className="mt-5 text-xl sm:text-2xl font-bold text-white tracking-tight">
          Sign in to your role dashboard
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Strict route protection separates Freelancer and Client portals.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-950/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800">
          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Your Platform Role
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => handleSelectRole('freelancer')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'freelancer'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icons.Briefcase className="w-3.5 h-3.5" />
                <span>Freelancer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('client')}
                className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'client'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icons.Building2 className="w-3.5 h-3.5" />
                <span>Client</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 text-center">
              {selectedRole === 'freelancer'
                ? 'Redirects to /freelancer/dashboard upon authentication'
                : 'Redirects to /client/dashboard upon authentication'}
            </p>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-6 p-3 bg-slate-900/90 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Quick Demo Presets:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Password: password123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRole('freelancer')}
                className="text-[11px] py-1.5 px-2 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 rounded-lg border border-indigo-800/50 transition-colors text-left font-medium truncate cursor-pointer"
              >
                🚀 Freelancer (Arjun)
              </button>
              <button
                type="button"
                onClick={() => handleSelectRole('client')}
                className="text-[11px] py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 rounded-lg border border-emerald-800/50 transition-colors text-left font-medium truncate cursor-pointer"
              >
                🏢 Client (Kunal Shah)
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs animate-in fade-in">
              <Icons.AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Icons.Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Icons.Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? (
                    <Icons.EyeOff className="w-4 h-4" />
                  ) : (
                    <Icons.Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-800 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-400">Remember session (7 days)</span>
              </label>
              <span className="text-xs text-slate-500">HttpOnly Secure Cookie</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                selectedRole === 'freelancer'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              } ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.99]'}`}
            >
              {isLoading ? (
                <>
                  <Icons.RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying role credentials...</span>
                </>
              ) : (
                <>
                  <Icons.Shield className="w-4 h-4" />
                  <span>
                    Sign in as {selectedRole === 'freelancer' ? 'Freelancer' : 'Client'}
                  </span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Security Architecture details */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Icons.ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>HMAC-SHA256 Signed JWT & Next.js Route Guards Active</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Clients cannot access /freelancer/*; Freelancers cannot access /client/*
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Back to Metron Platform</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
          Loading authentication portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
