export type TabType = 'overview' | 'proposals' | 'invoices' | 'trust' | 'projects';

export type TransactionStatus = 'Paid' | 'Pending' | 'Review Window Open';

export interface Transaction {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientAvatar: string;
  projectTitle: string;
  amount: number;
  paymentMethod: 'UPI' | 'Direct Transfer' | 'Card';
  status: TransactionStatus;
  date: string;
  upiRef?: string;
  vpa?: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  deliverableDate: string;
  amount: number;
  status: 'Completed' | 'In Progress' | 'Upcoming';
}

export interface Proposal {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany?: string;
  createdAt: string;
  validUntil: string;
  milestones: MilestoneItem[];
  currency: string;
  subtotal: number;
  gstApplicable: boolean;
  gstRate: number; // e.g. 18
  discount: number;
  totalAmount: number;
  signedByClient: boolean;
  clientSignedAt?: string;
  signatureDataUrl?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Declined';
}

export interface InvoiceItem {
  id: string;
  description: string;
  hoursOrUnits: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientVpa: string;
  freelancerVpa: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  gstEnabled: boolean;
  gstNumber?: string;
  discountAmount: number;
  totalPayable: number;
  shortUrl: string;
  upiIntentUrl: string;
  qrCodeUrl?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
}

export interface ClientReviewItem {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  clientAvatar: string;
  completionDate: string;
  totalBilled: number;
  isFreelancerReviewSubmitted: boolean;
  isMutualReviewUnlocked: boolean;
  freelancerRatings?: {
    paymentDiscipline: number; // 1-5
    scopeClarity: number;      // 1-5
    cooperation: number;       // 1-5
    notes?: string;
  };
  clientRatings?: {
    craftsmanship: number;     // 1-5
    punctuality: number;       // 1-5
    communication: number;     // 1-5
    testimonial: string;
  };
}

export interface TrustScoreMetrics {
  overallScore: number;
  totalReviews: number;
  verifiedTransactionsCount: number;
  onTimePaymentRate: number; // percentage
  pillars: {
    craftsmanship: { score: number; label: string; count: number };
    punctuality: { score: number; label: string; count: number };
    communication: { score: number; label: string; count: number };
  };
}

