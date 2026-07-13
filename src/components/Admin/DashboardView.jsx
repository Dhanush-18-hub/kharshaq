import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Eye, 
  AlertCircle,
  IndianRupee,
  FileText,
  Percent,
  PlusCircle,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DashboardView({ stats, loadingStats, setActiveTab, refreshStats }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [activeFilter, setActiveFilter] = useState('this-week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Trigger data refetch when activeFilter changes
  React.useEffect(() => {
    if (activeFilter !== 'custom') {
      refreshStats(activeFilter);
    }
  }, [activeFilter]);

  const handleApplyCustom = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates.');
      return;
    }
    refreshStats('custom', startDate, endDate);
  };

  // Convert numbers to Indian format (e.g. ₹2,45,680)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Skeleton Loader rendering
  if (loadingStats || !stats) {
    return (
      <div className="space-y-8 animate-pulse text-left select-none">
        {/* Welcome Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-gray-200 rounded-xl" />
            <div className="h-4 w-64 bg-gray-200 rounded-lg" />
          </div>
          <div className="h-9 w-24 bg-gray-200 rounded-xl" />
        </div>
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-5 rounded-2xl h-[105px] flex items-center justify-between shadow-sm">
              <div className="space-y-2.5 w-2/3">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-4 w-12 bg-gray-200 rounded-md" />
              </div>
              <div className="w-11 h-11 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
        {/* Chart Skeleton */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 h-[320px] flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-24 bg-gray-200 rounded-xl" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Format values
  const revenueStr = stats ? formatCurrency(stats.revenue) : '₹0';
  const ordersCount = stats?.ordersCount ?? 0;
  const customersCount = stats?.customersCount ?? 0;
  const productsCount = stats?.productsCount ?? 0;
  const pendingOrders = stats?.pendingOrders ?? 0;
  const profitStr = stats ? formatCurrency(stats.profit) : '₹0';

  // Sales points computed dynamically from backend stats
  const labels = stats?.salesOverview?.labels || [];
  const salesValues = stats?.salesOverview?.sales || [];
  const ordersValues = stats?.salesOverview?.orders || [];

  // Dynamically scale y-coordinate based on maximum sales in the current dataset
  const maxSalesVal = salesValues.length > 0 ? Math.max(...salesValues, 1000) : 1000;
  
  const getChartY = (salesVal) => {
    const minY = 160;
    const maxY = 30;
    const ratio = salesVal / maxSalesVal;
    return minY - ratio * (minY - maxY);
  };

  const weekData = labels.map((label, idx) => {
    const sales = salesValues[idx] || 0;
    const ordersCountVal = ordersValues[idx] || 0;
    const x = labels.length > 1 ? 30 + (idx / (labels.length - 1)) * 420 : 30;
    const y = getChartY(sales);
    return { day: label, sales, ordersCount: ordersCountVal, x, y };
  });

  // Dynamically compute display helper for label spacing
  const getDisplayLabel = (label, idx, total) => {
    if (total <= 12) return label;
    if (total === 24) return idx % 4 === 0 ? label : '';
    if (total > 24 && total <= 31) return idx % 5 === 0 ? label : '';
    const step = Math.ceil(total / 6) || 1;
    return idx % step === 0 ? label : '';
  };

  // Dynamically compute the path strings
  const linePath = weekData.length > 0 ? "M " + weekData.map(pt => `${pt.x},${pt.y}`).join(" L ") : "";
  const areaPath = weekData.length > 0 ? `M 30,180 L ${weekData.map(pt => `${pt.x},${pt.y}`).join(" L ")} L 450,180 Z` : "";

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            {getGreeting()}, Admin! 👋
          </h2>
          <p className="text-sm font-semibold text-gray-400 mt-1">Here is what is happening with your store today.</p>
        </div>
        <button 
          onClick={refreshStats}
          className="self-start sm:self-center px-4 py-2 border border-gray-100 hover:border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 shadow-sm transition active:scale-95"
        >
          Refresh Feed
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50 flex items-center justify-between group hover:border-emerald-200 transition-all select-none">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Revenue</span>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{revenueStr}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-max">
              <TrendingUp className="w-3 h-3" />
              <span>+18.6%</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
            <IndianRupee className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50 flex items-center justify-between group hover:border-emerald-200 transition-all select-none">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Orders</span>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{ordersCount}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-max">
              <TrendingUp className="w-3 h-3" />
              <span>+12.4%</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
            <ClipboardList className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50 flex items-center justify-between group hover:border-emerald-200 transition-all select-none">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Customers</span>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{customersCount}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-max">
              <TrendingUp className="w-3 h-3" />
              <span>+8.7%</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50 flex items-center justify-between group hover:border-emerald-200 transition-all select-none">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Products</span>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{productsCount}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg w-max">
              <TrendingUp className="w-3 h-3" />
              <span>+4.3%</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Pending Orders Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm shadow-gray-50 flex items-center justify-between group hover:border-emerald-200 transition-all select-none">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Pending Orders</span>
            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">{pendingOrders}</h3>
            <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg w-max">
              <TrendingDown className="w-3 h-3" />
              <span>-3.2%</span>
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 group-hover:scale-105 transition">
            <AlertCircle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Main Charts & Activity layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Interactive Line Chart */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-8 flex flex-col justify-between select-none">
          <div className="flex flex-col mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Sales Overview</h4>
                <p className="text-xs font-semibold text-gray-400 mt-0.5">Track growth database-driven analytics</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'this-week', label: 'This Week' },
                  { id: 'this-month', label: 'This Month' },
                  { id: 'this-year', label: 'This Year' },
                  { id: 'custom', label: 'Custom Range' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition select-none cursor-pointer border ${
                      activeFilter === f.id
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-100/50'
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible custom date picker range */}
            {activeFilter === 'custom' && (
              <div className="flex flex-wrap items-center gap-4 bg-gray-50/50 border border-gray-100/80 p-3 rounded-2xl mt-4 select-none animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">From</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">To</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-xs font-bold text-gray-600 outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleApplyCustom}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer select-none"
                >
                  Apply Filter
                </button>
              </div>
            )}
          </div>

          {/* Line Chart Draw Area */}
          <div className="relative h-[220px] w-full flex items-end">
            {ordersCount === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-100 select-none">
                <ShoppingBag className="w-10 h-10 text-gray-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-gray-500">No sales data available</p>
                <p className="text-[11px] text-gray-400 font-medium mt-1">There are no completed or delivered orders in this period.</p>
              </div>
            ) : (
              <svg viewBox="0 0 480 180" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="30" x2="480" y2="30" stroke="#f3f4f6" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="480" y2="90" stroke="#f3f4f6" strokeDasharray="3 3" />
                <line x1="0" y1="150" x2="480" y2="150" stroke="#f3f4f6" strokeDasharray="3 3" />

                {/* Area Under Curve */}
                <path 
                  d={areaPath} 
                  fill="url(#line-grad)" 
                />

                {/* Line Curve */}
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#059669" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive nodes */}
                {weekData.map((pt, i) => (
                  <circle 
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={selectedPoint?.day === pt.day ? 7 : 4.5}
                    fill={selectedPoint?.day === pt.day ? "#059669" : "#ffffff"}
                    stroke="#059669"
                    strokeWidth={selectedPoint?.day === pt.day ? 3.5 : 2}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setSelectedPoint(pt)}
                    onMouseLeave={() => setSelectedPoint(null)}
                  />
                ))}
              </svg>
            )}

            {/* Hover Tooltip box */}
            {selectedPoint && (
              <div 
                className="absolute bg-emerald-950 text-white px-3 py-2.5 rounded-xl text-[10px] font-bold pointer-events-none shadow-md flex flex-col border border-emerald-800 z-50 text-left min-w-[125px]"
                style={{ 
                  left: `${Math.min(Math.max((selectedPoint.x / 480) * 85, 5), 80)}%`, 
                  bottom: `${180 - selectedPoint.y - 20}px` 
                }}
              >
                <span className="text-gray-400 font-semibold">{selectedPoint.day}</span>
                <span className="text-[11px] font-extrabold mt-1 text-emerald-400">Sales: {formatCurrency(selectedPoint.sales)}</span>
                <span className="text-gray-300 mt-0.5">Orders: {selectedPoint.ordersCount}</span>
              </div>
            )}
          </div>

          {/* Graph labels */}
          <div className="flex justify-between items-center px-4 mt-4 border-t border-gray-50 pt-4">
            {weekData.map((pt, i) => (
              <span key={i} className="text-[11px] font-bold text-gray-400 min-w-[20px] text-center">
                {getDisplayLabel(pt.day, i, weekData.length)}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Orders Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-4 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Recent Orders</h4>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Manage incoming logs</p>
            </div>
            <button 
              onClick={() => setActiveTab('Orders')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[240px] pr-1 scrollbar-thin">
            {(stats?.recentOrders || []).slice(0, 5).map((order) => (
              <div key={order.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-[11px] text-gray-500 border border-gray-100">
                    #{(order.id || '').replace('KSQ', '')}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-800 leading-tight truncate w-[110px]">
                      {order.customerName}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-sans block mt-0.5">{order.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-xs text-gray-800">{formatCurrency(order.total)}</span>
                  <span className={`inline-block text-[9px] font-extrabold px-1.5 py-0.5 rounded-md mt-1 ${
                    order.status === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : order.status === 'Pending' 
                      ? 'bg-amber-50 text-amber-700' 
                      : 'bg-blue-50 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-400">No recent orders found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-4 flex flex-col">
          <h4 className="font-extrabold text-base text-gray-900 tracking-tight mb-6">Top Selling Products</h4>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[280px] scrollbar-thin">
            {(stats?.topSelling || []).map((prod, index) => (
              <div key={prod.id || index} className="flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-[10px]">
                    {index + 1}
                  </div>
                  <img 
                    src={prod.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260"} 
                    alt={prod.name} 
                    className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-gray-800 leading-tight truncate w-[100px]">{prod.name}</h5>
                    <span className="text-[9px] text-gray-400 block mt-0.5">{prod.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-bold text-gray-800">{prod.sold} sold</span>
                  <span className="block text-[10px] text-gray-400 font-sans mt-0.5">{formatCurrency(prod.revenue)}</span>
                </div>
              </div>
            ))}
            {(!stats?.topSelling || stats.topSelling.length === 0) && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-xs font-semibold text-gray-400">Products table empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Sales by Category Doughnut */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-4 flex flex-col justify-between">
          <h4 className="font-extrabold text-base text-gray-900 tracking-tight mb-4">Sales by Category</h4>
          
          {/* Doughnut graph drawn inside SVG */}
          <div className="relative w-full flex items-center justify-center py-2 select-none">
            <svg viewBox="0 0 160 160" className="w-[140px] h-[140px] transform -rotate-90">
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f3f4f6" strokeWidth="20" />
              {/* Category Segment 1: Fruits & Veggie (42%) */}
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="345" strokeDashoffset="145" />
              {/* Category Segment 2: Staples (25%) */}
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="345" strokeDashoffset="230" />
              {/* Category Segment 3: Spices (15%) */}
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f59e0b" strokeWidth="20" strokeDasharray="345" strokeDashoffset="282" />
              {/* Category Segment 4: Dry Fruits (10%) */}
              <circle cx="80" cy="80" r="55" fill="transparent" stroke="#ec4899" strokeWidth="20" strokeDasharray="345" strokeDashoffset="316" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Sales</span>
              <span className="text-sm font-extrabold text-gray-800 mt-0.5">{stats ? formatCurrency(stats.revenue) : '₹2,45,680'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 border-t border-gray-50 pt-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-gray-500">Fruits & Vegs (42%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
              <span className="text-[10px] font-bold text-gray-500">Staples (25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
              <span className="text-[10px] font-bold text-gray-500">Spices (15%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-pink-500 rounded-full" />
              <span className="text-[10px] font-bold text-gray-500">Dry Fruits (10%)</span>
            </div>
          </div>
        </div>

        {/* Store Activity logs */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-4 flex flex-col">
          <h4 className="font-extrabold text-base text-gray-900 tracking-tight mb-6">Store Activity</h4>
          <div className="space-y-5 flex-1 overflow-y-auto max-h-[285px] pr-1 scrollbar-thin">
            {(stats?.activityLog || []).map((act) => (
              <div key={act.id} className="flex gap-4 items-start relative last:pb-0 pb-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 leading-relaxed font-sans">{act.text}</p>
                  <span className="text-[10px] text-gray-400 block mt-1">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions canvas section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 select-none">
        <h4 className="font-extrabold text-base text-gray-900 tracking-tight mb-5">Quick Actions Dashboard</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          <button 
            onClick={() => setActiveTab('Products')}
            className="p-4 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-center group cursor-pointer transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">Add Product</span>
          </button>

          <button 
            onClick={() => setActiveTab('Offers & Coupons')}
            className="p-4 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-center group cursor-pointer transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">Add Coupon</span>
          </button>

          <button 
            onClick={() => setActiveTab('Offers & Coupons')}
            className="p-4 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-center group cursor-pointer transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <Percent className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">Create Offer</span>
          </button>

          <button 
            onClick={() => setActiveTab('Orders')}
            className="p-4 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-center group cursor-pointer transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">View Orders</span>
          </button>

          <button 
            onClick={() => setActiveTab('Reports & Analytics')}
            className="p-4 border border-gray-100 hover:border-emerald-200 rounded-2xl flex flex-col items-center gap-2 text-center group cursor-pointer transition active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-700 mt-1">Generate Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}
