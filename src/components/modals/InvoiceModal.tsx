import React, { useRef } from 'react';
import { X, Printer, Share2, Check, Download, Building2, Phone, QrCode } from 'lucide-react';
import { Invoice, Branch, BusinessSettings } from '../../types';
import { formatINR, formatIndianDate, formatIndianDateTime, numberToIndianWords, generateWhatsAppLink } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  branch?: Branch;
  settings: BusinessSettings;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  branch,
  settings,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const currentBranch = branch || {
    id: 'b-default',
    name: settings.shopName,
    code: 'MAIN',
    address: settings.address,
    city: settings.city,
    state: settings.state,
    pincode: settings.pincode,
    phone: settings.phone,
    gstin: settings.gstin,
    invoicePrefix: settings.invoicePrefix,
    isMain: true,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const itemLines = invoice.items.map(i => `• ${i.name} (Qty: ${i.qty}) - ₹${i.total.toLocaleString('en-IN')}`).join('\n');
    const msg = `🙏 *Greetings from ${settings.shopName}!*\n\nHere is your Tax Invoice:\n*Invoice No:* ${invoice.invoiceNumber}\n*Date:* ${formatIndianDate(invoice.date)}\n*Customer:* ${invoice.customerName}\n\n*Purchased Items:*\n${itemLines}\n\n*Total Amount:* ₹${invoice.grandTotal.toLocaleString('en-IN')}\n*Amount Paid:* ₹${invoice.amountPaid.toLocaleString('en-IN')}\n${invoice.balanceDue > 0 ? `*Balance Due:* ₹${invoice.balanceDue.toLocaleString('en-IN')}\n` : ''}*Payment Mode:* ${invoice.paymentMethod}\n\nThank you for choosing ${settings.shopName}! For service or queries, contact us at ${currentBranch.phone}. Have a great day!`;
    
    const url = generateWhatsAppLink(invoice.customerMobile, msg);
    window.open(url, '_blank');
  };

  const getHsnCode = (type: string, name: string) => {
    if (type === 'phone') return '8517 12 00';
    if (name.toLowerCase().includes('charger') || name.toLowerCase().includes('adapter')) return '8504 40 90';
    if (name.toLowerCase().includes('earphone') || name.toLowerCase().includes('headphone') || name.toLowerCase().includes('speaker')) return '8518 30 00';
    if (name.toLowerCase().includes('glass') || name.toLowerCase().includes('protector')) return '7007 19 00';
    if (name.toLowerCase().includes('cover') || name.toLowerCase().includes('case')) return '3926 90 99';
    return '8517 70 90';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">Tax Invoice (GST)</h3>
            <span className="text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full font-mono">
              {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp Bill
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Invoice
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div id="printable-content" ref={printRef} className="p-8 overflow-y-auto text-slate-800 text-xs leading-normal">
          {/* Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                  {settings.shopName}
                </h1>
                <p className="text-[11px] font-medium text-slate-600 italic">
                  {settings.tagline}
                </p>
                <p className="text-slate-700 mt-1 max-w-sm">
                  {currentBranch.address}, {currentBranch.city}, {currentBranch.state} - {currentBranch.pincode}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Phone:</span> +91 {currentBranch.phone} {settings.altPhone && `| ${settings.altPhone}`}
                </p>
                <p className="text-slate-700">
                  <span className="font-semibold">Email:</span> {settings.email}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-slate-900 text-white font-bold px-3 py-1 text-xs uppercase tracking-wider rounded mb-2">
                  Tax Invoice
                </span>
                <p className="font-mono text-sm font-bold text-slate-900">{invoice.invoiceNumber}</p>
                <p className="text-slate-600">Date: <span className="font-semibold text-slate-800">{formatIndianDate(invoice.date)}</span></p>
                <div className="mt-2 text-[11px] bg-slate-50 border border-slate-200 p-2 rounded text-left">
                  <p><span className="font-semibold">GSTIN:</span> <span className="font-mono">{currentBranch.gstin}</span></p>
                  <p><span className="font-semibold">State / Code:</span> {currentBranch.state} ({settings.stateCode})</p>
                  <p><span className="font-semibold">PAN:</span> <span className="font-mono">{settings.panNumber}</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Billing Details */}
          <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-lg p-3 mb-4 bg-slate-50/50">
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Billed To (Customer Details)</p>
              <p className="font-bold text-slate-900 text-sm">{invoice.customerName}</p>
              <p className="text-slate-600">Mobile: <span className="font-medium text-slate-900">+91 {invoice.customerMobile}</span></p>
              {invoice.customerGstin && (
                <p className="text-slate-700 font-mono"><span className="font-semibold">GSTIN:</span> {invoice.customerGstin}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Sale Details</p>
              <p className="text-slate-600">Salesperson: <span className="font-semibold text-slate-800">{invoice.salesEmployeeName}</span></p>
              <p className="text-slate-600">Branch: <span className="font-semibold text-slate-800">{currentBranch.name}</span></p>
              <p className="text-slate-600">Payment: <span className="font-semibold uppercase text-brand-700">{invoice.paymentMethod}</span></p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full border-collapse border border-slate-300 text-left mb-4">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                <th className="p-2 border-r border-slate-300">Product Description & Serial / IMEI</th>
                <th className="p-2 border-r border-slate-300 text-center w-20">HSN</th>
                <th className="p-2 border-r border-slate-300 text-center w-12">Qty</th>
                <th className="p-2 border-r border-slate-300 text-right w-24">Rate (₹)</th>
                <th className="p-2 border-r border-slate-300 text-right w-16">Disc (₹)</th>
                <th className="p-2 border-r border-slate-300 text-center w-16">GST</th>
                <th className="p-2 text-right w-24">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200 text-center text-slate-500">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200">
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.identifier && (
                      <p className="font-mono text-[10px] text-slate-500">
                        {item.type === 'phone' ? `IMEI: ${item.identifier}` : `SKU/Barcode: ${item.identifier}`}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-600">
                    {getHsnCode(item.type, item.name)}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-medium">{item.qty}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono">
                    {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-amber-700">
                    {item.discount > 0 ? item.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center text-[10px]">
                    {item.gstRate}%
                  </td>
                  <td className="p-2 text-right font-mono font-semibold text-slate-900">
                    {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Old phone buyback deduction if any */}
          {invoice.exchangeBuybackId && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3 flex justify-between items-center text-amber-900 text-xs">
              <div>
                <span className="font-bold">Old Phone Exchange Credit Applied</span> (Ref: #{invoice.exchangeBuybackId})
              </div>
              <div className="font-mono font-bold text-amber-800">
                - ₹{invoice.exchangeDiscount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          {/* Financial Calculation Summary */}
          <div className="grid grid-cols-12 gap-4 mb-4">
            {/* Left side: Amount in words & Bank info */}
            <div className="col-span-7 space-y-2">
              <div className="border border-slate-200 rounded p-2.5 bg-slate-50/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Amount in Words:</p>
                <p className="font-semibold text-slate-800 italic mt-0.5">
                  {numberToIndianWords(invoice.grandTotal)}
                </p>
              </div>

              {/* Bank Details */}
              <div className="border border-slate-200 rounded p-2 text-[10px] text-slate-600 bg-slate-50/30">
                <p className="font-bold text-slate-700 uppercase mb-1">Bank Payment Details</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                  <p>Bank: <span className="font-medium text-slate-900">{settings.bankDetails.bankName}</span></p>
                  <p>A/C Name: <span className="font-medium text-slate-900">{settings.bankDetails.accountName}</span></p>
                  <p>A/C No: <span className="font-mono font-medium text-slate-900">{settings.bankDetails.accountNumber}</span></p>
                  <p>IFSC: <span className="font-mono font-medium text-slate-900">{settings.bankDetails.ifsc}</span></p>
                  <p className="col-span-2">UPI VPA: <span className="font-mono font-medium text-blue-700">{settings.upiId}</span></p>
                </div>
              </div>
            </div>

            {/* Right side: Subtotal, GST Breakdown, Grand Total */}
            <div className="col-span-5 border border-slate-300 rounded overflow-hidden">
              <div className="divide-y divide-slate-200 text-[11px]">
                <div className="flex justify-between p-2">
                  <span className="text-slate-600">Taxable Subtotal:</span>
                  <span className="font-mono font-medium">₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.totalDiscount > 0 && (
                  <div className="flex justify-between p-2 text-emerald-700">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{invoice.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.cgst > 0 && (
                  <div className="flex justify-between p-2 text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{invoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.sgst > 0 && (
                  <div className="flex justify-between p-2 text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{invoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.igst > 0 && (
                  <div className="flex justify-between p-2 text-slate-600">
                    <span>IGST (18%):</span>
                    <span className="font-mono">₹{invoice.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {invoice.deliveryCharges > 0 && (
                  <div className="flex justify-between p-2 text-slate-600">
                    <span>Delivery / Shipping:</span>
                    <span className="font-mono">₹{invoice.deliveryCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between p-2.5 bg-slate-900 text-white font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="font-mono font-black">{formatINR(invoice.grandTotal, true)}</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 text-[10px]">
                  <span className="text-slate-600">Amount Paid ({invoice.paymentMethod}):</span>
                  <span className="font-mono font-bold text-emerald-700">₹{invoice.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between p-2 bg-red-50 text-[10px] text-red-700 font-bold">
                    <span>Balance Due (Khata):</span>
                    <span className="font-mono">₹{invoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Signature */}
          <div className="border-t border-slate-300 pt-3 mt-4 grid grid-cols-2 gap-4 items-end text-[10px]">
            <div>
              <p className="font-bold text-slate-700 uppercase mb-0.5">Terms & Conditions:</p>
              <p className="whitespace-pre-line text-slate-500 text-[9px] leading-tight">
                {settings.invoiceTerms}
              </p>
            </div>
            <div className="text-right space-y-8">
              <p className="font-semibold text-slate-800">For {settings.shopName}</p>
              <div className="border-t border-slate-400 inline-block w-40 pt-1">
                <p className="text-[10px] text-slate-600">Authorized Signatory</p>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 mt-4 border-t border-slate-200 pt-2">
            This is a computer generated tax invoice and requires authorized stamp/signature for warranty purposes.
          </div>
        </div>
      </div>
    </div>
  );
};
