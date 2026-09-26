import React, { useState } from 'react';
import { 
  Wrench, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Share2, 
  AlertCircle, 
  ArrowRight, 
  Smartphone, 
  DollarSign, 
  Eye, 
  X,
  ShieldCheck,
  Check,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RepairJob, RepairStatus, RepairConditionCheck } from '../../types';
import { formatINR, formatIndianDate, generateWhatsAppLink } from '../../utils/formatters';
import { RepairTokenModal } from '../modals/RepairTokenModal';

export const RepairView: React.FC = () => {
  const { 
    repairJobs, 
    customers, 
    employees, 
    branches, 
    activeBranchId, 
    settings, 
    createRepairJob, 
    updateRepairJob 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedJobForToken, setSelectedJobForToken] = useState<RepairJob | null>(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<RepairJob | null>(null);

  // New Repair Job Form State
  const [newJob, setNewJob] = useState({
    customerId: '',
    customerName: '',
    customerMobile: '',
    deviceBrand: 'Apple',
    deviceModel: '',
    imeiOrSerial: '',
    passcodePattern: '',
    conditionCheck: {
      screenBroken: false,
      bodyScratches: false,
      cameraWorking: true,
      touchWorking: true,
      powerOn: true,
      waterDamage: false,
      speakerWorking: true,
      fingerprintWorking: true
    } as RepairConditionCheck,
    customerComplaint: '',
    accessoriesReceived: ['SIM Tray'],
    estimatedCost: 2500,
    advancePaid: 500,
    technicianId: employees.find(e => e.role === 'Repair Technician')?.id || '',
    technicianName: employees.find(e => e.role === 'Repair Technician')?.name || 'Manoj Kumar',
    expectedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    laborCharge: 800,
    warrantyDays: 90,
  });

  const allStatuses: RepairStatus[] = [
    'Device Received',
    'Diagnosis',
    'Estimate Sent',
    'Customer Approval',
    'Repair in Progress',
    'Quality Check',
    'Ready for Pickup',
    'Delivered'
  ];

  // Filtering
  const filteredJobs = repairJobs.filter(job => {
    if (activeBranchId !== 'all' && job.branchId !== activeBranchId) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        job.jobId.toLowerCase().includes(q) ||
        job.customerName.toLowerCase().includes(q) ||
        job.customerMobile.includes(q) ||
        job.deviceModel.toLowerCase().includes(q) ||
        job.deviceBrand.toLowerCase().includes(q) ||
        job.imeiOrSerial.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeRepairsCount = filteredJobs.filter(j => j.status !== 'Delivered').length;
  const readyPickupCount = filteredJobs.filter(j => j.status === 'Ready for Pickup').length;
  const inProgressCount = filteredJobs.filter(j => j.status === 'Repair in Progress').length;

  const handleStatusChange = (jobId: string, newStatus: RepairStatus) => {
    updateRepairJob(jobId, { status: newStatus });
  };

  const handleWhatsAppStatus = (job: RepairJob) => {
    const msg = `🔧 *${settings.shopName} - Repair Status Update*\n\nDear *${job.customerName}*,\nYour device (*${job.deviceBrand} ${job.deviceModel}*) under Job ID *${job.jobId}* is currently in status: *${job.status}*.\n\n*Estimated Cost:* ₹${job.estimatedCost.toLocaleString('en-IN')}\n*Advance Paid:* ₹${job.advancePaid.toLocaleString('en-IN')}\n*Expected Ready Date:* ${formatIndianDate(job.expectedDeliveryDate)}\n\nFor queries or assistance, contact our repair desk at +91 ${settings.phone}.`;
    const url = generateWhatsAppLink(job.customerMobile, msg);
    window.open(url, '_blank');
  };

  const handleSubmitNewJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.customerName || !newJob.customerMobile || !newJob.deviceModel || !newJob.customerComplaint) {
      alert('Please fill customer details, device model, and complaint.');
      return;
    }

    const tech = employees.find(e => e.id === newJob.technicianId);

    const created = createRepairJob({
      ...newJob,
      technicianName: tech?.name || newJob.technicianName,
      status: 'Device Received',
      finalCost: 0,
      receivedDate: new Date().toISOString().split('T')[0],
      partsUsed: [],
      paymentStatus: 'Pending',
      branchId: activeBranchId === 'all' ? branches[0]?.id : activeBranchId,
    });

    setShowAddJobModal(false);
    setSelectedJobForToken(created);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-amber-500" />
            Mobile Service Center & Express Repair Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Intake job sheets, physical inspection checklist, 8-stage repair tracker, and print tokens
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'kanban' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              List View
            </button>
          </div>

          <button
            onClick={() => setShowAddJobModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-amber-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Repair Job
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Repairs</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {activeRepairsCount} <span className="text-xs font-medium text-slate-400">Devices</span>
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">In Service Desk</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Ready for Pickup</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {readyPickupCount}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">Customer Notification Due</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Work in Progress</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {inProgressCount}
          </p>
          <span className="text-[10px] text-slate-400">On Technician Bench</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Delivered & Resolved</span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {filteredJobs.filter(j => j.status === 'Delivered').length}
          </p>
          <span className="text-[10px] text-slate-400">Completed Service Tickets</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Job ID (e.g. REP-2026-0034), Customer Name, Phone, Model, IMEI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {allStatuses.map(status => {
            const statusJobs = filteredJobs.filter(j => j.status === status);

            return (
              <div 
                key={status}
                className="w-72 shrink-0 bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-3 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{status}</h4>
                  <span className="text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full shadow-xs">
                    {statusJobs.length}
                  </span>
                </div>

                {/* Job Cards in Column */}
                <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                  {statusJobs.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700/60 rounded-xl flex items-center justify-center text-[11px] text-slate-400">
                      Empty
                    </div>
                  ) : (
                    statusJobs.map(job => (
                      <div 
                        key={job.id}
                        className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-2.5 group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-xs font-black text-brand-600 dark:text-brand-400">
                            {job.jobId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatIndianDate(job.receivedDate)}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            {job.deviceBrand} {job.deviceModel}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {job.customerComplaint}
                          </p>
                        </div>

                        <div className="p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-[10px] space-y-0.5">
                          <div className="flex justify-between text-slate-500">
                            <span>Customer:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{job.customerName}</span>
                          </div>
                          <div className="flex justify-between text-slate-500">
                            <span>Tech:</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{job.technicianName}</span>
                          </div>
                          <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                            <span>Estimate:</span>
                            <span className="font-mono text-brand-600">{formatINR(job.estimatedCost)}</span>
                          </div>
                        </div>

                        {/* Action buttons on card */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => setSelectedJobForToken(job)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Print Service Token"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleWhatsAppStatus(job)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                            title="Send WhatsApp Update"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Advance Status Dropdown */}
                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.id, e.target.value as RepairStatus)}
                            className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded px-1.5 py-1 focus:outline-none"
                          >
                            {allStatuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Job ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Device</th>
                  <th className="p-3.5">Complaint</th>
                  <th className="p-3.5">Technician</th>
                  <th className="p-3.5 text-right">Estimate</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-mono font-bold text-brand-600">{job.jobId}</td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">{job.customerName}</div>
                      <div className="text-[10px] text-slate-400">+91 {job.customerMobile}</div>
                    </td>
                    <td className="p-3.5 font-medium">{job.deviceBrand} {job.deviceModel}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{job.customerComplaint}</td>
                    <td className="p-3.5">{job.technicianName}</td>
                    <td className="p-3.5 text-right font-mono font-bold">{formatINR(job.estimatedCost)}</td>
                    <td className="p-3.5 text-center">
                      <select
                        value={job.status}
                        onChange={(e) => handleStatusChange(job.id, e.target.value as RepairStatus)}
                        className="text-[10px] font-bold p-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        {allStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedJobForToken(job)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Print Token"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleWhatsAppStatus(job)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                          title="WhatsApp Update"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Repair Job Sheet Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-400" />
                Intake New Mobile Device for Repair
              </h3>
              <button onClick={() => setShowAddJobModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewJob} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={newJob.customerName}
                    onChange={(e) => setNewJob({ ...newJob, customerName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    value={newJob.customerMobile}
                    onChange={(e) => setNewJob({ ...newJob, customerMobile: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Device */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Brand</label>
                  <select
                    value={newJob.deviceBrand}
                    onChange={(e) => setNewJob({ ...newJob, deviceBrand: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Apple">Apple iPhone</option>
                    <option value="Samsung">Samsung</option>
                    <option value="OnePlus">OnePlus</option>
                    <option value="Xiaomi">Xiaomi / Redmi</option>
                    <option value="Realme">Realme</option>
                    <option value="Vivo">Vivo</option>
                    <option value="Oppo">Oppo</option>
                    <option value="Motorola">Motorola</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro or A53"
                    value={newJob.deviceModel}
                    onChange={(e) => setNewJob({ ...newJob, deviceModel: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">IMEI / Serial</label>
                  <input
                    type="text"
                    placeholder="IMEI number"
                    value={newJob.imeiOrSerial}
                    onChange={(e) => setNewJob({ ...newJob, imeiOrSerial: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Screen Lock PIN / Pattern</label>
                <input
                  type="text"
                  placeholder="e.g. PIN: 1234 or Pattern shape"
                  value={newJob.passcodePattern}
                  onChange={(e) => setNewJob({ ...newJob, passcodePattern: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                />
              </div>

              {/* Physical Condition Checklist */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                  Intake Inspection Checklist (Select all that apply)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJob.conditionCheck.screenBroken}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        conditionCheck: { ...newJob.conditionCheck, screenBroken: e.target.checked }
                      })}
                      className="rounded text-brand-600"
                    />
                    <span>Screen Broken</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJob.conditionCheck.waterDamage}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        conditionCheck: { ...newJob.conditionCheck, waterDamage: e.target.checked }
                      })}
                      className="rounded text-brand-600"
                    />
                    <span>Water Damage</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJob.conditionCheck.powerOn}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        conditionCheck: { ...newJob.conditionCheck, powerOn: e.target.checked }
                      })}
                      className="rounded text-brand-600"
                    />
                    <span>Powers ON</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newJob.conditionCheck.touchWorking}
                      onChange={(e) => setNewJob({
                        ...newJob,
                        conditionCheck: { ...newJob.conditionCheck, touchWorking: e.target.checked }
                      })}
                      className="rounded text-brand-600"
                    />
                    <span>Touch Works</span>
                  </label>
                </div>
              </div>

              {/* Complaint */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Customer Complaint / Fault Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Broken display, touch flickering, battery replacement required..."
                  value={newJob.customerComplaint}
                  onChange={(e) => setNewJob({ ...newJob, customerComplaint: e.target.value })}
                  className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Cost & Technician */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Estimated Cost (₹)</label>
                  <input
                    type="number"
                    required
                    value={newJob.estimatedCost || ''}
                    onChange={(e) => setNewJob({ ...newJob, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={newJob.advancePaid || ''}
                    onChange={(e) => setNewJob({ ...newJob, advancePaid: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold font-mono text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Technician</label>
                  <select
                    value={newJob.technicianId}
                    onChange={(e) => setNewJob({ ...newJob, technicianId: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow-md"
                >
                  Generate Job Sheet & Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repair Token Print Modal */}
      <RepairTokenModal
        isOpen={!!selectedJobForToken}
        onClose={() => setSelectedJobForToken(null)}
        job={selectedJobForToken}
        settings={settings}
      />
    </div>
  );
};
