import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './components/views/DashboardView';
import { PosView } from './components/views/PosView';
import { PhoneInventoryView } from './components/views/PhoneInventoryView';
import { AccessoriesInventoryView } from './components/views/AccessoriesInventoryView';
import { CrmView } from './components/views/CrmView';
import { RepairView } from './components/views/RepairView';
import { BuybackView } from './components/views/BuybackView';
import { PurchasesView } from './components/views/PurchasesView';
import { SuppliersView } from './components/views/SuppliersView';
import { ExpensesView } from './components/views/ExpensesView';
import { EmployeesView } from './components/views/EmployeesView';
import { ReportsView } from './components/views/ReportsView';
import { AiAssistantView } from './components/views/AiAssistantView';
import { BranchesView } from './components/views/BranchesView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
      case 'pos':
        return <PosView />;
      case 'phones':
        return <PhoneInventoryView />;
      case 'accessories':
        return <AccessoriesInventoryView />;
      case 'crm':
        return <CrmView />;
      case 'repairs':
        return <RepairView />;
      case 'buyback':
        return <BuybackView />;
      case 'purchases':
        return <PurchasesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'expenses':
        return <ExpensesView />;
      case 'employees':
        return <EmployeesView />;
      case 'reports':
        return <ReportsView />;
      case 'ai':
        return <AiAssistantView />;
      case 'branches':
        return <BranchesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onNavigate={setCurrentView} 
          onOpenQuickSale={() => setCurrentView('pos')}
          onOpenAddPhone={() => setCurrentView('phones')}
          onOpenNewRepair={() => setCurrentView('repairs')}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav currentView={currentView} onNavigate={setCurrentView} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
