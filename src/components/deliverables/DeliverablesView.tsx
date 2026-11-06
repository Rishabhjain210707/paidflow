'use client';

import React, { useState } from 'react';
import { Project, UserRole, DeliverableItem } from '../../types';
import { Icons } from '../ui/Icons';
import { EmptyState } from '../ui/EmptyState';

interface DeliverablesViewProps {
  projects: Project[];
  currentRole: UserRole;
  onSelectProject: (projectId: string) => void;
  onSubmitNewVersion: (projectId: string, deliverableId: string, url: string) => void;
  onApproveCut: (projectId: string, deliverableId: string) => void;
  onRequestRevision: (projectId: string, deliverableId: string) => void;
  onToast: (message: string) => void;
}

/**
 * DeliverablesView manages the multi-version review pipeline between
 * Freelancers, Team Collaborators, and Clients.
 *
 * Implements strict role-based capability gates:
 * - Clients cannot upload new versions (hidden to prevent client confusion)
 * - Decided cuts hide approval/rejection triggers once finalized
 */
export const DeliverablesView: React.FC<DeliverablesViewProps> = ({
  projects,
  currentRole,
  onSelectProject,
  onSubmitNewVersion,
  onApproveCut,
  onRequestRevision,
  onToast,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [versionInputs, setVersionInputs] = useState<Record<string, string>>({});

  // Flatten deliverables with project context
  const allDeliverablesWithContext = projects.flatMap((p) =>
    (p.deliverables || []).map((d) => ({
      ...d,
      projectId: p.id,
      projectTitle: p.title,
      clientName: p.clientName,
      clientCompany: p.clientCompany,
      revisionsUsed: p.freeRevisionsUsed || 0,
    }))
  );

  const filteredDeliverables = allDeliverablesWithContext.filter((del) => {
    if (activeFilter === 'pending') {
      return del.status === 'Submitted' || del.status === 'In Review';
    }
    if (activeFilter === 'approved') {
      return del.status === 'Approved';
    }
    return true;
  });

  const handleInputChange = (delId: string, val: string) => {
    setVersionInputs((prev) => ({ ...prev, [delId]: val }));
  };

  const handleVersionSubmit = (projectId: string, delId: string) => {
    const url = versionInputs[delId]?.trim();
    if (!url) {
      onToast('Please enter a valid Google Drive, YouTube, or file URL before submitting.');
      return;
    }
    onSubmitNewVersion(projectId, delId, url);
    setVersionInputs((prev) => ({ ...prev, [delId]: '' }));
    onToast(`Version cut submitted for review!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
              Deliverables & Version Cuts
            </h2>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
              {filteredDeliverables.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Track asset review links, DaVinci/Figma versions, revision limits, and client sign-offs.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Cuts
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'pending'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pending Review
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'approved'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Empty State Fallback */}
      {filteredDeliverables.length === 0 ? (
        <EmptyState
          icon="Play"
          title="No Deliverables Found"
          description={`There are currently no deliverables matching the "${activeFilter}" filter state.`}
          primaryAction={{
            label: 'View All Deliverables',
            onClick: () => setActiveFilter('all'),
            icon: 'History',
          }}
        />
      ) : (
        /* Deliverables Grid */
        <div className="space-y-4">
          {filteredDeliverables.map((del) => {
            const isApproved = del.status === 'Approved';
            const isRejected = del.status === 'Rejected' || del.status === 'Draft';
            const isPendingReview = del.status === 'Submitted' || del.status === 'In Review';
            const isDecided = isApproved || del.status === 'Rejected';

            return (
              <div
                key={del.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4 hover:border-slate-300 transition-colors"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                        {del.projectTitle}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-mono">
                        {del.currentVersion}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {del.title}
                    </h3>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Icons.CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Approved by Client</span>
                      </span>
                    )}
                    {isPendingReview && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span>Awaiting Review</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <Icons.AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Changes Requested</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Asset Work Link Card */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icons.Link2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        External Asset / Preview Link
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-800 truncate block">
                        {del.workLink || 'https://drive.link/preview_asset.mp4'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={del.workLink || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <span>Open Work Link</span>
                    <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Review Action Controls & Decision Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    <span>Revisions: </span>
                    <span className="font-bold text-slate-800">
                      {del.revisionsUsed || 0}/2 free used
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Approve / Reject buttons: Hidden if already decided! */}
                    {!isDecided ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onApproveCut(del.projectId, del.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Icons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve Cut</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRequestRevision(del.projectId, del.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Icons.AlertTriangle className="w-3.5 h-3.5" />
                          <span>Request Revision</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        ✓ Cut Accepted by {del.clientName}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                        ⚠ Waiting for next revision cut
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectProject(del.projectId)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Project Audit →
                    </button>
                  </div>
                </div>

                {/* Submit New Version: Strictly hidden for Client role and hidden when approved! */}
                {currentRole !== 'client' && !isApproved && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Paste new Google Drive / YouTube URL to submit next cut..."
                        value={versionInputs[del.id] || ''}
                        onChange={(e) => handleInputChange(del.id, e.target.value)}
                        className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50 focus:bg-white text-slate-800 placeholder:text-slate-400 font-mono transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleVersionSubmit(del.projectId, del.id)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                      >
                        Submit New Version
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
