import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  Trash2, 
  X,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const ExpensesView: React.FC = () => {
  const { expenses, branches, activeBranchId, currentUser, addExpense, deleteExpense } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newExp, setNewExp] = useState({
    title: '',
    category: 'Refreshments & Tea' as ExpenseCategory,
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI' as PaymentMethod,
    recordedBy: currentUser.name,
    branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
    receiptNote: '',
  });

  const categories: ExpenseCategory[] = [
    'Rent',
    'Electricity',
    'Internet & Telephone',
    'Staff Salaries',
    'Transportation',
    'Marketing & Ads',
    'Refreshments & Tea',
    'Shop Maintenance',
    'Packaging & Stationary',
    'Tools & Equipment',
    'Other Expenses'
  ];

  const filteredExpenses = expenses.filter(e => {
    if (activeBranchId !== 'all' && e.branchId !== activeBranchId) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.title || newExp.amount <= 0) {
      alert('Please fill expense title and valid amount.');
      return;
    }
    addExpense(newExp);
    setShowAddModal(false);
    setNewExp({
      title: '',
      category: 'Refreshments & Tea',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI',
      recordedBy: currentUser.name,
      branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
      receiptNote: '',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-600" />
            Showroom Operating Expenses & Cash Outflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rent, utilities, staff salaries, tea/refreshments, local logistics, and petty cash register
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-rose-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Expenses</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(totalExpenseAmount)}
          </p>
          <span className="text-[10px] text-slate-400">{filteredExpenses.length} Expense Vouchers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Cash Outflow</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(filteredExpenses.filter(e => e.paymentMethod === 'Cash').reduce((s, e) => s + e.amount, 0))}
          </p>
          <span className="text-[10px] text-slate-400">Petty Cash Payments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Top Category</span>
          <p className="text-xl font-black text-slate-800 dark:text-slate-200 mt-1 truncate">
            {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Rent'}
          </p>
          <span className="text-[10px] text-slate-400">Highest Cost Center</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses by title or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
        >
          <option value="all">All Expense Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Expense Item / Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Recorded By</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5">
                    <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                    {exp.receiptNote && <div className="text-[10px] text-slate-400">{exp.receiptNote}</div>}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{formatIndianDate(exp.date)}</td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{exp.paymentMethod}</td>
                  <td className="p-3.5 text-slate-500">{exp.recordedBy}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {formatINR(exp.amount)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Delete expense "${exp.title}"?`)) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                Record Business Expense
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Electricity Bill or Staff Tea/Refreshment"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value as ExpenseCategory })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newExp.amount || ''}
                    onChange={(e) => setNewExp({ ...newExp, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono font-bold text-rose-600 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Payment Mode</label>
                  <select
                    value={newExp.paymentMethod}
                    onChange={(e) => setNewExp({ ...newExp, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash Voucher</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Date</label>
                  <input
                    type="date"
                    required
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Receipt Note / Voucher Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Paid to Landlord or Consumer CA No"
                  value={newExp.receiptNote}
                  onChange={(e) => setNewExp({ ...newExp, receiptNote: e.target.value })}
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
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
