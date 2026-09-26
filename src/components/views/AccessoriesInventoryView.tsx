import React, { useState } from 'react';
import { 
  Headphones, 
  Search, 
  Plus, 
  Filter, 
  AlertTriangle, 
  Download, 
  Upload, 
  Edit3, 
  Trash2, 
  X, 
  Layers, 
  CheckCircle,
  Package
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobileAccessory, AccessoryCategory } from '../../types';
import { formatINR } from '../../utils/formatters';

export const AccessoriesInventoryView: React.FC = () => {
  const { 
    accessories, 
    suppliers, 
    branches, 
    activeBranchId, 
    addAccessory, 
    updateAccessory, 
    deleteAccessory 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAcc, setEditingAcc] = useState<MobileAccessory | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'boAt',
    sku: '',
    barcode: '',
    category: 'Chargers' as AccessoryCategory,
    compatibleModels: 'Universal',
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    currentStock: 10,
    minStockLevel: 5,
    supplierId: suppliers[0]?.id || '',
    branchId: branches[0]?.id || '',
    warrantyMonths: 12,
    description: '',
  });

  const categories: AccessoryCategory[] = [
    'Tempered Glass',
    'Mobile Covers',
    'Chargers',
    'Charging Cables',
    'Earphones & Headphones',
    'Neckbands',
    'Bluetooth Speakers',
    'Power Banks',
    'Smartwatches',
    'Memory Cards & Pen Drives',
    'Adapters & OTG',
    'Other Accessories'
  ];

  // Filtering
  const filteredAccessories = accessories.filter(acc => {
    if (activeBranchId !== 'all' && acc.branchId !== activeBranchId) return false;
    if (selectedCategory !== 'all' && acc.category !== selectedCategory) return false;
    if (showLowStockOnly && acc.currentStock > acc.minStockLevel) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        acc.name.toLowerCase().includes(q) ||
        acc.sku.toLowerCase().includes(q) ||
        acc.brand.toLowerCase().includes(q) ||
        acc.compatibleModels.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = accessories.filter(a => a.currentStock <= a.minStockLevel).length;
  const totalStockUnits = accessories.reduce((sum, a) => sum + a.currentStock, 0);
  const totalValuation = accessories.reduce((sum, a) => sum + (a.purchasePrice * a.currentStock), 0);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Brand', 'Category', 'SKU', 'Barcode', 'Compatible Models', 'Cost Price', 'Selling Price', 'Stock', 'Min Stock'];
    const rows = accessories.map(a => [
      `"${a.name}"`,
      `"${a.brand}"`,
      `"${a.category}"`,
      `"${a.sku}"`,
      `"${a.barcode}"`,
      `"${a.compatibleModels}"`,
      a.purchasePrice,
      a.sellingPrice,
      a.currentStock,
      a.minStockLevel
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accessories_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAcc) {
      updateAccessory(editingAcc.id, formData);
      setEditingAcc(null);
    } else {
      addAccessory({
        ...formData,
        sku: formData.sku || `ACC-${formData.brand.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`
      });
    }
    setShowAddModal(false);
  };

  const handleStockAdjust = (id: string, delta: number) => {
    const acc = accessories.find(a => a.id === id);
    if (!acc) return;
    const newStock = Math.max(0, acc.currentStock + delta);
    updateAccessory(id, { currentStock: newStock });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Headphones className="w-6 h-6 text-emerald-600" />
            Mobile Accessories & Gadgets Inventory (SKU Based)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage screen guards, fast chargers, covers, audio, power banks, and bundle packages
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingAcc(null);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Accessory
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Inventory</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalStockUnits} <span className="text-xs font-medium text-slate-400">Units</span>
          </p>
          <span className="text-[10px] text-slate-400">{accessories.length} Unique SKUs</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Stock Valuation</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalValuation)}
          </p>
          <span className="text-[10px] text-slate-400">At Purchase Cost</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Low Stock Alerts</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {lowStockCount}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Needs Immediate Reorder</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Categories</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {categories.length}
          </p>
          <span className="text-[10px] text-slate-400">All Accessories</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Accessory Name, SKU, Brand, or Compatible Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              showLowStockOnly ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            ⚠️ Low Stock ({lowStockCount})
          </button>
        </div>
      </div>

      {/* Accessories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Product Name & Brand</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">SKU / Barcode</th>
                <th className="p-3.5">Compatibility</th>
                <th className="p-3.5 text-right">Cost</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">Stock Level</th>
                <th className="p-3.5 text-center">Quick Adjust</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredAccessories.map(acc => {
                const isLow = acc.currentStock <= acc.minStockLevel;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">Brand: {acc.brand}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {acc.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      <div>{acc.sku}</div>
                      {acc.barcode && <div className="text-[10px] text-slate-400">{acc.barcode}</div>}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      {acc.compatibleModels}
                    </td>

                    <td className="p-3.5 text-right font-mono text-slate-500">
                      {formatINR(acc.purchasePrice)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(acc.sellingPrice)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        isLow ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 animate-pulse' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {acc.currentStock} Units
                      </span>
                    </td>

                    {/* Quick Adjust Buttons */}
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleStockAdjust(acc.id, -1)}
                          className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                          title="Decrease 1"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleStockAdjust(acc.id, 1)}
                          className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200"
                          title="Add 1"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleStockAdjust(acc.id, 10)}
                          className="px-1.5 h-6 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold hover:bg-emerald-100"
                          title="Add 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingAcc(acc);
                            setFormData({
                              name: acc.name,
                              brand: acc.brand,
                              sku: acc.sku,
                              barcode: acc.barcode,
                              category: acc.category,
                              compatibleModels: acc.compatibleModels,
                              purchasePrice: acc.purchasePrice,
                              sellingPrice: acc.sellingPrice,
                              mrp: acc.mrp,
                              currentStock: acc.currentStock,
                              minStockLevel: acc.minStockLevel,
                              supplierId: acc.supplierId,
                              branchId: acc.branchId,
                              warrantyMonths: acc.warrantyMonths,
                              description: acc.description,
                            });
                            setShowAddModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${acc.name}?`)) {
                              deleteAccessory(acc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Accessory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-400" />
                {editingAcc ? 'Edit Accessory' : 'Add New Accessory / Gadget'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple 20W USB-C Adapter or Spigen Tempered Glass"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple, Spigen, boAt, Samsung"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AccessoryCategory })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-generation"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Compatible Models</label>
                  <input
                    type="text"
                    placeholder="e.g. iPhone 15 Pro or All Type-C"
                    value={formData.compatibleModels}
                    onChange={(e) => setFormData({ ...formData, compatibleModels: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.purchasePrice || ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice || ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">MRP (₹)</label>
                  <input
                    type="number"
                    value={formData.mrp || ''}
                    onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Current Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Min Alert Level</label>
                  <input
                    type="number"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-amber-600 font-bold"
                  />
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
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  {editingAcc ? 'Update Changes' : 'Save Accessory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
