import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Building2, 
  CreditCard, 
  FileText, 
  Languages, 
  Moon, 
  Sun,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BusinessSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportDatabase, 
    importDatabase, 
    resetDatabaseToDefaults, 
    language, 
    setLanguage, 
    theme, 
    setTheme 
  } = useApp();

  const [form, setForm] = useState<BusinessSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleBackupDownload = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bharat_mobile_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabase(content);
      if (success) {
        alert('Database restored successfully from backup JSON file.');
      } else {
        alert('Failed to parse backup file. Please ensure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('WARNING: Are you sure you want to reset all data to default showroom factory settings? This will clear any new transactions.')) {
      resetDatabaseToDefaults();
      alert('System reset to initial sample state.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            Business Configuration & System Settings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure GSTIN, UPI payment details, bank accounts, invoice formatting, and JSON backup/restore
          </p>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Business Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <Building2 className="w-4 h-4 text-brand-600" />
            Showroom Identity & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Shop / Showroom Name</label>
              <input
                type="text"
                required
                value={form.shopName}
                onChange={(e) => setForm({ ...form, shopName: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Tagline / Slogan</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Proprietor / Owner Name</label>
              <input
                type="text"
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Primary Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Support Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">City & State</label>
              <input
                type="text"
                value={`${form.city}, ${form.state}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setForm({ ...form, city: parts[0]?.trim() || '', state: parts[1]?.trim() || '' });
                }}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Indian GST & Invoicing Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            GST Compliance & Invoice Formatting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Business GSTIN</label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">State Code (GST)</label>
              <input
                type="text"
                value={form.stateCode}
                onChange={(e) => setForm({ ...form, stateCode: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Default Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Invoice Terms & Conditions (Prints on Bills)</label>
            <textarea
              rows={3}
              value={form.invoiceTerms}
              onChange={(e) => setForm({ ...form, invoiceTerms: e.target.value })}
              className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>
        </div>

        {/* Section 3: Payments & Bank Details */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            UPI & Bank Account (For Dynamic QR Codes)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Showroom UPI VPA (GPay / PhonePe / Paytm)</label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Bank Name</label>
              <input
                type="text"
                value={form.bankDetails.bankName}
                onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Account Holder</label>
              <input
                type="text"
                value={form.bankDetails.accountName}
                onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountName: e.target.value } })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">A/C Number</label>
              <input
                type="text"
                value={form.bankDetails.accountNumber}
                onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">IFSC Code</label>
              <input
                type="text"
                value={form.bankDetails.ifsc}
                onChange={(e) => setForm({ ...form, bankDetails: { ...form.bankDetails, ifsc: e.target.value.toUpperCase() } })}
                className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 transition-all text-xs"
          >
            <Save className="w-4 h-4" />
            Save Configuration Changes
          </button>
        </div>
      </form>

      {/* Section 4: Backup, Restore & Factory Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <Download className="w-4 h-4 text-purple-600" />
          Data Backup, Restore & Factory Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Export Complete Database</h4>
            <p className="text-[11px] text-slate-500">Download full offline JSON backup containing all inventory, invoices, customers, and expenses.</p>
            <button
              onClick={handleBackupDownload}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Backup
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Restore from File</h4>
            <p className="text-[11px] text-slate-500">Import a previously saved JSON backup file to restore records.</p>
            <label className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Upload Backup File
              <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Factory Reset */}
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-2">
            <h4 className="font-bold text-xs text-red-900 dark:text-red-300">Factory Reset</h4>
            <p className="text-[11px] text-red-700 dark:text-red-400">Reverts the system to default sample showroom inventory and clears custom changes.</p>
            <button
              onClick={handleFactoryReset}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
