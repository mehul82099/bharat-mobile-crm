import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  TrendingUp, 
  Smartphone, 
  DollarSign, 
  Calendar, 
  Filter, 
  Layers,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { 
    invoices, 
    phones, 
    accessories, 
    expenses, 
    customers, 
    branches, 
    activeBranchId, 
    settings 
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'gst' | 'sales' | 'inventory'>('pnl');

  const branchFilter = (item: { branchId?: string }) => {
    if (activeBranchId === 'all') return true;
    return item.branchId === activeBranchId;
  };

  const filteredInvoices = invoices.filter(branchFilter).filter(i => i.status !== 'Cancelled');
  const filteredExpenses = expenses.filter(branchFilter);
  const filteredPhones = phones.filter(branchFilter);
  const filteredAccessories = accessories.filter(branchFilter);

  // Financial P&L Calculations
  const grossSales = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalDiscounts = filteredInvoices.reduce((sum, i) => sum + i.totalDiscount, 0);
  const netSales = grossSales;

  const cogs = filteredInvoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((iSum, item) => iSum + (item.purchaseCost * item.qty), 0);
  }, 0);

  const grossProfit = netSales - cogs;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpenses;

  // GST Calculation (GSTR-1 Outward Supplies)
  const totalTaxable = filteredInvoices.reduce((sum, i) => sum + i.subtotal, 0);
  const totalCgst = filteredInvoices.reduce((sum, i) => sum + i.cgst, 0);
  const totalSgst = filteredInvoices.reduce((sum, i) => sum + i.sgst, 0);
  const totalIgst = filteredInvoices.reduce((sum, i) => sum + i.igst, 0);
  const totalGstCollected = totalCgst + totalSgst + totalIgst;

  // Inventory Valuation
  const phoneValuation = filteredPhones.filter(p => p.status === 'Available').reduce((s, p) => s + p.purchasePrice, 0);
  const accValuation = filteredAccessories.reduce((s, a) => s + (a.purchasePrice * a.currentStock), 0);
  const totalStockValuation = phoneValuation + accValuation;

  // Export CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = 'report.csv';

    if (activeReportTab === 'sales') {
      filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Invoice No', 'Date', 'Customer', 'Mobile', 'Amount (₹)', 'Payment Method', 'Status'];
      rows = filteredInvoices.map(i => [
        `"${i.invoiceNumber}"`,
        `"${i.date}"`,
        `"${i.customerName}"`,
        `"${i.customerMobile}"`,
        i.grandTotal,
        `"${i.paymentMethod}"`,
        `"${i.status}"`
      ]);
    } else if (activeReportTab === 'gst') {
      filename = `gstr1_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Invoice No', 'Date', 'Customer GSTIN', 'Taxable Value', 'CGST (9%)', 'SGST (9%)', 'IGST (18%)', 'Total Invoice'];
      rows = filteredInvoices.map(i => [
        `"${i.invoiceNumber}"`,
        `"${i.date}"`,
        `"${i.customerGstin || 'B2C Consumer'}"`,
        i.subtotal,
        i.cgst,
        i.sgst,
        i.igst,
        i.grandTotal
      ]);
    } else {
      filename = `pnl_report_${new Date().toISOString().split('T')[0]}.csv`;
      headers = ['Metric', 'Amount (INR)'];
      rows = [
        ['Gross Sales Revenue', grossSales],
        ['Cost of Goods Sold (COGS)', cogs],
        ['Gross Operating Profit', grossProfit],
        ['Operating Showroom Expenses', totalExpenses],
        ['Estimated Net Profit', netOperatingProfit]
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Financial Reports, P&L Statements & GSTR-1 GST Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime accounting metrics computed from actual stored invoices, expenses, and inventory purchase costs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'pnl', label: 'Profit & Loss (P&L)' },
          { id: 'gst', label: 'GSTR-1 Tax Summary' },
          { id: 'sales', label: 'Sales Register' },
          { id: 'inventory', label: 'Inventory Valuation' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReportTab === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFIT & LOSS */}
      {activeReportTab === 'pnl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Gross Sales Revenue</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{formatINR(grossSales)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Cost of Goods Sold (COGS)</span>
              <p className="text-2xl font-black text-slate-600 dark:text-slate-400 mt-1 font-mono">{formatINR(cogs)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Gross Operating Profit</span>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">{formatINR(grossProfit)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Net Operating Profit</span>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{formatINR(netOperatingProfit)}</p>
            </div>
          </div>

          {/* Statement Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              Income Statement Summary (P&L)
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Total Billed Sales (Phones & Accessories)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(grossSales)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <span>Less: Trade Discounts Given</span>
                <span className="font-mono text-amber-600">- {formatINR(totalDiscounts)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-800/50 px-2 rounded">
                <span>Net Sales Revenue</span>
                <span className="font-mono">{formatINR(netSales)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <span>Less: Actual Purchase Cost of Sold Inventory (COGS)</span>
                <span className="font-mono text-red-600">- {formatINR(cogs)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-bold text-blue-600 bg-blue-50/50 dark:bg-blue-950/20 px-2 rounded">
                <span>Gross Profit Margin ({grossSales > 0 ? Math.round((grossProfit / grossSales) * 100) : 0}%)</span>
                <span className="font-mono">{formatINR(grossProfit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-slate-500">
                <span>Less: Total Showroom Operating Expenses (Rent, Bills, Staff)</span>
                <span className="font-mono text-red-600">- {formatINR(totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-slate-900 dark:border-white font-black text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 rounded-xl">
                <span>Estimated Net Business Profit</span>
                <span className="font-mono text-base">{formatINR(netOperatingProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GSTR-1 GST TAX SUMMARY */}
      {activeReportTab === 'gst' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Taxable Turnover</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{formatINR(totalTaxable)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">CGST Collected (9%)</span>
              <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatINR(totalCgst)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">SGST Collected (9%)</span>
              <p className="text-2xl font-black text-blue-600 mt-1 font-mono">{formatINR(totalSgst)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total GST Output Liability</span>
              <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{formatINR(totalGstCollected)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              GSTR-1 Outward Invoices Register
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                    <th className="p-3">Invoice No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer Type</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">CGST (₹)</th>
                    <th className="p-3 text-right">SGST (₹)</th>
                    <th className="p-3 text-right">Total Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="p-3 font-mono font-bold text-brand-600">{inv.invoiceNumber}</td>
                      <td className="p-3 text-slate-500">{formatIndianDate(inv.date)}</td>
                      <td className="p-3">{inv.customerGstin ? `B2B (${inv.customerGstin})` : 'B2C Retail'}</td>
                      <td className="p-3 text-right font-mono">{formatINR(inv.subtotal)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(inv.cgst)}</td>
                      <td className="p-3 text-right font-mono">{formatINR(inv.sgst)}</td>
                      <td className="p-3 text-right font-mono font-bold">{formatINR(inv.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SALES REGISTER */}
      {activeReportTab === 'sales' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                  <th className="p-3.5">Invoice No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Items Summary</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5 text-right">Grand Total</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="p-3.5 font-mono font-bold text-brand-600">{inv.invoiceNumber}</td>
                    <td className="p-3.5 text-slate-500">{formatIndianDate(inv.date)}</td>
                    <td className="p-3.5 font-medium">{inv.customerName}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {inv.items.map(i => i.name).join(', ')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{inv.paymentMethod}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">{formatINR(inv.grandTotal)}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
      )}

      {/* TAB 4: INVENTORY VALUATION */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Phone Stock Value</span>
              <p className="text-2xl font-black text-brand-600 mt-1 font-mono">{formatINR(phoneValuation)}</p>
              <span className="text-[10px] text-slate-400">{filteredPhones.filter(p => p.status === 'Available').length} IMEI Units</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Accessories Stock Value</span>
              <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{formatINR(accValuation)}</p>
              <span className="text-[10px] text-slate-400">{filteredAccessories.reduce((s, a) => s + a.currentStock, 0)} Units</span>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Inventory Valuation</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">{formatINR(totalStockValuation)}</p>
              <span className="text-[10px] text-slate-400">Invested Working Capital</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
