import React, { useState } from 'react';
import { 
  RefreshCw, 
  Search, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  Smartphone, 
  IndianRupee,
  X,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BuybackRecord, BuybackGrade } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const BuybackView: React.FC = () => {
  const { 
    buybacks, 
    branches, 
    activeBranchId, 
    employees, 
    currentUser, 
    createBuyback 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<BuybackRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerMobile: '',
    idProofType: 'Aadhaar Card' as const,
    idProofNumber: '',
    brand: 'Apple',
    model: '',
    imei: '',
    storage: '128 GB',
    conditionGrade: 'Grade A (Flawless)' as BuybackGrade,
    functionalCheck: {
      displayOk: true,
      touchOk: true,
      camerasOk: true,
      batteryHealth: '88%',
      wifiBluetoothOk: true,
      micSpeakerOk: true
    },
    accessoriesIncluded: ['Original Box'],
    estimatedMarketValue: 20000,
    buybackPrice: 16000,
    refurbishCost: 500,
    resalePrice: 22000,
    status: 'In Stock' as const,
    employeeId: currentUser.id,
    employeeName: currentUser.name,
    date: new Date().toISOString().split('T')[0],
    branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
  });

  const filteredBuybacks = buybacks.filter(b => {
    if (activeBranchId !== 'all' && b.branchId !== activeBranchId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.receiptNumber.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.model.toLowerCase().includes(q) ||
        b.imei.includes(q)
      );
    }
    return true;
  });

  const totalBuybackCost = filteredBuybacks.reduce((sum, b) => sum + b.buybackPrice, 0);
  const projectedResaleValue = filteredBuybacks.reduce((sum, b) => sum + b.resalePrice, 0);
  const expectedProfit = projectedResaleValue - totalBuybackCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerMobile || !formData.model || !formData.imei) {
      alert('Please fill customer details, device model, and IMEI.');
      return;
    }

    const created = createBuyback({
      ...formData,
      customerId: `cust-bb-${Date.now()}`
    });

    setShowAddModal(false);
    setSelectedReceipt(created);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-purple-600" />
            Old Phone Exchange & Used Phone Buyback Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aadhaar verification, physical grading checklist, buyback valuation receipts, and refurbishment tracking
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Intake Old Phone (Buyback)
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Devices Acquired</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {filteredBuybacks.length} <span className="text-xs font-medium text-slate-400">Phones</span>
          </p>
          <span className="text-[10px] text-slate-400">Trade-in & Direct Buyouts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Buyback Investment</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {formatINR(totalBuybackCost)}
          </p>
          <span className="text-[10px] text-slate-400">Paid to Customers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Expected Resale</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(projectedResaleValue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Margin: {formatINR(expectedProfit)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">In Stock / Refurbishing</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {filteredBuybacks.filter(b => b.status === 'In Stock').length}
          </p>
          <span className="text-[10px] text-blue-600 font-semibold">Available for Second-Hand Sale</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Receipt No, Customer Name, Model, IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Buybacks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Receipt No</th>
                <th className="p-3.5">Customer & ID Proof</th>
                <th className="p-3.5">Device & IMEI</th>
                <th className="p-3.5">Condition Grade</th>
                <th className="p-3.5 text-right">Buyout Price</th>
                <th className="p-3.5 text-right">Target Resale</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredBuybacks.map(bb => (
                <tr key={bb.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-purple-600">{bb.receiptNumber}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white">{bb.customerName}</div>
                    <div className="text-[10px] text-slate-400">+91 {bb.customerMobile} ({bb.idProofType})</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold">{bb.brand} {bb.model} ({bb.storage})</div>
                    <div className="text-[10px] font-mono text-slate-400">IMEI: {bb.imei}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      {bb.conditionGrade}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(bb.buybackPrice)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                    {formatINR(bb.resalePrice)}
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      {bb.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedReceipt(bb)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="View Buyback Receipt"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Buyback Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-400" />
                Intake Second-Hand Phone (Buyback / Trade-In)
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* ID Proof Verification */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                <span className="font-bold text-purple-900 dark:text-purple-300 uppercase text-[10px]">Customer Government ID Verification (Police Compliance)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400">ID Proof Type</label>
                    <select
                      value={formData.idProofType}
                      onChange={(e) => setFormData({ ...formData, idProofType: e.target.value as any })}
                      className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID Card</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-600 dark:text-slate-400">ID Document Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XXXX-XXXX-1234"
                      value={formData.idProofNumber}
                      onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                      className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Device Details */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OnePlus 11R"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Storage</label>
                  <input
                    type="text"
                    placeholder="e.g. 128 GB"
                    value={formData.storage}
                    onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Device IMEI</label>
                <input
                  type="text"
                  required
                  placeholder="15-digit IMEI"
                  value={formData.imei}
                  onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Physical Condition Grading */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Condition Grade</label>
                  <select
                    value={formData.conditionGrade}
                    onChange={(e) => setFormData({ ...formData, conditionGrade: e.target.value as BuybackGrade })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Grade A (Flawless)">Grade A (Flawless, No scratches)</option>
                    <option value="Grade B (Minor Wear)">Grade B (Minor edge wear)</option>
                    <option value="Grade C (Dents/Scratches)">Grade C (Visible scratches/dents)</option>
                    <option value="Grade D (Damaged)">Grade D (Damaged / Needs part repair)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Battery Health</label>
                  <input
                    type="text"
                    placeholder="e.g. 88%"
                    value={formData.functionalCheck.batteryHealth}
                    onChange={(e) => setFormData({
                      ...formData,
                      functionalCheck: { ...formData.functionalCheck, batteryHealth: e.target.value }
                    })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Valuation & Prices */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Estimated Value (₹)</label>
                  <input
                    type="number"
                    value={formData.estimatedMarketValue || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedMarketValue: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Buyout Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.buybackPrice || ''}
                    onChange={(e) => setFormData({ ...formData, buybackPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-purple-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Target Resale (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.resalePrice || ''}
                    onChange={(e) => setFormData({ ...formData, resalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  Complete Buyback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Old Device Purchase Receipt</h3>
                <p className="text-xs text-purple-600 font-mono font-bold">{selectedReceipt.receiptNumber}</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <p>Seller: <strong className="text-slate-900 dark:text-white">{selectedReceipt.customerName}</strong> (+91 {selectedReceipt.customerMobile})</p>
                <p>ID Proof: {selectedReceipt.idProofType} ({selectedReceipt.idProofNumber})</p>
                <p>Device: {selectedReceipt.brand} {selectedReceipt.model} ({selectedReceipt.storage})</p>
                <p className="font-mono">IMEI: {selectedReceipt.imei}</p>
                <p>Grade: {selectedReceipt.conditionGrade}</p>
              </div>

              <div className="flex justify-between p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-900 dark:text-purple-300 font-bold">
                <span>Buyback Amount Paid:</span>
                <span className="font-mono">{formatINR(selectedReceipt.buybackPrice)}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
