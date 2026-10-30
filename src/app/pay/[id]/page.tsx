'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockInitialInvoice, mockFreelancerProfile } from '../../../data/mockData';
import { formatINR, generateUPILink } from '../../../utils/formatters';
import { Icons } from '../../../components/ui/Icons';

export default function ClientUPIPaymentCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = (params?.id as string) || 'inv_1042_t2';

  // Determine tranche or full invoice
  const isTranche1 = invoiceId.includes('t1') || invoiceId.includes('1');
  const trancheLabel = isTranche1 ? 'Tranche 1: 50% Advance Lock' : 'Tranche 2: 50% on Final Delivery';
  const trancheAmount = 70800; // Half of ₹1,41,600

  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [settledRef, setSettledRef] = useState<string | null>(null);

  const upiIntent = generateUPILink({
    vpa: mockFreelancerProfile.upiId,
    name: mockFreelancerProfile.name,
    amount: trancheAmount,
    note: `CRED Pulse - ${trancheLabel}`,
  });

  const handleCopyVpa = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mockFreelancerProfile.upiId);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2000);
    }
  };

  const handleCopyCheckoutLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSimulatePayment = () => {
    const ref = 'UPI/' + Math.floor(100000000000 + Math.random() * 900000000000) + '/HDFC';
    setSettledRef(ref);
    setPaymentStatus('paid');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 sm:px-8 py-3.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white tracking-tight text-base">PaidFlow</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Instant UPI
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Zero Fee NPCI Direct Settlement Rail</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/p/proj_cred_video')}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors"
          >
            <span>← Back to Scope Portal</span>
          </button>
        </div>
      </header>

      {/* Main Checkout Box */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 w-full flex-1 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider block">
                CRED Technologies Pvt Ltd
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {trancheLabel}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Invoice: {mockInitialInvoice.invoiceNumber}</p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              0% Gateway Cut
            </span>
          </div>

          {/* Amount Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Amount to Pay
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {formatINR(trancheAmount)}
            </div>
            <p className="text-[11px] text-slate-400">
              Direct to <strong>{mockFreelancerProfile.name}</strong> • VPA:{' '}
              <span className="font-mono text-indigo-600 font-semibold">{mockFreelancerProfile.upiId}</span>
            </p>
          </div>

          {paymentStatus !== 'paid' ? (
            <div className="space-y-6">
              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 relative">
                <div className="w-48 h-48 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="5" y="5" width="26" height="26" rx="3" fill="#0f172a" />
                    <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="13" y="13" width="10" height="10" fill="#4f46e5" />
                    <rect x="69" y="5" width="26" height="26" rx="3" fill="#0f172a" />
                    <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="77" y="13" width="10" height="10" fill="#4f46e5" />
                    <rect x="5" y="69" width="26" height="26" rx="3" fill="#0f172a" />
                    <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                    <rect x="13" y="77" width="10" height="10" fill="#4f46e5" />
                    <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="46" y="8" width="8" height="6" fill="#0f172a" />
                    <rect x="58" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="36" y="18" width="16" height="6" fill="#0f172a" />
                    <rect x="56" y="18" width="6" height="6" fill="#0f172a" />
                    <rect x="8" y="36" width="6" height="16" fill="#0f172a" />
                    <rect x="18" y="46" width="12" height="6" fill="#0f172a" />
                    <rect x="22" y="36" width="8" height="6" fill="#0f172a" />
                    <circle cx="50" cy="50" r="11" fill="#4f46e5" />
                    <text x="50" y="54" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">
                      ₹
                    </text>
                    <rect x="36" y="38" width="6" height="6" fill="#0f172a" />
                    <rect x="60" y="38" width="12" height="6" fill="#0f172a" />
                    <rect x="76" y="38" width="16" height="6" fill="#0f172a" />
                    <rect x="66" y="48" width="6" height="14" fill="#0f172a" />
                    <rect x="76" y="48" width="10" height="6" fill="#0f172a" />
                    <rect x="36" y="68" width="8" height="8" fill="#0f172a" />
                    <rect x="48" y="68" width="6" height="8" fill="#0f172a" />
                    <rect x="58" y="68" width="16" height="6" fill="#0f172a" />
                    <rect x="80" y="68" width="12" height="8" fill="#0f172a" />
                    <rect x="36" y="82" width="16" height="10" fill="#0f172a" />
                    <rect x="56" y="82" width="8" height="10" fill="#0f172a" />
                    <rect x="68" y="82" width="24" height="10" fill="#0f172a" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-700 mt-3">Scan with any UPI App</span>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">GPay</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">PhonePe</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Paytm</span>
                  <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">CRED</span>
                </div>
              </div>

              {/* 1-Click Pay on Mobile */}
              <a
                href={upiIntent}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Icons.QrCode className="w-4 h-4" />
                <span>Pay {formatINR(trancheAmount)} via UPI App</span>
              </a>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyVpa}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedVpa ? <Icons.Check className="w-3.5 h-3.5 text-emerald-600" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVpa ? 'VPA Copied!' : 'Copy UPI ID'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyCheckoutLink}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? <Icons.Check className="w-3.5 h-3.5 text-emerald-600" /> : <Icons.Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Instant Simulation Button */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <Icons.Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Instant Settlement (Hackathon Demo)</span>
                </button>
              </div>
            </div>
          ) : (
            /* Paid Confirmation Card */
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                <Icons.Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h2 className="text-lg font-extrabold text-emerald-950">Payment Cleared & Settled!</h2>
              <p className="text-xs text-emerald-800">
                Received <strong>{formatINR(trancheAmount)}</strong> directly to HDFC Bank ****9810 with 0% platform fee.
              </p>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono text-emerald-900 select-all">
                Reference ID: {settledRef}
              </div>
              <button
                type="button"
                onClick={() => router.push('/p/proj_cred_video')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors mt-2"
              >
                Return to Deliverables Portal →
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

