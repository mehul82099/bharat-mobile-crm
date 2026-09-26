import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Plus, 
  Filter, 
  QrCode, 
  ShieldCheck, 
  Clock, 
  FileText, 
  AlertCircle, 
  Building2, 
  Tag, 
  Trash2, 
  Edit3, 
  X,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobilePhone, PhoneCondition, PhoneStatus } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const PhoneInventoryView: React.FC = () => {
  const { 
    phones, 
    branches, 
    suppliers, 
    activeBranchId, 
    addPhone, 
    updatePhone, 
    deletePhone, 
    invoices, 
    customers 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPhoneHistory, setSelectedPhoneHistory] = useState<MobilePhone | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Apple',
    modelName: '',
    modelNumber: '',
    ram: '8 GB',
    storage: '128 GB',
    color: 'Black',
    imei1: '',
    imei2: '',
    serialNumber: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    minSellingPrice: 0,
    mrp: 0,
    supplierId: suppliers[0]?.id || '',
    purchaseDate: new Date().toISOString().split('T')[0],
    warrantyMonths: 12,
    condition: 'New' as PhoneCondition,
    status: 'Available' as PhoneStatus,
    branchId: branches[0]?.id || '',
    notes: '',
  });

  // Filtered List
  const filteredPhones = phones.filter(p => {
    if (activeBranchId !== 'all' && p.branchId !== activeBranchId) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;
    if (brandFilter !== 'all' && p.brand !== brandFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.imei1.includes(q) ||
        (p.imei2 && p.imei2.includes(q)) ||
        p.brand.toLowerCase().includes(q) ||
        (p.serialNumber && p.serialNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const uniqueBrands = Array.from(new Set(phones.map(p => p.brand)));

  // Valuation metrics
  const availablePhones = phones.filter(p => p.status === 'Available');
  const totalValuation = availablePhones.reduce((sum, p) => sum + p.purchasePrice, 0);
  const totalRetailValue = availablePhones.reduce((sum, p) => sum + p.sellingPrice, 0);

  const handleSubmitPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imei1) {
      alert('IMEI 1 is mandatory for mobile phones.');
      return;
    }

    try {
      addPhone({
        ...formData,
        name: `${formData.brand} ${formData.modelName}`,
        barcode: formData.barcode || formData.imei1.slice(-8),
        minSellingPrice: formData.minSellingPrice || formData.purchasePrice,
      });
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: '',
        brand: 'Apple',
        modelName: '',
        modelNumber: '',
        ram: '8 GB',
        storage: '128 GB',
        color: 'Black',
        imei1: '',
        imei2: '',
        serialNumber: '',
        barcode: '',
        purchasePrice: 0,
        sellingPrice: 0,
        minSellingPrice: 0,
        mrp: 0,
        supplierId: suppliers[0]?.id || '',
        purchaseDate: new Date().toISOString().split('T')[0],
        warrantyMonths: 12,
        condition: 'New',
        status: 'Available',
        branchId: branches[0]?.id || '',
        notes: '',
      });
    } catch (err: any) {
      alert(err.message || 'Error adding phone.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-brand-600" />
            Serialized Mobile Phone Inventory (IMEI Tracked)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Every device tracked with unique dual-SIM IMEI, lifecycle history, and warranty records
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Phone Stock (IMEI)
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Available Stock</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {availablePhones.length} <span className="text-xs font-medium text-slate-400">Devices</span>
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Ready for Sale</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Stock Valuation (Cost)</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {formatINR(totalValuation)}
          </p>
          <span className="text-[10px] text-slate-400">Total Purchase Investment</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Retail Potential (MRP)</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalRetailValue)}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Expected Profit: {formatINR(totalRetailValue - totalValuation)}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Sold Devices</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {phones.filter(p => p.status === 'Sold').length}
          </p>
          <span className="text-[10px] text-slate-400">Recorded on Invoices</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by IMEI 1, IMEI 2, Model Name, Serial, or Brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Repair">Under Repair</option>
          </select>

          {/* Condition filter */}
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Conditions</option>
            <option value="New">Brand New</option>
            <option value="Refurbished">Refurbished</option>
            <option value="Second Hand">Second Hand (Used)</option>
            <option value="Open Box">Open Box</option>
          </select>

          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Phones */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Device & Variant</th>
                <th className="p-3.5">IMEI 1 / Serial</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5 text-right">Cost Price</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Branch</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPhones.map(phone => {
                const branch = branches.find(b => b.id === phone.branchId);

                return (
                  <tr key={phone.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{phone.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {phone.ram} | {phone.storage} | {phone.color}
                      </div>
                    </td>

                    <td className="p-3.5 font-mono">
                      <div className="text-slate-900 dark:text-slate-200 font-semibold">{phone.imei1}</div>
                      {phone.imei2 && <div className="text-[10px] text-slate-400">SIM 2: {phone.imei2}</div>}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        phone.condition === 'New' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        phone.condition === 'Refurbished' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {phone.condition}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {formatINR(phone.purchasePrice)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(phone.sellingPrice)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        phone.status === 'Available' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        phone.status === 'Sold' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' :
                        phone.status === 'Reserved' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {phone.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {branch?.code || 'MAIN'}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedPhoneHistory(phone)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-brand-600 transition-colors"
                          title="View IMEI History & Lifecycle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {phone.status === 'Available' && (
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${phone.name}?`)) {
                                deletePhone(phone.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete Stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Phone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-brand-400" />
                Intake New Mobile Phone (IMEI Entry)
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPhone} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Brand</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi / Redmi</option>
                    <option value="Realme">Realme</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Motorola">Motorola</option>
                    <option value="Google Pixel">Google Pixel</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 15 Pro or Galaxy S24"
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">RAM</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 GB"
                    value={formData.ram}
                    onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
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
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Color</label>
                  <input
                    type="text"
                    placeholder="e.g. Titanium Blue"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* IMEI Inputs */}
              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-800/60 space-y-2">
                <div>
                  <label className="font-bold text-brand-900 dark:text-brand-300 uppercase">Primary IMEI 1 (Mandatory)</label>
                  <input
                    type="text"
                    required
                    placeholder="15-digit IMEI number"
                    value={formData.imei1}
                    onChange={(e) => setFormData({ ...formData, imei1: e.target.value })}
                    className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-brand-900 dark:text-brand-300 uppercase">Secondary IMEI 2 (Dual SIM)</label>
                  <input
                    type="text"
                    placeholder="15-digit IMEI (Optional for eSIM/Dual-SIM)"
                    value={formData.imei2}
                    onChange={(e) => setFormData({ ...formData, imei2: e.target.value })}
                    className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="₹"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="₹"
                    value={formData.sellingPrice || ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="₹"
                    value={formData.mrp || ''}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Supplier, Branch, Condition */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as PhoneCondition })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="New">Brand New</option>
                    <option value="Refurbished">Refurbished</option>
                    <option value="Second Hand">Second Hand</option>
                    <option value="Open Box">Open Box</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Supplier</label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Branch</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save to Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMEI History Modal */}
      {selectedPhoneHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedPhoneHistory.name}</h3>
                <p className="text-xs text-slate-500 font-mono">IMEI: {selectedPhoneHistory.imei1}</p>
              </div>
              <button onClick={() => setSelectedPhoneHistory(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold text-brand-600">{selectedPhoneHistory.status}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500">Condition:</span>
                <span className="font-bold">{selectedPhoneHistory.condition}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500">Intake / Purchase Date:</span>
                <span className="font-bold">{formatIndianDate(selectedPhoneHistory.purchaseDate)}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-slate-500">Purchase Price:</span>
                <span className="font-bold font-mono">{formatINR(selectedPhoneHistory.purchasePrice)}</span>
              </div>
              {selectedPhoneHistory.status === 'Sold' && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                  <p className="font-bold text-purple-900 dark:text-purple-300">Sales Record</p>
                  <p className="text-purple-800 dark:text-purple-400">Sold Date: {formatIndianDate(selectedPhoneHistory.soldDate)}</p>
                  <p className="text-purple-800 dark:text-purple-400">Sold Price: {formatINR(selectedPhoneHistory.soldPrice || 0)}</p>
                  <p className="text-purple-800 dark:text-purple-400 font-mono">Invoice Ref: {selectedPhoneHistory.soldInvoiceId}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedPhoneHistory(null)}
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
