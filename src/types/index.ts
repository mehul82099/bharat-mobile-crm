export type Role = 
  | 'Owner' 
  | 'Shop Manager' 
  | 'Sales Employee' 
  | 'Accountant' 
  | 'Inventory Manager' 
  | 'Repair Technician';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  branchId: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  gstin: string;
  invoicePrefix: string;
  isMain: boolean;
}

export type PhoneCondition = 'New' | 'Open Box' | 'Refurbished' | 'Second Hand';
export type PhoneStatus = 'Available' | 'Reserved' | 'Sold' | 'Returned' | 'Under Repair';

export interface MobilePhone {
  id: string;
  name: string;
  brand: string;
  modelName: string;
  modelNumber: string;
  ram: string;
  storage: string;
  color: string;
  imei1: string;
  imei2?: string;
  serialNumber?: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  minSellingPrice: number;
  mrp: number;
  supplierId: string;
  purchaseDate: string;
  warrantyMonths: number;
  condition: PhoneCondition;
  status: PhoneStatus;
  branchId: string;
  image?: string;
  notes?: string;
  soldInvoiceId?: string;
  soldDate?: string;
  soldPrice?: number;
}

export type AccessoryCategory = 
  | 'Tempered Glass'
  | 'Mobile Covers'
  | 'Chargers'
  | 'Charging Cables'
  | 'Earphones & Headphones'
  | 'Neckbands'
  | 'Bluetooth Speakers'
  | 'Power Banks'
  | 'Smartwatches'
  | 'Memory Cards & Pen Drives'
  | 'Adapters & OTG'
  | 'Other Accessories';

export interface MobileAccessory {
  id: string;
  name: string;
  brand: string;
  sku: string;
  barcode: string;
  category: AccessoryCategory;
  compatibleModels: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  currentStock: number;
  minStockLevel: number;
  supplierId: string;
  branchId: string;
  warrantyMonths: number;
  description: string;
  image?: string;
}

export type CustomerType = 'Retail' | 'Wholesale' | 'Corporate';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  city: string;
  address?: string;
  type: CustomerType;
  registeredDate: string;
  notes?: string;
  loyaltyPoints: number;
  creditLimit: number;
  outstandingBalance: number;
  preferredBrands: string[];
  gstin?: string;
}

export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Debit Card' 
  | 'Credit Card' 
  | 'Bank Transfer' 
  | 'EMI' 
  | 'Customer Credit' 
  | 'Split';

export interface InvoiceItem {
  id: string;
  type: 'phone' | 'accessory' | 'repair' | 'buyback';
  name: string;
  identifier: string; // IMEI or SKU
  qty: number;
  unitPrice: number;
  purchaseCost: number;
  discount: number;
  gstRate: number; // e.g. 18%
  gstAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerGstin?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  igst: number;
  deliveryCharges: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    upiRef?: string;
    cardLast4?: string;
    emiProvider?: string;
    emiTenure?: number;
    splitDetails?: { method: string; amount: number }[];
  };
  amountPaid: number;
  balanceDue: number;
  status: 'Paid' | 'Partial' | 'Draft' | 'Cancelled';
  salesEmployeeId: string;
  salesEmployeeName: string;
  branchId: string;
  notes?: string;
  exchangeBuybackId?: string;
  exchangeDiscount?: number;
}

export interface Supplier {
  id: string;
  name: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  distributorType: string; // e.g. "Apple Authorized", "Accessories Wholesaler"
  paymentTerms: string;
  openingBalance: number;
  currentOutstanding: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifsc: string;
    upiId: string;
  };
  notes?: string;
}

export interface PurchaseItem {
  name: string;
  type: 'phone' | 'accessory';
  brand: string;
  imeis?: string[];
  qty: number;
  purchasePrice: number;
  gstRate: number;
  total: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: 'Paid' | 'Partial' | 'Unpaid';
  branchId: string;
  notes?: string;
}

export type RepairStatus = 
  | 'Device Received'
  | 'Diagnosis'
  | 'Estimate Sent'
  | 'Customer Approval'
  | 'Repair in Progress'
  | 'Quality Check'
  | 'Ready for Pickup'
  | 'Delivered';

export interface RepairConditionCheck {
  screenBroken: boolean;
  bodyScratches: boolean;
  cameraWorking: boolean;
  touchWorking: boolean;
  powerOn: boolean;
  waterDamage: boolean;
  speakerWorking: boolean;
  fingerprintWorking: boolean;
}

