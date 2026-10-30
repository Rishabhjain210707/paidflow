'use client';

import React, { useState } from 'react';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';
import { mockTransactions, mockProposals } from '../data/mockData';
import { Proposal, Transaction } from '../types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'trust'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions || []);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals || []);

  const defaultProposal: Proposal = proposals[0] || {
    id: 'prop_01',
    title: 'CRED Mobile App Micro-Interactions & Tokens',
    clientName: 'Kunal Shah',
    clientCompany: 'CRED',
    clientEmail: 'kunal@cred.club',
    clientPhone: '+91 98765 00001',
    totalAmount: 145000,
    subtotal: 145000,
    discount: 0,
    gstApplicable: false,
    status: 'Approved',
    signedByClient: true,
    validUntil: '2026-11-30',
    milestones: [
      {
        id: 'ms_1',
        title: 'Design System & Micro-Interactions',
        description: 'Figma prototypes, spline assets, and animation curves.',
        deliverableDate: '2026-11-10',
        amount: 70000,
        status: 'Completed',
      },
      {
        id: 'ms_2',
        title: 'React Native Components Integration',
        description: 'Production-ready code handoff and test coverage.',
        deliverableDate: '2026-11-25',
        amount: 75000,
        status: 'In Progress',
      },
    ],
  };

  const metrics = {
    totalSettledRevenue: 1485000,
    settledGrowthPercent: '+18.4%',
    pendingInvoicesCount: 3,
    pendingInvoicesAmount: 182500,
    activeProjectsCount: 3,
    verifiedTrustScore: 4.92,
    maxTrustScore: 5.0,
    trustReviewsCount: 38,
    onTimePaymentRate: 98,
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">PaidFlow</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SOLO PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fintech for Freelancers</p>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <span>+ Quick UPI Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('proposals')}
              className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <span>✎ New Proposal & Scope</span>
            </button>
          </div>

          {/* Tabs */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
              Workspace
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span>⊞</span>
                <span>Overview</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Live</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('proposals')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'proposals'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span>📄</span>
                <span>Proposals & E-Sign</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">E-Sign</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'invoices'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span>💳</span>
                <span>UPI Invoicing</span>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                Instant
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('trust')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${activeTab === 'trust'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span>🛡</span>
                <span>Trust & Reputation</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">4.9 ★</span>
            </button>
          </nav>
        </div>

        {/* User Info */}
        <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              AV
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">Arjun Verma</p>
              <p className="text-[10px] text-slate-400">arjunverma@okhdfcbank</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="UPI Active" />
        </div>
      </aside>

      {/* Main View Area */}
      <section className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
        {activeTab === 'overview' && (
          <OverviewDashboard
            metrics={metrics}
            transactions={transactions}
            onNewProposal={() => setActiveTab('proposals')}
            onQuickInvoice={() => setActiveTab('invoices')}
            onShareReputation={() => setActiveTab('trust')}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onActionClick={() => setActiveTab('invoices')}
          />
        )}

        {activeTab === 'proposals' && (
          <ProposalCreator
            initialProposal={defaultProposal}
            onSaveProposal={(updated) => {
              setProposals((prev) =>
                prev.map((p) => (p.id === updated.id ? updated : p))
              );
            }}
          />
        )}

        {activeTab === 'invoices' && (
          <UPIInvoiceView
            transactions={transactions}
            onBackToDashboard={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'trust' && (
          <TrustReviewView
            onBackToOverview={() => setActiveTab('overview')}
          />
        )}
      </section>
    </main>
  );
}