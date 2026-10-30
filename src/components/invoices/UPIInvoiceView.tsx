'use client';

import React, { useState } from 'react';
import { Invoice, InvoiceItem } from '../../types';
import { formatINR, generateUPILink, generateWhatsAppShareUrl } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import { mockFreelancerProfile } from '../../data/mockData';

interface UPIInvoiceViewProps {
  initialInvoice: Invoice;
  onPaymentSettled?: (invoice: Invoice) => void;
}

export const UPIInvoiceView: React.FC<UPIInvoiceViewProps> = ({
  initialInvoice,
  onPaymentSettled,
}) => {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>(initialInvoice.status);
  const [settledTxId, setSettledTxId] = useState<string | null>(null);

  // Recalculate invoice totals
  const recalculateInvoice = (
    items: InvoiceItem[],
    gstEnabled: boolean,
    discountAmount: number
  ) => {
    const subtotal = items.reduce(
      (sum, item) => sum + (Number(item.hoursOrUnits) || 1) * (Number(item.rate) || 0),
      0
    );
    const taxable = Math.max(0, subtotal - (Number(discountAmount) || 0));
    const gst = gstEnabled ? taxable * 0.18 : 0;
    const totalPayable = taxable + gst;

    const dynamicUPILink = generateUPILink({
      vpa: invoice.freelancerVpa,
      name: mockFreelancerProfile.name,
      amount: totalPayable,
      note: `Invoice ${invoice.invoiceNumber}`,
    });

    setInvoice((prev) => ({
      ...prev,
      items,
      subtotal,
      gstEnabled,
      discountAmount,
      totalPayable,
      upiIntentUrl: dynamicUPILink,
    }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const updated = invoice.items.map((item) => {
      if (item.id === id) {
        const next = { ...item, [field]: value };
        next.amount = (Number(next.hoursOrUnits) || 1) * (Number(next.rate) || 0);
        return next;
      }
      return item;
    });
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item_${Date.now()}`,
      description: 'Consultation & Design Architecture Sprint',
      hoursOrUnits: 1,
      rate: 20000,
      amount: 20000,
    };
    const updated = [...invoice.items, newItem];
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleRemoveItem = (id: string) => {
    if (invoice.items.length <= 1) return;
    const updated = invoice.items.filter((item) => item.id !== id);
    recalculateInvoice(updated, invoice.gstEnabled, invoice.discountAmount);
  };

  const handleGstToggle = () => {
    const nextGst = !invoice.gstEnabled;
    recalculateInvoice(invoice.items, nextGst, invoice.discountAmount);
  };

  const handleDiscountChange = (val: number) => {
    recalculateInvoice(invoice.items, invoice.gstEnabled, val);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(invoice.shortUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyVpa = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(invoice.freelancerVpa);
      setCopiedVpa(true);
      setTimeout(() => setCopiedVpa(false), 2200);
    }
  };

  const handleSendWhatsApp = () => {
    const message = `Hello ${invoice.clientName},\n\nHere is your verified UPI payment invoice ${invoice.invoiceNumber} for ${formatINR(invoice.totalPayable)}.\n\nPay securely with zero platform fee via UPI:\n${invoice.shortUrl}\n\nFreelancer: ${mockFreelancerProfile.name} (UPI: ${invoice.freelancerVpa})`;
    const url = generateWhatsAppShareUrl('9876543210', message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const handleSimulatePayment = () => {
    const newTxId = 'UPI/' + Math.floor(100000000000 + Math.random() * 900000000000) + '/SETTLED';
    setSettledTxId(newTxId);
    setPaymentStatus('Paid');
    const updated = { ...invoice, status: 'Paid' as const };
    setInvoice(updated);
    if (onPaymentSettled) {
      onPaymentSettled(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Payment State Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
              {invoice.invoiceNumber}
            </span>
            {paymentStatus === 'Paid' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />
                Settled to Bank Account
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Icons.Clock className="w-3.5 h-3.5" />
                Awaiting UPI Clearance
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Dynamic UPI Invoicing & Instant Settlement
          </h2>
          <p className="text-xs text-slate-500">
            Accept payments via Google Pay, PhonePe, Paytm, CRED, and BHIM with 0% gateway cuts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {paymentStatus !== 'Paid' ? (
            <button
              onClick={handleSimulatePayment}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-xl shadow-xs transition-all"
            >
              <Icons.Sparkles className="w-3.5 h-3.5" />
              <span>Simulate UPI Payment</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-700 block">
                Ref: {settledTxId}
              </span>
              <span className="text-[10px] text-slate-400">Settled to HDFC Bank ****9810</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column View: Itemized Invoice Sheet & Generated UPI Link Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clean Invoice Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  ₹
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{mockFreelancerProfile.name}</h3>
                  <p className="text-xs text-slate-400">{mockFreelancerProfile.role}</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-0.5 mt-2">
                <p>GSTIN: {mockFreelancerProfile.gstNumber}</p>
                <p>Bengaluru, Karnataka - 560038</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Billed To
              </span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.clientName}</p>
              <p className="text-slate-500 mt-1">Client UPI ID: {invoice.clientVpa}</p>
              <div className="mt-2 text-slate-400">
                <span>Due Date: </span>
                <span className="font-medium text-slate-700">{invoice.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Itemized Tasks Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Itemized Deliverables & Milestones
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 transition-colors"
              >
                <Icons.Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-2 w-16 text-center">Qty / Hrs</th>
                    <th className="py-2.5 px-3 w-28 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount (₹)</th>
                    <th className="py-2.5 px-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="group">
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-800 text-xs py-0.5"
                          placeholder="Task description"
                        />
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <input
                          type="number"
                          value={item.hoursOrUnits}
                          onChange={(e) =>
                            handleItemChange(item.id, 'hoursOrUnits', Number(e.target.value))
                          }
                          className="w-12 text-center bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-800 text-xs py-0.5"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(item.id, 'rate', Number(e.target.value))
                          }
                          className="w-24 text-right bg-transparent border-0 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 text-slate-900 font-semibold text-xs py-0.5"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        {invoice.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Icons.X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax, GST, and Discount Controls */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-3 text-xs">
            {/* Subtotal */}
            <div className="flex justify-between text-slate-600">
              <span>Itemized Subtotal</span>
              <span className="font-semibold text-slate-900">{formatINR(invoice.subtotal)}</span>
            </div>

            {/* Discount Field */}
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Discount Amount (INR)</span>
              <div className="w-28">
                <input
                  type="number"
                  value={invoice.discountAmount}
                  onChange={(e) => handleDiscountChange(Number(e.target.value))}
                  className="w-full text-right px-2 py-0.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* GST Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="font-medium text-slate-800">Add 18% GST</span>
                <span className="text-[11px] text-slate-400 block">
                  Applicable for Indian clients with GST invoice input
                </span>
              </div>
              <button
                type="button"
                onClick={handleGstToggle}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  invoice.gstEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    invoice.gstEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {invoice.gstEnabled && (
              <div className="flex justify-between text-slate-500 pl-2">
                <span>IGST @ 18%</span>
                <span className="font-medium text-slate-800">
                  {formatINR((invoice.subtotal - invoice.discountAmount) * 0.18)}
                </span>
              </div>
            )}

            {/* Total Payable */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">Total Net Payable</span>
                <span className="text-[10px] text-slate-400">Zero fee deduction via UPI rail</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {formatINR(invoice.totalPayable)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Payment Link, QR Code Preview & Direct WhatsApp (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card: Generated Dynamic Payment Link Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Icons.QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">UPI Payment Preview</h3>
                  <p className="text-[11px] text-slate-500">Auto-generated dynamic checkout</p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                0% Gateway Fee
              </span>
            </div>

            {/* QR Code Graphic Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/90 text-center flex flex-col items-center justify-center relative">
              {/* Dynamic QR SVG */}
              <div className="w-44 h-44 bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center relative">
                <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="26" height="26" rx="3" fill="#0f172a" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="13" y="13" width="10" height="10" fill="#4f46e5" />

                  <rect x="69" y="5" width="26" height="26" rx="3" fill="#0f172a" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="77" y="13" width="10" height="10" fill="#4f46e5" />

                  <rect x="5" y="69" width="26" height="26" rx="3" fill="#0f172a" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="#ffffff" />
                  <rect x="13" y="77" width="10" height="10" fill="#4f46e5" />

                  {/* Matrix patterns */}
                  <rect x="36" y="8" width="6" height="6" fill="#0f172a" />
                  <rect x="46" y="8" width="8" height="6" fill="#0f172a" />
                  <rect x="58" y="8" width="6" height="6" fill="#0f172a" />

                  <rect x="36" y="18" width="16" height="6" fill="#0f172a" />
                  <rect x="56" y="18" width="6" height="6" fill="#0f172a" />

                  <rect x="8" y="36" width="6" height="16" fill="#0f172a" />
                  <rect x="18" y="46" width="12" height="6" fill="#0f172a" />
                  <rect x="22" y="36" width="8" height="6" fill="#0f172a" />

                  {/* Center branding dot */}
                  <circle cx="50" cy="50" r="11" fill="#4f46e5" />
                  <text
                    x="50"
                    y="54"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    ₹
                  </text>

                  {/* Lower matrix dots */}
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

              <div className="mt-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Scan to Pay {formatINR(invoice.totalPayable)}
                </span>
                <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                  UPI ID: {invoice.freelancerVpa}
                </span>
              </div>

              {/* Supported UPI Apps Row */}
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500">
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">GPay</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">PhonePe</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">Paytm</span>
                <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200">CRED</span>
              </div>
            </div>

            {/* Razorpay Short-Link Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Razorpay / PaidFlow Short Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 truncate select-all">
                  {invoice.shortUrl}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Icons.Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Send to WhatsApp Button */}
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold shadow-sm transition-all"
            >
              <Icons.WhatsApp className="w-4 h-4 fill-white" />
              <span>Send Invoice via WhatsApp</span>
            </button>

            {/* Quick VPA Copy */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Freelancer VPA</span>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>{invoice.freelancerVpa}</span>
                {copiedVpa ? (
                  <Icons.Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Icons.Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

