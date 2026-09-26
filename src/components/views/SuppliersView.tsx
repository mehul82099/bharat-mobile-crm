import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Building2, 
  Phone, 
  CreditCard, 
  FileText, 
  IndianRupee, 
  X,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Supplier, PaymentMethod } from '../../types';
import { formatINR, generateWhatsAppLink } from '../../utils/formatters';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, recordSupplierPayment } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);

  // Form State
  const [newSup, setNewSup] = useState({
    name: '',
    companyName: '',
    contactPerson: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
    distributorType: 'Smartphones & Flagships',
    paymentTerms: '15 Days Credit',
    openingBalance: 0,
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '',
      ifsc: '',
      upiId: '',
    },
    notes: '',
  });

  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payNotes, setPayNotes] = useState('');

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDues = suppliers.reduce((sum, s) => sum + s.currentOutstanding, 0);

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name || !newSup.mobile) {
      alert('Please fill supplier name and mobile.');
      return;
    }
    addSupplier(newSup);
    setShowAddModal(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || payAmount <= 0) return;
    recordSupplierPayment(selectedSupplier.id, payAmount, payMethod, payNotes);
    setShowPayModal(false);
    setPayAmount(0);
    setPayNotes('');
    const updated = suppliers.find(s => s.id === selectedSupplier.id);
    if (updated) setSelectedSupplier(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Distributor & Supplier Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage authorized brand distributors, wholesale credit lines, GSTIN details, and vendor payments
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Distributors</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {suppliers.length} <span className="text-xs font-medium text-slate-400">Partners</span>
          </p>
          <span className="text-[10px] text-slate-400">National & Local Wholesalers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Supplier Dues</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatINR(totalDues)}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Payable on Credit Terms</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average Credit Cycle</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            15 Days
          </p>
          <span className="text-[10px] text-slate-400">Payment turnaround window</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers by name, company, or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{sup.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{sup.companyName}</p>
                </div>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full">
                  {sup.distributorType}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>Contact: <strong className="text-slate-800 dark:text-slate-200">{sup.contactPerson}</strong></p>
                <p>Phone: <span className="font-mono text-slate-800 dark:text-slate-200">+91 {sup.mobile}</span></p>
                <p>GSTIN: <span className="font-mono text-slate-800 dark:text-slate-200">{sup.gstin}</span></p>
                <p>Credit Terms: <span className="text-slate-800 dark:text-slate-200 font-medium">{sup.paymentTerms}</span></p>
              </div>

              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Outstanding Dues</span>
                <span className="font-mono font-black text-amber-700 dark:text-amber-300 text-sm">
                  {formatINR(sup.currentOutstanding)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setShowPayModal(true);
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Pay Supplier
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pay Supplier Modal */}
      {showPayModal && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Pay Supplier / Settle Dues</h4>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl space-y-1">
                <p className="text-slate-500">Supplier: <strong className="text-slate-800 dark:text-slate-200">{selectedSupplier.name}</strong></p>
                <p className="text-slate-500">Current Dues: <strong className="text-amber-600 font-mono">{formatINR(selectedSupplier.currentOutstanding)}</strong></p>
                {selectedSupplier.bankDetails.accountNumber && (
                  <p className="text-[10px] text-slate-400 font-mono">Bank A/C: {selectedSupplier.bankDetails.accountNumber} ({selectedSupplier.bankDetails.ifsc})</p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={payAmount || ''}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount paid"
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Mode</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash Voucher</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                Register New Supplier / Distributor
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Trade Name / Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Redington India Ltd"
                    value={newSup.name}
                    onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Khurana"
                    value={newSup.contactPerson}
                    onChange={(e) => setNewSup({ ...newSup, contactPerson: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={newSup.mobile}
                    onChange={(e) => setNewSup({ ...newSup, mobile: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">GSTIN (15 Digits)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="07AABCB..."
                    value={newSup.gstin}
                    onChange={(e) => setNewSup({ ...newSup, gstin: e.target.value.toUpperCase() })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Distributor Type</label>
                <input
                  type="text"
                  placeholder="e.g. Apple & Samsung National Distributor"
                  value={newSup.distributorType}
                  onChange={(e) => setNewSup({ ...newSup, distributorType: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
