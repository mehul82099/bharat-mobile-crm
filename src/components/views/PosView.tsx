import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  QrCode, 
  UserPlus, 
  Smartphone, 
  Headphones, 
  CreditCard, 
  Check, 
  Printer, 
  Share2, 
  IndianRupee, 
  Percent, 
  AlertCircle,
  Tag,
  RefreshCw,
  ShoppingCart,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MobilePhone, MobileAccessory, Customer, InvoiceItem, PaymentMethod, Invoice } from '../../types';
import { formatINR, calculateGST, cleanMobile } from '../../utils/formatters';
import { InvoiceModal } from '../modals/InvoiceModal';
import { UpiQrModal } from '../modals/UpiQrModal';

export const PosView: React.FC = () => {
  const { 
    phones, 
    accessories, 
    customers, 
    employees, 
    branches, 
    activeBranchId, 
    currentUser, 
    settings, 
    createInvoice, 
    addCustomer 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'phones' | 'accessories'>('all');
  
  // Cart state
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  
  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');
  const [newCustCity, setNewCustCity] = useState(settings.city);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  
  // Exchange / Buyback credit state
  const [hasExchange, setHasExchange] = useState(false);
  const [exchangeModel, setExchangeModel] = useState('');
  const [exchangeImei, setExchangeImei] = useState('');
  const [exchangeValue, setExchangeValue] = useState<number>(0);

  // Modals
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Salesperson
  const [salesEmployeeId, setSalesEmployeeId] = useState<string>(
    currentUser.role === 'Sales Employee' ? currentUser.id : employees[0]?.id || ''
  );

  // Current branch
  const currentBranch = branches.find(b => b.id === (activeBranchId === 'all' ? branches[0]?.id : activeBranchId)) || branches[0];

  // Available inventory
  const availablePhones = phones.filter(p => 
    p.status === 'Available' && 
    (activeBranchId === 'all' || p.branchId === currentBranch.id)
  );

  const availableAccessories = accessories.filter(a => 
    a.currentStock > 0 && 
    (activeBranchId === 'all' || a.branchId === currentBranch.id)
  );

  // Filtering products
  const filteredPhones = availablePhones.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.imei1.includes(searchQuery) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAccessories = availableAccessories.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add Phone to Cart
  const handleAddPhone = (phone: MobilePhone) => {
    // Check if phone IMEI is already in cart
    if (cartItems.some(i => i.identifier === phone.imei1)) {
      alert('This mobile phone is already in the billing cart.');
      return;
    }

    const newItem: InvoiceItem = {
      id: phone.id,
      type: 'phone',
      name: `${phone.brand} ${phone.modelName} (${phone.ram}/${phone.storage}, ${phone.color})`,
      identifier: phone.imei1,
      qty: 1,
      unitPrice: phone.sellingPrice,
      purchaseCost: phone.purchasePrice,
      discount: 0,
      gstRate: settings.defaultPhoneGstRate || 18,
      gstAmount: (phone.sellingPrice * (settings.defaultPhoneGstRate || 18)) / 100,
      total: phone.sellingPrice,
    };

    setCartItems(prev => [...prev, newItem]);
  };

  // Add Accessory to Cart
  const handleAddAccessory = (acc: MobileAccessory) => {
    const existing = cartItems.find(i => i.identifier === acc.sku);
    if (existing) {
      if (existing.qty >= acc.currentStock) {
        alert(`Cannot add more. Available stock for ${acc.name} is ${acc.currentStock}.`);
        return;
      }
      setCartItems(prev => prev.map(item => {
        if (item.identifier === acc.sku) {
          const newQty = item.qty + 1;
          const newTotal = (item.unitPrice * newQty) - item.discount;
          return { ...item, qty: newQty, total: newTotal };
        }
        return item;
      }));
    } else {
      const newItem: InvoiceItem = {
        id: acc.id,
        type: 'accessory',
        name: acc.name,
        identifier: acc.sku,
        qty: 1,
        unitPrice: acc.sellingPrice,
        purchaseCost: acc.purchasePrice,
        discount: 0,
        gstRate: settings.defaultAccessoryGstRate || 18,
        gstAmount: (acc.sellingPrice * (settings.defaultAccessoryGstRate || 18)) / 100,
        total: acc.sellingPrice,
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  // Remove Item
  const handleRemoveItem = (identifier: string) => {
    setCartItems(prev => prev.filter(i => i.identifier !== identifier));
  };

  // Update item discount
  const handleItemDiscount = (identifier: string, discount: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.identifier === identifier) {
        const itemSubtotal = item.unitPrice * item.qty;
        const boundedDiscount = Math.min(itemSubtotal, Math.max(0, discount));
        return {
          ...item,
          discount: boundedDiscount,
          total: itemSubtotal - boundedDiscount,
        };
      }
      return item;
    }));
  };

  // Calculations
  const grossTotal = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
  const itemDiscounts = cartItems.reduce((sum, item) => sum + item.discount, 0);
  const totalDiscount = itemDiscounts + (discountAmount || 0);

  // Exchange deduction
  const exchangeDeduction = hasExchange ? (exchangeValue || 0) : 0;

  const finalTaxable = Math.max(0, grossTotal - totalDiscount - exchangeDeduction);
  const gstBreakdown = calculateGST(finalTaxable, 18, false); // Default Intra-state CGST+SGST
  const grandTotal = Math.round(finalTaxable);

  // Auto-sync amount paid if not Customer Credit
  const effectiveAmountPaid = paymentMethod === 'Customer Credit' ? amountPaid : (amountPaid === 0 ? grandTotal : amountPaid);
  const balanceDue = Math.max(0, grandTotal - effectiveAmountPaid);

  // Handle Quick Add Customer
  const handleCreateCustomer = () => {
    if (!newCustName || !newCustMobile) {
      alert('Please enter customer name and 10-digit mobile number.');
      return;
    }
    const created = addCustomer({
      name: newCustName,
      mobile: cleanMobile(newCustMobile),
      city: newCustCity,
      type: 'Retail',
      creditLimit: 10000,
      preferredBrands: [],
    });
    setSelectedCustomer(created);
    setShowNewCustModal(false);
    setNewCustName('');
    setNewCustMobile('');
  };

  // Confirm Sale & Generate Invoice
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your billing cart is empty. Please add at least one product.');
      return;
    }

    if (!selectedCustomer) {
      alert('Please select or add a customer to generate GST invoice.');
      return;
    }

    const salesRep = employees.find(e => e.id === salesEmployeeId) || employees[0];

    const invoicePayload = {
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerMobile: selectedCustomer.mobile,
      customerGstin: selectedCustomer.gstin,
      items: cartItems,
      subtotal: Math.round(finalTaxable / 1.18),
      totalDiscount,
      cgst: gstBreakdown.cgst,
      sgst: gstBreakdown.sgst,
      igst: 0,
      deliveryCharges: 0,
      grandTotal,
      paymentMethod,
      amountPaid: effectiveAmountPaid,
      balanceDue,
      status: balanceDue === 0 ? 'Paid' as const : (effectiveAmountPaid > 0 ? 'Partial' as const : 'Draft' as const),
      salesEmployeeId: salesRep?.id || currentUser.id,
      salesEmployeeName: salesRep?.name || currentUser.name,
      branchId: currentBranch.id,
      notes: `${notes || ''}${hasExchange ? ` [Exchange: ${exchangeModel} (IMEI: ${exchangeImei}) credited ₹${exchangeValue}]` : ''}`.trim(),
      exchangeBuybackId: hasExchange ? exchangeImei : undefined,
      exchangeDiscount: exchangeDeduction > 0 ? exchangeDeduction : undefined,
    };

    const newInvoice = createInvoice(invoicePayload);
    setGeneratedInvoice(newInvoice);
    setShowInvoiceModal(true);

    // Reset Form
    setCartItems([]);
    setSelectedCustomer(null);
    setAmountPaid(0);
    setDiscountAmount(0);
    setHasExchange(false);
    setExchangeModel('');
    setExchangeImei('');
    setExchangeValue(0);
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">
      {/* Left 7 Columns: Product Catalog & Search */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search & Tabs */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search phone by Model or IMEI / Accessory by Name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {(['all', 'phones', 'accessories'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab === 'phones' ? `Phones (${availablePhones.length})` : tab === 'accessories' ? `Accessories (${availableAccessories.length})` : 'All Products'}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
          {/* Phones */}
          {(activeTab === 'all' || activeTab === 'phones') && filteredPhones.map(phone => (
            <div
              key={phone.id}
              onClick={() => handleAddPhone(phone)}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-full uppercase">
                    {phone.brand}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    phone.condition === 'New' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {phone.condition}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 group-hover:text-brand-600 transition-colors line-clamp-1">
                  {phone.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {phone.ram} RAM • {phone.storage} • {phone.color}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  IMEI: {phone.imei1}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-1.5">{formatINR(phone.mrp)}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{formatINR(phone.sellingPrice)}</span>
                </div>
                <button className="w-7 h-7 rounded-lg bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Accessories */}
          {(activeTab === 'all' || activeTab === 'accessories') && filteredAccessories.map(acc => (
            <div
              key={acc.id}
              onClick={() => handleAddAccessory(acc)}
              className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">
                    {acc.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    acc.currentStock <= acc.minStockLevel ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    Stock: {acc.currentStock}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5 group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {acc.name}
                </h4>
                <p className="text-[10px] font-mono text-slate-400 mt-1">
                  SKU: {acc.sku}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-1.5">{formatINR(acc.mrp)}</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{formatINR(acc.sellingPrice)}</span>
                </div>
                <button className="w-7 h-7 rounded-lg bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right 5 Columns: Billing Cart & Checkout Panel */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Billing Counter</span>
              <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} Items
              </span>
            </h3>
            {cartItems.length > 0 && (
              <button 
                onClick={() => setCartItems([])}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            )}
          </div>

          {/* Customer Selection Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Customer Details</span>
              <button
                onClick={() => setShowNewCustModal(true)}
                className="text-[11px] text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + New Customer
              </button>
            </div>

            {selectedCustomer ? (
              <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-bold text-xs text-slate-900 dark:text-white">{selectedCustomer.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">+91 {selectedCustomer.mobile}</p>
                  {selectedCustomer.outstandingBalance > 0 && (
                    <p className="text-[10px] text-red-600 font-bold mt-0.5">Khata Due: {formatINR(selectedCustomer.outstandingBalance)}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded-lg"
                  title="Remove customer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <select
                onChange={(e) => {
                  const cust = customers.find(c => c.id === e.target.value);
                  if (cust) setSelectedCustomer(cust);
                }}
                defaultValue=""
                className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="" disabled>Select Existing Customer (or click + New)...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — +91 {c.mobile} {c.outstandingBalance > 0 ? `(Khata: ₹${c.outstandingBalance})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Cart is empty. Click on a phone or accessory to add.
              </div>
            ) : (
              cartItems.map(item => (
                <div 
                  key={item.identifier}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">
                      {item.type === 'phone' ? `IMEI: ${item.identifier}` : `SKU: ${item.identifier} (x${item.qty})`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {formatINR(item.total)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.identifier)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Old Phone Buyback / Exchange Option */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={hasExchange}
                onChange={(e) => setHasExchange(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                Customer Old Phone Exchange / Trade-in
              </span>
            </label>

            {hasExchange && (
              <div className="mt-2.5 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Old Phone (e.g. iPhone 12 64GB)"
                    value={exchangeModel}
                    onChange={(e) => setExchangeModel(e.target.value)}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Old Phone IMEI"
                    value={exchangeImei}
                    onChange={(e) => setExchangeImei(e.target.value)}
                    className="p-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Exchange Credit (₹)</label>
                  <input
                    type="number"
                    value={exchangeValue || ''}
                    onChange={(e) => setExchangeValue(parseFloat(e.target.value) || 0)}
                    placeholder="Exchange Valuation Price (₹)"
                    className="w-full mt-0.5 p-1.5 bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Payment Method</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['UPI', 'Cash', 'Credit Card', 'Customer Credit'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setPaymentMethod(mode)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all ${
                    paymentMethod === mode
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {mode === 'Customer Credit' ? 'Khata' : mode}
                </button>
              ))}
            </div>

            {/* UPI QR Trigger Button */}
            {paymentMethod === 'UPI' && grandTotal > 0 && (
              <button
                onClick={() => setShowUpiModal(true)}
                className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                Show Dynamic UPI Payment QR (GPay / PhonePe / Paytm)
              </button>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Products Total:</span>
              <span className="font-mono">{formatINR(grossTotal)}</span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount Applied:</span>
                <span className="font-mono">- {formatINR(totalDiscount)}</span>
              </div>
            )}

            {exchangeDeduction > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>Old Phone Exchange Deduction:</span>
                <span className="font-mono">- {formatINR(exchangeDeduction)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST Included (18% HSN 8517):</span>
              <span className="font-mono">{formatINR(gstBreakdown.totalTax)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Net Payable:</span>
              <span className="font-mono text-xl text-brand-600 dark:text-brand-400">{formatINR(grandTotal)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Complete Sale & Print GST Invoice
          </button>
        </div>
      </div>

      {/* New Customer Modal */}
      {showNewCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Register New Customer</h4>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">Customer Full Name</label>
              <input
                type="text"
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="e.g. Vikas Sharma"
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">10-Digit Mobile Number</label>
              <input
                type="tel"
                maxLength={10}
                value={newCustMobile}
                onChange={(e) => setNewCustMobile(e.target.value)}
                placeholder="98XXXXXXXX"
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 uppercase">City</label>
              <input
                type="text"
                value={newCustCity}
                onChange={(e) => setNewCustCity(e.target.value)}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowNewCustModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustomer}
                className="flex-1 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                Save & Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic UPI QR Modal */}
      <UpiQrModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={grandTotal}
        upiId={settings.upiId}
        payeeName={settings.shopName}
        customerName={selectedCustomer?.name}
        onPaymentConfirmed={() => {
          setAmountPaid(grandTotal);
        }}
      />

      {/* GST Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        invoice={generatedInvoice}
        branch={currentBranch}
        settings={settings}
      />
    </div>
  );
};
