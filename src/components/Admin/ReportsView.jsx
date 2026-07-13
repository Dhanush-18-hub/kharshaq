import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Layers,
  ShoppingBag,
  TrendingUp,
  Percent,
  PlusCircle,
  Trash2,
  Settings,
  Sliders,
  Search,
  ArrowUpDown,
  Download,
  IndianRupee,
  FileText,
  HelpCircle,
  Eye,
  Activity,
  Users,
  CreditCard,
  PercentCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReportsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('Overview'); // 'Overview', 'Expenses', 'Settings'
  const [filter, setFilter] = useState('this-month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState(['Completed', 'Delivered']);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Expenses state
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'Delivery Charges', amount: '', description: '', date: '' });

  // GST percentage state
  const [gstPercent, setGstPercent] = useState(18.0);
  const [savingGst, setSavingGst] = useState(false);

  // Ledger state
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSortKey, setLedgerSortKey] = useState('month');
  const [ledgerSortAsc, setLedgerSortAsc] = useState(false);

  // Products state
  const [prodSearch, setProdSearch] = useState('');

  // Fetch financial analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = selectedStatuses.join(',');
      let url = `/api/admin/financial-analytics?filter=${filter}&status=${statusParam}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to retrieve financial analytics from database. Please verify connection and admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expenses list
  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await api.get('/api/admin/expenses');
      setExpenses(res.data.expenses || []);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Fetch GST percentage
  const fetchGst = async () => {
    try {
      const res = await api.get('/api/admin/gst-config');
      setGstPercent(res.data.gst_percent);
    } catch (err) {
      console.error('Failed to fetch GST config:', err);
    }
  };

  useEffect(() => {
    if (filter !== 'custom') {
      fetchAnalytics();
    }
  }, [filter, selectedStatuses]);

  useEffect(() => {
    fetchExpenses();
    fetchGst();
  }, []);

  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      return toast.error('Please choose both start and end dates.');
    }
    fetchAnalytics();
  };

  // Record a new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      return toast.error('Please enter a valid expense amount.');
    }
    try {
      const payload = {
        category: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date ? new Date(expenseForm.date).toISOString() : new Date().toISOString()
      };
      await api.post('/api/admin/expenses', payload);
      toast.success('Expense recorded successfully!');
      setExpenseForm({ category: 'Delivery Charges', amount: '', description: '', date: '' });
      fetchExpenses();
      fetchAnalytics(); // Recalculate profit analytics
    } catch (err) {
      console.error('Failed to add expense:', err);
      toast.error('Failed to register expense.');
    }
  };

  // Delete an expense
  const handleDeleteExpense = async (id) => {
    try {
      await api.delete(`/api/admin/expenses/${id}`);
      toast.success('Expense record deleted!');
      fetchExpenses();
      fetchAnalytics(); // Recalculate profit
    } catch (err) {
      console.error('Failed to delete expense:', err);
      toast.error('Failed to delete expense record.');
    }
  };

  // Update GST Percentage settings
  const handleSaveGst = async () => {
    try {
      setSavingGst(true);
      await api.post('/api/admin/gst-config', { gst_percent: parseFloat(gstPercent) });
      toast.success('GST tax configuration updated successfully!');
      fetchAnalytics(); // Reload metrics
    } catch (err) {
      console.error('Failed to update GST config:', err);
      toast.error('Failed to save GST configuration.');
    } finally {
      setSavingGst(false);
    }
  };

  // Format Currency values (Indian Rupees)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Export report to CSV
  const handleExportCSV = (type = 'ledger') => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'ledger') {
      csvContent += 'Month,Orders,Gross Revenue,Conversion Rate\n';
      data.monthlyLedger.forEach(row => {
        csvContent += `"${row.month}",${row.orders},${row.revenue},"${row.conversion}"\n`;
      });
    } else if (type === 'products') {
      csvContent += 'Product ID,Product Name,Units Sold,Revenue,Profit,Stock\n';
      data.topSelling.forEach(p => {
        csvContent += `"${p.id}","${p.name}",${p.sold},${p.revenue},${p.profit},${p.stock}\n`;
      });
    } else if (type === 'payment') {
      csvContent += 'Payment Method,Gross Amount,Orders count,Percentage\n';
      data.paymentAnalytics.forEach(p => {
        csvContent += `"${p.method}",${p.amount},${p.orders},"${p.percentage}%"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_${type}_report_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV report exported successfully!');
  };

  // Trigger Print layout (PDF)
  const handlePrint = () => {
    window.print();
  };

  // Toggle order status in selections
  const toggleStatusSelection = (status) => {
    setSelectedStatuses(prev => {
      const index = prev.indexOf(status);
      if (index > -1) {
        if (prev.length === 1) {
          toast.error('Select at least one status.');
          return prev;
        }
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Sorting handlers for Ledger
  const handleSortLedger = (key) => {
    if (ledgerSortKey === key) {
      setLedgerSortAsc(!ledgerSortAsc);
    } else {
      setLedgerSortKey(key);
      setLedgerSortAsc(false);
    }
  };

  // Process data if available
  const filteredLedger = data?.monthlyLedger
    ? data.monthlyLedger.filter(row => 
        row.month.toLowerCase().includes(ledgerSearch.toLowerCase())
      ).sort((a, b) => {
        let valA = a[ledgerSortKey];
        let valB = b[ledgerSortKey];
        if (ledgerSortKey === 'month') {
          const dateA = new Date(valA);
          const dateB = new Date(valB);
          return ledgerSortAsc ? dateA - dateB : dateB - dateA;
        }
        if (ledgerSortKey === 'conversion') {
          valA = parseFloat(valA.replace('%', ''));
          valB = parseFloat(valB.replace('%', ''));
        }
        return ledgerSortAsc ? valA - valB : valB - valA;
      })
    : [];

  const filteredTopProducts = data?.topSelling
    ? data.topSelling.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
    : [];

  const filteredLowProducts = data?.lowSelling
    ? data.lowSelling.filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
    : [];

  // SVG Chart points calculation
  const trendLabels = data?.trends?.labels || [];
  const trendSales = data?.trends?.sales || [];
  const trendOrders = data?.trends?.orders || [];
  const maxSales = trendSales.length > 0 ? Math.max(...trendSales, 100) : 100;
  
  const getChartY = (salesVal) => {
    const minY = 160;
    const maxY = 20;
    const ratio = salesVal / maxSales;
    return minY - ratio * (minY - maxY);
  };

  const chartPoints = trendLabels.map((lbl, idx) => {
    const sVal = trendSales[idx] || 0;
    const oVal = trendOrders[idx] || 0;
    const x = trendLabels.length > 1 ? 30 + (idx / (trendLabels.length - 1)) * 420 : 30;
    const y = getChartY(sVal);
    return { label: lbl, sales: sVal, orders: oVal, x, y };
  });

  const chartLinePath = chartPoints.length > 0 
    ? 'M ' + chartPoints.map(pt => `${pt.x},${pt.y}`).join(' L ') 
    : '';

  const chartAreaPath = chartPoints.length > 0 
    ? `M 30,180 L ${chartPoints.map(pt => `${pt.x},${pt.y}`).join(' L ')} L 450,180 Z` 
    : '';

  const getDisplayLabel = (lbl, idx, total) => {
    if (total <= 12) return lbl;
    if (total === 24) return idx % 4 === 0 ? lbl : '';
    if (total > 24 && total <= 31) return idx % 5 === 0 ? lbl : '';
    const step = Math.ceil(total / 6) || 1;
    return idx % step === 0 ? lbl : '';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-left select-none">
        <div className="flex justify-between items-center mb-4">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-gray-200 rounded-xl" />
            <div className="h-4 w-72 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-9 w-28 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl h-24 flex items-center justify-between shadow-sm">
              <div className="space-y-2 w-2/3">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-200 rounded" />
              </div>
              <div className="w-9 h-9 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="h-[320px] bg-white border border-gray-100 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center bg-white border border-gray-100 rounded-3xl shadow-sm text-left select-none max-w-xl mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-lg font-black text-gray-800">Analytics Loading Error</h3>
        <p className="text-sm text-gray-500 leading-relaxed font-sans">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
        >
          <Activity className="w-4 h-4" />
          <span>Retry Loading Database</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports & Auditing</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">Audit detailed conversion, dynamic profit margin, expenses, and taxes in real-time</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="relative">
            <button 
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="bg-white border border-gray-100 text-xs font-bold text-gray-600 px-3.5 py-2.5 rounded-xl outline-none hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              <span>Status ({selectedStatuses.length})</span>
            </button>
            {statusDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-3 z-50 space-y-2 text-left text-xs font-semibold">
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">Filter by Status</span>
                {['Completed', 'Delivered', 'Pending', 'Cancelled', 'Refunded'].map((st) => (
                  <label key={st} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition select-none">
                    <input 
                      type="checkbox" 
                      checked={selectedStatuses.includes(st)} 
                      onChange={() => toggleStatusSelection(st)}
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                    />
                    <span>{st}</span>
                  </label>
                ))}
                <button 
                  onClick={() => { setStatusDropdownOpen(false); fetchAnalytics(); }}
                  className="w-full text-center bg-emerald-600 text-white rounded-xl py-1 text-[11px] font-bold mt-2 cursor-pointer"
                >
                  Apply Status
                </button>
              </div>
            )}
          </div>

          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-100 text-xs font-bold text-gray-600 px-3.5 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="this-week">This Week</option>
            <option value="last-week">Last Week</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          <button 
            onClick={handlePrint}
            className="bg-white border border-gray-100 text-xs font-bold text-gray-600 px-3.5 py-2.5 rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer"
            title="Export full reports layout as PDF"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {filter === 'custom' && (
        <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-100/50 p-4 rounded-2xl select-none animate-fadeIn print:hidden text-left">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</span>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">End Date</span>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:border-emerald-500 outline-none"
            />
          </div>
          <button 
            onClick={handleApplyCustom}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Apply Date Filter
          </button>
        </div>
      )}

      {/* Sub tabs selector */}
      <div className="flex border-b border-gray-100 select-none print:hidden">
        {['Overview', 'Expenses', 'Settings'].map((t) => (
          <button
            key={t}
            onClick={() => setActiveSubTab(t)}
            className={`px-6 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeSubTab === t
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'Overview' && 'Overview Analytics'}
            {t === 'Expenses' && 'Expenses Tracker'}
            {t === 'Settings' && 'Tax settings'}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeSubTab === 'Overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Metrics grids */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 select-none">
            {/* AOV */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average Order Value</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">{formatCurrency(data.aov)}</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Calculated from Completed sales</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            {/* Conversion */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Conversion Rate</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">{data.conversionRate}%</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1 font-sans">Orders ÷ Registered customers</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            {/* New signups */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">New Registered Profiles</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">+{data.newRegisteredProfiles}</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">User signups in selected range</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            {/* Revenue */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Gross Revenue</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">{formatCurrency(data.revenue)}</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Matches Graph & Dashboard</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>

            {/* Net after tax */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Revenue (After Tax)</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">{formatCurrency(data.taxCalculation.netRevenueAfterTax)}</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Excludes reverse-calculated GST</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <PercentCircle className="w-5 h-5" />
              </div>
            </div>

            {/* Profit margin */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between col-span-1 lg:col-span-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Net Profit Margin</span>
                <h3 className="text-xl font-extrabold text-gray-800 mt-2">{formatCurrency(data.profitCalculation.profit)}</h3>
                <span className="text-[9px] text-gray-400 font-semibold block mt-1">Margin: {data.profitCalculation.profitMargin}%</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Graph trend */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 select-none">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Revenue & Orders Trend</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Plot values matching the selected calendar range</p>
              </div>
            </div>

            <div className="relative h-[225px] w-full flex items-end">
              {chartPoints.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                  <ShoppingBag className="w-10 h-10 text-gray-300 mb-1" />
                  <p className="text-sm font-bold text-gray-400">No Sales Data Available</p>
                </div>
              ) : (
                <svg viewBox="0 0 480 180" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="curve-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  <line x1="0" y1="20" x2="480" y2="20" stroke="#f9fafb" strokeWidth="2" />
                  <line x1="0" y1="100" x2="480" y2="100" stroke="#f9fafb" strokeWidth="2" />
                  <line x1="0" y1="180" x2="480" y2="180" stroke="#f3f4f6" strokeWidth="1" />

                  <path d={chartAreaPath} fill="url(#curve-grad)" />
                  <path d={chartLinePath} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />

                  {chartPoints.map((pt, i) => (
                    <g key={i}>
                      {/* Visible dot node */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={7} 
                        fill={selectedPoint?.label === pt.label ? '#059669' : '#ffffff'} 
                        stroke="#059669" 
                        strokeWidth={selectedPoint?.label === pt.label ? 3.5 : 2} 
                        className="transition-all"
                        pointerEvents="none"
                      />
                      {/* Large invisible interactive hover zone */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={24}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setSelectedPoint(pt)}
                        onMouseLeave={() => setSelectedPoint(null)}
                      />
                    </g>
                  ))}
                </svg>
              )}

              {selectedPoint && (
                <div 
                  className="absolute bg-emerald-950 text-white rounded-xl px-3 py-2 text-[10px] font-bold shadow-lg border border-emerald-800/80 z-50 text-left min-w-[120px] pointer-events-none"
                  style={{ 
                    left: `${(selectedPoint.x / 480) * 100}%`, 
                    bottom: `${((180 - selectedPoint.y + 15) / 180) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="text-gray-400">{selectedPoint.label}</div>
                  <div className="text-emerald-400 mt-0.5 text-[11px] font-extrabold font-sans">Sales: {formatCurrency(selectedPoint.sales)}</div>
                  <div className="text-gray-200 mt-0.5 font-sans">Orders: {selectedPoint.orders}</div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-4 px-2 select-none">
              {chartPoints.map((pt, i) => (
                <span key={i} className="text-[10px] font-black text-gray-400 min-w-[15px] text-center">
                  {getDisplayLabel(pt.label, i, chartPoints.length)}
                </span>
              ))}
            </div>
          </div>

          {/* Table ledger & categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 lg:col-span-8 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Monthly Sales Ledger</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5 font-sans">Dynamically compiled completed transactions</p>
                </div>
                <div className="flex items-center gap-2 select-none print:hidden">
                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search month..."
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="bg-gray-50 border border-gray-100 pl-8 pr-3 py-1.5 text-xs font-bold text-gray-600 rounded-xl outline-none focus:bg-white focus:border-emerald-500 w-full"
                    />
                  </div>
                  <button 
                    onClick={() => handleExportCSV('ledger')}
                    className="p-2 border border-gray-100 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    title="Export Ledger to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 select-none">
                      <th className="py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSortLedger('month')}>
                        <span className="flex items-center gap-1">Month <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSortLedger('orders')}>
                        <span className="flex items-center gap-1">Orders Count <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSortLedger('revenue')}>
                        <span className="flex items-center gap-1">Gross Revenue <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                      <th className="py-3 px-4 cursor-pointer hover:text-gray-700" onClick={() => handleSortLedger('conversion')}>
                        <span className="flex items-center gap-1">Conversion Rate <ArrowUpDown className="w-3 h-3" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {filteredLedger.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4 font-bold text-gray-800">{row.month}</td>
                        <td className="py-3 px-4 font-mono">{row.orders} Orders</td>
                        <td className="py-3 px-4 font-bold text-gray-900 font-sans">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 px-4 text-emerald-600">{row.conversion}</td>
                      </tr>
                    ))}
                    {filteredLedger.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-400 font-bold select-none">
                          No ledger rows match query.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 lg:col-span-4 flex flex-col justify-between">
              <div className="select-none">
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Category Breakdown</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Dynamic category revenue splits</p>
              </div>

              <div className="space-y-4 mt-6">
                {(data.categoryRevenue || []).map((cat, i) => {
                  const pct = data.revenue > 0 ? (cat.revenue / data.revenue) * 100 : 0;
                  return (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>{cat.name}</span>
                        <span className="font-mono text-gray-500 font-sans">{formatCurrency(cat.revenue)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                        <span>Orders: {cat.orders}</span>
                        <span>Profit: {formatCurrency(cat.profit)}</span>
                      </div>
                    </div>
                  );
                })}
                {(data.categoryRevenue || []).length === 0 && (
                  <div className="py-12 text-center text-gray-400 font-semibold select-none">
                    No sales recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discount and refund cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 tracking-tight mb-4 uppercase">Discount & Coupon Analytics</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Total Discount Given</span>
                    <span className="text-base text-gray-800 font-sans">{formatCurrency(data.discountAnalytics.totalDiscount)}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Coupon Usage Count</span>
                    <span className="text-base text-gray-800">{data.discountAnalytics.couponUsageCount} Times</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Highest Used Coupon</span>
                    <span className="text-base text-gray-800 truncate block">{data.discountAnalytics.highestUsedCoupon}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Average Discount value</span>
                    <span className="text-base text-gray-800 font-sans">{formatCurrency(data.discountAnalytics.averageDiscount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-gray-800 tracking-tight mb-4 uppercase">Refund Analytics & Audits</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Refund Requests</span>
                    <span className="text-base text-gray-800">{data.refundAnalytics.requests} Claims</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Approved Refunds</span>
                    <span className="text-base text-gray-800">{data.refundAnalytics.approved} approved</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Rejected Claims</span>
                    <span className="text-base text-gray-800">{data.refundAnalytics.rejected} rejected</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Refunded Amount</span>
                    <span className="text-base text-rose-600 font-sans">{formatCurrency(data.refundAnalytics.amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer loyalty and payment distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 lg:col-span-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Customer Analytics</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Database audit of customer spend patterns</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6 text-xs font-bold">
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <span className="text-[10px] text-gray-400 block mb-1">New Customers</span>
                    <span className="text-base text-gray-800">+{data.customerAnalytics.newCustomers}</span>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Returning Customers</span>
                    <span className="text-base text-gray-800">+{data.customerAnalytics.returningCustomers}</span>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 col-span-2">
                    <span className="text-[10px] text-gray-400 block mb-1">Highest Spending Customer</span>
                    <span className="text-sm text-gray-800 truncate block font-sans">{data.customerAnalytics.highestSpendingCustomer} ({formatCurrency(data.customerAnalytics.highestSpendingAmount)})</span>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Repeat Purchase Rate</span>
                    <span className="text-base text-emerald-600">{data.customerAnalytics.repeatPurchaseRate}%</span>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <span className="text-[10px] text-gray-400 block mb-1">Customer LTV (Avg)</span>
                    <span className="text-base text-gray-800 font-sans">{formatCurrency(data.customerAnalytics.lifetimeValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 lg:col-span-6 flex flex-col justify-between">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Payment Distribution</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Track usage percentages per payment channel</p>

                <div className="space-y-3.5 mt-6">
                  {data.paymentAnalytics.map((pm, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>{pm.method}</span>
                        <span className="font-mono text-gray-500 font-sans">{formatCurrency(pm.amount)} ({pm.percentage}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100/50">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pm.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400 font-semibold">
                        <span>{pm.orders} Orders processed</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Growth comparison */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50 select-none">
            <h4 className="font-extrabold text-base text-gray-900 tracking-tight mb-1">Monthly Comparison</h4>
            <p className="text-xs font-semibold text-gray-400 mb-6 font-sans">Compare this calendar month vs prior calendar month</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-bold text-left">
              {[
                { label: 'Revenue Growth', val: data.monthlyComparison.revenueGrowth },
                { label: 'Order Growth', val: data.monthlyComparison.orderGrowth },
                { label: 'Customer Growth', val: data.monthlyComparison.customerGrowth },
                { label: 'Profit Growth', val: data.monthlyComparison.profitGrowth },
                { label: 'AOV Growth', val: data.monthlyComparison.aovGrowth }
              ].map((grow, idx) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-gray-400 block mb-2">{grow.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-base font-extrabold ${grow.val >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {grow.val >= 0 ? '+' : ''}{grow.val}%
                    </span>
                    {grow.val >= 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-rose-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product sales statistics */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Top Selling Products (Top 10)</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Top performing products ordered in active range</p>
              </div>
              <div className="flex items-center gap-2 select-none print:hidden">
                <div className="relative w-44">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search product..."
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="bg-gray-50 border border-gray-100 pl-8 pr-3 py-1.5 text-xs font-bold text-gray-600 rounded-xl outline-none focus:bg-white focus:border-emerald-500 w-full"
                  />
                </div>
                <button 
                  onClick={() => handleExportCSV('products')}
                  className="p-2 border border-gray-100 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition cursor-pointer"
                  title="Export Top Products to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 select-none">
                    <th className="py-2.5 px-4">Product Name</th>
                    <th className="py-2.5 px-4">Units Sold</th>
                    <th className="py-2.5 px-4">Gross Revenue</th>
                    <th className="py-2.5 px-4">Estimated Profit</th>
                    <th className="py-2.5 px-4">Current Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {filteredTopProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition">
                      <td className="py-2.5 px-4 font-bold text-gray-800">{p.name}</td>
                      <td className="py-2.5 px-4 font-mono">{p.sold} sold</td>
                      <td className="py-2.5 px-4 font-sans font-bold text-gray-900">{formatCurrency(p.revenue)}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-sans">{formatCurrency(p.profit)}</td>
                      <td className="py-2.5 px-4 font-mono">{p.stock} units</td>
                    </tr>
                  ))}
                  {filteredTopProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 font-bold select-none">
                        No product matches query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50">
              <div className="mb-6 select-none">
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Low Selling Products</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Ordered products with lowest performance</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="py-2.5 px-4">Product Name</th>
                      <th className="py-2.5 px-4">Units Sold</th>
                      <th className="py-2.5 px-4">Gross Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {filteredLowProducts.map((p, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-4 font-bold text-gray-800">{p.name}</td>
                        <td className="py-2.5 px-4 font-mono">{p.sold} sold</td>
                        <td className="py-2.5 px-4 font-sans font-bold text-gray-900">{formatCurrency(p.revenue)}</td>
                      </tr>
                    ))}
                    {filteredLowProducts.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400 font-bold">
                          No low selling products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50/50">
              <div className="mb-6 select-none">
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Dead Inventory (Never Purchased)</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Catalog products with zero sold volumes</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="py-2.5 px-4">Product Name</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Current Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {data.deadInventory.map((p, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-4 font-bold text-gray-800">{p.name}</td>
                        <td className="py-2.5 px-4 text-emerald-600">{p.category}</td>
                        <td className="py-2.5 px-4 font-mono text-rose-500">{p.stock} units left</td>
                      </tr>
                    ))}
                    {data.deadInventory.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-gray-400 font-bold">
                          No dead inventory found in catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EXPENSES TAB */}
      {activeSubTab === 'Expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn text-left">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm shadow-gray-50/50 lg:col-span-4 select-none">
            <h4 className="font-extrabold text-sm text-gray-900 tracking-tight mb-4 uppercase">Record Store Expense</h4>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Category</label>
                <select 
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option value="Delivery Charges">Delivery Charges</option>
                  <option value="Packaging Cost">Packaging Cost</option>
                  <option value="Marketing Cost">Marketing Cost</option>
                  <option value="Warehouse Expenses">Warehouse Expenses</option>
                  <option value="Employee Salary">Employee Salary</option>
                  <option value="Other Expenses">Other Expenses</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Amount (₹)</label>
                <input 
                  type="number"
                  placeholder="Enter cost value e.g. 500"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Expense Date</label>
                <input 
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Description (Optional)</label>
                <textarea 
                  placeholder="Record note details e.g. Box wraps, Blinkit delivery..."
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-100/50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Save Expense Record</span>
              </button>
            </form>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm shadow-gray-50/50 lg:col-span-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Recorded Store Expenses</h4>
                  <p className="text-xs font-semibold text-gray-400 mt-0.5 font-sans">Manage and track recorded organizational expenses</p>
                </div>
                {loadingExpenses && (
                  <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 select-none">
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4">Category</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Notes</th>
                      <th className="py-2.5 px-4 text-center print:hidden">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-2.5 px-4 font-mono">{new Date(exp.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="py-2.5 px-4"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-lg">{exp.category}</span></td>
                        <td className="py-2.5 px-4 font-bold text-gray-900 font-sans">{formatCurrency(exp.amount)}</td>
                        <td className="py-2.5 px-4 font-sans text-gray-400 max-w-xs truncate">{exp.description || '—'}</td>
                        <td className="py-2.5 px-4 text-center print:hidden">
                          <button 
                            onClick={() => handleDeleteExpense(exp.id)}
                            className="p-1.5 text-gray-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                            title="Delete this expense record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-gray-400 font-bold select-none">
                          No expense logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeSubTab === 'Settings' && (
        <div className="max-w-2xl bg-white border border-gray-100 p-6 rounded-3xl shadow-sm shadow-gray-50/50 animate-fadeIn text-left select-none">
          <h4 className="font-extrabold text-sm text-gray-900 tracking-tight mb-2 uppercase flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-600" />
            <span>Tax Configurations & GST parameters</span>
          </h4>
          <p className="text-xs font-semibold text-gray-400 mb-6 leading-normal font-sans">
            Configure default GST tax rates. GST calculations are automatically computed backwards (reverse calculations) based on this rate.
          </p>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
              <div className="space-y-1 max-w-xs">
                <span className="text-xs font-bold text-gray-800">GST Collected Percentage</span>
                <p className="text-[11px] text-gray-400 leading-normal font-sans">Set default tax percentage collected on items total (e.g. 18.0%)</p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(e.target.value)}
                  className="bg-white border border-gray-200 rounded-xl p-2 w-20 text-xs font-bold text-center text-gray-700 outline-none focus:border-emerald-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
                <span className="text-xs font-extrabold text-gray-400">%</span>
              </div>
            </div>

            <div className="p-4 border border-emerald-100 bg-emerald-50/20 rounded-2xl space-y-3 font-semibold text-xs leading-relaxed text-emerald-800">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block mb-1">Live reverse tax calculations:</span>
              <div className="flex justify-between">
                <span>GST Tax collected ({data.taxCalculation.taxPercentage}%):</span>
                <span className="font-bold font-sans">{formatCurrency(data.taxCalculation.gstCollected)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxable Revenue (Net before Tax):</span>
                <span className="font-bold font-sans">{formatCurrency(data.taxCalculation.taxableRevenue)}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-100 pt-2 font-bold text-emerald-900 text-sm">
                <span>Gross Revenue (Collected total):</span>
                <span className="font-sans">{formatCurrency(data.revenue)}</span>
              </div>
            </div>

            <button
              onClick={handleSaveGst}
              disabled={savingGst}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold transition cursor-pointer select-none"
            >
              {savingGst ? 'Saving config...' : 'Save GST configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
