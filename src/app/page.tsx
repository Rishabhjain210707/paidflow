'use client';

import React, { useState } from 'react';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';
import {
  mockTransactions,
  mockProposals,
  mockProjects,
  mockTeamMembers,
  mockInitialInvoice,
  mockFreelancerProfile,
  mockTrustMetrics,
  mockPendingClientReviews,
} from '../data/mockData';
import {
  Proposal,
  Transaction,
  Project,
  TeamMember,
  UserRole,
  Invoice,
  InvoiceItem,
  TabType,
} from '../types';
import { Icons } from '../components/ui/Icons';
import { formatINR } from '../utils/formatters';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUserRole, setCurrentRole] = useState<UserRole>('freelancer');
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions || []);
  const [proposals, setProposals] = useState<Proposal[]>(mockProposals || []);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(mockInitialInvoice);
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle Trust Mode for Team Members (Feature 3)
  const handleToggleTrustMode = (memberId: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextMode = m.trustMode === 'trusted' ? 'needs_approval' : 'trusted';
          showToast(
            `${m.name} is now ${nextMode === 'trusted' ? 'Trusted (Bypasses Freelancer Review)' : 'Needs Lead Approval'}`
          );
          return { ...m, trustMode: nextMode };
        }
        return m;
      })
    );
  };

  // Update Project state
  const handleUpdateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Feature 5: Add Billable Scope (+₹5,000) to Invoice
  const handleAddBillableScope = (amount: number, description: string) => {
    const newItem: InvoiceItem = {
      id: `item_scope_${Date.now()}`,
      description: description || 'Extra Out-of-Scope Revision Sprint',
      hoursOrUnits: 1,
      rate: amount,
      amount: amount,
    };

    const updatedItems = [...currentInvoice.items, newItem];
    const subtotal = updatedItems.reduce((sum, it) => sum + it.amount, 0);
    const taxable = Math.max(0, subtotal - currentInvoice.discountAmount);
    const gst = currentInvoice.gstEnabled ? taxable * 0.18 : 0;
    const totalPayable = taxable + gst;

    // Distribute addition into pending tranches
    const updatedTranches = (currentInvoice.tranches || []).map((t, idx, arr) => {
      if (idx === arr.length - 1) {
        // Add to last tranche
        return {
          ...t,
          amount: t.amount + Math.round(amount * (currentInvoice.gstEnabled ? 1.18 : 1)),
        };
      }
      return t;
    });

    setCurrentInvoice((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      totalPayable,
      tranches: updatedTranches,
    }));

    showToast(`⚡ Added ${formatINR(amount)} billable scope to Invoice ${currentInvoice.invoiceNumber}!`);
  };

  // Handle invoice payment settlement from UPI view
  const handlePaymentSettled = (updatedInvoice: Invoice, settledTrancheId?: string) => {
    setCurrentInvoice(updatedInvoice);

    // Update transactions table
    const settledTranche = updatedInvoice.tranches?.find((t) => t.id === settledTrancheId);
    if (settledTranche) {
      const newTx: Transaction = {
        id: `tx_${Date.now()}`,
        invoiceNumber: updatedInvoice.invoiceNumber,
        clientName: updatedInvoice.clientName.split('(')[0].trim(),
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        projectTitle: `CRED Pulse: ${settledTranche.label}`,
        amount: settledTranche.amount,
        paymentMethod: 'UPI',
        status: 'Paid',
        date: '2026-10-30',
        upiRef: settledTranche.upiRef || 'UPI/998127391823/HDFC',
        vpa: 'kunal@cred',
        trancheLabel: settledTranche.label,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast(`✓ Received ${formatINR(settledTranche.amount)} via UPI (Instant Bank Settlement)!`);
    }
  };

  // Feature 7: Calculate pending invoices metrics dynamically counting only unsettled parts
  const unsettledTranchesAmount = (currentInvoice.tranches || []).reduce((sum, t) => {
    return t.status !== 'Paid' ? sum + t.amount : sum;
  }, 0);

  // Other pending transactions (e.g., INV-2026-085 overdue at 97,500)
  const otherPendingAmount = 97500;
  const dynamicPendingInvoicesAmount = unsettledTranchesAmount + otherPendingAmount;
  const dynamicPendingCount = (currentInvoice.status !== 'Paid' ? 1 : 0) + 1; // current + overdue

  const defaultProposal: Proposal = proposals[0] || {
    id: 'prop_01',
    title: 'CRED Pulse: 30s Brand Video & Interactive Motion Teaser',
    clientName: 'Kunal Shah',
    clientCompany: 'CRED Technologies',
    clientEmail: 'kunal@cred.club',
    clientPhone: '+91 98200 11223',
    totalAmount: 1445500,
    subtotal: 1250000,
    discount: 25000,
    gstApplicable: true,
    gstRate: 18,
    status: 'Sent',
    signedByClient: false,
    validUntil: '2026-11-15',
    currency: 'INR',
    createdAt: '2026-10-30',
    milestones: [
      {
        id: 'ms_1',
        title: 'Milestone 1: 50% Advance Lock & Storyboard Direction',
        description: 'Color script, storyboard animatics, and sound design scratch track.',
        deliverableDate: '2026-11-04',
        amount: 625000,
        status: 'In Progress',
      },
      {
        id: 'ms_2',
        title: 'Milestone 2: Final 4K DaVinci Grade & Spatial Audio Stems',
        description: 'Clean ProRes 4444 master, Instagram 9:16 cut, and complete stem pack.',
        deliverableDate: '2026-11-15',
        amount: 625000,
        status: 'Upcoming',
      },
    ],
  };

  const metrics = {
    totalSettledRevenue: 1485000,
    settledGrowthPercent: '+18.4%',
    pendingInvoicesCount: dynamicPendingCount,
    pendingInvoicesAmount: dynamicPendingInvoicesAmount,
    activeProjectsCount: 3,
    verifiedTrustScore: 4.92,
    maxTrustScore: 5.0,
    trustReviewsCount: 38,
    onTimePaymentRate: 98,
  };

  const rohanMember = teamMembers.find((m) => m.id === 'member_rohan');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased font-sans text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Icons.Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER: ROLE SWITCHER & GLOBAL CONTROLS (Feature 3) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm">PaidFlow</span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Solo Pro
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none">Fintech & Escrow for Creators</p>
            </div>
          </div>

          {/* Quick Team Trust Drawer Button */}
          {currentUserRole === 'freelancer' && (
            <button
              type="button"
              onClick={() => setShowTeamDrawer(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <Icons.Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>Team & Trust</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
            </button>
          )}
        </div>

        {/* Feature 3: Top-level 3-Way Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => setCurrentRole('freelancer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUserRole === 'freelancer'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.User className="w-3.5 h-3.5" />
            <span>Freelancer (Arjun - Lead)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRole('team_member')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUserRole === 'team_member'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.Play className="w-3.5 h-3.5" />
            <span>Team Member (Rohan - Editor)</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRole('client')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentUserRole === 'client'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icons.Check className="w-3.5 h-3.5" />
            <span>Client (Kunal Shah - CRED)</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Quick Action Buttons (Only for Freelancer) */}
            {currentUserRole === 'freelancer' ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Icons.Rupee className="w-3.5 h-3.5" />
                  <span>+ Quick UPI Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Icons.Plus className="w-3.5 h-3.5" />
                  <span>✎ New Proposal & Scope</span>
                </button>
              </div>
            ) : currentUserRole === 'team_member' ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Restricted Editor Portal</span>
                <p className="text-[11px] text-slate-500">
                  Upload cut links & version notes for CRED video deliverables.
                </p>
                <div className="mt-2 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 inline-block">
                  Trust Status: {rohanMember?.trustMode === 'trusted' ? 'Trusted (Direct Client Push)' : 'Needs Lead Review'}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-emerald-950 block">CRED Client Portal</span>
                <p className="text-[11px] text-emerald-700">
                  Review creative cuts, request revisions, and release instant UPI escrow tranches.
                </p>
              </div>
            )}

            {/* Nav Tabs */}
            <nav className="space-y-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-2">
                Workspace
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icons.Sliders className="w-4 h-4" />
                  <span>Overview & Projects</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Live</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('proposals')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'proposals'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icons.FileText className="w-4 h-4" />
                  <span>Proposals & E-Sign</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Scope</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('invoices')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icons.Rupee className="w-4 h-4" />
                  <span>UPI Invoicing</span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                  Tranches
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('trust')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'trust'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icons.ShieldCheck className="w-4 h-4" />
                  <span>Trust & Reputation</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">4.9 ★</span>
              </button>
            </nav>
          </div>

          {/* User Persona Profile in Sidebar Bottom */}
          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {currentUserRole === 'freelancer' ? (
                  <img src={mockFreelancerProfile.avatar} alt="Arjun" className="w-full h-full object-cover" />
                ) : currentUserRole === 'team_member' ? (
                  <img src={rohanMember?.avatar} alt="Rohan" className="w-full h-full object-cover" />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="Kunal Shah"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUserRole === 'freelancer'
                    ? 'Arjun Verma'
                    : currentUserRole === 'team_member'
                    ? 'Rohan Mehta'
                    : 'Kunal Shah'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentUserRole === 'freelancer'
                    ? 'Lead Creative Director'
                    : currentUserRole === 'team_member'
                    ? 'Video Editor'
                    : 'Founder, CRED'}
                </p>
              </div>
            </div>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentUserRole === 'freelancer'
                  ? 'bg-emerald-500'
                  : currentUserRole === 'team_member'
                  ? 'bg-indigo-500'
                  : 'bg-amber-500'
              }`}
              title="Active User"
            />
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              transactions={transactions}
              projects={projects}
              teamMembers={teamMembers}
              currentUserRole={currentUserRole}
              onNewProposal={() => setActiveTab('proposals')}
              onQuickInvoice={() => setActiveTab('invoices')}
              onShareReputation={() => setActiveTab('trust')}
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onActionClick={() => setActiveTab('invoices')}
              onUpdateProject={handleUpdateProject}
              onToggleTrustMode={handleToggleTrustMode}
              onAddBillableScope={handleAddBillableScope}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalCreator
              initialProposal={defaultProposal}
              onSaveProposal={(updated) => {
                setProposals((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                );
                showToast(`Proposal "${updated.title}" scope saved!`);
              }}
            />
          )}

          {activeTab === 'invoices' && (
            <UPIInvoiceView
              initialInvoice={currentInvoice}
              onInvoiceChange={setCurrentInvoice}
              onPaymentSettled={handlePaymentSettled}
              currentUserRole={currentUserRole}
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'trust' && (
            <TrustReviewView
              metrics={mockTrustMetrics}
              reviewsQueue={mockPendingClientReviews}
              onShareProfile={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(mockFreelancerProfile.reputationUrl);
                  showToast('Copied verified reputation link to clipboard!');
                }
              }}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}
        </section>
      </div>

      {/* TEAM MEMBERS & TRUST TOGGLE DRAWER (Feature 3) */}
      {showTeamDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Team Members & Trust Modes</h3>
                  <p className="text-xs text-slate-500">
                    Control whether member submissions need your approval before clients see them.
                  </p>
                </div>
                <button
                  onClick={() => setShowTeamDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const isTrusted = member.trustMode === 'trusted';
                  return (
                    <div
                      key={member.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{member.name}</p>
                            <p className="text-[11px] text-slate-500">{member.role}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isTrusted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isTrusted ? 'Trusted' : 'Needs Approval'}
                        </span>
                      </div>

                      {/* Trust Toggle Switch */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            Direct Client Delivery
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isTrusted
                              ? 'Can push version links directly to Kunal Shah (CRED)'
                              : 'Submissions held for Freelancer lead sign-off'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTrustMode(member.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            isTrusted ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              isTrusted ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTeamDrawer(false)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
