'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';
import { formatINR } from '../../utils/formatters';

interface DelaySimulatorViewProps {
  onNavigateTab?: (tab: string) => void;
  onToast?: (message: string) => void;
}

/**
 * DelaySimulatorView simulates freelance cash flow fragility and runway impact
 * when a high-paying client delays milestone approval or UPI settlement.
 *
 * Financial Runway Math:
 * - Current Monthly Burn: ₹85,000 / month (approx ₹2,833 / day)
 * - Liquid Cash Reserve: ₹2,40,000 (approx 85 days baseline runway)
 * - Single Client Delay Impact: Decreases operational runway linearly while fixed expenses continue.
 */
export const DelaySimulatorView: React.FC<DelaySimulatorViewProps> = ({
  onNavigateTab,
  onToast,
}) => {
  const [delayDays, setDelayDays] = useState(30);
  const [delayedAmount, setDelayedAmount] = useState(145000); // Milestone tranche
  const monthlyBurn = 85000;
  const liquidReserve = 240000;

  // Daily burn calculation
  const dailyBurn = monthlyBurn / 30;
  const baselineRunwayDays = Math.round(liquidReserve / dailyBurn);

  // Remaining runway if payment is delayed
  const lostRunwayDays = Math.min(delayDays, Math.round(delayedAmount / dailyBurn));
  const effectiveRunwayDays = Math.max(0, baselineRunwayDays - delayDays);
  const isEmergency = effectiveRunwayDays < 25;
  const isWarning = effectiveRunwayDays >= 25 && effectiveRunwayDays < 45;

  const handleApplyPreset = (days: number, amount: number) => {
    setDelayDays(days);
    setDelayedAmount(amount);
    if (onToast) {
      onToast(`Applied ${days}-day delay scenario (${formatINR(amount)})`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600 block">
              FINTECH RISK MODEL
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight mt-0.5">
            Client Delay Impact Simulator
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
            Simulate operational runway impact if your highest-paying client delays milestone settlement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            Monthly Expense: {formatINR(monthlyBurn)}
          </span>
        </div>
      </div>

      {/* Simulator Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Baseline Cash Runway</span>
          <span className="text-2xl font-bold text-slate-900 block font-mono">
            {baselineRunwayDays} Days
          </span>
          <span className="text-[11px] text-slate-400 block">
            Reserve: {formatINR(liquidReserve)}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Delayed Tranche Capital</span>
          <span className="text-2xl font-bold text-indigo-600 block font-mono">
            {formatINR(delayedAmount)}
          </span>
          <span className="text-[11px] text-slate-400 block">
            Locked CRED DaVinci master cut
          </span>
        </div>

        <div
          className={`rounded-2xl border p-5 shadow-2xs space-y-2 ${
            isEmergency
              ? 'bg-rose-50/70 border-rose-200 text-rose-950'
              : isWarning
              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
              : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold block">Post-Delay Runway</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isEmergency
                  ? 'bg-rose-200 text-rose-800'
                  : isWarning
                  ? 'bg-amber-200 text-amber-800'
                  : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {isEmergency ? 'Critical' : isWarning ? 'Warning' : 'Healthy'}
            </span>
          </div>
          <span className="text-2xl font-black block font-mono">
            {effectiveRunwayDays} Days
          </span>
          <span className="text-[11px] opacity-80 block">
            {delayDays} days of delayed inflows simulated
          </span>
        </div>
      </div>

      {/* Interactive Controls & Scenario Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800">
              Simulate Delay Window (Days):
            </label>
            <span className="text-sm font-bold text-indigo-600 font-mono bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {delayDays} Days
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={delayDays}
            onChange={(e) => setDelayDays(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>0 Days (On Time)</span>
            <span>30 Days (1 Month)</span>
            <span>60 Days (2 Months)</span>
            <span>90 Days (Quarter)</span>
          </div>
        </div>

        {/* Quick Scenario Chips */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Quick Real-World Delay Scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleApplyPreset(14, 70000)}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-slate-800">14-Day Revision Loop</div>
              <div className="text-[11px] text-slate-500 mt-0.5">₹70,000 mid-cut tranche</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(30, 145000)}
              className="p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-indigo-900">30-Day Finance Desk Approval</div>
              <div className="text-[11px] text-indigo-700 mt-0.5">₹1,45,000 final sign-off</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset(60, 250000)}
              className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-left transition-colors cursor-pointer"
            >
              <div className="text-xs font-bold text-rose-950">60-Day Corporate Net-60 Hold</div>
              <div className="text-[11px] text-rose-800 mt-0.5">₹2,50,000 bulk retainer</div>
            </button>
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icons.ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs text-slate-600">
              Mitigate runway risk by requesting milestone escrow advances and setting 3-day approval cutoffs.
            </p>
          </div>

          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab('proposals')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              Structure Retainer Scope →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
