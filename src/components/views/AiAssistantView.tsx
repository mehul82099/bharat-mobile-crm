import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  HelpCircle, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR, formatIndianDate, generateWhatsAppLink } from '../../utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionPayload?: {
    type: 'whatsapp' | 'view';
    mobile?: string;
    msg?: string;
  };
}

export const AiAssistantView: React.FC = () => {
  const { 
    phones, 
    accessories, 
    invoices, 
    customers, 
    suppliers, 
    repairJobs, 
    expenses, 
    employees, 
    settings 
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'ai',
      text: `Hello! I am your **BharatMobile AI Business Assistant**.\n\nI can analyze your store's live data, compute real-time sales figures, track pending Khata payments, audit low stock, calculate employee commissions, and generate professional WhatsApp message drafts for your customers.\n\nHow can I help you manage your mobile store today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sampleQuestions = [
    "What are today's total sales and profit?",
    "Which accessories are running low in stock?",
    "Show me customers with overdue Khata dues",
    "How much commission has Priya Patel earned?",
    "Which phones are currently available in stock?",
    "Draft a Diwali festival WhatsApp promotion",
  ];

  // Natural Language AI Processing
  const processQuery = (query: string): { responseText: string; action?: any } => {
    const q = query.toLowerCase();

    // 1. Sales & Profit
    if (q.includes('today') && (q.includes('sale') || q.includes('profit') || q.includes('revenue'))) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayInvoices = invoices.filter(i => i.date === todayStr && i.status !== 'Cancelled');
      const sales = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
      const cogs = todayInvoices.reduce((sum, inv) => sum + inv.items.reduce((s, it) => s + (it.purchaseCost * it.qty), 0), 0);
      const profit = sales - cogs;

      return {
        responseText: `📊 **Today's Business Summary (${formatIndianDate(new Date())})**:\n\n• **Today's Total Sales:** ${formatINR(sales)}\n• **Invoices Issued:** ${todayInvoices.length}\n• **Cost of Goods Sold (COGS):** ${formatINR(cogs)}\n• **Today's Gross Profit:** ${formatINR(profit)} (${sales > 0 ? Math.round((profit / sales) * 100) : 0}% margin)\n\n*Overall Showroom Revenue to date:* ${formatINR(invoices.reduce((s, i) => s + i.grandTotal, 0))}`
      };
    }

    // 2. Low stock
    if (q.includes('low') || q.includes('reorder') || q.includes('stock')) {
      const lowStockAcc = accessories.filter(a => a.currentStock <= a.minStockLevel);
      if (lowStockAcc.length === 0) {
        return {
          responseText: `✅ All accessories and phone stocks are currently above minimum threshold levels. No immediate reorders needed!`
        };
      }
      const list = lowStockAcc.map(a => `• **${a.name}** (Brand: ${a.brand}) — Current Stock: **${a.currentStock}** (Min: ${a.minStockLevel})`).join('\n');
      return {
        responseText: `⚠️ **Low Stock Reorder Alert (${lowStockAcc.length} items):**\n\n${list}\n\n*Suggested Action:* Contact suppliers (${suppliers.map(s => s.name).join(', ')}) to place a purchase replenishment order.`
      };
    }

    // 3. Khata / Overdue Customer dues
    if (q.includes('khata') || q.includes('due') || q.includes('pending payment') || q.includes('overdue')) {
      const debtors = customers.filter(c => c.outstandingBalance > 0);
      const totalDue = debtors.reduce((s, c) => s + c.outstandingBalance, 0);
      const list = debtors.map(c => `• **${c.name}** (+91 ${c.mobile}) — Due: **${formatINR(c.outstandingBalance)}** (Credit Limit: ${formatINR(c.creditLimit)})`).join('\n');
      return {
        responseText: `💰 **Outstanding Khata Balances:**\nTotal Outstanding: **${formatINR(totalDue)}** across ${debtors.length} customers.\n\n${list}\n\n*Tip:* You can send an automated WhatsApp payment reminder link to these customers directly from the CRM tab.`
      };
    }

    // 4. Employee Commission
    if (q.includes('commission') || q.includes('priya') || q.includes('rahul') || q.includes('manoj')) {
      const empName = q.includes('rahul') ? 'Rahul Singh' : q.includes('manoj') ? 'Manoj Kumar' : 'Priya Patel';
      const emp = employees.find(e => e.name.toLowerCase().includes(empName.toLowerCase().split(' ')[0])) || employees[0];
      const empInvoices = invoices.filter(i => i.salesEmployeeId === emp.id && i.status !== 'Cancelled');
      
      let phoneComm = 0;
      let accComm = 0;
      empInvoices.forEach(inv => {
        inv.items.forEach(it => {
          if (it.type === 'phone') phoneComm += (emp.commissionRules.phoneFixedCommission * it.qty);
          if (it.type === 'accessory') accComm += (it.total * emp.commissionRules.accessoryCommissionPercent) / 100;
        });
      });
      const totalSales = empInvoices.reduce((s, i) => s + i.grandTotal, 0);

      return {
        responseText: `🎖️ **Commission & Performance Analysis for ${emp.name} (${emp.role})**:\n\n• **Total Sales Generated:** ${formatINR(totalSales)}\n• **Monthly Sales Target:** ${formatINR(emp.monthlySalesTarget)} (${Math.round((totalSales / emp.monthlySalesTarget) * 100)}% achieved)\n• **Phone Commission (₹${emp.commissionRules.phoneFixedCommission}/unit):** ${formatINR(phoneComm)}\n• **Accessory Commission (${emp.commissionRules.accessoryCommissionPercent}%):** ${formatINR(accComm)}\n• **Total Commission Earned:** **${formatINR(phoneComm + accComm)}**`
      };
    }

    // 5. Available Phones
    if (q.includes('phone') && (q.includes('available') || q.includes('list'))) {
      const avail = phones.filter(p => p.status === 'Available');
      const list = avail.map(p => `• **${p.name}** (${p.color}, ${p.storage}) — Price: **${formatINR(p.sellingPrice)}** | IMEI: \`${p.imei1}\``).join('\n');
      return {
        responseText: `📱 **Available Phones in Stock (${avail.length} Units):**\n\n${list}`
      };
    }

    // 6. Draft WhatsApp Promotion
    if (q.includes('draft') || q.includes('whatsapp') || q.includes('diwali') || q.includes('festival') || q.includes('promo')) {
      const promoMsg = `✨ *Grand Festive Offers at ${settings.shopName}!* ✨\n\nUpgrade your smartphone this festive season with exclusive deals:\n📱 *iPhone 15 & S24 Ultra* available at best exchange rates!\n🎁 *Free 9H Tempered Glass + Smoke Armor Case* on every smartphone purchase!\n💳 Instant EMI starting @ ₹0 Down Payment via Bajaj Finserv & HDFC!\n\n📍 Visit our showroom: ${settings.address}, ${settings.city}\n📞 Call: +91 ${settings.phone}\n\n*Limited stock. Visit us today!*`;

      return {
        responseText: `📝 **Generated Festive WhatsApp Broadcast Draft:**\n\n\`\`\`\n${promoMsg}\n\`\`\`\n\nYou can copy this text or broadcast it to your customer list!`,
        action: {
          type: 'whatsapp',
          msg: promoMsg
        }
      };
    }

    // Default intelligent answer
    return {
      responseText: `I've analyzed your store records. Currently:\n• **${phones.filter(p => p.status === 'Available').length} mobile phones** in active stock\n• **${customers.length} registered customers** with **${formatINR(customers.reduce((s, c) => s + c.outstandingBalance, 0))}** total Khata balance\n• **${repairJobs.filter(r => r.status !== 'Delivered').length} active repair tickets** in the service center\n\nYou can ask me specific questions like: *"What were today's sales?"*, *"Which items are low in stock?"*, or *"Calculate staff commission"*!`
    };
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');

    // Simulate AI thinking and response
    setTimeout(() => {
      const { responseText, action } = processQuery(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionPayload: action
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 400);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI Business Assistant & Smart Co-pilot
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime conversational queries on store metrics, Khata collections, reorder intelligence, and message drafting
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs font-semibold px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1.5 text-left"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            {q}
          </button>
        ))}
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:opacity-100 flex items-center gap-1 transition-opacity"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about sales, low stock, customer Khata, or draft messages..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-purple-600/30 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
