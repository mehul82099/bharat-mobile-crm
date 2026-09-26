import React, { useState } from 'react';
import { 
  Building2, 
  Moon, 
  Sun, 
  Languages, 
  Bell, 
  UserCircle2, 
  ChevronDown, 
  Plus, 
  Smartphone, 
  Wrench, 
  ShoppingCart,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';
import { translations } from '../../utils/translations';
import { formatIndianDate } from '../../utils/formatters';

interface HeaderProps {
  onNavigate: (view: string) => void;
  onOpenQuickSale?: () => void;
  onOpenAddPhone?: () => void;
  onOpenNewRepair?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNavigate,
  onOpenQuickSale,
  onOpenAddPhone,
  onOpenNewRepair
}) => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    branches, 
    activeBranchId, 
    setActiveBranchId,
    theme, 
    setTheme, 
    language, 
    setLanguage,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    settings
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const t = translations[language];
  const unreadCount = notifications.filter(n => !n.read).length;

  const rolesList: { role: Role; label: string; desc: string }[] = [
    { role: 'Owner', label: 'Owner / Super Admin', desc: 'Full access to all financials, reports, branches & settings' },
    { role: 'Shop Manager', label: 'Shop Manager', desc: 'Manage stock, daily sales, repairs, approvals & customers' },
    { role: 'Sales Employee', label: 'Sales Employee', desc: 'POS billing, customer inquiries, quotes & commission tracking' },
    { role: 'Accountant', label: 'Accountant', desc: 'Financial ledgers, expenses, supplier dues, GST & Khata' },
    { role: 'Inventory Manager', label: 'Inventory Manager', desc: 'IMEI management, stock adjustments & branch transfers' },
    { role: 'Repair Technician', label: 'Repair Technician', desc: 'Service center job sheets, repair status & parts intake' },
  ];

  const handleRoleSwitch = (newRole: Role) => {
    const userForRole = users.find(u => u.role === newRole) || {
      id: `u-${newRole.toLowerCase()}`,
      name: `${newRole} User`,
      email: `${newRole.toLowerCase()}@bharatmobile.in`,
      mobile: '9811000000',
      role: newRole,
      branchId: branches[0]?.id || 'branch-1'
    };
    setCurrentUser(userForRole);
    setShowRoleMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Branch Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-white dark:bg-slate-900">{t.allBranches} (Consolidated)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">GST Ready</span>
          </div>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Actions Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all shadow-sm shadow-brand-600/30"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {showQuickMenu && (
              <div 
                className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowQuickMenu(false)}
              >
                <button
                  onClick={() => { onNavigate('pos'); onOpenQuickSale?.(); }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5"
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  New POS Sale (Bill)
                </button>
                <button
                  onClick={() => { onNavigate('phones'); onOpenAddPhone?.(); }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5"
                >
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  Add Phone Stock (IMEI)
                </button>
                <button
                  onClick={() => { onNavigate('repairs'); onOpenNewRepair?.(); }}
                  className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2.5"
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  New Repair Job Sheet
                </button>
              </div>
            )}
          </div>

          {/* Language Toggle (English / हिंदी) */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Language (English / हिंदी)"
          >
            <Languages className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-100 dark:bg-red-950 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-slate-400">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link) onNavigate(n.link);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${!n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          <span className="text-[10px] text-slate-400">
                            {formatIndianDate(n.timestamp)}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold leading-tight mt-0.5">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active User Profile</p>
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{currentUser.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
                </div>

                <div className="px-3 py-1.5">
                  <p className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Switch Role (RBAC Demo)</p>
                </div>

                <div className="space-y-1">
                  {rolesList.map(({ role, label, desc }) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${currentUser.role === role ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-200 font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'}`}
                    >
                      <div className="pt-0.5">
                        {currentUser.role === role ? (
                          <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                        )}
                      </div>
                      <div>
                        <p className="leading-tight font-medium">{label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
