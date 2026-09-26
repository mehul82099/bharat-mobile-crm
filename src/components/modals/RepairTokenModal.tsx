import React, { useRef } from 'react';
import { X, Printer, Share2, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { RepairJob, BusinessSettings } from '../../types';
import { formatINR, formatIndianDate, generateWhatsAppLink } from '../../utils/formatters';

interface RepairTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: RepairJob | null;
  settings: BusinessSettings;
}

export const RepairTokenModal: React.FC<RepairTokenModalProps> = ({
  isOpen,
  onClose,
  job,
  settings,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !job) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppStatus = () => {
    const msg = `🔧 *${settings.shopName} - Repair Status Update*\n\nDear *${job.customerName}*,\nYour device (*${job.deviceBrand} ${job.deviceModel}*) under Job ID *${job.jobId}* is currently in status: *${job.status}*.\n\n*Estimated Cost:* ₹${job.estimatedCost.toLocaleString('en-IN')}\n*Advance Paid:* ₹${job.advancePaid.toLocaleString('en-IN')}\n*Expected Ready Date:* ${formatIndianDate(job.expectedDeliveryDate)}\n\nFor queries or assistance, contact our repair desk at +91 ${settings.phone}.`;
    const url = generateWhatsAppLink(job.customerMobile, msg);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-lg">Repair Job Sheet & Token</h3>
            <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2.5 py-0.5 rounded-full font-mono">
              {job.jobId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Update
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Token
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Job Sheet Content */}
        <div id="printable-content" ref={printRef} className="p-8 overflow-y-auto text-slate-800 text-xs leading-normal">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {settings.shopName} - Express Service Center
              </h1>
              <p className="text-slate-600 text-[11px]">
                {settings.address}, {settings.city} | Helpline: +91 {settings.phone}
              </p>
            </div>
            <div className="text-right">
              <span className="bg-slate-900 text-white font-bold px-2.5 py-1 text-[11px] uppercase rounded">
                Service Job Token
              </span>
              <p className="font-mono text-base font-bold text-slate-900 mt-1">{job.jobId}</p>
              <p className="text-slate-500 text-[10px]">Received: {formatIndianDate(job.receivedDate)}</p>
            </div>
          </div>

          {/* Customer & Device Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border border-slate-200 rounded p-3 bg-slate-50/60">
              <p className="font-bold text-[10px] text-slate-500 uppercase mb-1">Customer Information</p>
              <p className="font-bold text-slate-900 text-sm">{job.customerName}</p>
              <p className="text-slate-600">Mobile: <span className="font-medium text-slate-900">+91 {job.customerMobile}</span></p>
              <p className="text-slate-600">Expected Delivery: <span className="font-bold text-blue-700">{formatIndianDate(job.expectedDeliveryDate)}</span></p>
            </div>

            <div className="border border-slate-200 rounded p-3 bg-slate-50/60">
              <p className="font-bold text-[10px] text-slate-500 uppercase mb-1">Device Under Repair</p>
              <p className="font-bold text-slate-900 text-sm">{job.deviceBrand} {job.deviceModel}</p>
              <p className="text-slate-600 font-mono text-[11px]">IMEI/Serial: {job.imeiOrSerial || 'N/A'}</p>
              {job.passcodePattern && (
                <p className="text-slate-700 font-mono text-[11px]">Lock / PIN: <span className="font-bold bg-amber-100 px-1 rounded">{job.passcodePattern}</span></p>
              )}
            </div>
          </div>

          {/* Complaint & Intake Check */}
          <div className="border border-slate-200 rounded p-3 mb-4 space-y-2">
            <div>
              <p className="font-bold text-slate-700 uppercase text-[10px]">Reported Issue / Customer Complaint:</p>
              <p className="text-slate-900 font-medium bg-amber-50/60 p-2 rounded border border-amber-200/60 mt-1">
                {job.customerComplaint}
              </p>
            </div>

            <div>
              <p className="font-bold text-slate-700 uppercase text-[10px] mb-1">Intake Condition Inspection Checklist:</p>
              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <span className={`p-1 rounded text-center border ${job.conditionCheck.screenBroken ? 'bg-red-50 text-red-700 border-red-200 font-bold' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  Screen: {job.conditionCheck.screenBroken ? 'Cracked/Damaged' : 'OK'}
                </span>
                <span className={`p-1 rounded text-center border ${job.conditionCheck.touchWorking ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200 font-bold'}`}>
                  Touch: {job.conditionCheck.touchWorking ? 'Working' : 'Faulty'}
                </span>
                <span className={`p-1 rounded text-center border ${job.conditionCheck.powerOn ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200 font-bold'}`}>
                  Power: {job.conditionCheck.powerOn ? 'Turns ON' : 'Dead'}
                </span>
                <span className={`p-1 rounded text-center border ${job.conditionCheck.waterDamage ? 'bg-red-50 text-red-700 border-red-200 font-bold' : 'bg-green-50 text-green-700 border-green-200'}`}>
                  Water Damage: {job.conditionCheck.waterDamage ? 'Detected' : 'None'}
                </span>
              </div>
            </div>

            {job.accessoriesReceived && job.accessoriesReceived.length > 0 && (
              <div>
                <p className="font-bold text-slate-700 uppercase text-[10px]">Accessories Deposited with Device:</p>
                <p className="text-slate-700">{job.accessoriesReceived.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Pricing & Estimation */}
          <div className="border border-slate-300 rounded p-3 mb-4 bg-slate-50 flex justify-between items-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">Service Estimation</p>
              <p className="text-sm font-semibold text-slate-800">Assigned Technician: {job.technicianName}</p>
              <p className="text-[11px] text-slate-600">Post-repair Testing Warranty: <strong className="text-slate-900">{job.warrantyDays} Days</strong></p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-slate-600">Estimated Repair Cost: <span className="font-mono font-bold text-slate-900">{formatINR(job.estimatedCost)}</span></p>
              <p className="text-slate-600">Advance Paid: <span className="font-mono font-bold text-emerald-700">{formatINR(job.advancePaid)}</span></p>
              <p className="text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                Balance on Delivery: <span className="font-mono text-brand-700">{formatINR(Math.max(0, job.estimatedCost - job.advancePaid))}</span>
              </p>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-slate-300 pt-3 space-y-2 text-[9px] text-slate-500 leading-tight">
            <p className="font-bold text-slate-700 text-[10px] uppercase">Service Terms:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Customer must produce this original job token for taking delivery of the device.</li>
              <li>{settings.shopName} will not be responsible for any internal data loss during OS flash, screen, or motherboard repair. Please backup personal data before submission.</li>
              <li>Devices not claimed within 30 days from expected delivery date will be disposed of to recover service and spare parts costs.</li>
              <li>Liquid/water damaged devices are accepted solely on customer risk for inspection.</li>
            </ol>

            <div className="grid grid-cols-2 gap-4 pt-6 text-[10px]">
              <div className="border-t border-slate-300 pt-1 w-44">
                <p className="text-slate-700 font-medium">Customer Signature</p>
              </div>
              <div className="border-t border-slate-300 pt-1 w-44 ml-auto text-right">
                <p className="text-slate-700 font-medium">Technician / Store Stamp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
