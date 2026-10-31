# Metron — Freelancer Fintech SaaS Dashboard 🇮🇳

**Metron** is a modern, high-converting SaaS dashboard tailored for solo freelancers, design engineers, and independent consultants to manage proposals, milestone deliverables, zero-commission UPI invoicing, and verified double-blind client trust scores.

---

## ⚡ Instant "Go Live" Feature (Zero Setup Required)

You can run Metron **directly with the VS Code "Go Live" (Live Server) extension**:

1. In VS Code, look at the bottom right blue status bar and click **`Go Live`** (or right-click [`index.html`](file:///c:/Users/risha/OneDrive/Desktop/vscode/mnit/index.html) and choose **"Open with Live Server"**).
2. Live Server will instantly launch the full interactive app in your browser at:
   ```
   http://127.0.0.1:5500/index.html
   ```
3. Everything is **100% interactive and functional out-of-the-box**:
   - ✅ Interactive Tab Switching (Overview, Proposals, UPI Invoices, Trust & Reviews)
   - ✅ Real-time Milestone Scope Builder with 18% GST toggle & INR price calculations
   - ✅ Client Digital E-Signature Canvas (draw with mouse/touch, clear, and e-sign)
   - ✅ Dynamic UPI QR Code, Razorpay short-link copying, and direct WhatsApp invoice launcher
   - ✅ Instant UPI Payment Simulation (auto-updates settled revenue in real-time)
   - ✅ Double-Blind Mutual Review Rating modal that unlocks client reciprocal reviews
   - ✅ Responsive desktop sidebar collapsing to mobile bottom navigation

---

## 🎨 Theme & Aesthetic System

- **Aesthetic Direction**: High-velocity fintech minimalism inspired by Linear, Stripe, and Wise.
- **Color Palette**:
  - Surfaces: Clean White (`#ffffff`) and Slate Mist (`#f8fafc`)
  - Structural Borders: Dark Slate Borders (`#e2e8f0`)
  - Typography: Crisp Charcoal (`#0f172a`) with Plus Jakarta Sans & JetBrains Mono font pairing
  - Financial Accents: Electric Indigo (`#4f46e5`) for brand & actions, Emerald (`#059669`) for settled revenue and positive cash flow.
- **Currency System**: Fully native Indian Rupee format (`₹`, Lakhs / Thousands, 2,2,3 grouping).

---

## 🚀 Key Modules & Architecture

### 1. Overview Dashboard
- **Top Metrics Bar**:
  - `Total Settled Revenue (₹)`: Real-time aggregated revenue with month-over-month growth.
  - `Pending UPI Invoices`: Unsettled invoice count with average clearance speed.
  - `Active Projects`: Active scopes locked under milestone contracts.
  - `My Verified Trust Score`: 4.9/5.0 ★ verified reputation score.
- **Quick Action Buttons**:
  - `+ New Proposal`: Launches scoped milestone creator.
  - `+ Quick UPI Invoice`: Generates instant UPI dynamic QR in under 15 seconds.
  - `Share Reputation Profile`: Public credentials and portfolio badge embedder.
- **Recent Transactions Table**: Live search filter, client avatars, UPI auto-pay badges, status pills (`Paid`, `Pending`, `Review Window Open`), and contextual actions (Receipts, WhatsApp Reminders, Rate & Unlock).

### 2. Proposal & E-Sign Creator
- **Scope & Milestone Form**:
  - Project Title, Client Name, WhatsApp number, Email.
  - Milestone builder: Deliverable specifications, target dates, and individual tranche amounts in INR.
- **Pricing & Tax Engine**:
  - Auto-calculated subtotal.
  - 18% GST toggle (SAC: 998314) and discount field.
- **Live Client Preview Pane**:
  - Real-time reflection of what the client sees.
  - Interactive HTML5 / React **Signature Canvas** for drawing digital e-signatures.
  - Digital seal verification upon client sign-off.
  - One-click "Send to WhatsApp" pre-filled proposal launcher.

### 3. UPI Invoicing & Instant Settlement
- **Itemized Invoice Card**:
  - Deliverable rows with Qty/Hrs and Rate in ₹.
  - GST toggle with GSTIN compliance (`29ABCDE1234F1Z5`).
  - Total Net Payable calculation.
- **Dynamic UPI Payment Hub**:
  - Dynamic QR Code supporting Google Pay, PhonePe, Paytm, and CRED.
  - Razorpay / Metron short-link box with clipboard animation.
  - Direct WhatsApp billing message trigger.
  - Simulation engine: Clears invoice instantly and updates overview revenue.

### 4. Verified Trust & Reputation System
- **3 Pillars of Freelancer Reputation**:
  1. *Product Craftsmanship & Quality* (4.95 / 5.0)
  2. *Deadline Punctuality* (4.89 / 5.0)
  3. *Communication & Revisions* (4.93 / 5.0)
- **Review Pending Queue (Mutual Blind Lock)**:
  - Freelancers rate clients across 3 buyer criteria: *Payment Discipline*, *Scope Clarity*, and *Cooperation*.
  - Once submitted, the client's mutual review is unlocked and published to the verified feed.

---

## 🛠 Project Structure

```
mnit/
├── index.html                      # 🟢 INSTANT "GO LIVE" SINGLE-PAGE APP
├── README.md                       # Documentation & Quickstart
├── package.json                    # Next.js Dependencies
├── tsconfig.json                   # TypeScript Config
├── tailwind.config.js              # Tailwind Config
├── postcss.config.js               # PostCSS Config
├── next.config.js                  # Next.js Config
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   ├── dashboard/
    │   │   └── OverviewDashboard.tsx
    │   ├── proposals/
    │   │   ├── ProposalCreator.tsx
    │   │   └── SignatureCanvas.tsx
    │   ├── invoices/
    │   │   └── UPIInvoiceView.tsx
    │   ├── trust/
    │   │   ├── TrustReviewView.tsx
    │   │   └── ClientReviewModal.tsx
    │   ├── modals/
    │   │   ├── NewProposalModal.tsx
    │   │   ├── QuickUPIInvoiceModal.tsx
    │   │   └── ShareReputationModal.tsx
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   └── MobileNav.tsx
    │   └── ui/
    │       └── Icons.tsx
    ├── data/
    │   └── mockData.ts
    ├── types/
    │   └── index.ts
    └── utils/
        └── formatters.ts
```

---

## 💻 How to Run

### Option A: VS Code "Go Live" (Recommended & Instant)
- Right-click [`index.html`](file:///c:/Users/risha/OneDrive/Desktop/vscode/mnit/index.html) and select **Open with Live Server**, or click the **Go Live** button in VS Code's bottom status bar.
- Opens instantly at `http://127.0.0.1:5500/index.html`.

### Option B: Next.js Development Server
```bash
npm install
npm run dev
```
- Opens at `http://localhost:3000`.
