'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
import { TopNavBar } from '../components/navigation/TopNavBar';
import { DeliverablesView } from '../components/deliverables/DeliverablesView';
import { DelaySimulatorView } from '../components/simulator/DelaySimulatorView';
import { ConcentrationRiskView } from '../components/concentration/ConcentrationRiskView';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ToastProvider } from '../components/ui/ToastProvider';
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

  // Deliverables comments state
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

      {/* 2-Tier Modular Top Navigation Bar */}
      <TopNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        isUserDropdownOpen={isUserDropdownOpen}
        setIsUserDropdownOpen={setIsUserDropdownOpen}
        onOpenQuickInvoice={() => setIsQuickInvoiceModalOpen(true)}
        onOpenNewProposal={() => {
          setActiveTab('proposals');
          showToast('Opened Proposals & E-Sign Creator');
        }}
        onToast={showToast}
      />

      {/* ================= CONTENT SECTION: 8 DEDICATED WORKING PAGES ================= */}
      <ErrorBoundary>
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
            <DeliverablesView
              projects={projects}
              currentRole={currentRole}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                setIsDetailModalOpen(true);
              }}
              onSubmitNewVersion={handleUpdateDeliverableLink}
              onApproveCut={(projectId, delivId) =>
                handleUpdateDeliverableStatus(projectId, delivId, 'Approved')
              }
              onRequestRevision={(projectId, delivId) =>
                handleUpdateDeliverableStatus(
                  projectId,
                  delivId,
                  'Changes Requested',
                  'Revision requested by client.'
                )
              }
              onToast={showToast}
            />
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
            <DelaySimulatorView
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onToast={showToast}
            />
          )}

          {/* ================= PAGE 6: DEDICATED CLIENT CONCENTRATION GAUGE PAGE ================= */}
          {activeTab === 'concentration' && (
            <ConcentrationRiskView
              onNavigateTab={(tab) => setActiveTab(tab as TabType)}
              onToast={showToast}
            />
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
      </ErrorBoundary>

      {/* TEAM MEMBERS & DISCORD-STYLE PERMISSIONS DRAWER */}
      {showTeamDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-0.5">
                    TEAM ARCHITECTURE
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Crew Members & Discord-Style Permissions</h3>
                  <p className="text-xs text-slate-500">
                    Assign roles to collaborators. Permissions stack across roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTeamDrawer(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              {/* Embed Discord-Style Crew Architecture */}
              <CrewRolesView
                onNavigateTab={(tab) => {
                  setShowTeamDrawer(false);
                  setActiveTab(tab as any);
                }}
                onShareTrustUrl={() => {
                  setShowTeamDrawer(false);
                  setActiveTab('trust');
                }}
                onToast={showToast}
              />
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowTeamDrawer(false);
                  setActiveTab('team');
                }}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors text-center cursor-pointer"
              >
                Expand Full Page View →
              </button>
              <button
                type="button"
                onClick={() => setShowTeamDrawer(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
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
