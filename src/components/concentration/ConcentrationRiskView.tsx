'use client';

import React from 'react';
import { Icons } from '../ui/Icons';
import { formatINR } from '../../utils/formatters';

interface ClientExposureItem {
  id: string;
  clientName: string;
  clientCompany: string;
  revenue: number;
  sharePercentage: number;
  status: 'Critical' | 'Moderate' | 'Safe';
  projectsCount: number;
}

interface ConcentrationRiskViewProps {
  onNavigateTab?: (tab: string) => void;
  onToast?: (message: string) => void;
}

/**
 * ConcentrationRiskView analyzes revenue exposure across the client portfolio.
 *
 * Risk Thresholds:
 * - Single Client > 50%: CRITICAL (High concentration risk - losing one client destroys cash flow)
 * - Single Client 25% - 50%: MODERATE (Diversification advised)
 * - Single Client < 25%: SAFE (Healthy distributed client base)
 */
export const ConcentrationRiskView: React.FC<ConcentrationRiskViewProps> = ({
  onNavigateTab,
  onToast,
}) => {
  const clients: ClientExposureItem[] = [
    {
      id: 'client_cred',
      clientName: 'Kunal Shah',
      clientCompany: 'CRED Technologies',
      revenue: 1250000,
      sharePercentage: 66.5,
      status: 'Critical',
      projectsCount: 1,
    },
    {
      id: 'client_finly',
      clientName: 'Neha Singhal',
      clientCompany: 'Finly.io',
      revenue: 380000,
      sharePercentage: 20.2,
      status: 'Safe',
      projectsCount: 1,
    },
    {
      id: 'client_aura',
      clientName: 'Pooja Iyer',
      clientCompany: 'Aura Health',
      revenue: 250000,
      sharePercentage: 13.3,
      status: 'Safe',
      projectsCount: 1,
    },
  ];

  const totalPortfolioValue = clients.reduce((acc, c) => acc + c.revenue, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 block">
              PORTFOLIO EXPOSURE AUDIT
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-mono">
              66.5% RED ALERT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
            Client Revenue Concentration Risk
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Freelance businesses fail when a single client represents over 50% of revenue. Diversify to protect cash runway.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Pipeline: {formatINR(totalPortfolioValue)}
          </span>
        </div>
      </div>

      {/* Critical Alert Card */}
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Icons.AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-rose-950">
              High Concentration Hazard: 66.5% Tied to Kunal Shah (CRED)
            </h3>
            <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
              If CRED delays sign-off or freezes external creative agency spend, your monthly income drops by two-thirds. We recommend onboarding at least two new retainers to bring single-client exposure below 35%.
            </p>
          </div>
        </div>
      </div>

      {/* Client Exposure Breakdown Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900">
          Client Revenue Share Distribution
        </h3>

        <div className="space-y-4">
          {clients.map((client) => {
            const isCritical = client.status === 'Critical';

            return (
              <div
                key={client.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{client.clientName}</span>
                    <span className="text-slate-400 font-normal ml-1.5">
                      ({client.clientCompany})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono">
                      {formatINR(client.revenue)}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {client.sharePercentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical
                        ? 'bg-rose-500'
                        : client.sharePercentage > 20
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${client.sharePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Recommended Action: Send 2 outbound proposals this week
          </span>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('proposals')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Draft New Proposal →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

