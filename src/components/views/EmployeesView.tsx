import React, { useState } from 'react';
import { 
  BadgePercent, 
  Search, 
  Plus, 
  UserCheck, 
  DollarSign, 
  Target, 
  Award, 
  CheckCircle2, 
  Edit3, 
  X,
  Smartphone,
  Headphones,
  Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, Role } from '../../types';
import { formatINR, formatIndianDate } from '../../utils/formatters';

export const EmployeesView: React.FC = () => {
  const { employees, invoices, repairJobs, branches, activeBranchId } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const filteredEmployees = employees.filter(e => {
    if (activeBranchId !== 'all' && e.branchId !== activeBranchId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.mobile.includes(q) || e.role.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate commissions for each employee from actual stored invoices
  const calculateCommission = (emp: Employee) => {
    const empInvoices = invoices.filter(i => i.salesEmployeeId === emp.id && i.status !== 'Cancelled');
    
    let phoneCommission = 0;
    let accessoryCommission = 0;

    empInvoices.forEach(inv => {
      inv.items.forEach(item => {
        if (item.type === 'phone') {
          phoneCommission += (emp.commissionRules.phoneFixedCommission * item.qty);
        } else if (item.type === 'accessory') {
          accessoryCommission += (item.total * emp.commissionRules.accessoryCommissionPercent) / 100;
        }
      });
    });

    // Repair technician commission
    let repairCommission = 0;
    if (emp.role === 'Repair Technician') {
      const empRepairs = repairJobs.filter(r => r.technicianId === emp.id && r.status === 'Delivered');
      empRepairs.forEach(rep => {
        repairCommission += (rep.laborCharge * emp.commissionRules.repairCommissionPercent) / 100;
      });
    }

    const totalSalesRevenue = empInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
    const targetAchievedPercent = Math.min(100, Math.round((totalSalesRevenue / (emp.monthlySalesTarget || 1)) * 100));

    return {
      phoneCommission,
      accessoryCommission,
      repairCommission,
      totalCommission: Math.round(phoneCommission + accessoryCommission + repairCommission),
      totalSalesRevenue,
      targetAchievedPercent
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BadgePercent className="w-6 h-6 text-emerald-600" />
            Staff Roster, Sales Targets & Commission Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent commission calculation per sold phone IMEI, accessory margin %, and service labor charges
          </p>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => {
          const stats = calculateCommission(emp);
          const branch = branches.find(b => b.id === emp.branchId);

          return (
            <div
              key={emp.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{emp.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    {emp.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                  <p>Branch: <strong className="text-slate-800 dark:text-slate-200">{branch?.name}</strong></p>
                  <p>Mobile: <span className="font-mono text-slate-800 dark:text-slate-200">+91 {emp.mobile}</span></p>
                  <p>Joined: {formatIndianDate(emp.joiningDate)}</p>
                </div>

                {/* Sales Target Progress */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Monthly Sales Progress:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(stats.totalSalesRevenue)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${stats.targetAchievedPercent}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Target: {formatINR(emp.monthlySalesTarget)}</span>
                    <span className="font-bold text-emerald-600">{stats.targetAchievedPercent}% Achieved</span>
                  </div>
                </div>

                {/* Commission Breakdown */}
                <div className="mt-3 p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    Calculated Commission Earned
                  </span>
                  
                  <div className="flex justify-between text-emerald-900 dark:text-emerald-200">
                    <span>Phones (₹{emp.commissionRules.phoneFixedCommission}/unit):</span>
                    <span className="font-mono font-bold">{formatINR(stats.phoneCommission)}</span>
                  </div>

                  <div className="flex justify-between text-emerald-900 dark:text-emerald-200">
                    <span>Accessories ({emp.commissionRules.accessoryCommissionPercent}%):</span>
                    <span className="font-mono font-bold">{formatINR(stats.accessoryCommission)}</span>
                  </div>

                  {emp.role === 'Repair Technician' && (
                    <div className="flex justify-between text-emerald-900 dark:text-emerald-200">
                      <span>Repair Labor ({emp.commissionRules.repairCommissionPercent}%):</span>
                      <span className="font-mono font-bold">{formatINR(stats.repairCommission)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-950 dark:text-emerald-100 font-extrabold pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span>Total Incentive Due:</span>
                    <span className="font-mono text-sm font-black">{formatINR(stats.totalCommission)}</span>
                  </div>
                </div>
              </div>

              {/* Base Salary */}
              <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Base Salary:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatINR(emp.salary)} / mo</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
