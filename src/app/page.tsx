'use client';

import React, { useState } from 'react';
import { TabType, Transaction, Proposal, Invoice, ClientReviewItem } from '../types';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { MobileNav } from '../components/layout/MobileNav';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';
import { NewProposalModal } from '../components/modals/NewProposalModal';
import { QuickUPIInvoiceModal } from '../components/modals/QuickUPIInvoiceModal';
import { ShareReputationModal } from '../components/modals/ShareReputationModal';
import {
  mockMetrics,
  mockTransactions,
  mockInitialProposal,
  mockInitialInvoice,
  mockTrustMetrics,
  mockPendingClientReviews,
} from '../data/mockData';
import { formatINR } from '../utils/formatters';

export default function PaidFlowApp() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Core Data State
  const [metrics, setMetrics] = useState(mockMetrics);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [currentProposal, setCurrentProposal] = useState<Proposal>(mockInitialProposal);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(mockInitialInvoice);
  const [reviewsQueue, setReviewsQueue] = useState<ClientReviewItem[]>(mockPendingClientReviews);
  const [trustMetrics, setTrustMetrics] = useState(mockTrustMetrics);

  // Modal Triggers
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [isQuickInvoiceModalOpen, setIsQuickInvoiceModalOpen] = useState(false);
  const [isShareReputationModalOpen, setIsShareReputationModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastNotification(message);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Handlers
  const handleCreateNewProposal = (data: Partial<Proposal>) => {
    const updated: Proposal = {
      ...currentProposal,
      id: 'prop_' + Math.floor(1000 + Math.random() * 9000),
      title: data.title || 'Custom Client Engagement',
      clientName: data.clientName || 'Partner Client',
      clientPhone: data.clientPhone || '+91 98112 34567',
      subtotal: data.subtotal || 75000,
      totalAmount: data.totalAmount || 88500,
      signedByClient: false,
      status: 'Sent',
    };
    setCurrentProposal(updated);
    setActiveTab('proposals');
    showToast(`✓ Proposal created for ${updated.clientName}`);
  };

  const handleQuickInvoiceCreated = (invoiceData: any) => {
    const newTx: Transaction = {
      id: 'tx_' + Math.floor(100 + Math.random() * 900),
      invoiceNumber: invoiceData.invNumber,
      clientName: invoiceData.clientName,
      clientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      projectTitle: invoiceData.taskDescription,
      amount: invoiceData.totalAmount,
      paymentMethod: 'UPI',
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      vpa: 'client@upi',
    };

    setTransactions([newTx, ...transactions]);
    setMetrics((prev) => ({
      ...prev,
      pendingInvoicesCount: prev.pendingInvoicesCount + 1,
      pendingInvoicesAmount: prev.pendingInvoicesAmount + invoiceData.totalAmount,
    }));

    showToast(`✓ UPI Invoice ${invoiceData.invNumber} issued for ${formatINR(invoiceData.totalAmount)}`);
  };

  const handlePaymentSettled = (settledInvoice: Invoice) => {
    setMetrics((prev) => ({
      ...prev,
      totalSettledRevenue: prev.totalSettledRevenue + settledInvoice.totalPayable,
      pendingInvoicesCount: Math.max(0, prev.pendingInvoicesCount - 1),
      pendingInvoicesAmount: Math.max(0, prev.pendingInvoicesAmount - settledInvoice.totalPayable),
    }));

    showToast(`💰 Instant UPI Settlement Received: ${formatINR(settledInvoice.totalPayable)} credited`);
  };

  const handleTransactionAction = (tx: Transaction) => {
    if (tx.status === 'Review Window Open') {
      setActiveTab('trust');
    } else if (tx.status === 'Pending') {
      showToast(`WhatsApp reminder prepared for ${tx.clientName} (${formatINR(tx.amount)})`);
    } else {
      showToast(`Receipt for ${tx.invoiceNumber} downloaded`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased">
      {/* Toast popup */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-3">
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewProposal={() => setIsNewProposalModalOpen(true)}
        onQuickInvoice={() => setIsQuickInvoiceModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header
          activeTab={activeTab}
          onOpenShareReputation={() => setIsShareReputationModalOpen(true)}
          onQuickInvoice={() => setIsQuickInvoiceModalOpen(true)}
          onNewProposal={() => setIsNewProposalModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              transactions={transactions}
              onNewProposal={() => setIsNewProposalModalOpen(true)}
              onQuickInvoice={() => setIsQuickInvoiceModalOpen(true)}
              onShareReputation={() => setIsShareReputationModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onActionClick={handleTransactionAction}
            />
          )}

          {activeTab === 'proposals' && (
            <ProposalCreator
              initialProposal={currentProposal}
              onSaveProposal={(updated) => {
                setCurrentProposal(updated);
                showToast('✓ Scope & milestones saved successfully');
              }}
            />
          )}

          {activeTab === 'invoices' && (
            <UPIInvoiceView
              initialInvoice={currentInvoice}
              onPaymentSettled={handlePaymentSettled}
            />
          )}

          {activeTab === 'trust' && (
            <TrustReviewView
              metrics={trustMetrics}
              reviewsQueue={reviewsQueue}
              onShareProfile={() => setIsShareReputationModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickInvoice={() => setIsQuickInvoiceModalOpen(true)}
      />

      {/* Interactive Modals */}
      <NewProposalModal
        isOpen={isNewProposalModalOpen}
        onClose={() => setIsNewProposalModalOpen(false)}
        onCreate={handleCreateNewProposal}
      />

      <QuickUPIInvoiceModal
        isOpen={isQuickInvoiceModalOpen}
        onClose={() => setIsQuickInvoiceModalOpen(false)}
        onInvoiceCreated={handleQuickInvoiceCreated}
      />

      <ShareReputationModal
        isOpen={isShareReputationModalOpen}
        onClose={() => setIsShareReputationModalOpen(false)}
      />
    </div>
  );
}

