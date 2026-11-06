'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quickInvoiceSchema, QuickInvoiceFormData } from '../../lib/validations/schemas';
import { Icons } from '../ui/Icons';
import { formatINR, generateWhatsAppShareUrl } from '../../utils/formatters';

export interface CreatedInvoiceSummary {
  clientName: string;
  taskDescription: string;
  totalAmount: number;
  invNumber: string;
  shortUrl: string;
}

interface QuickUPIInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated: (invoiceData: CreatedInvoiceSummary) => void;
}

/**
 * QuickUPIInvoiceModal
 * Production-ready modal allowing freelancers to rapidly generate and dispatch
 * zero-fee UPI payment links for milestones and scope additions.
 *
 * Implements React Hook Form + Zod for strict field validation and real-time total calculation.
 */
export const QuickUPIInvoiceModal: React.FC<QuickUPIInvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<QuickInvoiceFormData>({
    resolver: zodResolver(quickInvoiceSchema),
    defaultValues: {
      clientName: 'Kunal Shah',
      clientPhone: '+91 90798 79010',
      taskDescription: 'Design Sprint & Frontend Components',
      amount: 45000,
      addGst: false,
      freelancerVpa: '9079879010@fam',
      dueDate: 'Due on Receipt',
    },
    mode: 'onChange',
  });

  if (!isOpen) return null;

  // Real-time calculated amounts
  const watchedAmount = watch('amount') || 0;
  const watchedAddGst = watch('addGst') || false;
  const watchedClientName = watch('clientName') || 'Client Partner';
  const watchedClientPhone = watch('clientPhone') || '+91 90798 79010';
  const watchedTaskDescription = watch('taskDescription') || 'Milestone Delivery';

  const baseAmount = Number(watchedAmount) || 0;
  const gstAmount = watchedAddGst ? Math.round(baseAmount * 0.18) : 0;
  const totalAmount = baseAmount + gstAmount;

  const invNumber = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://metron.app';
  const generatedShortUrl = `${origin}/pay/${invNumber.toLowerCase()}?amount=${totalAmount}&title=${encodeURIComponent(
    watchedTaskDescription
  )}&inv=${invNumber}&client=${encodeURIComponent(watchedClientName)}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(generatedShortUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSendWhatsApp = () => {
    const text = `Hi ${watchedClientName}, please find your Metron UPI milestone invoice (${invNumber}) for ${formatINR(
      totalAmount
    )} here:\n${generatedShortUrl}\n\nSettlement goes directly to verified UPI VPA. Thank you!`;
    const url = generateWhatsAppShareUrl(watchedClientPhone, text);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const onSubmit = (data: QuickInvoiceFormData) => {
    const calculatedTotal = data.amount + (data.addGst ? Math.round(data.amount * 0.18) : 0);
    onInvoiceCreated({
      clientName: data.clientName,
      taskDescription: data.taskDescription || 'Quick UPI Payment',
      totalAmount: calculatedTotal,
      invNumber,
      shortUrl: generatedShortUrl,
    });
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
              <Icons.QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">Quick UPI Invoice Generator</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Instant Settled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Zero platform take rate • Direct bank-to-bank settlement</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 text-xs">
          {/* Row 1: Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Client Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('clientName')}
                placeholder="e.g. Kunal Shah / CRED"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                  errors.clientName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {errors.clientName && (
                <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <Icons.AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{errors.clientName.message}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                WhatsApp Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                {...register('clientPhone')}
                placeholder="+91 90798 79010"
                className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-mono transition-all ${
                  errors.clientPhone ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {errors.clientPhone && (
                <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <Icons.AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{errors.clientPhone.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Row 2: Scope Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Deliverable / Milestone Scope <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register('taskDescription')}
              placeholder="e.g. Design tokens & UI components"
              className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all ${
                errors.taskDescription ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {errors.taskDescription && (
              <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                <Icons.AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{errors.taskDescription.message}</span>
              </p>
            )}
          </div>

          {/* Row 3: Amount & GST */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Amount (₹ INR) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="100"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="45000"
                  className={`w-full pl-7 pr-3 py-2 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none font-bold text-slate-900 transition-all ${
                    errors.amount ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-rose-600 text-[11px] mt-1 flex items-center gap-1 font-medium">
                  <Icons.AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>{errors.amount.message}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/90 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  {...register('addGst')}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs text-slate-800 font-bold block leading-none">Add 18% GST</span>
                  <span className="text-[10px] text-slate-400 leading-none mt-0.5 block">
                    {watchedAddGst ? `+${formatINR(gstAmount)} tax` : 'Tax exempt'}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Live Calculated Payment Preview */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-semibold">Total Receivable Settlement:</span>
              <span className="text-base font-extrabold text-slate-950 font-mono">{formatINR(totalAmount)}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-700 truncate shadow-2xs">
                {generatedShortUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 active:scale-95 rounded-lg text-[11px] font-bold text-slate-800 transition-all shrink-0 cursor-pointer"
              >
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all active:scale-95 cursor-pointer"
            >
              <Icons.WhatsApp className="w-3.5 h-3.5 fill-emerald-600" />
              <span>WhatsApp Direct</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Icons.Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Issue & Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
