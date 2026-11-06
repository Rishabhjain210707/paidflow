'use client';

import React from 'react';
import Link from 'next/link';
import { TabType, UserRole } from '../../types';
import { Icons } from '../ui/Icons';

interface TopNavBarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  isUserDropdownOpen: boolean;
  setIsUserDropdownOpen: (open: boolean) => void;
  onOpenQuickInvoice: () => void;
  onOpenNewProposal: () => void;
  onToast: (msg: string) => void;
}

/**
 * TopNavBar provides the master two-tier horizontal navigation for Metron:
 * Tier 1: Platform branding, perspective role switcher, quick creation actions, and user menu.
 * Tier 2: Sub-navigation tabs with live count indicators and active pill styling.
 */
export const TopNavBar: React.FC<TopNavBarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  onOpenQuickInvoice,
  onOpenNewProposal,
  onToast,
}) => {
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'freelancer') {
      onToast('Switched to Freelancer (Arjun - Lead) mode');
    } else if (newRole === 'team_member') {
      onToast('Switched to Team (Riya - Editor) mode. Financials restricted.');
    } else {
      onToast('Switched to Client (Kunal Shah - CRED) perspective');
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Sign out error:', e);
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      {/* Tier 1: Main Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Solo Pro Badge */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-white font-extrabold shadow-md group-hover:scale-105 transition-transform">
              <span className="text-lg">₹</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 tracking-tight text-lg">
                  Metron
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                  SOLO PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Fintech & Scope Guard
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Perspective Role Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80">
          <span className="text-[11px] font-semibold text-slate-400 px-2">View as:</span>
          <button
            type="button"
            onClick={() => handleRoleChange('freelancer')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'freelancer'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Freelancer
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('team_member')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'team_member'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team (Riya)
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('client')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentRole === 'client'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Client (Kunal)
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onOpenQuickInvoice}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Icons.Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Quick</span>
            <span>UPI Invoice</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewProposal}
            className="bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
          >
            <Icons.Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Proposal</span>
          </button>

          {/* Direct Sign Out Action */}
          <button
            type="button"
            onClick={handleSignOut}
            className="bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 active:scale-[0.98] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
            title="Sign out of your session"
          >
            <Icons.LogOut className="w-3.5 h-3.5 text-slate-500 hover:text-rose-600" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* Profile Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                AS
              </div>
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">Arjun S.</span>
              <Icons.ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isUserDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
                <div className="p-2 border-b border-slate-100 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      AS
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Arjun Sharma</p>
                      <p className="text-[11px] text-slate-500 font-mono">9079879010@fam</p>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-block border border-emerald-100">
                    WhatsApp: +91 90798 79010
                  </div>
                </div>

                {/* Switch Role on Mobile */}
                <div className="md:hidden pb-2 mb-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Switch Perspective
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleChange('freelancer');
                        setIsUserDropdownOpen(false);
                      }}
                      className={`py-1 rounded text-center font-semibold text-[11px] ${
                        currentRole === 'freelancer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Freelancer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleChange('team_member');
                        setIsUserDropdownOpen(false);
                      }}
                      className={`py-1 rounded text-center font-semibold text-[11px] ${
                        currentRole === 'team_member' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Team
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleChange('client');
                        setIsUserDropdownOpen(false);
                      }}
                      className={`py-1 rounded text-center font-semibold text-[11px] ${
                        currentRole === 'client' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Client
                    </button>
                  </div>
                </div>

                {/* Fast Links */}
                <div className="space-y-1">
                  <Link
                    href="/freelancer/dashboard"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full text-left p-2 rounded-xl bg-indigo-50/70 hover:bg-indigo-100/70 font-semibold text-indigo-900 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icons.ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Freelancer RBAC Guard</span>
                    </span>
                    <span className="text-[10px] text-indigo-700 font-bold">Portal →</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('team');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Icons.Users className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Team & Access (RBAC)</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold">Crew & Roles →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('simulator');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Icons.Sliders className="w-3.5 h-3.5 text-amber-500" />
                      <span>Client Delay Simulator</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Runway →</span>
                  </button>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left p-2 rounded-xl bg-rose-50 hover:bg-rose-100 font-bold text-rose-700 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icons.LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out of Metron</span>
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Sub-Navigation Horizontal Tabs */}
      <div className="border-t border-slate-100 bg-white/70 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 h-11 text-xs whitespace-nowrap">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Active Gigs & Scope</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('deliverables')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'deliverables'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Deliverables & Versions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('proposals')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'proposals'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            Proposals & E-Sign
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            UPI Invoicing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Delay Simulator</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Runway
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('concentration')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              activeTab === 'concentration'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Concentration Risk</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              66.5% RED
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trust')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
              activeTab === 'trust'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Trust & Reviews</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">
              4.92 ★
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <span>Crew & Roles</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

