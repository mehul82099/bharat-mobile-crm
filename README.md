# BharatMobile CRM | All-in-One Mobile Shop & Business Management System (India)

A modern, mobile-first, enterprise-grade CRM, Point of Sale (POS), and ERP platform specifically engineered for mobile phone retail showrooms and service centers in India.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Vite**, featuring zero-latency local persistence, full Indian GST compliance, dual-SIM IMEI tracking, dynamic UPI payments, and an integrated AI Business Assistant.

---

## 🌟 Key Modules & Capabilities

### 1. Role-Based Access Control (RBAC) & Multi-User Architecture
- **6 Built-in Roles**:
  - **Owner / Super Admin**: Unrestricted visibility across all branches, financial statements, and configuration.
  - **Shop Manager**: Sales approvals, stock movements, and technician assignments.
  - **Sales Employee**: Quick POS counter, customer quotations, and personal commission tracking.
  - **Accountant**: P&L statements, GSTR-1 summaries, vendor dues, and Khata credit ledger.
  - **Inventory Manager**: Serialized IMEI intake, warehouse adjustments, and branch transfers.
  - **Repair Technician**: Job sheets, intake checklists, parts consumption, and service tokens.
- Instant **Role Switcher** in the top navigation bar to test the application under different permission profiles.

### 2. Live Executive Business Dashboard
- Real-time business KPIs computed from stored transactions:
  - Today's Sales Revenue & Gross Profit margins.
  - Operating Showroom Expenses & Net Profit estimation.
  - Customer Khata dues & Supplier payables.
  - Total Stock Valuation (at purchase cost & retail potential).
- Interactive visual charts:
  - Top Smartphone Brands Market Share (Apple, Samsung, OnePlus, Xiaomi, Realme, Vivo).
  - Payment Modes Breakdown (UPI, Cash, EMI, Credit Card, Khata).
  - Staff Sales Leaderboard with monthly target achievement bars.
- Instant alert banners for low-stock accessories, pending service repairs, and overdue Khata payments.

### 3. Serialized Mobile Phone Inventory (IMEI Tracked)
- Dual-SIM IMEI tracking (IMEI 1 & IMEI 2) with duplicate prevention.
- Product condition classification: **Brand New**, **Open Box**, **Refurbished**, and **Second Hand**.
- Complete IMEI lifecycle tracking (`Intake -> Available -> Reserved -> Sold on Invoice # -> Warranty -> Repair`).
- Stock status filtering, batch search by IMEI, model name, RAM/Storage, or serial number.

### 4. Mobile Accessories & Gadgets Inventory (SKU-Based)
- 12 Indian retail categories: Tempered Glass, Mobile Covers, Chargers, Cables, Earphones, Neckbands, Bluetooth Speakers, Power Banks, Smartwatches, Memory Cards, Adapters, and OTG.
- Reorder threshold monitoring with automated Low Stock alerts.
- Quick `+1`, `-1`, and `+10` stock adjustment buttons.
- One-click CSV export and import.

### 5. Point of Sale (POS) & GST Billing Counter
- Rapid barcode/IMEI search and quick-add to cart.
- Customer selection or inline `+ New Customer` creation.
- **Dynamic UPI Payment QR Code**: Generates real `upi://pay` QR codes with payee name and amount prefilled for Google Pay, PhonePe, Paytm, and BHIM.
- Customer Old Phone Exchange / Trade-in credit deducted directly from invoice total.
- **Printable GST Tax Invoice**:
  - HSN code classification (8517 for smartphones, 8504 for chargers, etc.).
  - Intra-state CGST (9%) + SGST (9%) or Inter-state IGST (18%) breakdown.
  - Indian numbering amount in words ("Rupees Seventy Three Thousand Two Hundred and Ninety Eight Only").
  - Direct **WhatsApp Share** button that pre-formats the bill with an instant message link (`https://wa.me/91...`).

### 6. Customer CRM & Khata Credit Ledger
- Complete customer profiles with purchase history, loyalty rewards, and credit limits.
- Customer Khata (udhar) ledger with `Record Payment` workflow.
- One-click WhatsApp Payment Reminder with pre-filled amount and showroom UPI ID.
- Follow-up management for quotations, pending payments, and expiring warranties.

### 7. Mobile Repair & Express Service Desk
- Comprehensive service intake job sheet with physical checklist (Screen broken, Water damage, Power ON, Touch OK).
- **8-Stage Service Lifecycle Tracker**:
  `Device Received -> Diagnosis -> Estimate Sent -> Customer Approval -> Repair in Progress -> Quality Check -> Ready for Pickup -> Delivered`.
- Interactive **Kanban Board** & **List View**.
- Printable Customer Repair Token / Job Sheet with barcode, terms, and customer signature area.
- Instant WhatsApp status update notifications to customers.

### 8. Old Phone Buyback & Trade-In Evaluation
- Government ID verification (Aadhaar, Driving License, Voter ID, Passport) for second-hand purchases.
- Physical condition grading (**Grade A** flawless to **Grade D** damaged).
- Functional diagnostics (Display, Touch, Battery Health %, Cameras, WiFi/Bluetooth).
- Buyback price valuation and target resale margin.
- Automatic integration into second-hand phone inventory.

### 9. Purchases & Supplier Ledger
- Distributor bills intake (Redington, Rashi Peripherals, Gaffar Market wholesalers).
- Serialized phone IMEI intake during stock receipt.
- Input Tax Credit (ITC) tracking for GSTR-2B compliance.
- Supplier ledger and payment settlement.

### 10. Showroom Expenses & Petty Cash Register
- Categorized expense tracking (Rent, Electricity, Broadband, Staff Salaries, Refreshments/Tea, Marketing, Maintenance).
- Daily cash outflow vs bank payments.
- Real-time impact on net business profit.

### 11. Staff Sales Targets & Commission Management
- Customizable commission formulas:
  - Fixed ₹ per phone sold.
  - % margin on mobile accessories.
  - % labor charge on repair service jobs.
- Transparent incentive breakdown per employee with monthly target progress.

### 12. Financial Reports & GSTR-1 Tax Analytics
- **Profit & Loss (P&L)**: Gross Revenue, Discounts, COGS, Gross Profit, Operating Expenses, Net Operating Profit.
- **GSTR-1 Outward Supplies Summary**: Taxable Turnover, CGST, SGST, IGST liability.
- **Inventory Valuation**: Current investment locked in phone and accessory stock.
- Export all reports to CSV or print.

### 13. AI Business Assistant & Smart Co-pilot
- Natural-language query interface answering real-time questions:
  - *"What are today's total sales and profit?"*
  - *"Which accessories are running low in stock?"*
  - *"Show me customers with overdue Khata dues"*
  - *"How much commission has Priya Patel earned?"*
  - *"Draft a Diwali festival WhatsApp promotion"*
- Generates customer communication drafts with one-click copy.

### 14. Multi-Branch Showroom Management
- Support for multiple store locations (e.g. Connaught Place, Delhi & Sector 18, Noida).
- Consolidated or branch-specific inventory views.
- Inter-branch stock transfer workflow.

### 15. Settings, Localization & Data Protection
- English and Hindi (हिंदी) language toggle.
- Dark and Light mode.
- Complete JSON database backup export and restore file upload.
- Factory reset to restore sample store state.

---

## 🚀 Running the Application Locally

```bash
# Install dependencies
npm install

# Start the Vite development server (Port 5173)
npm run dev

# Build production bundle
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` in your browser.
