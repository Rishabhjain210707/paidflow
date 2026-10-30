/**
 * Utility functions for Indian Rupee (INR) formatting, date formatting,
 * and UPI payment string generation.
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

