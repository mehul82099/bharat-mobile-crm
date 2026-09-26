import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  ArrowRightLeft, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  X,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Branch, MobilePhone } from '../../types';
import { formatINR } from '../../utils/formatters';

export const BranchesView: React.FC = () => {
  const { branches, phones, accessories, invoices, transferStock, settings } = useApp();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromBranch, setFromBranch] = useState(branches[0]?.id || '');
  const [toBranch, setToBranch] = useState(branches[1]?.id || branches[0]?.id || '');
  const [selectedPhoneId, setSelectedPhoneId] = useState('');

  // Available phones at source branch
  const sourcePhones = phones.filter(p => p.branchId === fromBranch && p.status === 'Available');

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranch === toBranch) {
      alert('Source and destination branches must be different.');
      return;
    }
    if (!selectedPhoneId) {
      alert('Please select a phone to transfer.');
      return;
    }

    const phone = phones.find(p => p.id === selectedPhoneId);
    if (!phone) return;

    transferStock(fromBranch, toBranch, [
      {
        type: 'phone',
        id: phone.id,
        name: phone.name,
        imei: phone.imei1,
        qty: 1
      }
    ]);

    setShowTransferModal(false);
    setSelectedPhoneId('');
    alert(`Successfully transferred ${phone.name} (IMEI: ${phone.imei1}) to destination branch.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-600" />
            Multi-Branch Showroom Management & Stock Transfer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage showroom locations, branch-specific invoice prefixes, and inter-branch inventory transfers
          </p>
        </div>

        <button
          onClick={() => setShowTransferModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Transfer Stock Between Branches
        </button>
      </div>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {branches.map(branch => {
          const branchPhones = phones.filter(p => p.branchId === branch.id && p.status === 'Available');
          const branchAccessories = accessories.filter(a => a.branchId === branch.id);
          const branchInvoices = invoices.filter(i => i.branchId === branch.id && i.status !== 'Cancelled');
          const branchRevenue = branchInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

          return (
            <div
              key={branch.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{branch.name}</h3>
                    {branch.isMain && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold px-2 py-0.5 rounded-full">
                        Main Flagship
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {branch.address}, {branch.city}, {branch.state} - {branch.pincode}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    +91 {branch.phone}
                  </p>
                </div>
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg">
                  Prefix: {branch.invoicePrefix}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Showroom GSTIN:</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">{branch.gstin}</p>
              </div>

              {/* Branch Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800/60">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Phone Stock</span>
                  <p className="text-lg font-black text-blue-600 mt-0.5">{branchPhones.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Accessories</span>
                  <p className="text-lg font-black text-emerald-600 mt-0.5">{branchAccessories.reduce((s, a) => s + a.currentStock, 0)}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/60">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Total Sales</span>
                  <p className="text-sm font-black text-purple-600 mt-1 font-mono">{formatINR(branchRevenue)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inter-Branch Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-brand-600" />
                Inter-Branch Stock Dispatch
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">From Branch</label>
                  <select
                    value={fromBranch}
                    onChange={(e) => {
                      setFromBranch(e.target.value);
                      setSelectedPhoneId('');
                    }}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">To Branch</label>
                  <select
                    value={toBranch}
                    onChange={(e) => setToBranch(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Select Phone (Available at Origin)</label>
                <select
                  required
                  value={selectedPhoneId}
                  onChange={(e) => setSelectedPhoneId(e.target.value)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="" disabled>Select device to dispatch...</option>
                  {sourcePhones.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (IMEI: {p.imei1}) - {formatINR(p.sellingPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-2.5 rounded-xl border font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md"
                >
                  Dispatch Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
