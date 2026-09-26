import React, { useState } from 'react';
import { 
  PackagePlus, 
  Search, 
  Plus, 
  Truck, 
  Calendar, 
  FileText, 
  CheckCircle, 
  IndianRupee, 
  X,
  Smartphone
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PurchaseBill, PurchaseItem, MobilePhone } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const PurchasesView: React.FC = () => {
  const { 
    purchases, 
    suppliers, 
    branches, 
    activeBranchId, 
    createPurchase 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [billNumber, setBillNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Items in purchase
  const [pType, setPType] = useState<'phone' | 'accessory'>('phone');
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('Apple');
  const [pImeis, setPImeis] = useState('');
  const [pQty, setPQty] = useState(1);
  const [pPrice, setPPrice] = useState(0);

  const [items, setItems] = useState<PurchaseItem[]>([]);

  const filteredPurchases = purchases.filter(p => {
    if (activeBranchId !== 'all' && p.branchId !== activeBranchId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.billNumber.toLowerCase().includes(q) ||
        p.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPurchasesCost = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalBalanceDue = filteredPurchases.reduce((sum, p) => sum + p.balanceDue, 0);

  const handleAddItem = () => {
    if (!pName || pPrice <= 0) {
      alert('Please enter product name and purchase cost.');
      return;
    }

    const imeiList = pImeis
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const qty = pType === 'phone' ? Math.max(1, imeiList.length || pQty) : pQty;
    const sub = pPrice * qty;
    const gst = Math.round(sub * 0.18);

    const newItem: PurchaseItem = {
      name: pName,
      type: pType,
      brand: pBrand,
      imeis: imeiList,
      qty,
      purchasePrice: pPrice,
      gstRate: 18,
      total: sub + gst
    };

    setItems(prev => [...prev, newItem]);
    setPName('');
    setPImeis('');
    setPPrice(0);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one product item to the purchase invoice.');
      return;
    }

    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const subtotal = items.reduce((sum, i) => sum + (i.purchasePrice * i.qty), 0);
    const gstAmount = items.reduce((sum, i) => sum + (i.total - (i.purchasePrice * i.qty)), 0);
    const totalAmount = subtotal + gstAmount;

    // Prepare phones to add to inventory
    const newPhonesToAdd: Omit<MobilePhone, 'id'>[] = [];
    items.forEach(item => {
      if (item.type === 'phone' && item.imeis) {
        item.imeis.forEach(imei => {
          newPhonesToAdd.push({
            name: `${item.brand} ${item.name}`,
            brand: item.brand,
            modelName: item.name,
            modelNumber: 'RETAIL',
            ram: '8 GB',
            storage: '128 GB',
            color: 'Assorted',
            imei1: imei,
            barcode: imei.slice(-8),
            purchasePrice: item.purchasePrice,
            sellingPrice: Math.round(item.purchasePrice * 1.12),
            minSellingPrice: item.purchasePrice,
            mrp: Math.round(item.purchasePrice * 1.2),
            supplierId: supplier.id,
            purchaseDate,
            warrantyMonths: 12,
            condition: 'New',
            status: 'Available',
            branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
            notes: `Purchased under bill ${billNumber}`
          });
        });
      }
    });

    createPurchase({
      billNumber: billNumber || `PB-${Date.now().toString().slice(-6)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      date: purchaseDate,
      items,
      subtotal,
      gstAmount,
      totalAmount,
      amountPaid,
      balanceDue: Math.max(0, totalAmount - amountPaid),
      paymentStatus: amountPaid >= totalAmount ? 'Paid' : (amountPaid > 0 ? 'Partial' : 'Unpaid'),
      branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
    }, newPhonesToAdd);

    setShowAddModal(false);
    setItems([]);
    setBillNumber('');
    setAmountPaid(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <PackagePlus className="w-6 h-6 text-blue-600" />
            Purchases & Supplier Invoices (Stock Intake)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record distributor bills, scan incoming phone IMEIs, input tax credit (ITC), and supplier dues
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Purchase Bill
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Purchases</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(totalPurchasesCost)}
          </p>
          <span className="text-[10px] text-slate-400">{purchases.length} Recorded Bills</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Supplier Dues</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatINR(totalBalanceDue)}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Payable to Distributors</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Input Tax Credit (ITC)</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(Math.round(totalPurchasesCost * 0.18 / 1.18))}
          </p>
          <span className="text-[10px] text-slate-400">Claimable under GSTR-2B</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Bill Number, Supplier Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Bill Number</th>
                <th className="p-3.5">Supplier</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Items Summary</th>
                <th className="p-3.5 text-right">Taxable Subtotal</th>
                <th className="p-3.5 text-right">Total Bill (GST Incl)</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredPurchases.map(pb => (
                <tr key={pb.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 font-mono font-bold text-blue-600">{pb.billNumber}</td>
                  <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{pb.supplierName}</td>
                  <td className="p-3.5 text-slate-500">{formatIndianDate(pb.date)}</td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-400">
                    {pb.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-500">{formatINR(pb.subtotal)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatINR(pb.totalAmount)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-red-600">{formatINR(pb.balanceDue)}</td>
                  <td className="p-3.5 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pb.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      pb.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {pb.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-blue-400" />
                Record Distributor Purchase Invoice
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.companyName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Distributor Bill No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RED-DEL-8921"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              {/* Add Item Subsection */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">Add Received Stock Items</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Type</label>
                    <select
                      value={pType}
                      onChange={(e) => setPType(e.target.value as any)}
                      className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                    >
                      <option value="phone">Serialized Phone</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Brand</label>
                    <input
                      type="text"
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 font-semibold">Product Name / Model</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 15 Pro 128GB"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Purchase Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Cost / Unit"
                      value={pPrice || ''}
                      onChange={(e) => setPPrice(parseFloat(e.target.value) || 0)}
                      className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Qty</label>
                    <input
                      type="number"
                      value={pQty}
                      onChange={(e) => setPQty(parseInt(e.target.value) || 1)}
                      className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border rounded-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="w-full py-1.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>

                {pType === 'phone' && (
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">
                      Paste / Scan IMEIs (One IMEI per line):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="354892091234567&#10;354892091234568"
                      value={pImeis}
                      onChange={(e) => setPImeis(e.target.value)}
                      className="w-full mt-1 p-2 bg-white dark:bg-slate-900 border rounded-xl font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-1.5 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Items in this Bill:</span>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <strong>{item.brand} {item.name}</strong> (Qty: {item.qty})
                        {item.imeis && item.imeis.length > 0 && (
                          <div className="text-[10px] font-mono text-slate-400">IMEIs: {item.imeis.join(', ')}</div>
                        )}
                      </div>
                      <div className="font-mono font-bold">
                        {formatINR(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Amount Paid */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Immediate Payment to Supplier (₹)</label>
                <input
                  type="number"
                  placeholder="Enter amount paid now (Leave 0 for full credit)"
                  value={amountPaid || ''}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                />
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Confirm Purchase & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
