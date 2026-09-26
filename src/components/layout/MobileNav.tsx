import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Smartphone, 
  Wrench, 
  Menu, 
  X,
  Users,
  Headphones,
  RefreshCw,
  PackagePlus,
  Truck,
  Receipt,
  BadgePercent,
  BarChart3,
  Sparkles,
  Building2,
  Settings
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';

interface MobileNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { language, repairJobs } = useApp();
  const t = translations[language];

  const pendingRepairsCount = repairJobs.filter(j => j.status !== 'Delivered').length;

  const moreItems = [
    { id: 'accessories', label: t.accessories, icon: Headphones },
    { id: 'crm', label: t.crm, icon: Users },
    { id: 'buyback', label: t.buyback, icon: RefreshCw },
    { id: 'purchases', label: t.purchases, icon: PackagePlus },
    { id: 'suppliers', label: t.suppliers, icon: Truck },
    { id: 'expenses', label: t.expenses, icon: Receipt },
    { id: 'employees', label: t.employees, icon: BadgePercent },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'ai', label: t.aiAssistant, icon: Sparkles },
    { id: 'branches', label: t.branches, icon: Building2 },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <>
      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentView === 'dashboard' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>{t.dashboard}</span>
        </button>

        <button
          onClick={() => onNavigate('pos')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium transition-colors relative ${
            currentView === 'pos' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-brand-600 text-white flex items-center justify-center -mt-4 shadow-md shadow-brand-600/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <span>POS</span>
        </button>

        <button
          onClick={() => onNavigate('phones')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium transition-colors ${
            currentView === 'phones' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span>{t.phones}</span>
        </button>

        <button
          onClick={() => onNavigate('repairs')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium transition-colors relative ${
            currentView === 'repairs' ? 'text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span>{t.repairs}</span>
          {pendingRepairsCount > 0 && (
            <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          onClick={() => setShowMoreMenu(true)}
          className="flex flex-col items-center gap-1 p-1.5 rounded-xl text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </nav>

      {/* Full Screen Slide-over Drawer for More Items */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full p-5 overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Business Modules</h3>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 py-4">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center text-center gap-2 border transition-all ${
                      isActive 
                        ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/60 dark:border-brand-500 dark:text-brand-300 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                    <span className="text-xs leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
