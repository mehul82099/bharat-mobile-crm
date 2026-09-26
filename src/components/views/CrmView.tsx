import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Phone, 
  CreditCard, 
  Award, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Share2, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  X,
  History,
  Tag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, FollowUp, PaymentMethod } from '../../types';
import { formatINR, formatIndianDate, generateWhatsAppLink } from '../../utils/formatters';

export const CrmView: React.FC = () => {
  const { 
    customers, 
    invoices, 
    repairJobs, 
    followUps, 
    employees, 
    settings, 
    addCustomer, 
    updateCustomer, 
    recordCustomerPayment, 
    addFollowUp, 
    updateFollowUp 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    mobile: '',
    altMobile: '',
    email: '',
    city: settings.city,
    address: '',
    type: 'Retail' as const,
    creditLimit: 15000,
    preferredBrands: ['Apple', 'Samsung'],
    gstin: '',
    notes: '',
  });

  // Record Khata Payment Form
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Follow-up Form
  const [newFollowUp, setNewFollowUp] = useState({
    type: 'Pending Payment' as const,
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    priority: 'High' as const,
    assignedEmployeeId: employees[0]?.id || '',
    notes: '',
  });

  // Filtered customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalLoyaltyPoints = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  // WhatsApp Khata Reminder
  const handleWhatsAppKhataReminder = (customer: Customer) => {
    const msg = `🙏 *Namaste ${customer.name} ji,*\n\nThis is a friendly payment reminder from *${settings.shopName}* regarding your Khata account.\n\n*Outstanding Dues:* ${formatINR(customer.outstandingBalance)}\n*UPI ID:* ${settings.upiId}\n\nYou can pay securely via Google Pay, PhonePe, or Paytm to our UPI ID: *${settings.upiId}*.\n\nKindly acknowledge once paid. Thank you!`;
    const url = generateWhatsAppLink(customer.mobile, msg);
    window.open(url, '_blank');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.name || !newCust.mobile) {
      alert('Name and 10-digit mobile number are required.');
      return;
    }
    const created = addCustomer(newCust);
    setShowAddCustomerModal(false);
    setSelectedCustomer(created);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }
    recordCustomerPayment(selectedCustomer.id, paymentAmount, paymentMethod, paymentNotes);
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setPaymentNotes('');
    // refresh selected customer
    const updated = customers.find(c => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const emp = employees.find(e => e.id === newFollowUp.assignedEmployeeId) || employees[0];
    addFollowUp({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      type: newFollowUp.type,
      dueDate: newFollowUp.dueDate,
      priority: newFollowUp.priority,
      assignedEmployeeId: emp?.id || '',
      assignedEmployeeName: emp?.name || '',
      notes: newFollowUp.notes,
      status: 'Pending',
    });
    setShowFollowUpModal(false);
    setNewFollowUp({
      type: 'Pending Payment',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: 'High',
      assignedEmployeeId: employees[0]?.id || '',
      notes: '',
    });
  };

  // Customer Invoices & Repairs
  const customerInvoices = selectedCustomer 
    ? invoices.filter(i => i.customerId === selectedCustomer.id) 
    : [];
  const customerRepairs = selectedCustomer
    ? repairJobs.filter(r => r.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Customer Relationship Management & Khata Credit Ledger
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profiles, purchase history, loyalty rewards, credit limits, and automated WhatsApp follow-ups
          </p>
        </div>

        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Registered</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {customers.length} <span className="text-xs font-medium text-slate-400">Buyers</span>
          </p>
          <span className="text-[10px] text-slate-400">Active Mobile Clients</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Khata Credit Dues</span>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">
            {formatINR(totalOutstanding)}
          </p>
          <span className="text-[10px] text-red-500 font-semibold">{customers.filter(c => c.outstandingBalance > 0).length} Customers Pending</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Loyalty Reward Bank</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {totalLoyaltyPoints} <span className="text-xs font-medium text-slate-400">Pts</span>
          </p>
          <span className="text-[10px] text-slate-400">Redeemable on accessories</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Pending Follow-ups</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {followUps.filter(f => f.status === 'Pending').length}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">Payment & Quotation calls</span>
        </div>
      </div>

      {/* Main Content: Left Column Customer List, Right Column Profile & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: Directory */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, mobile, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredCustomers.map(customer => {
              const isSelected = selectedCustomer?.id === customer.id;

              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{customer.name}</h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">+91 {customer.mobile}</p>
                      <p className="text-[10px] text-slate-400">{customer.city} • {customer.type}</p>
                    </div>

                    <div className="text-right">
                      {customer.outstandingBalance > 0 ? (
                        <div>
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded-full">
                            Khata Due
                          </span>
                          <p className="text-xs font-mono font-bold text-red-600 mt-1">
                            {formatINR(customer.outstandingBalance)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          All Clear
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Columns: Selected Customer Details & Ledger */}
        <div className="lg:col-span-7">
          {selectedCustomer ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              {/* Profile Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedCustomer.name}</h3>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {selectedCustomer.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    +91 {selectedCustomer.mobile} {selectedCustomer.altMobile && `| ${selectedCustomer.altMobile}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {selectedCustomer.address ? `${selectedCustomer.address}, ` : ''}{selectedCustomer.city}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleWhatsAppKhataReminder(selectedCustomer)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    WhatsApp
                  </button>
                  {selectedCustomer.outstandingBalance > 0 && (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      Record Payment
                    </button>
                  )}
                </div>
              </div>

              {/* Khata & Credit Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-800/60">
                  <span className="text-[10px] font-bold text-red-700 dark:text-red-300 uppercase">Khata Balance Due</span>
                  <p className="text-xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">
                    {formatINR(selectedCustomer.outstandingBalance)}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Approved Credit Limit</span>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 font-mono">
                    {formatINR(selectedCustomer.creditLimit)}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase">Loyalty Reward Points</span>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {selectedCustomer.loyaltyPoints} Pts
                  </p>
                </div>
              </div>

              {/* Purchase History Invoices */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Invoice History ({customerInvoices.length})</h4>
                </div>

                {customerInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No purchases recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerInvoices.map(inv => (
                      <div key={inv.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-brand-600">{inv.invoiceNumber}</span>
                            <span className="text-[10px] text-slate-400">{formatIndianDate(inv.date)}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {inv.items.map(i => i.name).join(', ')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{formatINR(inv.grandTotal)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Service & Repair History */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Service & Repair History ({customerRepairs.length})</h4>
                {customerRepairs.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    No repair tickets on record.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {customerRepairs.map(rep => (
                      <div key={rep.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{rep.jobId}</span>
                            <span className="text-[10px] text-indigo-600 font-semibold">{rep.deviceBrand} {rep.deviceModel}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{rep.customerComplaint}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                            {rep.status}
                          </span>
                          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                            {formatINR(rep.estimatedCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  + Add Customer Follow-up Task
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
              <Users className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-semibold">Select a customer to view complete profile and Khata ledger</p>
            </div>
          )}
        </div>
      </div>

      {/* Record Khata Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Record Khata Payment</h4>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                <p className="text-slate-500">Customer: <strong className="text-slate-800 dark:text-slate-200">{selectedCustomer.name}</strong></p>
                <p className="text-slate-500">Total Due: <strong className="text-red-600 font-mono">{formatINR(selectedCustomer.outstandingBalance)}</strong></p>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  max={selectedCustomer.outstandingBalance}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount received"
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                  <option value="Debit Card">Debit Card</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. UTR number or cash slip"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" />
                Register New Customer Profile
              </h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newCust.name}
                    onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Mobile Number (10 Digits)</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newCust.mobile}
                    onChange={(e) => setNewCust({ ...newCust, mobile: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Customer Type</label>
                  <select
                    value={newCust.type}
                    onChange={(e) => setNewCust({ ...newCust, type: e.target.value as any })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Retail">Retail (Consumer)</option>
                    <option value="Corporate">Corporate / Business</option>
                    <option value="Wholesale">Wholesale Trader</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={newCust.creditLimit}
                    onChange={(e) => setNewCust({ ...newCust, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Address & City</label>
                <input
                  type="text"
                  placeholder="Street / Colony / Landmark"
                  value={newCust.address}
                  onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {showFollowUpModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">New Follow-up Task</h4>
            <form onSubmit={handleAddFollowUp} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Follow-up Reason</label>
                <select
                  value={newFollowUp.type}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, type: e.target.value as any })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Pending Payment">Pending Khata Payment</option>
                  <option value="Quotation Follow-up">Quotation Given</option>
                  <option value="Repair Pickup">Repair Ready for Delivery</option>
                  <option value="Warranty Expiring">Warranty Expiring Soon</option>
                  <option value="New Phone Launch">New Model Launch Interest</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Due Date</label>
                <input
                  type="date"
                  required
                  value={newFollowUp.dueDate}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Assign Employee</label>
                <select
                  value={newFollowUp.assignedEmployeeId}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, assignedEmployeeId: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Notes / Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Call customer in evening regarding balance"
                  value={newFollowUp.notes}
                  onChange={(e) => setNewFollowUp({ ...newFollowUp, notes: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFollowUpModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-600 text-white rounded-xl font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
