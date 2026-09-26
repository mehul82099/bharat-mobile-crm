import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Branch, 
  MobilePhone, 
  MobileAccessory, 
  Customer, 
  Invoice, 
  Supplier, 
  PurchaseBill, 
  RepairJob, 
  BuybackRecord, 
  Expense, 
  Employee, 
  FollowUp, 
  AppNotification, 
  BusinessSettings,
  ActivityLog,
  PaymentMethod
} from '../types';

import { 
  initialBranches, 
  initialUsers, 
  initialEmployees, 
  initialSuppliers, 
  initialPhones, 
  initialAccessories, 
  initialCustomers, 
  initialInvoices, 
  initialRepairJobs, 
  initialBuybacks, 
  initialExpenses, 
  initialFollowUps, 
  initialPurchases, 
  initialNotifications, 
  initialSettings 
} from '../data/initialData';

import { Language } from '../utils/translations';
import confetti from 'canvas-confetti';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  branches: Branch[];
  activeBranchId: string;
  setActiveBranchId: (id: string) => void;
  users: User[];
  employees: Employee[];
  phones: MobilePhone[];
  accessories: MobileAccessory[];
  customers: Customer[];
  invoices: Invoice[];
  suppliers: Supplier[];
  purchases: PurchaseBill[];
  repairJobs: RepairJob[];
  buybacks: BuybackRecord[];
  expenses: Expense[];
  followUps: FollowUp[];
  notifications: AppNotification[];
  settings: BusinessSettings;
  activityLogs: ActivityLog[];
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  language: Language;
  setLanguage: (l: Language) => void;

  // Actions
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  addPhone: (phone: Omit<MobilePhone, 'id'>) => string;
  updatePhone: (id: string, updates: Partial<MobilePhone>) => void;
  deletePhone: (id: string) => void;
  
  addAccessory: (acc: Omit<MobileAccessory, 'id'>) => void;
  updateAccessory: (id: string, updates: Partial<MobileAccessory>) => void;
  deleteAccessory: (id: string) => void;

  addCustomer: (cust: Omit<Customer, 'id' | 'registeredDate' | 'loyaltyPoints' | 'outstandingBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  recordCustomerPayment: (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  createInvoice: (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  cancelInvoice: (id: string, reason: string) => void;

  addSupplier: (sup: Omit<Supplier, 'id' | 'currentOutstanding'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;

  createPurchase: (purchaseData: Omit<PurchaseBill, 'id'>, newPhones?: Omit<MobilePhone, 'id'>[]) => void;

  createRepairJob: (job: Omit<RepairJob, 'id' | 'jobId'>) => RepairJob;
  updateRepairJob: (id: string, updates: Partial<RepairJob>) => void;

  createBuyback: (buyback: Omit<BuybackRecord, 'id' | 'receiptNumber'>) => BuybackRecord;

  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addFollowUp: (fu: Omit<FollowUp, 'id'>) => void;
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;

  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  transferStock: (fromBranchId: string, toBranchId: string, items: { type: 'phone' | 'accessory'; id: string; name: string; imei?: string; qty: number }[]) => void;

  exportDatabase: () => string;
  importDatabase: (json: string) => boolean;
  resetDatabaseToDefaults: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'bharat_mobile_crm_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  };

  const [branches, setBranches] = useState<Branch[]>(() => loadStored('branches', initialBranches));
  const [users, setUsers] = useState<User[]>(() => loadStored('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => loadStored('currentUser', initialUsers[0]));
  const [activeBranchId, setActiveBranchId] = useState<string>(() => loadStored('activeBranchId', 'all'));
  const [employees, setEmployees] = useState<Employee[]>(() => loadStored('employees', initialEmployees));
  const [phones, setPhones] = useState<MobilePhone[]>(() => loadStored('phones', initialPhones));
  const [accessories, setAccessories] = useState<MobileAccessory[]>(() => loadStored('accessories', initialAccessories));
  const [customers, setCustomers] = useState<Customer[]>(() => loadStored('customers', initialCustomers));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStored('invoices', initialInvoices));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadStored('suppliers', initialSuppliers));
  const [purchases, setPurchases] = useState<PurchaseBill[]>(() => loadStored('purchases', initialPurchases));
  const [repairJobs, setRepairJobs] = useState<RepairJob[]>(() => loadStored('repairJobs', initialRepairJobs));
  const [buybacks, setBuybacks] = useState<BuybackRecord[]>(() => loadStored('buybacks', initialBuybacks));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadStored('expenses', initialExpenses));
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => loadStored('followUps', initialFollowUps));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored('notifications', initialNotifications));
  const [settings, setSettings] = useState<BusinessSettings>(() => loadStored('settings', initialSettings));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => loadStored('activityLogs', []));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadStored('theme', 'light'));
  const [language, setLanguage] = useState<Language>(() => loadStored('language', 'en'));

  // Sync to localStorage
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_branches`, JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_activeBranchId`, JSON.stringify(activeBranchId)); }, [activeBranchId]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_phones`, JSON.stringify(phones)); }, [phones]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_accessories`, JSON.stringify(accessories)); }, [accessories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_invoices`, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_purchases`, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_repairJobs`, JSON.stringify(repairJobs)); }, [repairJobs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_buybacks`, JSON.stringify(buybacks)); }, [buybacks]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_followUps`, JSON.stringify(followUps)); }, [followUps]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_activityLogs`, JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_theme`, JSON.stringify(theme)); }, [theme]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_language`, JSON.stringify(language)); }, [language]);

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const logActivity = (action: string, module: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      details,
      branchId: currentUser.branchId
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 199)]);
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('UPDATE_SETTINGS', 'Settings', 'Updated business settings');
  };

  // --- Phone Inventory Actions ---
  const addPhone = (phoneData: Omit<MobilePhone, 'id'>): string => {
    // Check for duplicate IMEI
    const exists = phones.some(p => p.imei1 === phoneData.imei1 || (phoneData.imei2 && p.imei2 === phoneData.imei2));
    if (exists) {
      throw new Error(`A phone with IMEI ${phoneData.imei1} already exists in the system.`);
    }

    const id = `ph-${Date.now()}`;
    const newPhone: MobilePhone = { ...phoneData, id };
    setPhones(prev => [newPhone, ...prev]);
    logActivity('ADD_PHONE', 'Inventory', `Added ${newPhone.brand} ${newPhone.modelName} (IMEI: ${newPhone.imei1})`);
    return id;
  };

  const updatePhone = (id: string, updates: Partial<MobilePhone>) => {
    setPhones(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    logActivity('UPDATE_PHONE', 'Inventory', `Updated phone ID: ${id}`);
  };

  const deletePhone = (id: string) => {
    const phone = phones.find(p => p.id === id);
    setPhones(prev => prev.filter(p => p.id !== id));
    logActivity('DELETE_PHONE', 'Inventory', `Deleted phone: ${phone?.modelName || id}`);
  };

  // --- Accessories Actions ---
  const addAccessory = (accData: Omit<MobileAccessory, 'id'>) => {
    const id = `acc-${Date.now()}`;
    const newAcc: MobileAccessory = { ...accData, id };
    setAccessories(prev => [newAcc, ...prev]);
    logActivity('ADD_ACCESSORY', 'Accessories', `Added accessory: ${newAcc.name} (SKU: ${newAcc.sku})`);
  };

  const updateAccessory = (id: string, updates: Partial<MobileAccessory>) => {
    setAccessories(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    logActivity('UPDATE_ACCESSORY', 'Accessories', `Updated accessory ID: ${id}`);
  };

  const deleteAccessory = (id: string) => {
    const acc = accessories.find(a => a.id === id);
    setAccessories(prev => prev.filter(a => a.id !== id));
    logActivity('DELETE_ACCESSORY', 'Accessories', `Deleted accessory: ${acc?.name || id}`);
  };

  // --- Customer Actions ---
  const addCustomer = (custData: Omit<Customer, 'id' | 'registeredDate' | 'loyaltyPoints' | 'outstandingBalance'>): Customer => {
    const id = `cust-${Date.now()}`;
    const newCust: Customer = {
      ...custData,
      id,
      registeredDate: new Date().toISOString().split('T')[0],
      loyaltyPoints: 10, // 10 welcome points
      outstandingBalance: 0,
    };
    setCustomers(prev => [newCust, ...prev]);
    logActivity('ADD_CUSTOMER', 'CRM', `Registered customer: ${newCust.name} (${newCust.mobile})`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    logActivity('UPDATE_CUSTOMER', 'CRM', `Updated customer ID: ${id}`);
  };

  const recordCustomerPayment = (customerId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const newBal = Math.max(0, c.outstandingBalance - amount);
        return { ...c, outstandingBalance: newBal };
      }
      return c;
    }));

    const customer = customers.find(c => c.id === customerId);
    logActivity('CUSTOMER_PAYMENT', 'Khata', `Received ₹${amount} from ${customer?.name} via ${paymentMethod}. Note: ${notes || '-'}`);

    // Create notification
    setNotifications(prev => [{
      id: `notif-${Date.now()}`,
      title: 'Payment Received',
      message: `Received ₹${amount} from ${customer?.name} via ${paymentMethod}`,
      category: 'payment',
      timestamp: new Date().toISOString(),
      read: false,
      link: 'crm'
    }, ...prev]);
  };

  // --- POS / Invoice Actions ---
  const createInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const branch = branches.find(b => b.id === invData.branchId) || branches[0];
    const seq = invoices.length + 191;
    const invoiceNumber = `${branch.invoicePrefix}2026-${String(seq).padStart(4, '0')}`;
    const id = `inv-${Date.now()}`;

    const newInvoice: Invoice = {
      ...invData,
      id,
      invoiceNumber,
    };

    // 1. Mark Phones as Sold
    invData.items.forEach(item => {
      if (item.type === 'phone') {
        setPhones(prev => prev.map(p => {
          if (p.imei1 === item.identifier || p.id === item.id) {
            return {
              ...p,
              status: 'Sold',
              soldInvoiceId: id,
              soldDate: invData.date,
              soldPrice: item.unitPrice - item.discount,
            };
          }
          return p;
        }));
      } else if (item.type === 'accessory') {
        // 2. Deduct Accessory Stock
        setAccessories(prev => prev.map(a => {
          if (a.id === item.id || a.sku === item.identifier) {
            const newStock = Math.max(0, a.currentStock - item.qty);
            // Low stock alert check
            if (newStock <= a.minStockLevel) {
              setNotifications(nPrev => [{
                id: `notif-${Date.now()}-${a.id}`,
                title: 'Low Stock Alert',
                message: `${a.name} is low on stock (${newStock} remaining). Reorder recommended.`,
                category: 'stock',
                timestamp: new Date().toISOString(),
                read: false,
                link: 'accessories'
              }, ...nPrev]);
            }
            return { ...a, currentStock: newStock };
          }
          return a;
        }));
      }
    });

    // 3. Update Customer Khata & Loyalty points
    if (invData.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === invData.customerId) {
          const addedKhata = invData.balanceDue;
          const pointsEarned = Math.floor(invData.grandTotal / 200); // 1 point per ₹200
          return {
            ...c,
            outstandingBalance: c.outstandingBalance + addedKhata,
            loyaltyPoints: c.loyaltyPoints + pointsEarned
          };
        }
        return c;
      }));
    }

    setInvoices(prev => [newInvoice, ...prev]);
    logActivity('CREATE_INVOICE', 'POS', `Generated invoice ${invoiceNumber} for ₹${invData.grandTotal} (${invData.customerName})`);

    // Confetti effect for celebrating sale
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // ignore
    }

    return newInvoice;
  };

  const cancelInvoice = (id: string, reason: string) => {
    const inv = invoices.find(i => i.id === id);
    if (!inv) return;

    // Restore phones to Available
    inv.items.forEach(item => {
      if (item.type === 'phone') {
        setPhones(prev => prev.map(p => {
          if (p.soldInvoiceId === id || p.imei1 === item.identifier) {
            return { ...p, status: 'Available', soldInvoiceId: undefined, soldDate: undefined, soldPrice: undefined };
          }
          return p;
        }));
      } else if (item.type === 'accessory') {
        setAccessories(prev => prev.map(a => {
          if (a.id === item.id || a.sku === item.identifier) {
            return { ...a, currentStock: a.currentStock + item.qty };
          }
          return a;
        }));
      }
    });

    // Reverse customer balance
    if (inv.customerId && inv.balanceDue > 0) {
      setCustomers(prev => prev.map(c => {
        if (c.id === inv.customerId) {
          return { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - inv.balanceDue) };
        }
        return c;
      }));
    }

    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'Cancelled', notes: `${i.notes || ''} [CANCELLED: ${reason}]` } : i));
    logActivity('CANCEL_INVOICE', 'POS', `Cancelled invoice ${inv.invoiceNumber}. Reason: ${reason}`);
  };

  // --- Supplier & Purchases ---
  const addSupplier = (supData: Omit<Supplier, 'id' | 'currentOutstanding'>) => {
    const id = `sup-${Date.now()}`;
    const newSup: Supplier = { ...supData, id, currentOutstanding: supData.openingBalance || 0 };
    setSuppliers(prev => [newSup, ...prev]);
    logActivity('ADD_SUPPLIER', 'Suppliers', `Added supplier ${newSup.name} (${newSup.companyName})`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    logActivity('UPDATE_SUPPLIER', 'Suppliers', `Updated supplier ID: ${id}`);
  };

  const recordSupplierPayment = (supplierId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, currentOutstanding: Math.max(0, s.currentOutstanding - amount) };
      }
      return s;
    }));
    const sup = suppliers.find(s => s.id === supplierId);
    logActivity('SUPPLIER_PAYMENT', 'Suppliers', `Paid ₹${amount} to ${sup?.name} via ${paymentMethod}. Note: ${notes || '-'}`);
  };

  const createPurchase = (purchaseData: Omit<PurchaseBill, 'id'>, newPhones?: Omit<MobilePhone, 'id'>[]) => {
    const id = `pur-${Date.now()}`;
    const newPurchase: PurchaseBill = { ...purchaseData, id };

    // Update supplier outstanding balance
    setSuppliers(prev => prev.map(s => {
      if (s.id === purchaseData.supplierId) {
        return { ...s, currentOutstanding: s.currentOutstanding + purchaseData.balanceDue };
      }
      return s;
    }));

    // Add new serialized phones to inventory if provided
    if (newPhones && newPhones.length > 0) {
      newPhones.forEach(phone => {
        addPhone(phone);
      });
    }

    setPurchases(prev => [newPurchase, ...prev]);
    logActivity('CREATE_PURCHASE', 'Purchases', `Recorded purchase bill ${purchaseData.billNumber} from ${purchaseData.supplierName} for ₹${purchaseData.totalAmount}`);
  };

  // --- Repair Jobs ---
  const createRepairJob = (jobData: Omit<RepairJob, 'id' | 'jobId'>): RepairJob => {
    const seq = repairJobs.length + 37;
    const jobId = `REP-2026-${String(seq).padStart(4, '0')}`;
    const id = `rep-${Date.now()}`;
    const newJob: RepairJob = { ...jobData, id, jobId };

    setRepairJobs(prev => [newJob, ...prev]);
    logActivity('CREATE_REPAIR', 'Service', `Created repair ticket ${jobId} for ${jobData.customerName} (${jobData.deviceBrand} ${jobData.deviceModel})`);

    // Add follow-up for pickup
    addFollowUp({
      customerId: jobData.customerId,
      customerName: jobData.customerName,
      customerMobile: jobData.customerMobile,
      type: 'Repair Pickup',
      dueDate: jobData.expectedDeliveryDate,
      priority: 'High',
      assignedEmployeeId: jobData.technicianId,
      assignedEmployeeName: jobData.technicianName,
      notes: `Repair job ${jobId} scheduled for completion on ${jobData.expectedDeliveryDate}`,
      status: 'Pending'
    });

    return newJob;
  };

  const updateRepairJob = (id: string, updates: Partial<RepairJob>) => {
    setRepairJobs(prev => prev.map(j => {
      if (j.id === id) {
        const updated = { ...j, ...updates };
        if (updates.status === 'Ready for Pickup' && j.status !== 'Ready for Pickup') {
          // Notify customer
          setNotifications(nPrev => [{
            id: `notif-${Date.now()}`,
            title: 'Repair Ready for Delivery',
            message: `${updated.deviceBrand} ${updated.deviceModel} (Job ${updated.jobId}) is ready for pickup by ${updated.customerName}.`,
            category: 'repair',
            timestamp: new Date().toISOString(),
            read: false,
            link: 'repairs'
          }, ...nPrev]);
        }
        return updated;
      }
      return j;
    }));
    logActivity('UPDATE_REPAIR', 'Service', `Updated repair job ID: ${id}`);
  };

  // --- Old Phone Buyback / Exchange ---
  const createBuyback = (bbData: Omit<BuybackRecord, 'id' | 'receiptNumber'>): BuybackRecord => {
    const seq = buybacks.length + 13;
    const receiptNumber = `BB-2026-${String(seq).padStart(4, '0')}`;
    const id = `bb-${Date.now()}`;
    const newRecord: BuybackRecord = { ...bbData, id, receiptNumber };

    // Also automatically add to phones inventory as 'Second Hand'
    const newPhone: MobilePhone = {
      id: `ph-${Date.now()}`,
      name: `${bbData.brand} ${bbData.model} (Exchange Trade-in)`,
      brand: bbData.brand,
      modelName: bbData.model,
      modelNumber: 'SEC-HAND',
      ram: '4 GB',
      storage: bbData.storage,
      color: 'Assorted',
      imei1: bbData.imei,
      barcode: `BB${bbData.imei.slice(-6)}`,
      purchasePrice: bbData.buybackPrice,
      sellingPrice: bbData.resalePrice,
      minSellingPrice: bbData.buybackPrice + 1000,
      mrp: bbData.estimatedMarketValue,
      supplierId: 'customer-buyback',
      purchaseDate: bbData.date,
      warrantyMonths: 1,
      condition: 'Second Hand',
      status: 'Available',
      branchId: bbData.branchId,
      notes: `Trade-in from ${bbData.customerName}. Grade: ${bbData.conditionGrade}. Receipt: ${receiptNumber}`
    };

    setPhones(prev => [newPhone, ...prev]);
    setBuybacks(prev => [newRecord, ...prev]);
    logActivity('CREATE_BUYBACK', 'Exchange', `Recorded trade-in ${receiptNumber} for ${bbData.brand} ${bbData.model} (Valued: ₹${bbData.buybackPrice})`);
    return newRecord;
  };

  // --- Expenses ---
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    const newExpense: Expense = { ...expData, id };
    setExpenses(prev => [newExpense, ...prev]);
    logActivity('ADD_EXPENSE', 'Expenses', `Recorded expense: ${expData.title} (₹${expData.amount})`);
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    logActivity('DELETE_EXPENSE', 'Expenses', `Deleted expense: ${exp?.title || id}`);
  };

  // --- Follow Ups ---
  const addFollowUp = (fuData: Omit<FollowUp, 'id'>) => {
    const id = `fu-${Date.now()}`;
    const newFu: FollowUp = { ...fuData, id };
    setFollowUps(prev => [newFu, ...prev]);
    logActivity('ADD_FOLLOWUP', 'CRM', `Created follow-up for ${fuData.customerName} on ${fuData.dueDate}`);
  };

  const updateFollowUp = (id: string, updates: Partial<FollowUp>) => {
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  // --- Notifications ---
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // --- Stock Transfer ---
  const transferStock = (
    fromBranchId: string, 
    toBranchId: string, 
    items: { type: 'phone' | 'accessory'; id: string; name: string; imei?: string; qty: number }[]
  ) => {
    items.forEach(item => {
      if (item.type === 'phone') {
        setPhones(prev => prev.map(p => p.id === item.id ? { ...p, branchId: toBranchId } : p));
      } else {
        // deduct from fromBranchId, add to toBranchId
        setAccessories(prev => prev.map(a => {
          if (a.id === item.id) {
            return { ...a, branchId: toBranchId };
          }
          return a;
        }));
      }
    });

    const fromB = branches.find(b => b.id === fromBranchId)?.name || fromBranchId;
    const toB = branches.find(b => b.id === toBranchId)?.name || toBranchId;
    logActivity('STOCK_TRANSFER', 'Inventory', `Transferred ${items.length} items from ${fromB} to ${toB}`);
  };

  // --- Database Export / Import / Reset ---
  const exportDatabase = (): string => {
    const payload = {
      branches,
      users,
      employees,
      phones,
      accessories,
      customers,
      invoices,
      suppliers,
      purchases,
      repairJobs,
      buybacks,
      expenses,
      followUps,
      settings,
      activityLogs,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDatabase = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.phones) setPhones(data.phones);
      if (data.accessories) setAccessories(data.accessories);
      if (data.customers) setCustomers(data.customers);
      if (data.invoices) setInvoices(data.invoices);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.purchases) setPurchases(data.purchases);
      if (data.repairJobs) setRepairJobs(data.repairJobs);
      if (data.buybacks) setBuybacks(data.buybacks);
      if (data.expenses) setExpenses(data.expenses);
      if (data.followUps) setFollowUps(data.followUps);
      if (data.settings) setSettings(data.settings);
      logActivity('DATABASE_RESTORE', 'System', 'Imported data from JSON backup file');
      return true;
    } catch {
      return false;
    }
  };

  const resetDatabaseToDefaults = () => {
    setBranches(initialBranches);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setEmployees(initialEmployees);
    setPhones(initialPhones);
    setAccessories(initialAccessories);
    setCustomers(initialCustomers);
    setInvoices(initialInvoices);
    setSuppliers(initialSuppliers);
    setPurchases(initialPurchases);
    setRepairJobs(initialRepairJobs);
    setBuybacks(initialBuybacks);
    setExpenses(initialExpenses);
    setFollowUps(initialFollowUps);
    setNotifications(initialNotifications);
    setSettings(initialSettings);
    setActivityLogs([]);
    localStorage.clear();
    logActivity('DATABASE_RESET', 'System', 'Reset all system data to initial factory state');
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      branches,
      activeBranchId,
      setActiveBranchId,
      users,
      employees,
      phones,
      accessories,
      customers,
      invoices,
      suppliers,
      purchases,
      repairJobs,
      buybacks,
      expenses,
      followUps,
      notifications,
      settings,
      activityLogs,
      theme,
      setTheme,
      language,
      setLanguage,

      updateSettings,
      addPhone,
      updatePhone,
      deletePhone,
      addAccessory,
      updateAccessory,
      deleteAccessory,
      addCustomer,
      updateCustomer,
      recordCustomerPayment,
      createInvoice,
      cancelInvoice,
      addSupplier,
      updateSupplier,
      recordSupplierPayment,
      createPurchase,
      createRepairJob,
      updateRepairJob,
      createBuyback,
      addExpense,
      deleteExpense,
      addFollowUp,
      updateFollowUp,
      markNotificationRead,
      clearAllNotifications,
      transferStock,
      exportDatabase,
      importDatabase,
      resetDatabaseToDefaults,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
