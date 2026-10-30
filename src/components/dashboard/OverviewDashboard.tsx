'use client';

import React, { useState } from 'react';
import {
  Transaction,
  Project,
  TeamMember,
  UserRole,
} from '../../types';
import {
  formatINR,
  formatDate,
  getDeadlineStatus,
  calculateDelayImpact,
  generateWhatsAppShareUrl,
  getAppBaseUrl,
} from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import {
  mockFreelancerProfile,
  mockClientConcentration,
  mockProjects,
  mockTeamMembers,
  mockMetrics,
  mockTransactions,
} from '../../data/mockData';
import { ProjectDetailModal } from '../projects/ProjectDetailModal';

interface OverviewDashboardProps {
  metrics?: {
    totalSettledRevenue?: number;
    settledGrowthPercent?: string;
    pendingInvoicesCount?: number;
    pendingInvoicesAmount?: number;
    activeProjectsCount?: number;
    verifiedTrustScore?: number;
    maxTrustScore?: number;
    trustReviewsCount?: number;
    onTimePaymentRate?: number;
  };
  transactions?: Transaction[];
  projects?: Project[];
  teamMembers?: TeamMember[];
  currentUserRole?: UserRole;
  onSelectProject?: (id: string) => void;
  onNewProposal?: () => void;
  onQuickInvoice?: () => void;
  onShareReputation?: () => void;
  onNavigateTab?: (tab: string) => void;
  onActionClick?: (tx: Transaction) => void;
  onUpdateProject?: (updated: Project) => void;
  onToggleTrustMode?: (memberId: string) => void;
  onAddBillableScope?: (amount: number, description?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = (props) => {
  const {
    metrics,
    transactions = [],
    projects = [],
    teamMembers = [],
    currentUserRole = 'freelancer',
    onSelectProject,
    onNewProposal,
    onQuickInvoice,
    onShareReputation,
    onNavigateTab,
    onActionClick,
    onUpdateProject,
    onToggleTrustMode,
    onAddBillableScope,
  } = props;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Client Delay Impact Simulator State
  const [delayDays, setDelayDays] = useState<number>(30);
  const credDelayedAmount = 145000;
  const delayImpact = calculateDelayImpact(credDelayedAmount, delayDays);

  // Defensive array checks to guarantee no undefined .filter() or .find() can ever occur
  const safeTransactions = Array.isArray(transactions) && transactions.length > 0 ? transactions : (mockTransactions || []);
  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : (mockProjects || []);
  const safeTeamMembers = Array.isArray(teamMembers) && teamMembers.length > 0 ? teamMembers : (mockTeamMembers || []);
  const safeMetrics = metrics || mockMetrics;
  const safeRole = currentUserRole || 'freelancer';

  const filteredTransactions = safeTransactions.filter((tx) => {
    if (!tx) return false;
    const clientName = (tx.clientName || '').toLowerCase();
    const projectTitle = (tx.projectTitle || '').toLowerCase();
    const invoiceNumber = (tx.invoiceNumber || '').toLowerCase();
    const query = (searchTerm || '').toLowerCase();

    const matchesSearch =
      clientName.includes(query) ||
      projectTitle.includes(query) ||
      invoiceNumber.includes(query);

    const matchesStatus =
      statusFilter === 'All' ? true : tx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (txId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    const matchingTx = safeTransactions.find((t: any) => t && t.id === txId);
    const amountParam = matchingTx
      ? `?amount=${matchingTx.amount}&title=${encodeURIComponent(matchingTx.projectTitle)}&inv=${encodeURIComponent(matchingTx.invoiceNumber)}&client=${encodeURIComponent(matchingTx.clientName)}`
      : '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${origin}/pay/${txId}${amountParam}`);
      setCopiedTxId(txId);
      setTimeout(() => setCopiedTxId(null), 2000);
    }
  };

  const handleSendNudgeWhatsApp = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    const text = `Hi Kunal, hope you're having a great week! Just following up on the pending milestone tranche for CRED Pulse (${formatINR(credDelayedAmount)}). The DaVinci color grade & audio stems are ready for your review: ${origin}/pay/inv_1042_t2?amount=${credDelayedAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`;
    const url = generateWhatsAppShareUrl('+919820011223', text);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  // Safe team member trust mode lookup
  const rohanMember = safeTeamMembers.find((m) => m && m.id === 'member_rohan');
  const isRohanTrusted = rohanMember?.trustMode === 'trusted';

  // Safe project filtering by role
  const visibleProjects = safeProjects.filter((p) => {
    if (!p) return false;
    const clientName = (p.clientName || '').toLowerCase();
    const clientCompany = (p.clientCompany || '').toLowerCase();

    if (safeRole === 'client') {
      return clientName.includes('kunal') || clientCompany.includes('cred') || p.id === 'p1';
    }
    if (safeRole === 'team_member') {
      return p.assignedTeamMemberId === 'member_rohan' || p.id === 'p1' || p.id === 'proj_cred_video';
    }
    return true;
  });

  const handleCardClick = (proj: Project) => {
    setSelectedProject(proj);
    if (onSelectProject) {
      onSelectProject(proj.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner Notification */}
      {safeRole !== 'freelancer' && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Icons.User className="w-4 h-4 text-indigo-600" />
            <span>
              {safeRole === 'team_member'
                ? 'Team Member Mode: You are viewing assigned video & motion deliverables. Financial metrics & client rates are hidden.'
                : 'Client Portal Mode: Viewing CRED deliverables, milestone approvals, and UPI payment releases.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
            {String(safeRole).replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Top Welcome Ribbon */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {safeRole === 'team_member'
                  ? 'Team Member Workspace'
                  : safeRole === 'client'
                    ? 'CRED Client Portal'
                    : 'Verified Freelancer'}
              </span>
              {safeRole === 'freelancer' && (
                <span className="text-xs text-slate-300 font-mono">
                  VPA: {mockFreelancerProfile?.upiId || '9079879010@fam'}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {safeRole === 'team_member'
                ? 'Welcome, Rohan Mehta 👋'
                : safeRole === 'client'
                  ? 'Welcome back, Kunal Shah 👋'
                  : `Welcome back, ${mockFreelancerProfile?.name ? mockFreelancerProfile.name.split(' ')[0] : 'Arjun'} 👋`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {safeRole === 'team_member'
                ? 'You have 1 deliverable waiting for review on the CRED 30s Brand Video cut. Upload links to push new versions.'
                : safeRole === 'client'
                  ? 'Review deliverables, request revisions, and release escrow milestone settlements with zero fees.'
                  : 'Your UPI settlement pipeline is running at zero fees. You have 3 pending invoices and 1 client deliverable awaiting review.'}
            </p>
          </div>

          {safeRole === 'freelancer' && (
            <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
              <button
                type="button"
                onClick={onNewProposal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-semibold backdrop-blur-sm border border-white/15 transition-all shadow-sm"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                <span>+ New Proposal</span>
              </button>

              <button
                type="button"
                onClick={onQuickInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <Icons.Rupee className="w-3.5 h-3.5" />
                <span>+ Quick UPI Invoice</span>
              </button>

              <button
                type="button"
                onClick={onShareReputation}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 text-xs font-semibold transition-all shadow-sm"
              >
                <Icons.Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Share Reputation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      {safeRole !== 'team_member' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Settled Revenue
              </span>
              <span className="text-emerald-600 font-bold text-sm">₹</span>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatINR(metrics?.totalSettledRevenue || 1485000)}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span className="text-emerald-700 font-semibold">
                  {metrics?.settledGrowthPercent || '+18.4%'}
                </span>
                <span className="text-slate-400">vs last 30 days</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Pending UPI Invoices
              </span>
              <Icons.Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatINR(metrics?.pendingInvoicesAmount || 182500)}
                </span>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {metrics?.pendingInvoicesCount || 3} Unsettled
                </span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                Avg clearance: <span className="text-slate-600 font-medium">3.4 hrs via UPI Intent</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Active Projects
              </span>
              <Icons.FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {visibleProjects.length}
                </span>
                <span className="text-xs text-slate-500">Scopes In Progress</span>
              </div>
              <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All milestones on track</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab && onNavigateTab('trust')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 cursor-pointer transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Verified Trust Score
              </span>
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {(metrics?.verifiedTrustScore || 4.9).toFixed(1)}
                </span>
                <span className="text-slate-400 font-medium text-sm">/ 5.0 ★</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">
                  {metrics?.trustReviewsCount || 38} Verified Reviews
                </span>
                <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">
                  View Pillars →
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Assigned Scopes</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">1 Active Project</span>
            <span className="text-[11px] text-indigo-600 mt-0.5 block">CRED 30s Brand Video</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Review Pipeline</span>
            <span className="text-2xl font-bold text-amber-600 mt-1 block">v2 Submitted</span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Awaiting lead approval</span>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Trust Level</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block flex items-center gap-1.5">
              {isRohanTrusted ? (
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Trusted Direct Push
                </span>
              ) : (
                <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⏱ Lead Approval Required
                </span>
              )}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {isRohanTrusted ? 'Pushes straight to client' : 'Arjun reviews before client'}
            </span>
          </div>
        </div>
      )}

      {/* Active Projects Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Projects & Scopes</h3>
            <p className="text-xs text-slate-500">
              Click any project card to inspect deliverables, version links, review comments & audit log.
            </p>
          </div>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {visibleProjects.length} Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleProjects.map((proj) => {
            if (!proj) return null;
            const deadlineStatus = getDeadlineStatus(proj.deadline);
            const delivList = Array.isArray(proj.deliverables) ? proj.deliverables : [];
            const totalDeliv = proj.totalDeliverables || delivList.length || 1;
            const completedDeliv =
              proj.completedDeliverables ||
              delivList.filter((d) => d && d.status === 'Approved').length ||
              0;
            const progress = Math.min(100, Math.round((completedDeliv / totalDeliv) * 100));

            return (
              <div
                key={proj.id}
                onClick={() => handleCardClick(proj)}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 p-5 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col justify-between group space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {proj.status || 'In Progress'}
                    </span>

                    {deadlineStatus.color === 'red' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span>Overdue</span>
                      </span>
                    )}
                    {deadlineStatus.color === 'amber' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>At risk ({deadlineStatus.daysDiff}d left)</span>
                      </span>
                    )}
                    {deadlineStatus.color === 'emerald' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>On track</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {proj.title}
                  </h4>

                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{proj.clientName}</span>
                    <span>•</span>
                    <span>{proj.clientCompany}</span>
                  </div>

                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Progress</span>
                      <span className="font-bold text-indigo-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{completedDeliv}/{totalDeliv} Deliverables Done</span>
                      <span>Target: {formatDate(proj.deadline)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {safeRole !== 'team_member' ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Total Scope Budget
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">
                        {formatINR(proj.totalBudget || proj.budget || 0)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                        Deliverable Tasks
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {delivList.length} Work Items
                      </span>
                    </div>
                  )}

                  <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                    Inspect Deliverables →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Concentration Meter & Simulator */}
      {safeRole === 'freelancer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Icons.TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Client Revenue Concentration
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculates dependency risk. Over 60% with a single client raises cashflow fragility.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {(Array.isArray(mockClientConcentration) ? mockClientConcentration : []).map((client) => {
                if (!client) return null;
                const isHighRisk = client.riskLevel === 'high';

                return (
                  <div key={client.clientName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={client.clientAvatar}
                          alt={client.clientName}
                          className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-bold text-slate-800">{client.clientName}</span>
                        <span className="text-[10px] text-slate-400">({client.clientCompany})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">
                          {formatINR(client.totalRevenue, true)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isHighRisk
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          {client.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${client.percentage > 60
                            ? 'bg-rose-500'
                            : client.percentage >= 40
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        style={{ width: `${client.percentage}%` }}
                      />
                    </div>

                    {isHighRisk && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-1.5 text-[11px] text-rose-900">
                        <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>High concentration risk: 66.5% tied to Kunal Shah!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Icons.Sliders className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Client Delay Impact Simulator
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate cash runway impact if your highest-paying client delays milestone settlement.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                CRED: {formatINR(credDelayedAmount)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Simulate Payment Delay:</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">
                  {delayDays} Days Delay
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={delayDays}
                onChange={(e) => setDelayDays(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 Days (Instant)</span>
                <span>15 Days</span>
                <span>30 Days (Standard delay)</span>
                <span>45 Days (Severe)</span>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${delayDays >= 30
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : delayDays >= 15
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Icons.AlertTriangle
                  className={`w-5 h-5 shrink-0 ${delayDays >= 30 ? 'text-rose-600' : 'text-amber-600'
                    }`}
                />
                <p className="leading-relaxed">
                  If <strong>Kunal Shah (CRED)</strong> delays payment by{' '}
                  <strong>{delayDays} days</strong>, your cash runway{' '}
                  <strong className="underline">{delayImpact.netImpactText}</strong>.
                  (Base Balance: ₹1.2L • Burn: ₹60k/mo).
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendNudgeWhatsApp}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <Icons.WhatsApp className="w-3.5 h-3.5 fill-white" />
                <span>Send Polite Nudge</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Members List */}
      {safeRole === 'freelancer' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Icons.Users className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Team Members & Trust Approvals
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage team delegation. Members marked &apos;Trusted&apos; can push deliverable links directly to the client portal.
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {safeTeamMembers.length} Members Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeTeamMembers.map((member) => {
              if (!member) return null;
              const isTrusted = member.trustMode === 'trusted';

              return (
                <div
                  key={member.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{member.name}</h4>
                      <p className="text-[11px] text-slate-500">{member.role}</p>
                      <span className="text-[10px] text-indigo-600 font-medium">
                        {member.activeTasksCount || 1} Active Deliverable Tasks
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleTrustMode && onToggleTrustMode(member.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs ${isTrusted
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                        }`}
                    >
                      <span>{isTrusted ? '✓ Trusted (Direct Push)' : '⏱ Needs My Approval'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Click to toggle permission</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {safeRole !== 'team_member' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
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
              <input
                type="text"
                placeholder="Search client, project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-56"
              />

              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                {['All', 'Paid', 'Pending', 'Review Window Open'].map((st) => (
                  <button
                    key={st}
                    type="button"
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
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {tx.clientAvatar ? (
                              <img
                                src={tx.clientAvatar}
                                alt={tx.clientName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                {tx.clientName ? tx.clientName[0] : 'C'}
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-slate-900 block">
                                {tx.clientName}
                              </span>
                              <span className="text-[11px] text-slate-400">{tx.vpa}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <span className="font-medium text-slate-800 line-clamp-1 block">
                            {tx.projectTitle}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span className="font-mono">{tx.invoiceNumber}</span>
                            {tx.trancheLabel && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-indigo-600">
                                  {tx.trancheLabel}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span>{formatDate(tx.date)}</span>
                          </div>
                        </td>

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

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>UPI Auto-Pay</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          {isPaid && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ <span>Paid</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              ⏱ <span>Pending</span>
                            </span>
                          )}
                          {isReviewOpen && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              ★ <span>Review Window Open</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {isReviewOpen ? (
                            <button
                              type="button"
                              onClick={() => onActionClick && onActionClick(tx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                            >
                              <span>Rate & Unlock</span>
                            </button>
                          ) : isPending ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyLink(tx.id)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                              >
                                {copiedTxId === tx.id ? 'Copied!' : 'Copy Link'}
                              </button>
                              <button
                                type="button"
                                onClick={() => onActionClick && onActionClick(tx)}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                              >
                                Remind
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onActionClick && onActionClick(tx)}
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

          <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Escrow release backed by NPCI & RBI compliant UPI 2.0 handle.</span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('invoices')}
              className="text-indigo-600 hover:underline font-medium text-xs"
            >
              Manage All Invoices →
            </button>
          </div>
        </div>
      )}

      {/* Interactive Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          currentUserRole={safeRole}
          isTeamMemberTrusted={isRohanTrusted}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={(updated) => {
            setSelectedProject(updated);
            if (onUpdateProject) onUpdateProject(updated);
          }}
          onAddBillableScope={onAddBillableScope}
        />
      )}
    </div>
  );
};