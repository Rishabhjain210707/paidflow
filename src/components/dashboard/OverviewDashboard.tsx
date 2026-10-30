'use client';

import React, { useState } from 'react';
import { Transaction, Proposal } from '../../types';
import { formatINR, formatDate } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import { mockFreelancerProfile, mockProposals } from '../../data/mockData';

interface OverviewDashboardProps {
  metrics: {
    totalSettledRevenue: number;
    settledGrowthPercent: string;
    pendingInvoicesCount: number;
    pendingInvoicesAmount: number;
    activeProjectsCount: number;
    verifiedTrustScore: number;
    maxTrustScore: number;
    trustReviewsCount: number;
    onTimePaymentRate: number;
  };
  transactions: Transaction[];
  onNewProposal: () => void;
  onQuickInvoice: () => void;
  onShareReputation: () => void;
  onNavigateTab: (tab: any) => void;
  onActionClick: (tx: Transaction) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  transactions,
  onNewProposal,
  onQuickInvoice,
  onShareReputation,
  onNavigateTab,
  onActionClick,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Proposal | null>(null);

  // Active projects list with fallback
  const projects: Proposal[] = mockProposals || [
    {
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
          id: 'm1',
          title: 'Design System & Micro-Interactions',
          description: 'Figma prototypes, spline assets, and animation curves.',
          deliverableDate: '2026-11-10',
          amount: 70000,
          status: 'Completed',
        },
        {
          id: 'm2',
          title: 'React Native Components Integration',
          description: 'Production-ready code handoff and test coverage.',
          deliverableDate: '2026-11-25',
          amount: 75000,
          status: 'In Progress',
        },
      ],
    },
    {
      id: 'prop_02',
      title: 'Fintech Dashboard Redesign & Multi-Currency Flow',
      clientName: 'Neha Singhal',
      clientCompany: 'Finly.io',
      clientEmail: 'neha@finly.io',
      clientPhone: '+91 98765 00002',
      totalAmount: 85000,
      subtotal: 85000,
      discount: 0,
      gstApplicable: true,
      status: 'Approved',
      signedByClient: true,
      validUntil: '2026-12-05',
      milestones: [
        {
          id: 'm3',
          title: 'Dashboard UX Architecture',
          description: 'Wireframes and client reviews for real-time INR/USD ledger.',
          deliverableDate: '2026-11-15',
          amount: 45000,
          status: 'Completed',
        },
        {
          id: 'm4',
          title: 'Frontend Next.js Implementation',
          description: 'Responsive Tailwind layout with clean state management.',
          deliverableDate: '2026-12-01',
          amount: 40000,
          status: 'Upcoming',
        },
      ],
    },
    {
      id: 'prop_03',
      title: 'B2B SaaS Onboarding Flow & Landing Page',
      clientName: 'Vikramaditya Rao',
      clientCompany: 'ScaleStack Tech',
      clientEmail: 'vikram@scalestack.io',
      clientPhone: '+91 98765 00003',
      totalAmount: 97500,
      subtotal: 97500,
      discount: 0,
      gstApplicable: false,
      status: 'Pending',
      signedByClient: false,
      validUntil: '2026-11-20',
      milestones: [
        {
          id: 'm5',
          title: 'Landing Page & Interactive Demo',
          description: 'Conversion-optimized hero, interactive product calculator.',
          deliverableDate: '2026-11-18',
          amount: 97500,
          status: 'Upcoming',
        },
      ],
    },
  ];

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ? true : tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (txId: string) => {
    navigator.clipboard?.writeText?.(`https://pflow.in/pay/${txId}`);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Quick Action Ribbon & Freelancer Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Verified Freelancer
              </span>
              <span className="text-xs text-slate-300 font-mono">
                VPA: {mockFreelancerProfile.upiId}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Welcome back, {mockFreelancerProfile.name.split(' ')[0]} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your UPI settlement pipeline is running at zero fees. You have{' '}
              <strong className="text-emerald-300 font-semibold">{metrics.pendingInvoicesCount} invoices</strong>{' '}
              eligible for auto-reminders and 1 review waiting for mutual unlock.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
            <button
              onClick={onNewProposal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold backdrop-blur-sm border border-white/15 transition-all shadow-sm"
            >
              <Icons.Plus className="w-4 h-4 text-indigo-300" />
              <span>+ New Proposal</span>
            </button>

            <button
              onClick={onQuickInvoice}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm shadow-emerald-950/30"
            >
              <Icons.Rupee className="w-4 h-4" />
              <span>+ Quick UPI Invoice</span>
            </button>

            <button
              onClick={onShareReputation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 text-xs font-semibold transition-all shadow-sm"
            >
              <Icons.Share2 className="w-4 h-4 text-indigo-600" />
              <span>Share Reputation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Bar: 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Settled Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icons.Rupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {formatINR(metrics.totalSettledRevenue)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <span className="text-emerald-700 font-semibold inline-flex items-center">
                <Icons.ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {metrics.settledGrowthPercent}
              </span>
              <span className="text-slate-400">vs last 30 days</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending UPI Invoices
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Icons.Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatINR(metrics.pendingInvoicesAmount)}
              </span>
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {metrics.pendingInvoicesCount} Unsettled
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <span>Avg clearance:</span>
              <span className="text-slate-600 font-medium">3.4 hours via UPI Intent</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Icons.FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {metrics.activeProjectsCount}
              </span>
              <span className="text-xs text-slate-500">Scopes In Progress</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600 font-medium">All milestones on track</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => onNavigateTab('trust')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Verified Trust Score
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icons.ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {metrics.verifiedTrustScore.toFixed(1)}
              </span>
              <span className="text-slate-400 font-medium text-sm">/ 5.0</span>
              <div className="flex text-amber-400 ml-1">
                <Icons.Star className="w-4 h-4" filled={true} />
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">
                {metrics.trustReviewsCount} Verified Reviews
              </span>
              <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">
                View Pillars →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Clickable Active Project Cards Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Projects & Scopes</h3>
            <p className="text-xs text-slate-500">
              Click any project card to review milestones, escrow releases, and contract details.
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {projects.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => setSelectedProject(proj)}
              className="bg-white rounded-xl border border-slate-200 hover:border-indigo-500 p-4 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${proj.signedByClient
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                  >
                    {proj.signedByClient ? '✓ E-Signed & Active' : '⏱ Awaiting E-Sign'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {proj.milestones.length} Milestones
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {proj.title}
                </h4>

                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="font-medium text-slate-700">{proj.clientName}</span>
                  {proj.clientCompany && (
                    <>
                      <span>•</span>
                      <span>{proj.clientCompany}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                    Budget
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatINR(proj.totalAmount)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                {filteredTransactions.length} Invoices
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant UPI milestone releases, pending settlements, and review windows.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              {['All', 'Paid', 'Pending', 'Review Window Open'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  {st === 'Review Window Open' ? 'Reviews' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-5">Client & Organization</th>
                <th className="py-3 px-4">Project Title & Invoice</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Payment Rail</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPaid = tx.status === 'Paid';
                  const isPending = tx.status === 'Pending';
                  const isReviewOpen = tx.status === 'Review Window Open';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Client */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={tx.clientAvatar}
                            alt={tx.clientName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {tx.clientName}
                            </span>
                            <span className="text-[11px] text-slate-400">{tx.vpa}</span>
                          </div>
                        </div>
                      </td>

                      {/* Project Title & Invoice ID */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-1 block">
                          {tx.projectTitle}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                          <span className="font-mono">{tx.invoiceNumber}</span>
                          <span>•</span>
                          <span>{formatDate(tx.date)}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-slate-900">
                          {formatINR(tx.amount)}
                        </span>
                        {tx.upiRef && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Ref: {tx.upiRef.split('/')[1] || tx.upiRef}
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>UPI Auto-Pay</span>
                        </span>
                      </td>

                      {/* Status Pill */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Icons.Check className="w-3 h-3 stroke-[3]" />
                            <span>Paid</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <Icons.Clock className="w-3 h-3" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isReviewOpen && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Icons.Sparkles className="w-3 h-3" />
                            <span>Review Window Open</span>
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        {isReviewOpen ? (
                          <button
                            onClick={() => onActionClick(tx)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                          >
                            <Icons.Star className="w-3.5 h-3.5" filled={true} />
                            <span>Rate & Unlock</span>
                          </button>
                        ) : isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleCopyLink(tx.id)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              title="Copy UPI payment link"
                            >
                              {copiedTxId === tx.id ? (
                                <span className="text-emerald-600 font-semibold">Copied!</span>
                              ) : (
                                <span>Copy Link</span>
                              )}
                            </button>
                            <button
                              onClick={() => onActionClick(tx)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            >
                              Remind
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onActionClick(tx)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info banner */}
        <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Escrow release backed by NPCI & RBI compliant UPI 2.0 handle.</span>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="text-indigo-600 hover:underline font-medium text-xs"
          >
            Manage All Invoices →
          </button>
        </div>
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                    Project Scope Detail
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedProject.id}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedProject.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client: <strong className="text-slate-800">{selectedProject.clientName}</strong>
                  {selectedProject.clientCompany && ` (${selectedProject.clientCompany})`} • Valid until {selectedProject.validUntil}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Commitment</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatINR(selectedProject.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">E-Sign Status</span>
                  <span
                    className={`font-semibold inline-block mt-0.5 ${selectedProject.signedByClient ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                  >
                    {selectedProject.signedByClient ? '✓ Sealed & Binding' : '⏱ Pending Signature'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Settlement Channel</span>
                  <span className="font-semibold text-slate-800 inline-block mt-0.5">
                    UPI Instant P2P
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  Scope Milestones ({selectedProject.milestones.length})
                </h4>
                <div className="space-y-2.5">
                  {selectedProject.milestones.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {m.title}
                        </span>
                        <span className="font-bold text-slate-900">{formatINR(m.amount)}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{m.description}</p>
                      <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Delivery Target: {m.deliverableDate}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${m.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.status === 'In Progress'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                          {m.status || 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};