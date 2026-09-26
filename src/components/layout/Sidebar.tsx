import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Smartphone, 
  Headphones, 
  Users, 
  Wrench, 
  RefreshCw, 
  PackagePlus, 
  Truck, 
  Receipt, 
  BadgePercent, 
  BarChart3, 
  Sparkles, 
  Building2, 
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Role } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, language, repairJobs, accessories, customers, settings } = useApp();
  const t = translations[language];

  // Badges
  const pendingRepairsCount = repairJobs.filter(j => j.status !== 'Delivered').length;
  const lowStockCount = accessories.filter(a => a.currentStock <= a.minStockLevel).length;
  const overdueKhataCount = customers.filter(c => c.outstandingBalance > 0).length;

  const role = currentUser.role;

  // Determine module visibility based on RBAC
  const canAccess = (module: string): boolean => {
    if (role === 'Owner' || role === 'Shop Manager') return true;

    switch (module) {
      case 'dashboard':
        return true;
      case 'pos':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Accountant'].includes(role);
      case 'phones':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Inventory Manager', 'Repair Technician'].includes(role);
      case 'accessories':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Inventory Manager', 'Repair Technician'].includes(role);
      case 'crm':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Accountant'].includes(role);
      case 'repairs':
        return ['Owner', 'Shop Manager', 'Repair Technician', 'Sales Employee'].includes(role);
      case 'buyback':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Inventory Manager'].includes(role);
      case 'purchases':
        return ['Owner', 'Shop Manager', 'Accountant', 'Inventory Manager'].includes(role);
      case 'suppliers':
        return ['Owner', 'Shop Manager', 'Accountant', 'Inventory Manager'].includes(role);
      case 'expenses':
        return ['Owner', 'Shop Manager', 'Accountant'].includes(role);
      case 'employees':
        return ['Owner', 'Shop Manager', 'Sales Employee', 'Accountant'].includes(role);
      case 'reports':
        return ['Owner', 'Shop Manager', 'Accountant'].includes(role);
      case 'ai':
        return true;
      case 'branches':
        return ['Owner', 'Shop Manager', 'Inventory Manager'].includes(role);
      case 'settings':
        return ['Owner', 'Shop Manager'].includes(role);
      default:
        return false;
    }
  };

  const navItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, badge: null },
    { id: 'pos', label: t.posBilling, icon: ShoppingCart, badge: 'POS' },
    { id: 'phones', label: t.phones, icon: Smartphone, badge: null },
    { id: 'accessories', label: t.accessories, icon: Headphones, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-500' },
    { id: 'crm', label: t.crm, icon: Users, badge: overdueKhataCount > 0 ? overdueKhataCount : null, badgeColor: 'bg-blue-500' },
    { id: 'repairs', label: t.repairs, icon: Wrench, badge: pendingRepairsCount > 0 ? pendingRepairsCount : null, badgeColor: 'bg-red-500' },
    { id: 'buyback', label: t.buyback, icon: RefreshCw, badge: null },
    { id: 'purchases', label: t.purchases, icon: PackagePlus, badge: null },
    { id: 'suppliers', label: t.suppliers, icon: Truck, badge: null },
    { id: 'expenses', label: t.expenses, icon: Receipt, badge: null },
    { id: 'employees', label: t.employees, icon: BadgePercent, badge: null },
    { id: 'reports', label: t.reports, icon: BarChart3, badge: null },
    { id: 'ai', label: t.aiAssistant, icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-600' },
    { id: 'branches', label: t.branches, icon: Building2, badge: null },
    { id: 'settings', label: t.settings, icon: SettingsIcon, badge: null },
  ];

  return (
    <aside 
      className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Name */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30 shrink-0 font-black text-sm">
              BM
            </div>
            <div className="truncate">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white block leading-none">
                {settings.shopName}
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Mobile CRM & ERP
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md font-black text-sm">
            BM
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navItems.map(item => {
          if (!canAccess(item.id)) return null;

          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                isActive 
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
              
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}

              {/* Badge */}
              {item.badge !== null && !collapsed && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white leading-none ${
                  isActive ? 'bg-white/30 text-white' : item.badgeColor || 'bg-brand-500'
                }`}>
                  {item.badge}
                </span>
              )}

              {/* Dot indicator if collapsed and has badge */}
              {item.badge !== null && collapsed && (
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-brand-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Role Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="truncate">
              <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{currentUser.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`${currentUser.name} (${currentUser.role})`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
        )}
      </div>
    </aside>
  );
};
