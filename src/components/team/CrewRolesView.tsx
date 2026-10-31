'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { formatINR } from '../../utils/formatters';

interface CrewMemberItem {
  id: string;
  name: string;
  role: string;
  roleColor: 'cyan' | 'emerald' | 'pink' | 'purple';
  owed: number;
  isPaid: boolean;
}

interface RolePermission {
  id: string;
  title: string;
  description: string;
  enabledRoles: string[]; // Roles that have this enabled
}

interface CrewRolesViewProps {
  onNavigateTab?: (tab: string) => void;
  onShareTrustUrl?: () => void;
  onToast?: (msg: string) => void;
}

export const CrewRolesView: React.FC<CrewRolesViewProps> = ({
  onNavigateTab,
  onShareTrustUrl,
  onToast,
}) => {
  // Crew members state
  const [crewMembers, setCrewMembers] = useState<CrewMemberItem[]>([
    {
      id: 'member_1',
      name: 'Riya',
      role: 'Editor',
      roleColor: 'cyan',
      owed: 18000,
      isPaid: false,
    },
    {
      id: 'member_2',
      name: 'Karan',
      role: 'Trusted Senior',
      roleColor: 'emerald',
      owed: 24000,
      isPaid: false,
    },
    {
      id: 'member_3',
      name: 'Meera',
      role: 'Script Writer',
      roleColor: 'pink',
      owed: 0,
      isPaid: true,
    },
  ]);

  // Selected role for permissions card
  const [selectedRole, setSelectedRole] = useState<string>('Editor');
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  // Discord-style permissions mapping
  const [permissions, setPermissions] = useState<RolePermission[]>([
    {
      id: 'perm_hand_in',
      title: 'Hand in work',
      description: 'Submit deliverables for freelancer approval',
      enabledRoles: ['Editor', 'Trusted Senior', 'Script Writer'],
    },
    {
      id: 'perm_direct_send',
      title: 'Direct-to-client send',
      description: 'Bypasses freelancer approval straight to client',
      enabledRoles: ['Trusted Senior'],
    },
    {
      id: 'perm_view_budgets',
      title: 'View financial budgets',
      description: 'Access project budgets and invoice numbers',
      enabledRoles: [],
    },
    {
      id: 'perm_client_chat',
      title: 'View client chat & files',
      description: 'Access project chat and uploaded client assets',
      enabledRoles: ['Editor', 'Trusted Senior', 'Script Writer'],
    },
  ]);

  const handleTogglePermission = (permId: string) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (p.id !== permId) return p;
        const hasRole = p.enabledRoles.includes(selectedRole);
        const updatedRoles = hasRole
          ? p.enabledRoles.filter((r) => r !== selectedRole)
          : [...p.enabledRoles, selectedRole];
        if (onToast) {
          onToast(
            `${hasRole ? 'Disabled' : 'Enabled'} "${p.title}" for ${selectedRole}`
          );
        }
        return { ...p, enabledRoles: updatedRoles };
      })
    );
  };

  const handleMarkPaid = (memberId: string) => {
    setCrewMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        const newPaid = !m.isPaid;
        if (onToast) {
          onToast(
            newPaid
              ? `Settled payout for ${m.name} (${formatINR(m.owed)}) via UPI!`
              : `Marked ${m.name} payout as pending`
          );
        }
        return { ...m, isPaid: newPaid };
      })
    );
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const roleName = newRoleName.trim();
    setSelectedRole(roleName);
    setIsCreateRoleModalOpen(false);
    setNewRoleName('');
    if (onToast) {
      onToast(`Role "${roleName}" created with custom permission gates!`);
    }
  };

  const allRoles = Array.from(
    new Set([
      ...crewMembers.map((m) => m.role),
      'Editor',
      'Trusted Senior',
      'Script Writer',
      selectedRole,
    ])
  );

  return (
    <div className="space-y-6">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Hey Arjun. Let's get you paid on time.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mt-1.5 leading-relaxed font-medium">
            Late clients and fuzzy approvals cost freelancers real money. Here is your financial pulse, scope limits, and live UPI settlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab && onNavigateTab('projects')}
            className="bg-slate-950 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>View Active Gigs</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onShareTrustUrl) {
                onShareTrustUrl();
              } else if (onToast) {
                onToast('Public Trust URL copied: https://metron.me/u/arjun-verma');
              }
            }}
            className="bg-white hover:bg-slate-50 active:scale-[0.98] text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs transition-all"
          >
            Share Trust URL
          </button>
        </div>
      </div>

      {/* ================= TEAM ARCHITECTURE SECTION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 block mb-1">
              TEAM ARCHITECTURE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
              Crew Members & Discord-Style Permissions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Assign roles to collaborators. Permissions stack across roles.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateRoleModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Icons.Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create New Role</span>
          </button>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Card 1: Crew Members & Payouts */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Crew Members & Payouts
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">MEMBER</th>
                    <th className="pb-3 font-semibold">ASSIGNED ROLE</th>
                    <th className="pb-3 font-semibold">OWED</th>
                    <th className="pb-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {crewMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-bold text-slate-900">
                        {member.name}
                      </td>
                      <td className="py-3.5">
                        {member.roleColor === 'cyan' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            <span>{member.role}</span>
                          </span>
                        )}
                        {member.roleColor === 'emerald' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{member.role}</span>
                          </span>
                        )}
                        {member.roleColor === 'pink' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                            <span>{member.role}</span>
                          </span>
                        )}
                        {member.roleColor === 'purple' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span>{member.role}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-800">
                        {member.isPaid ? (
                          <span className="text-slate-400 font-medium">Settled</span>
                        ) : (
                          formatINR(member.owed)
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        {member.isPaid ? (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(member.id)}
                            className="inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors text-xs"
                          >
                            <Icons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Paid</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(member.id)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors text-xs shadow-2xs"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Role Permissions */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs flex flex-col justify-between">
            <div>
              {/* Header with Role Selector */}
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Role Permissions
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Active role: <span className="font-bold text-slate-700">{selectedRole}</span>
                  </p>
                </div>

                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {allRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Permission Toggles List */}
              <div className="space-y-3.5">
                {permissions.map((perm) => {
                  const isEnabled = perm.enabledRoles.includes(selectedRole);
                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="pr-2">
                        <p className="font-bold text-slate-900 text-xs leading-snug">
                          {perm.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {perm.description}
                        </p>
                      </div>

                      {/* Discord-style Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                          isEnabled ? 'bg-indigo-600' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Stacking applies to all project milestones</span>
              <span className="text-emerald-600 font-semibold">Live in Workspace</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Create New Role */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Create New Role
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a specialized team role and configure its permission rules.
            </p>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Motion Designer, QA Reviewer"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

