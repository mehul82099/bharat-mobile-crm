import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, Copy, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import { formatINR, generateUPIPaymentUrl } from '../../utils/formatters';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId: string;
  payeeName: string;
  customerName?: string;
  invoiceNumber?: string;
  onPaymentConfirmed?: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  amount,
  upiId,
  payeeName,
  customerName,
  invoiceNumber,
  onPaymentConfirmed
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && upiId && amount > 0) {
      const upiUrl = generateUPIPaymentUrl(
        upiId,
        payeeName,
        amount,
        `Inv ${invoiceNumber || 'Sale'}`
      );
      QRCode.toDataURL(upiUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
    }
  }, [isOpen, upiId, payeeName, amount, invoiceNumber]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Instant UPI Payment</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Pay to</p>
            <p className="font-bold text-slate-800 dark:text-slate-100 text-base">{payeeName}</p>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {upiId}
              </span>
              <button 
                onClick={handleCopyUpi} 
                className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                title="Copy UPI ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            {copied && <span className="text-[10px] text-green-600 font-medium">Copied!</span>}
          </div>

          {/* Amount Badge */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 py-2.5 px-4 rounded-xl">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Amount to Pay</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight">{formatINR(amount, true)}</p>
            {customerName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Customer: {customerName}</p>
            )}
          </div>

          {/* QR Code Container */}
          <div className="flex justify-center p-3 bg-white rounded-xl shadow-inner border border-slate-200 inline-block mx-auto">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="UPI Payment QR Code" className="w-52 h-52 object-contain" />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-slate-100 rounded text-slate-400 text-sm">
                Generating QR...
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scan using any UPI App: <strong className="text-slate-700 dark:text-slate-300">Google Pay, PhonePe, Paytm, BHIM</strong>
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            {onPaymentConfirmed && (
              <button
                onClick={() => {
                  onPaymentConfirmed();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                Payment Received
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
