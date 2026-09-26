import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  PackagePlus, 
  DollarSign, 
  Wallet, 
  CreditCard, 
  Users, 
  Wrench, 
  AlertTriangle, 
  Smartphone, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar,
  Filter,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianDate } from '../../utils/formatters';
import { translations } from '../../utils/translations';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { 
    phones, 
    accessories, 
    invoices, 
    purchases, 
    expenses, 
    customers, 
    suppliers, 
    repairJobs, 
    followUps, 
    employees, 
    activeBranchId, 
    language,
    settings 
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const t = translations[language];

  // Branch filter
  const branchFilter = (item: { branchId?: string }) => {
    if (activeBranchId === 'all') return true;
    return item.branchId === activeBranchId;
  };

  const filteredInvoices = invoices.filter(branchFilter).filter(i => i.status !== 'Cancelled');
  const filteredPurchases = purchases.filter(branchFilter);
  const filteredExpenses = expenses.filter(branchFilter);
  const filteredPhones = phones.filter(branchFilter);
  const filteredAccessories = accessories.filter(branchFilter);
  const filteredRepairs = repairJobs.filter(branchFilter);

  // Today calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySales = filteredInvoices
    .filter(i => i.date === todayStr)
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const todayPurchases = filteredPurchases
    .filter(p => p.date === todayStr)
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Total sales revenue
  const totalSalesRevenue = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);

  // Total Cost of Goods Sold (COGS)
  const totalCOGS = filteredInvoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((iSum, item) => iSum + (item.purchaseCost * item.qty), 0);
  }, 0);

  const grossProfit = totalSalesRevenue - totalCOGS;

  // Operating Expenses
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedNetProfit = grossProfit - totalExpensesAmount;

  // Outstandings
  const totalCustomerKhata = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalSupplierDues = suppliers.reduce((sum, s) => sum + s.currentOutstanding, 0);

  // Inventory Valuation (Purchase cost of in-stock phones + accessories)
  const phoneStockValue = filteredPhones
    .filter(p => p.status === 'Available')
    .reduce((sum, p) => sum + p.purchasePrice, 0);

  const accessoryStockValue = filteredAccessories
    .reduce((sum, a) => sum + (a.purchasePrice * a.currentStock), 0);

  const totalInventoryValue = phoneStockValue + accessoryStockValue;

  // Counts
  const pendingRepairsCount = filteredRepairs.filter(r => r.status !== 'Delivered').length;
  const lowStockCount = filteredAccessories.filter(a => a.currentStock <= a.minStockLevel).length;
  const activeFollowUps = followUps.filter(f => f.status === 'Pending').length;

  // Brand sales breakdown
  const brandSales: Record<string, number> = {};
  filteredInvoices.forEach(inv => {
    inv.items.forEach(item => {
      if (item.type === 'phone') {
        const brand = item.name.split(' ')[0] || 'Other';
        brandSales[brand] = (brandSales[brand] || 0) + item.total;
      }
    });
  });

  // Payment Methods breakdown
  const paymentBreakdown: Record<string, number> = {};
  filteredInvoices.forEach(inv => {
    paymentBreakdown[inv.paymentMethod] = (paymentBreakdown[inv.paymentMethod] || 0) + inv.grandTotal;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-bold text-brand-400">Live Business Dashboard</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Realtime Synced
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mt-1">{settings.shopName}</h2>
          <p className="text-slate-300 text-xs mt-0.5">
            {formatIndianDate(new Date())} • Connected to {filteredPhones.filter(p => p.status === 'Available').length} In-Stock IMEI Devices
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-brand-300 ml-2" />
          {(['today', 'week', 'month', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                dateFilter === f ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Urgent Action Banners (Low Stock / Pending Repairs / Khata Due) */}
      {(lowStockCount > 0 || pendingRepairsCount > 0 || totalCustomerKhata > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {lowStockCount > 0 && (
            <div 
              onClick={() => onNavigate('accessories')}
              className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">{lowStockCount} Accessories Low in Stock</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">Reorder chargers & cases</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}

          {pendingRepairsCount > 0 && (
            <div 
              onClick={() => onNavigate('repairs')}
              className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-900 dark:text-red-200">{pendingRepairsCount} Phones in Service Queue</p>
                  <p className="text-[11px] text-red-700 dark:text-red-400">Check technician progress</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-red-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}

          {totalCustomerKhata > 0 && (
            <div 
              onClick={() => onNavigate('crm')}
              className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-200">{formatINR(totalCustomerKhata)} Khata Balance Due</p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">Send WhatsApp reminders</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.todaySales}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {formatINR(todaySales)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Revenue: {formatINR(totalSalesRevenue)}</span>
          </div>
        </div>

        {/* Card 2: Gross Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.grossProfit}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {formatINR(grossProfit)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <span>Margin: {totalSalesRevenue > 0 ? Math.round((grossProfit / totalSalesRevenue) * 100) : 0}%</span>
          </div>
        </div>

        {/* Card 3: Estimated Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.netProfit}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2 tracking-tight">
            {formatINR(estimatedNetProfit)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <span>After {formatINR(totalExpensesAmount)} expenses</span>
          </div>
        </div>

        {/* Card 4: Inventory Valuation */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.stockValue}</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
            {formatINR(totalInventoryValue)}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
            <span>{filteredPhones.filter(p => p.status === 'Available').length} Phones + {filteredAccessories.reduce((s, a) => s + a.currentStock, 0)} Accessories</span>
          </div>
        </div>
      </div>

      {/* Secondary Outstandings Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.customerKhata}</span>
          <p className="text-lg font-black text-red-600 dark:text-red-400 mt-1">{formatINR(totalCustomerKhata)}</p>
          <span className="text-[10px] text-slate-400">Receivable from buyers</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.supplierDues}</span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">{formatINR(totalSupplierDues)}</p>
          <span className="text-[10px] text-slate-400">Payable to distributors</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.activeFollowUps}</span>
          <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-1">{activeFollowUps} Pending</p>
          <span className="text-[10px] text-slate-400">Quotes & ready pickups</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Sales Staff</span>
          <p className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1">{employees.length} Active</p>
          <span className="text-[10px] text-slate-400">Commission tracked</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brand Market Share Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Top Smartphone Brands</h3>
              <span className="text-xs text-slate-400 font-medium">By Revenue</span>
            </div>
            
            <div className="space-y-3">
              {Object.entries(brandSales).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No phone sales recorded yet.</p>
              ) : (
                Object.entries(brandSales).map(([brand, amount]) => {
                  const percent = Math.min(100, Math.round((amount / (totalSalesRevenue || 1)) * 100));
                  return (
                    <div key={brand} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>{brand}</span>
                        <span>{formatINR(amount)} ({percent}%)</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('phones')}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-between hover:underline"
          >
            <span>View All Serialized IMEI Stock</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Methods Mix */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Payment Modes Mix</h3>
              <span className="text-xs text-slate-400 font-medium">UPI / Cash / EMI</span>
            </div>

            <div className="space-y-3">
              {Object.entries(paymentBreakdown).map(([mode, amt]) => {
                const percent = Math.round((amt / (totalSalesRevenue || 1)) * 100);
                return (
                  <div key={mode} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>{mode}</span>
                      <span>{formatINR(amt)} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          mode === 'UPI' ? 'bg-emerald-500' :
                          mode === 'Cash' ? 'bg-blue-500' :
                          mode === 'EMI' ? 'bg-purple-500' :
                          mode === 'Customer Credit' ? 'bg-red-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-between hover:underline"
          >
            <span>View Full Financial Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Sales Performance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Staff Sales Leaderboard</h3>
              <span className="text-xs text-slate-400 font-medium">Target & Incentives</span>
            </div>

            <div className="space-y-3">
              {employees.filter(e => e.role === 'Sales Employee').map(emp => {
                const empSales = filteredInvoices
                  .filter(i => i.salesEmployeeId === emp.id)
                  .reduce((sum, i) => sum + i.grandTotal, 0);

                const percent = Math.min(100, Math.round((empSales / emp.monthlySalesTarget) * 100));

                return (
                  <div key={emp.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatINR(empSales)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Target: {formatINR(emp.monthlySalesTarget)}</span>
                      <span>{percent}% Achieved</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => onNavigate('employees')}
            className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-between hover:underline"
          >
            <span>Configure Commission Rules</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recent Activity Feed & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Recent Customer Invoices</h3>
            <button 
              onClick={() => onNavigate('pos')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              Go to Billing
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <th className="pb-2 font-medium">Invoice No</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredInvoices.slice(0, 5).map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 font-mono text-brand-600 dark:text-brand-400">{inv.invoiceNumber}</td>
                    <td className="py-2.5 text-slate-700 dark:text-slate-300">
                      <div>{inv.customerName}</div>
                      <div className="text-[10px] text-slate-400">+91 {inv.customerMobile}</div>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {formatINR(inv.grandTotal)}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                        inv.status === 'Partial' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Service Center Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Active Repair Queue</h3>
            <button 
              onClick={() => onNavigate('repairs')}
              className="text-xs font-semibold text-brand-600 hover:underline"
            >
              View Service Center
            </button>
          </div>

          <div className="space-y-3">
            {filteredRepairs.slice(0, 4).map(job => (
              <div key={job.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{job.jobId}</span>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-medium">
                      {job.deviceBrand} {job.deviceModel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">{job.customerComplaint}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block ${
                    job.status === 'Ready for Pickup' ? 'bg-emerald-100 text-emerald-700' :
                    job.status === 'Repair in Progress' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {job.status}
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {formatINR(job.estimatedCost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
