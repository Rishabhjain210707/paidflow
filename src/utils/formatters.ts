/**
 * Utility functions for Indian Rupee (INR) formatting, date formatting,
 * deadline calculations, and UPI payment string generation.
 */

export function formatINR(amount: number, compact: boolean = false): string {
  if (isNaN(amount)) return '₹0';

  if (compact) {
    if (amount >= 10000000) {
      const cr = (amount / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} Cr`;
    }
    if (amount >= 100000) {
      const lakh = (amount / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} L`;
    }
    if (amount >= 1000) {
      const k = (amount / 1000).toFixed(1).replace(/\.0$/, '');
      return `₹${k}k`;
    }
  }

  // Format with standard Indian numbering system (2,2,3 grouping)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumberINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Calculates deadline alert status:
 * - If past simulated current date (2026-10-30): 'Overdue' (Red)
 * - If within 3 days (between 2026-10-30 and 2026-11-02): 'At risk' (Amber)
 * - Otherwise: 'On track' (Emerald)
 */
export function getDeadlineStatus(deadlineStr: string, simulatedTodayStr: string = '2026-10-30'): {
  label: 'Overdue' | 'At risk' | 'On track';
  color: 'red' | 'amber' | 'emerald';
  daysDiff: number;
} {
  try {
    const deadline = new Date(deadlineStr).getTime();
    const today = new Date(simulatedTodayStr).getTime();
    const diffDays = Math.round((deadline - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: 'Overdue', color: 'red', daysDiff: diffDays };
    }
    if (diffDays <= 3) {
      return { label: 'At risk', color: 'amber', daysDiff: diffDays };
    }
    return { label: 'On track', color: 'emerald', daysDiff: diffDays };
  } catch {
    return { label: 'On track', color: 'emerald', daysDiff: 10 };
  }
}

/**
 * Cash Runway Simulator:
 * Baseline balance: ₹1,20,000, monthly burn ₹60,000 (₹2,000/day)
 * If Kunal delays payment of `delayedAmount` by `delayDays`,
 * calculate remaining runway days.
 */
export function calculateDelayImpact(
  delayedAmount: number,
  delayDays: number,
  baselineBalance: number = 120000,
  monthlyBurn: number = 60000
): {
  baseRunwayDays: number;
  projectedRunwayDays: number;
  netImpactText: string;
} {
  const dailyBurn = monthlyBurn / 30; // ₹2,000 / day
  const baseRunwayDays = Math.round(baselineBalance / dailyBurn); // 60 days

  // If delayed, cash inflow is postponed. During delayDays, freelancer only has base balance minus daily burn.
  // After delayDays, runway drops by the burnt cash without replenishment.
  const cashRemainingAtDelayEnd = Math.max(0, baselineBalance - delayDays * dailyBurn);
  const projectedRunwayDays = Math.round(cashRemainingAtDelayEnd / dailyBurn);

  return {
    baseRunwayDays,
    projectedRunwayDays,
    netImpactText: `drops from ${baseRunwayDays} days to ${projectedRunwayDays} days`,
  };
}

export function generateUPILink(params: {
  vpa: string;
  name: string;
  amount: number;
  note: string;
  transactionRef?: string;
}): string {
  const { vpa, name, amount, note, transactionRef = 'PF' + Math.floor(100000 + Math.random() * 900000) } = params;
  const encodedName = encodeURIComponent(name);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${vpa}&pn=${encodedName}&am=${amount.toFixed(2)}&cu=INR&tn=${encodedNote}&tr=${transactionRef}`;
}

export function generateWhatsAppShareUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedText}`;
}