export interface RepairPartUsed {
  name: string;
  cost: number;
  price: number;
}

export interface RepairJob {
  id: string;
  jobId: string; // e.g. "REP-2026-0042"
  customerId: string;
  customerName: string;
  customerMobile: string;
  deviceBrand: string;
  deviceModel: string;
  imeiOrSerial: string;
  passcodePattern?: string;
  conditionCheck: RepairConditionCheck;
  customerComplaint: string;
  accessoriesReceived: string[]; // e.g. ["SIM Tray", "Back Cover"]
  estimatedCost: number;
  finalCost: number;
  advancePaid: number;
  technicianId: string;
  technicianName: string;
  status: RepairStatus;
  receivedDate: string;
  expectedDeliveryDate: string;
  deliveredDate?: string;
  partsUsed: RepairPartUsed[];
  laborCharge: number;
  warrantyDays: number;
  paymentStatus: 'Pending' | 'Paid';
  branchId: string;
  technicianNotes?: string;
}

export type BuybackGrade = 'Grade A (Flawless)' | 'Grade B (Minor Wear)' | 'Grade C (Dents/Scratches)' | 'Grade D (Damaged)';

export interface BuybackRecord {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  idProofType: 'Aadhaar Card' | 'Driving License' | 'Voter ID' | 'Passport';
  idProofNumber: string;
  brand: string;
  model: string;
  imei: string;
  storage: string;
  conditionGrade: BuybackGrade;
  functionalCheck: {
    displayOk: boolean;
    touchOk: boolean;
    camerasOk: boolean;
    batteryHealth: string;
    wifiBluetoothOk: boolean;
    micSpeakerOk: boolean;
  };
  accessoriesIncluded: string[];
  estimatedMarketValue: number;
  buybackPrice: number;
  refurbishCost: number;
  resalePrice: number;
  status: 'In Stock' | 'Under Refurbishment' | 'Sold';
  employeeId: string;
  employeeName: string;
  linkedInvoiceId?: string;
  date: string;
  branchId: string;
}

export type ExpenseCategory = 
  | 'Rent'
  | 'Electricity'
  | 'Internet & Telephone'
  | 'Staff Salaries'
  | 'Transportation'
  | 'Marketing & Ads'
  | 'Refreshments & Tea'
  | 'Shop Maintenance'
  | 'Packaging & Stationary'
  | 'Tools & Equipment'
  | 'Other Expenses';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  branchId: string;
  receiptNote?: string;
}

export interface Employee {
  id: string;
  name: string;
  mobile: string;
  role: Role;
  joiningDate: string;
  salary: number;
  branchId: string;
  status: 'Active' | 'Inactive';
  monthlySalesTarget: number;
  commissionRules: {
    phoneFixedCommission: number; // e.g. ₹200 per phone
    accessoryCommissionPercent: number; // e.g. 5% on accessories
    repairCommissionPercent: number; // e.g. 10% on repair labor
    grossProfitPercent: number; // e.g. 2% on net gross profit
  };
}

export type FollowUpType = 
  | 'Quotation Follow-up'
  | 'Pending Payment'
  | 'Warranty Expiring'
  | 'Repair Pickup'
  | 'New Phone Launch'
  | 'Exchange Offer';

export interface FollowUp {
  id: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: FollowUpType;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  notes: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromBranchId: string;
  toBranchId: string;
  items: {
    type: 'phone' | 'accessory';
    id: string;
    name: string;
    imei?: string;
    qty: number;
  }[];
  status: 'In Transit' | 'Completed' | 'Cancelled';
  requestedBy: string;
  receivedBy?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  module: string;
  details: string;
  branchId: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: 'stock' | 'repair' | 'payment' | 'lead' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface BusinessSettings {
  shopName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  stateCode: string; // e.g. "07" for Delhi, "09" for UP
  panNumber: string;
  invoicePrefix: string;
  upiId: string;
  upiQrEnabled: boolean;
  bankDetails: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };
  invoiceTerms: string;
  defaultPhoneGstRate: number; // 18%
  defaultAccessoryGstRate: number; // 18%
  currency: string;
  language: 'en' | 'hi';
  theme: 'light' | 'dark';
  activeBranchId: string;
  lowStockThreshold: number;
}
