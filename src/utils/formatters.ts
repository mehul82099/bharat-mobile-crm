/**
 * Utilities & Formatters specifically tuned for Indian Retail & GST Compliance
 */

// Formats number to Indian Rupee representation (e.g. ₹1,25,000)
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  };
  
  const formatted = new Intl.NumberFormat('en-IN', options).format(absAmount);
  return isNegative ? `-${formatted}` : formatted;
}

// Formats date to Indian Standard DD/MM/YYYY
export function formatIndianDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

// Formats date and time to Indian format (DD/MM/YYYY, hh:mm A)
export function formatIndianDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 hour is 12 AM
    
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  } catch {
    return String(dateInput);
  }
}

// Convert numbers into Indian numbering words for GST Invoices (Lakhs & Crores)
export function numberToIndianWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Rupees Zero Only';

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];

  const tens = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
  ];

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n];
    const unit = n % 10;
    return tens[Math.floor(n / 10)] + (unit ? ' ' + ones[unit] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let str = '';
    if (hundred) str += ones[hundred] + ' Hundred';
    if (rest) str += (str ? ' and ' : '') + convertTwoDigits(rest);
    return str;
  }

  let num = rounded;
  let result = '';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const remainder = num;

  if (crore) {
    result += convertTwoDigits(crore) + ' Crore ';
  }
  if (lakh) {
    result += convertTwoDigits(lakh) + ' Lakh ';
  }
  if (thousand) {
    result += convertTwoDigits(thousand) + ' Thousand ';
  }
  if (remainder) {
    result += convertThreeDigits(remainder) + ' ';
  }

  return 'Rupees ' + result.trim() + ' Only';
}

// Calculates GST breakdown (CGST+SGST for Intra-state, IGST for Inter-state)
export function calculateGST(taxableAmount: number, gstRatePercent: number, isInterState: boolean = false) {
  const totalTax = (taxableAmount * gstRatePercent) / 100;
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax,
      rate: gstRatePercent,
    };
  } else {
    const halfTax = totalTax / 2;
    return {
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax,
      rate: gstRatePercent,
    };
  }
}

// Cleans phone numbers to 10-digit Indian standard
export function cleanMobile(mobile: string | undefined): string {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length > 10) {
    return digits.slice(-10);
  }
  return digits;
}

// Generates Direct WhatsApp Click-to-Chat Link
export function generateWhatsAppLink(mobile: string, message: string): string {
  const cleaned = cleanMobile(mobile);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/91${cleaned}?text=${encoded}`;
}

// Generates Standard UPI Payment URI for QR code generation
export function generateUPIPaymentUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  transactionNote: string = 'Mobile Store Payment'
): string {
  const cleanPa = encodeURIComponent(upiId.trim());
  const cleanPn = encodeURIComponent(payeeName.trim());
  const cleanAm = amount.toFixed(2);
  const cleanTn = encodeURIComponent(transactionNote.trim());
  
  return `upi://pay?pa=${cleanPa}&pn=${cleanPn}&am=${cleanAm}&cu=INR&tn=${cleanTn}`;
}
