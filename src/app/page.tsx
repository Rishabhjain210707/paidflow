'use client';

import React, { useState } from 'react';
import {
  initialProjects,
  initialTeamMembers,
  initialActivityLogs,
  mockTransactions,
  mockFreelancerProfile,
  mockClientConcentration,
  mockInitialInvoice,
  mockTrustMetrics,
  mockPendingClientReviews,
} from '../data/mockData';
import {
  Project,
  UserRole,
  ActivityLogItem,
  TeamMember,
  Transaction,
  TabType,
  DeliverableItem,
} from '../types';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';
import { QuickUPIInvoiceModal } from '../components/modals/QuickUPIInvoiceModal';
import { CrewRolesView } from '../components/team/CrewRolesView';
import { PrerequisiteAssetsCard } from '../components/projects/PrerequisiteAssetsCard';
import { ProjectChatCard } from '../components/projects/ProjectChatCard';
import { Icons } from '../components/ui/Icons';
import {
  formatINR,
  getDeadlineStatus,
  calculateDelayImpact,
  generateWhatsAppShareUrl,
  getAppBaseUrl,
} from '../utils/formatters';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('freelancer');

  // Core application state
  const defaultProjects: Project[] = Array.isArray(initialProjects) && initialProjects.length > 0 ? initialProjects : [];
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    Array.isArray(mockTransactions) ? mockTransactions : []
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    Array.isArray(initialTeamMembers) ? initialTeamMembers : []
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() =>
    Array.isArray(initialActivityLogs) ? initialActivityLogs : []
  );

  const [activeProjectId, setActiveProjectId] = useState<string>('proj_cred_video');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isQuickInvoiceModalOpen, setIsQuickInvoiceModalOpen] = useState(false);
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delay Impact Simulator State (Page & Card)
  const [simDelayDays, setSimDelayDays] = useState<number>(30);
  const [simTone, setSimTone] = useState<'friendly' | 'firm' | 'final'>('friendly');
  const delayedCredAmount = 145000;
  const simImpact = calculateDelayImpact(delayedCredAmount, simDelayDays);

  // Deliverables filter & state
  const [deliverablesSearch, setDeliverablesSearch] = useState('');
  const [deliverablesStatusFilter, setDeliverablesStatusFilter] = useState('All');
  const [newVersionInputs, setNewVersionInputs] = useState<{ [delId: string]: string }>({});
  const [newCommentInputs, setNewCommentInputs] = useState<{ [delId: string]: string }>({});

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : defaultProjects;
  const activeProject = safeProjects.find((p) => p && p.id === activeProjectId) || safeProjects[0];

  // Dynamic metrics calculation
  const metrics = {
    totalSettledRevenue: 1485000,
    settledGrowthPercent: '+18.4%',
    pendingInvoicesCount: 3,
    pendingInvoicesAmount: 182500,
    activeProjectsCount: safeProjects.length,
    verifiedTrustScore: 4.92,
    maxTrustScore: 5.0,
    trustReviewsCount: 38,
    onTimePaymentRate: 98,
  };

  const addActivityLog = (projectId: string, person: string, role: string, action: string, deliverableId?: string) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      projectId,
      timestamp: 'Just now',
      person,
      role,
      action,
      deliverableId,
      badgeType: 'submission',
    };
    setActivityLogs((prev) => [newLog, ...(Array.isArray(prev) ? prev : [])]);
  };

  // Deliverable status transition
  const handleUpdateDeliverableStatus = (projectId: string, deliverableId: string, newStatus: any, feedback?: string) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;

        let revisionsUsed = project.freeRevisionsUsed || 0;
        if (newStatus === 'Changes Requested') {
          revisionsUsed += 1;
        }

        const updatedDeliverables = (project.deliverables || []).map((deliv) => {
          if (deliv.id !== deliverableId) return deliv;
          return {
            ...deliv,
            status: newStatus,
            latestComment: feedback || deliv.latestComment,
          };
        });

        const completedCount = updatedDeliverables.filter((d) => d.status === 'Approved').length;

        return {
          ...project,
          deliverables: updatedDeliverables,
          freeRevisionsUsed: revisionsUsed,
          completedDeliverables: completedCount,
        };
      })
    );

    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah (Client)';
    addActivityLog(projectId, person, currentRole, `Status updated to "${newStatus}"`, deliverableId);
    showToast(`Updated deliverable status to "${newStatus}"`);
  };

  // Submit new version
  const handleUpdateDeliverableLink = (projectId: string, deliverableId: string, link: string) => {
    if (!link.trim()) return;

    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = (project.deliverables || []).map((deliv) => {
          if (deliv.id !== deliverableId) return deliv;
          const currentV = deliv.currentVersion || deliv.version || 'v1';
          const nextVNum = parseInt(currentV.replace('v', ''), 10) + 1;
          const nextVersion = `v${nextVNum}`;

          const newVersionObj = {
            version: nextVersion,
            link: link.trim(),
            submittedBy: currentRole === 'team_member' ? 'Rohan Mehta' : 'Arjun Verma',
            submittedAt: 'Today',
            notes: 'Updated cut revision with color correction.',
          };

          return {
            ...deliv,
            workLink: link.trim(),
            currentVersion: nextVersion,
            version: nextVersion,
            versions: [newVersionObj, ...(deliv.versions || [])],
            status: 'Submitted',
          };
        });
        return { ...project, deliverables: updatedDeliverables };
      })
    );

    setNewVersionInputs((prev) => ({ ...prev, [deliverableId]: '' }));
    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : 'Rohan (Editor)';
    addActivityLog(projectId, person, currentRole, `Submitted new version link for deliverable`, deliverableId);
    showToast(`✓ Submitted new version link!`);
  };

  // Add threaded comment
  const handleAddDeliverableComment = (projectId: string, deliverableId: string, text: string) => {
    if (!text.trim()) return;

    const authorName = currentRole === 'freelancer' ? 'Arjun Verma' : currentRole === 'team_member' ? 'Rohan Mehta' : 'Kunal Shah';
    const avatarUrl =
      currentRole === 'freelancer'
        ? mockFreelancerProfile.avatar
        : currentRole === 'team_member'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80';

    const newComment = {
      id: `comm_${Date.now()}`,
      author: authorName,
      authorRole: currentRole,
      avatar: avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          deliverables: (proj.deliverables || []).map((d) => {
            if (d.id !== deliverableId) return d;
            return {
              ...d,
              comments: [...(d.comments || []), newComment],
            };
          }),
        };
      })
    );

    setNewCommentInputs((prev) => ({ ...prev, [deliverableId]: '' }));
    showToast('Comment posted to deliverable!');
  };

  // Add billable scope creep
  const handleAddBillableScope = (projectId: string, amount: number) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        const currentBudget = project.totalBudget || project.budget || 0;
        return {
          ...project,
          extraScopeAmount: (project.extraScopeAmount || 0) + amount,
          budget: currentBudget + amount,
          totalBudget: currentBudget + amount,
        };
      })
    );
    addActivityLog(projectId, 'SoloFlow Bot', 'freelancer', `Added billable scope of ₹${amount.toLocaleString('en-IN')} for extra revision`);
    showToast(`⚡ Added +${formatINR(amount)} billable scope to next invoice!`);
  };

  // Trust toggle
  const handleToggleTrust = (memberId: string) => {
    setTeamMembers((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) => {
        if (m.id === memberId) {
          const nextMode = m.trustMode === 'trusted' ? 'needs_approval' : 'trusted';
          showToast(`${m.name} trust mode: ${nextMode === 'trusted' ? 'Trusted (Direct Client Push)' : 'Needs Lead Review'}`);
          return { ...m, trustMode: nextMode };
        }
        return m;
      })
    );
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setIsDetailModalOpen(true);
  };

  // Generate Tone-Aware WhatsApp URL
  const getWhatsAppNudgeUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    const checkoutLink = `${origin}/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`;

    let msg = '';
    if (simTone === 'friendly') {
      msg = `Hi Kunal, hope you're having a productive week! Just checking in on the pending milestone tranche for CRED Pulse (${formatINR(
        delayedCredAmount
      )}). The DaVinci color master & spatial audio stems are signed off and ready for release: ${checkoutLink}`;
    } else if (simTone === 'firm') {
      msg = `Hello Kunal, following up regarding the invoice for CRED Pulse (${formatINR(
        delayedCredAmount
      )}). As the deliverables are approved, settling the UPI tranche today helps us keep our upcoming motion sprint schedule intact: ${checkoutLink}`;
    } else {
      msg = `Urgent Notice: The UPI milestone invoice for CRED Pulse (${formatINR(
        delayedCredAmount
      )}) is past the payment agreement window. Please clear the payment immediately to avoid pausing production handoff: ${checkoutLink}`;
    }
    return generateWhatsAppShareUrl('+919079879010', msg);
  };

  // All deliverables flattened across all projects
  const allDeliverables = safeProjects.flatMap((p) =>
    (p.deliverables || []).map((d) => ({
      ...d,
      projectId: p.id,
      projectTitle: p.title,
      clientName: p.clientName,
      clientCompany: p.clientCompany,
      deadline: p.deadline,
    }))
  );

  const filteredDeliverables = allDeliverables.filter((d) => {
    const matchesSearch =
      (d.title || '').toLowerCase().includes(deliverablesSearch.toLowerCase()) ||
      (d.projectTitle || '').toLowerCase().includes(deliverablesSearch.toLowerCase()) ||
      (d.clientName || '').toLowerCase().includes(deliverablesSearch.toLowerCase());
    const matchesStatus = deliverablesStatusFilter === 'All' ? true : d.status === deliverablesStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Icons.Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================= TOP HEADER (Row 1) ================= */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Brand Identity */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => setActiveTab('overview')}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-950 text-base sm:text-lg tracking-tight leading-none">
                  PaidFlow
                </span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  SOLO PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">Fintech & Scope Guard</p>
            </div>
          </div>

          {/* Center: View as Perspective Switcher (Freelancer | Team (Riya) | Client (Kunal)) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-xs font-semibold text-slate-400 pl-3 pr-1 select-none">View as:</span>
            <button
              type="button"
              onClick={() => {
                setCurrentRole('freelancer');
                showToast('Switched to Freelancer (Arjun - Lead) mode');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'freelancer'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentRole('team_member');
                showToast('Switched to Team (Riya / Rohan - Editor) mode. Financials restricted.');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'team_member'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Team (Riya)
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentRole('client');
                showToast('Switched to Client (Kunal Shah - CRED) perspective');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentRole === 'client'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Client (Kunal)
            </button>
          </div>

          {/* Right: Quick Action Buttons & Profile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsQuickInvoiceModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Icons.Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Quick UPI Invoice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('proposals');
                showToast('Opened Proposals & E-Sign Creator');
              }}
              className="bg-slate-100 hover:bg-slate-200/80 active:scale-[0.98] text-slate-800 text-xs font-bold px-3 sm:px-3.5 py-2 rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
            >
              <Icons.Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Proposal</span>
            </button>

            {/* Profile Dropdown Button */}
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

              {/* Profile Dropdown Menu */}
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
                        onClick={() => {
                          setCurrentRole('freelancer');
                          setIsUserDropdownOpen(false);
                        }}
                        className={`py-1 rounded text-center font-semibold text-[11px] ${
                          currentRole === 'freelancer' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Freelancer
                      </button>
                      <button
                        onClick={() => {
                          setCurrentRole('team_member');
                          setIsUserDropdownOpen(false);
                        }}
                        className={`py-1 rounded text-center font-semibold text-[11px] ${
                          currentRole === 'team_member' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Team
                      </button>
                      <button
                        onClick={() => {
                          setCurrentRole('client');
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
                    <button
                      onClick={() => {
                        setShowTeamDrawer(true);
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Icons.Users className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Team & Access (RBAC)</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Roster →</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('simulator');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Icons.Sliders className="w-3.5 h-3.5 text-amber-500" />
                        <span>Client Delay Simulator</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Runway →</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('concentration');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Client Concentration Risk</span>
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold">66.5% RED →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= SUB-NAVIGATION BAR (Row 2) ================= */}
        <div className="border-t border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none text-xs">
            {/* Overview */}
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Overview
            </button>

            {/* Active Gigs & Scope • */}
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'projects'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Active Gigs & Scope</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Deliverables & Versions */}
            <button
              type="button"
              onClick={() => setActiveTab('deliverables')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === 'deliverables'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Deliverables & Versions
            </button>

            {/* Proposals & E-Sign */}
            <button
              type="button"
              onClick={() => setActiveTab('proposals')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === 'proposals'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Proposals & E-Sign
            </button>

            {/* UPI Invoicing */}
            <button
              type="button"
              onClick={() => setActiveTab('invoices')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                activeTab === 'invoices'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              UPI Invoicing
            </button>

            {/* Delay Simulator */}
            <button
              type="button"
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Delay Simulator</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Runway
              </span>
            </button>

            {/* Concentration Risk */}
            <button
              type="button"
              onClick={() => setActiveTab('concentration')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                activeTab === 'concentration'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <span>Concentration Risk</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-50 text-rose-700 border border-rose-200">
                66.5% RED
              </span>
            </button>

            {/* Trust & Reviews (4.92 ★) */}
            <button
              type="button"
              onClick={() => setActiveTab('trust')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 ${
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

            {/* Crew & Roles */}
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

      {/* ================= CONTENT SECTION: 8 DEDICATED WORKING PAGES ================= */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* ================= PAGE 1: OVERVIEW COMMAND CENTER ================= */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              transactions={transactions}
              projects={safeProjects}
              teamMembers={teamMembers}
              currentUserRole={currentRole}
              onSelectProject={handleSelectProject}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onNewProposal={() => setActiveTab('proposals')}
              onQuickInvoice={() => setActiveTab('invoices')}
              onShareReputation={() => setActiveTab('trust')}
              onActionClick={() => setActiveTab('invoices')}
              onUpdateProject={(updated) => {
                setProjects((prev) => (Array.isArray(prev) ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]));
              }}
              onToggleTrustMode={handleToggleTrust}
              onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
            />
          )}

          {/* ================= PAGE 2: DEDICATED PROJECTS & DEADLINES PAGE ================= */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Feature 1 of 8
                    </span>
                    <span className="text-xs text-slate-400">SoloFlow Delivery Guard</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Projects & Deadline Thresholds</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live dynamic progress calculated automatically from completed deliverables with deadline risk badges.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('deliverables')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Deliverables →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('proposals')}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    + New Project Scope
                  </button>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {safeProjects.map((project) => {
                  const deadlineStatus = getDeadlineStatus(project.deadline);
                  const progressPct =
                    project.totalDeliverables > 0
                      ? Math.round((project.completedDeliverables / project.totalDeliverables) * 100)
                      : 0;

                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                              {project.clientCompany}
                            </span>
                            <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">{project.title}</h3>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                              deadlineStatus.color === 'red'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : deadlineStatus.color === 'amber'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {deadlineStatus.label}
                          </span>
                        </div>

                        {/* Progress Bar (Dynamic from deliverables) */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>
                              Deliverables Progress: <strong>{project.completedDeliverables}/{project.totalDeliverables}</strong>
                            </span>
                            <span className="font-mono font-bold text-slate-900">{progressPct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Due Date</span>
                            <span className="font-semibold text-slate-700">{project.deadline}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-medium">Scope Budget</span>
                            <span className="font-bold text-slate-900">
                              {currentRole === 'team_member' ? 'Confidential' : formatINR(project.totalBudget || project.budget || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectProject(project.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Icons.Search className="w-3.5 h-3.5" />
                          <span>Inspect Deliverables</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBillableScope(project.id, 5000)}
                          className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          title="Add +₹5,000 Billable Scope"
                        >
                          +₹5k Scope
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Client Assets & Real-time Collaboration (Image 1 features) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <PrerequisiteAssetsCard onToast={showToast} />
                <ProjectChatCard onToast={showToast} currentUserRole={currentRole} />
              </div>
            </div>
          )}

          {/* ================= PAGE 3: DEDICATED DELIVERABLES & VERSION CONTROL PAGE ================= */}
          {activeTab === 'deliverables' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Feature 2 & 5 of 8
                    </span>
                    <span className="text-xs text-slate-400">Version Approvals & Scope Creep Guard</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Deliverables & Version Control</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Clickable Google Drive/YouTube work links, version history (v1, v2, v3), status approval flows, and revision limit counters.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search deliverables or clients..."
                    value={deliverablesSearch}
                    onChange={(e) => setDeliverablesSearch(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={deliverablesStatusFilter}
                    onChange={(e) => setDeliverablesStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Submitted">Submitted (Review)</option>
                    <option value="Approved">Approved</option>
                    <option value="Changes Requested">Changes Requested</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Deliverables List Grid */}
              <div className="space-y-4">
                {filteredDeliverables.map((deliv) => {
                  const isQuotaExceeded = (deliv.revisionsUsed || 0) >= (deliv.freeRevisionsLimit || 2);

                  return (
                    <div
                      key={deliv.id}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                              {deliv.clientCompany} • {deliv.projectTitle}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                              {deliv.currentVersion || deliv.version || 'v1'}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm mt-0.5">{deliv.title}</h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                              deliv.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : deliv.status === 'Changes Requested'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : deliv.status === 'Submitted'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {deliv.status}
                          </span>
                        </div>
                      </div>

                      {/* Work Link Preview Box */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Icons.Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-800 block">External Work Asset Link</span>
                            <span className="font-mono text-indigo-600 text-[11px] select-all truncate block max-w-md">
                              {deliv.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const link = deliv.workLink || 'https://youtu.be/unlisted_cred_hero_v2';
                              if (typeof window !== 'undefined') {
                                window.open(link, '_blank');
                              }
                              showToast('Opening unlisted asset cut in new tab...');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1.5"
                          >
                            <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Open Work Link</span>
                          </button>
                        </div>
                      </div>

                      {/* Scope Creep Warning if 2/2 Revisions Used */}
                      {isQuotaExceeded && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                          <div className="flex items-center gap-2">
                            <Icons.AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              <strong>Free Revision Quota Reached ({deliv.revisionsUsed}/{deliv.freeRevisionsLimit} used).</strong>{' '}
                              Further revisions are billable scope creep.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddBillableScope(deliv.projectId, 5000)}
                            className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shrink-0"
                          >
                            + Add ₹5,000 to Invoice
                          </button>
                        </div>
                      )}

                      {/* Interactive Actions per Role */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Revisions:</span>
                          <span className="text-xs font-bold text-slate-800">
                            {deliv.revisionsUsed || 0}/{deliv.freeRevisionsLimit || 2} free used
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {currentRole === 'client' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateDeliverableStatus(deliv.projectId, deliv.id, 'Approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
                              >
                                <Icons.Check className="w-3.5 h-3.5" />
                                <span>Approve Cut</span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateDeliverableStatus(
                                    deliv.projectId,
                                    deliv.id,
                                    'Changes Requested',
                                    'Need tighter cut at 0:15 and punchier audio.'
                                  )
                                }
                                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs"
                              >
                                <span>Request Revision</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateDeliverableStatus(deliv.projectId, deliv.id, 'Approved')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                              >
                                Mark Approved
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateDeliverableStatus(deliv.projectId, deliv.id, 'Sent to Client')}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold"
                              >
                                Send to Client
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Inline Submit New Version Input */}
                      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Paste new Google Drive / YouTube URL to submit next cut..."
                          value={newVersionInputs[deliv.id] || ''}
                          onChange={(e) =>
                            setNewVersionInputs({ ...newVersionInputs, [deliv.id]: e.target.value })
                          }
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateDeliverableLink(deliv.projectId, deliv.id, newVersionInputs[deliv.id] || '')
                          }
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                        >
                          Submit New Version
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= PAGE 4: DEDICATED INVOICES & TRANCHES PAGE ================= */}
          {activeTab === 'invoices' && (
            <UPIInvoiceView
              initialInvoice={mockInitialInvoice}
              currentUserRole={currentRole}
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* ================= PAGE 5: DEDICATED DELAY IMPACT SIMULATOR PAGE ================= */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      Feature 6 of 8
                    </span>
                    <span className="text-xs text-slate-400">Cash Runway Protection</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Client Delay Impact Simulator</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Drag the slider to see what late payment costs your cash runway and generate tone-tailored WhatsApp nudges.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('concentration')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Concentration Gauge →
                  </button>
                </div>
              </div>

              {/* Main Simulator Workbench Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  {/* Slider Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-900">
                        Simulated Payment Delay for Kunal Shah (CRED)
                      </label>
                      <span className="text-lg font-mono font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        +{simDelayDays} Days Late
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={45}
                      step={1}
                      value={simDelayDays}
                      onChange={(e) => setSimDelayDays(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>0 Days (On Time)</span>
                      <span>15 Days</span>
                      <span>30 Days (Critical)</span>
                      <span>45 Days (Default Risk)</span>
                    </div>
                  </div>

                  {/* Runway Drop Graphic */}
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/90 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Cash Runway Depletion
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          simImpact.runwayDaysAfterDelay < 20
                            ? 'bg-rose-100 text-rose-800'
                            : simImpact.runwayDaysAfterDelay < 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {simImpact.runwayDaysAfterDelay < 20 ? 'CRITICAL RUNWAY' : 'MANAGEABLE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[11px] text-slate-400 block">Baseline Runway</span>
                        <span className="text-2xl font-bold text-slate-900">{simImpact.baselineRunwayDays} Days</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Based on ₹1,20k reserve</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[11px] text-slate-400 block">After {simDelayDays}d Delay</span>
                        <span
                          className={`text-2xl font-bold ${
                            simImpact.runwayDaysAfterDelay < 20 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {simImpact.runwayDaysAfterDelay} Days
                        </span>
                        <span className="text-[10px] text-rose-600 block mt-0.5 font-semibold">
                          -{simImpact.baselineRunwayDays - simImpact.runwayDaysAfterDelay} Days Lost
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                      <Icons.AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Impact Warning:</strong> If Kunal Shah (CRED) delays payment by {simDelayDays} days,
                        your personal cash runway drops from {simImpact.baselineRunwayDays} days to{' '}
                        <strong>{simImpact.runwayDaysAfterDelay} days</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Solopreneur Runway Formula Breakdown */}
                  <div className="text-xs text-slate-500 space-y-1 bg-white p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Financial Parameters</span>
                    <p>• Delayed Cash: <strong>{formatINR(delayedCredAmount)}</strong> (CRED Pulse Milestone 2)</p>
                    <p>• Monthly Operating & Living Burn: <strong>₹60,000</strong> (₹2,000/day)</p>
                    <p>• Current Bank Buffer: <strong>₹1,20,000</strong></p>
                  </div>
                </div>

                {/* Right Column: WhatsApp Reminder Generator with 3 Tones */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Tone-Tailored WhatsApp Nudge</h3>
                    <p className="text-xs text-slate-500">Pick friendly, firm, or final tone from the feature roadmap.</p>
                  </div>

                  {/* 3 Tone Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setSimTone('friendly')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'friendly' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Friendly
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimTone('firm')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'firm' ? 'bg-white text-indigo-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Firm
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimTone('final')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'final' ? 'bg-white text-rose-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Final Tone
                    </button>
                  </div>

                  {/* Message Preview Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono space-y-2 whitespace-pre-line leading-relaxed">
                    {simTone === 'friendly'
                      ? `Hi Kunal, hope you're having a productive week! Just checking in on the pending milestone tranche for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}).\n\nThe DaVinci color master & spatial audio stems are signed off and ready for release:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`
                      : simTone === 'firm'
                      ? `Hello Kunal, following up regarding the invoice for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}).\n\nAs the deliverables are approved, settling the UPI tranche today helps us keep our upcoming motion sprint schedule intact:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`
                      : `Urgent Notice: The UPI milestone invoice for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}) is past the payment agreement window.\n\nPlease clear the payment immediately to avoid pausing production handoff:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`}
                  </div>

                  {/* Direct WhatsApp Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = getWhatsAppNudgeUrl();
                      if (typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      }
                      showToast(`Opening WhatsApp with ${simTone} reminder tone!`);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Icons.WhatsApp className="w-4 h-4 fill-white" />
                    <span>Send {simTone.toUpperCase()} Reminder via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 6: DEDICATED CLIENT CONCENTRATION GAUGE PAGE ================= */}
          {activeTab === 'concentration' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Feature 6 of 8
                    </span>
                    <span className="text-xs text-slate-400">Cash Dependency Guard</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">Client Concentration Risk Gauge</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prevents solopreneur collapse when a single client represents &gt;60% of your total pipeline revenue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Icons.Sliders className="w-3.5 h-3.5" />
                  <span>Test Delay on Kunal Shah (CRED) →</span>
                </button>
              </div>

              {/* Concentration Meter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">Pipeline Revenue Distribution</span>
                  <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    ⚠️ 66.5% HIGH DEPENDENCY
                  </span>
                </div>

                {/* Combined Progress Distribution Bar */}
                <div className="h-5 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100">
                  <div style={{ width: '66.5%' }} className="bg-rose-500 hover:bg-rose-600 transition-colors" title="Kunal Shah (CRED): 66.5%" />
                  <div style={{ width: '20.2%' }} className="bg-emerald-500 hover:bg-emerald-600 transition-colors" title="Neha Singhal (Finly.io): 20.2%" />
                  <div style={{ width: '13.3%' }} className="bg-teal-500 hover:bg-teal-600 transition-colors" title="Pooja Iyer (Aura): 13.3%" />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Kunal Shah (CRED): <strong>66.5% (High Risk &gt;60%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Neha Singhal: <strong>20.2% (Healthy &lt;40%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-teal-500" />
                    <span>Pooja Iyer: <strong>13.3% (Healthy &lt;40%)</strong></span>
                  </div>
                </div>
              </div>

              {/* Client Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(mockClientConcentration || []).map((client) => {
                  const isHighRisk = client.riskLevel === 'high';
                  return (
                    <div
                      key={client.clientName}
                      className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${
                        isHighRisk ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.clientAvatar}
                            alt={client.clientName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{client.clientName}</h4>
                            <p className="text-[11px] text-slate-400">{client.clientCompany}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isHighRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isHighRisk ? 'High Risk' : 'Healthy'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Pipeline Share</span>
                          <span className="text-xl font-bold text-slate-900">{client.percentage}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Total Revenue</span>
                          <span className="text-sm font-bold text-slate-900">{formatINR(client.totalRevenue)}</span>
                        </div>
                      </div>

                      {isHighRisk && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('simulator')}
                          className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Icons.Sliders className="w-3.5 h-3.5" />
                          <span>Simulate Delay Shock</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= PAGE 7: DEDICATED VERIFIED TRUST & REVIEWS PAGE ================= */}
          {activeTab === 'trust' && (
            <TrustReviewView
              metrics={mockTrustMetrics}
              reviewsQueue={mockPendingClientReviews}
              onShareProfile={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(mockFreelancerProfile.reputationUrl);
                  showToast('Copied tamper-proof reputation profile link!');
                }
              }}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* ================= PAGE 8: DEDICATED PROPOSALS & E-SIGN SCOPE PAGE ================= */}
          {activeTab === 'proposals' && (
            <ProposalCreator
              initialProposal={{
                id: activeProject.id,
                title: activeProject.title,
                clientName: activeProject.clientName,
                clientCompany: activeProject.clientCompany,
                clientEmail: 'client@example.com',
                clientPhone: activeProject.clientPhone || '+91 90798 79010',
                createdAt: '2026-10-30',
                currency: 'INR',
                gstRate: 18,
                totalAmount: activeProject.totalBudget || activeProject.budget || 185000,
                subtotal: activeProject.totalBudget || activeProject.budget || 185000,
                discount: 0,
                gstApplicable: false,
                status: 'Approved',
                signedByClient: true,
                validUntil: activeProject.deadline,
                milestones: (activeProject.deliverables || []).map((d) => ({
                  id: d.id,
                  title: d.title,
                  description: d.workLink || 'Deliverable link asset',
                  deliverableDate: activeProject.deadline,
                  amount: Math.round((activeProject.totalBudget || activeProject.budget || 185000) / (activeProject.deliverables?.length || 1)),
                  status: (d.status === 'Approved' ? 'Completed' : 'In Progress') as any,
                })),
              }}
              onSaveProposal={(updated) => {
                showToast(`Saved proposal scope for "${updated.title}"!`);
              }}
            />
          )}

          {/* ================= PAGE 9: CREW & DISCORD-STYLE ROLES ================= */}
          {activeTab === 'team' && (
            <CrewRolesView
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onShareTrustUrl={() => setActiveTab('trust')}
              onToast={showToast}
            />
          )}
        </main>

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
                <button onClick={() => setShowTeamDrawer(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const isTrusted = member.trustMode === 'trusted';
                  return (
                    <div key={member.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
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
                            isTrusted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isTrusted ? 'Trusted' : 'Needs Approval'}
                        </span>
                      </div>

                      {/* Trust Toggle Switch */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">Direct Client Delivery</span>
                          <span className="text-[10px] text-slate-400">
                            {isTrusted ? 'Can push version links directly to Kunal Shah' : 'Submissions held for Freelancer sign-off'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTrust(member.id)}
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

      {/* Project Detail Modal */}
      {isDetailModalOpen && (
        <ProjectDetailModal
          project={activeProject}
          isOpen={isDetailModalOpen}
          currentUserRole={currentRole}
          isTeamMemberTrusted={teamMembers.find((m) => m.id === 'member_rohan')?.trustMode === 'trusted'}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateProject={(updated) => {
            setProjects((prev) => (Array.isArray(prev) ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]));
          }}
          onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
        />
      )}

      {/* Quick UPI Invoice Modal */}
      <QuickUPIInvoiceModal
        isOpen={isQuickInvoiceModalOpen}
        onClose={() => setIsQuickInvoiceModalOpen(false)}
        onInvoiceCreated={(data) => {
          showToast(`UPI invoice ${data.invNumber} for ${formatINR(data.totalAmount)} generated!`);
          setActiveTab('invoices');
        }}
      />
    </div>
  );
}
