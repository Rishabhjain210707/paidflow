'use client';

import React, { useState } from 'react';
import { initialProjects, initialTeamMembers, initialActivityLogs, mockTransactions } from '../data/mockData';
import { Project, Role, ActivityLog, TeamMember } from '../types';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'invoices' | 'trust'>('overview');
  const [currentRole, setCurrentRole] = useState<Role>('freelancer');

  // Safe initialization
  const [projects, setProjects] = useState<Project[]>(() =>
    Array.isArray(initialProjects) ? initialProjects : []
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    Array.isArray(initialTeamMembers) ? initialTeamMembers : []
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    Array.isArray(initialActivityLogs) ? initialActivityLogs : []
  );

  const [activeProjectId, setActiveProjectId] = useState<string>('p1');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState(''); // Fixed: Declared missing password state
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);

  // Safe fallback to guarantee activeProject is never undefined during prerender
  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : (Array.isArray(initialProjects) ? initialProjects : []);
  const activeProject = safeProjects.find((p) => p && p.id === activeProjectId) || safeProjects[0] || {
    id: 'p1',
    title: 'Brand Refresh & Launch Assets',
    clientName: 'Kunal Shah',
    clientCompany: 'CRED',
    deadline: '2026-11-05',
    budget: 185000,
    freeRevisionsTotal: 2,
    freeRevisionsUsed: 1,
    extraScopeAmount: 0,
    deliverables: [],
  };

  const addActivityLog = (projectId: string, person: string, role: Role, action: string, deliverableId?: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      projectId,
      timestamp: new Date().toISOString(),
      person,
      role,
      action,
      deliverableId,
    };
    setActivityLogs((prev) => [newLog, ...(Array.isArray(prev) ? prev : [])]);
  };

  const handleUpdateDeliverableStatus = (projectId: string, deliverableId: string, newStatus: any, feedback?: string) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;

        let revisionsUsed = project.freeRevisionsUsed;
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

        return {
          ...project,
          deliverables: updatedDeliverables,
          freeRevisionsUsed: revisionsUsed,
        };
      })
    );

    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah (Client)';
    addActivityLog(projectId, person, currentRole, `Status updated to "${newStatus}"`, deliverableId);
  };

  const handleUpdateDeliverableLink = (projectId: string, deliverableId: string, link: string) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = (project.deliverables || []).map((deliv) => {
          if (deliv.id !== deliverableId) return deliv;
          return {
            ...deliv,
            workLink: link,
            version: (deliv.version === 'v1' ? 'v2' : deliv.version === 'v2' ? 'v3' : 'v3') as any,
            status: 'Submitted' as any,
          };
        });
        return { ...project, deliverables: updatedDeliverables };
      })
    );
    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : 'Rohan (Editor)';
    addActivityLog(projectId, person, currentRole, `Submitted new version link for deliverable`, deliverableId);
  };

  const handleAddBillableScope = (projectId: string, amount: number) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        return {
          ...project,
          extraScopeAmount: (project.extraScopeAmount || 0) + amount,
          budget: project.budget + amount,
        };
      })
    );
    addActivityLog(projectId, 'SoloFlow Bot', 'freelancer', `Added billable scope of ₹${amount.toLocaleString('en-IN')} for extra revision`);
  };

  const handleToggleTrust = (memberId: string) => {
    setTeamMembers((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) =>
        m.id === memberId
          ? { ...m, trustMode: m.trustMode === 'trusted' ? 'approval_required' : 'trusted' }
          : m
      )
    );
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setIsDetailModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = (userEmail || '').trim();
    if (!cleanEmail) {
      setLoginFeedback('Please enter your email or VPA handle.');
      return;
    }
    const username = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
    setLoginFeedback(`Signed in as ${username}!`);
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setLoginFeedback(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs relative z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px] bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
            SoloFlow
          </span>
          <span className="text-slate-300 hidden sm:inline">Active View:</span>
          <span className="font-semibold text-slate-100">
            {currentRole === 'freelancer' ? 'Arjun (Freelancer Lead)' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah (CRED Client)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>👤</span>
            <span>Freelancer Login</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <span>☰</span>
              <span>Menu</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900">Workspace Features</span>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block mb-1.5">
                      1. Delivery & Scopes
                    </span>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Projects & Deadlines</span>
                        <span className="text-[10px] text-slate-400">Cards →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('overview'); setIsDetailModalOpen(true); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Deliverables & Versions</span>
                        <span className="text-[10px] text-slate-400">v1 / v2 →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-1.5">
                      2. Financials & Cash Risk
                    </span>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => { setActiveTab('invoices'); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Advance & Milestone Invoices</span>
                        <span className="text-[10px] text-slate-400">Split Tranches →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Delay Impact Simulator</span>
                        <span className="text-[10px] text-slate-400">Runway Days →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('overview'); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Client Concentration Gauge</span>
                        <span className="text-[10px] text-slate-400">Risk Meter →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block mb-1.5">
                      3. Reputation & Verification
                    </span>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => { setActiveTab('trust'); setIsMenuOpen(false); }}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">Verified Client Reviews</span>
                        <span className="text-[10px] text-slate-400">4.9 ★ →</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1.5">
                      4. Switch Perspective
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => { setCurrentRole('freelancer'); setIsMenuOpen(false); }}
                        className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'freelancer' ? 'bg-indigo-600 text-white font-bold' : 'bg-white border text-slate-700'
                          }`}
                      >
                        Freelancer
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCurrentRole('team_member'); setIsMenuOpen(false); }}
                        className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'team_member' ? 'bg-amber-600 text-white font-bold' : 'bg-white border text-slate-700'
                          }`}
                      >
                        Editor
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCurrentRole('client'); setIsMenuOpen(false); }}
                        className={`py-1.5 px-2 rounded-md font-medium text-center ${currentRole === 'client' ? 'bg-emerald-600 text-white font-bold' : 'bg-white border text-slate-700'
                          }`}
                      >
                        Client
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ₹
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base">SoloFlow</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {currentRole === 'freelancer' ? 'LEAD' : currentRole === 'team_member' ? 'COLLAB' : 'CLIENT'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Cash Flow & Delivery Guard</p>
              </div>
            </div>

            {currentRole !== 'client' && (
              <div className="space-y-2">
                {currentRole === 'freelancer' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <span>+ Quick Split Invoice</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span>{currentRole === 'freelancer' ? '✎ Scope & Proposals' : '📂 Deliverables Portal'}</span>
                </button>
              </div>
            )}

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
                  <span>{currentRole === 'client' ? 'Client Dashboard' : 'Overview & Risk Pulse'}</span>
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
                  <span>Scopes & Contracts</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Active</span>
              </button>

              {currentRole !== 'team_member' && (
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
                    <span>{currentRole === 'client' ? 'Pay Milestones (UPI)' : 'UPI Invoicing'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                    Instant
                  </span>
                </button>
              )}

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
                  <span>Trust & Reviews</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">4.9 ★</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${currentRole === 'freelancer' ? 'bg-indigo-700' : currentRole === 'team_member' ? 'bg-amber-600' : 'bg-emerald-700'
                }`}>
                {currentRole === 'freelancer' ? 'AV' : currentRole === 'team_member' ? 'ED' : 'KS'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentRole === 'freelancer' ? 'Arjun (Lead)' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentRole === 'freelancer' ? 'Lead Freelancer' : currentRole === 'team_member' ? 'Video Editor' : 'CRED Client'}
                </p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </aside>

        {/* Content Pane */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          {activeTab === 'overview' && (
            <OverviewDashboard
              projects={safeProjects}
              currentUserRole={currentRole}
              teamMembers={teamMembers}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onUpdateProject={(updated) => {
                setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              }}
              onToggleTrustMode={handleToggleTrust}
              onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalCreator
              initialProposal={{
                id: activeProject.id,
                title: activeProject.title,
                clientName: activeProject.clientName,
                clientCompany: activeProject.clientCompany,
                clientEmail: 'client@example.com',
                clientPhone: '+91 98765 00000',
                totalAmount: activeProject.budget,
                subtotal: activeProject.budget,
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
                  amount: Math.round(activeProject.budget / (activeProject.deliverables?.length || 1)),
                  status: d.status === 'Approved' ? 'Completed' : 'In Progress',
                })),
              }}
              onSaveProposal={() => { }}
            />
          )}

          {activeTab === 'invoices' && (
            <UPIInvoiceView
              invoiceNumber="INV-2026-001"
              clientName={activeProject.clientName}
              clientVPA="kunal@cred.club"
              totalAmount={activeProject.budget}
              initialTranches={[
                { id: 'tr_1', title: '50% Advance Commitment', amount: Math.round(activeProject.budget / 2), isPaid: true, dueDate: 'Paid (Immediate)' },
                { id: 'tr_2', title: 'Final Delivery & Copyright Release', amount: Math.round(activeProject.budget / 2), isPaid: false, dueDate: activeProject.deadline },
              ]}
            />
          )}

          {activeTab === 'trust' && <TrustReviewView />}
        </section>
      </div>

      {/* Project Detail Modal */}
      {isDetailModalOpen && (
        <ProjectDetailModal
          project={activeProject}
          isOpen={isDetailModalOpen}
          currentUserRole={currentRole}
          isTeamMemberTrusted={teamMembers.find((m) => m.id === 'member_rohan')?.trustMode === 'trusted'}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateProject={(updated) => {
            setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          }}
          onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
        />
      )}

      {/* Freelancer Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  ₹
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Freelancer Portal Login</h3>
                  <p className="text-[11px] text-slate-400">Access your UPI escrow, scopes & trust stats</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-5 space-y-4">
              {loginFeedback && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  {loginFeedback}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Freelancer Email / VPA ID</label>
                <input
                  type="text"
                  placeholder="arjunverma@okhdfcbank"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passcode / OTP</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
              >
                Sign In to Dashboard
              </button>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-2 text-center">
                  Or Instant Demo 1-Click Login
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setCurrentRole('freelancer'); setIsLoginModalOpen(false); }}
                    className="p-2 text-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 text-[11px] font-semibold transition-colors"
                  >
                    Arjun (Lead)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrentRole('team_member'); setIsLoginModalOpen(false); }}
                    className="p-2 text-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 text-[11px] font-semibold transition-colors"
                  >
                    Rohan (Editor)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrentRole('client'); setIsLoginModalOpen(false); }}
                    className="p-2 text-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 text-[11px] font-semibold transition-colors"
                  >
                    Kunal (Client)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}