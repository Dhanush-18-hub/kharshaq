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

export default function DashboardView({ stats, setActiveTab, refreshStats }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Convert numbers to Indian format (e.g. ₹2,45,680)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format values
  const revenueStr = stats ? formatCurrency(stats.revenue) : '₹2,45,680';
  const ordersCount = stats?.ordersCount ?? 1248;
  const customersCount = stats?.customersCount ?? 3265;
  const productsCount = stats?.productsCount ?? 512;
  const pendingOrders = stats?.pendingOrders ?? 25;
  const profitStr = stats ? formatCurrency(stats.profit) : '₹44,222';

  // Sales points for SVG interactive chart
  const weekData = [
    { day: 'Mon', sales: 28000, x: 30, y: 140 },
    { day: 'Tue', sales: 31000, x: 100, y: 125 },
    { day: 'Wed', sales: 34000, x: 170, y: 110 },
    { day: 'Thu', sales: 30000, x: 240, y: 130 },
    { day: 'Fri', sales: 48000, x: 310, y: 50 },
    { day: 'Sat', sales: 36000, x: 380, y: 100 },
    { day: 'Sun', sales: 42000, x: 450, y: 80 }
  ];

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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-extrabold text-base text-gray-900 tracking-tight">Sales Overview</h4>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">Track growth weekly analytics</p>
            </div>
            <select className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 px-3 py-1.5 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>

          {/* Line Chart Draw Area */}
          <div className="relative h-[220px] w-full flex items-end">
            <svg viewBox="0 0 480 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="line-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10b981" stop-opacity="0.12" />
                  <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="30" x2="480" y2="30" stroke="#f3f4f6" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="480" y2="90" stroke="#f3f4f6" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="480" y2="150" stroke="#f3f4f6" strokeDasharray="3 3" />

              {/* Area Under Curve */}
              <path 
                d="M 30,140 L 100,125 L 170,110 L 240,130 L 310,50 L 380,100 L 450,80 L 450,180 L 30,180 Z" 
                fill="url(#line-grad)" 
              />

              {/* Line Curve */}
              <path 
                d="M 30,140 L 100,125 L 170,110 L 240,130 L 310,50 L 380,100 L 450,80" 
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

            {/* Hover Tooltip box */}
            {selectedPoint && (
              <div 
                className="absolute bg-emerald-950 text-white px-3 py-2 rounded-xl text-[10px] font-bold pointer-events-none shadow-md flex flex-col border border-emerald-800"
                style={{ 
                  left: `${(selectedPoint.x / 480) * 85}%`, 
                  bottom: `${180 - selectedPoint.y - 20}px` 
                }}
              >
                <span>{selectedPoint.day} sales</span>
                <span className="text-[12px] font-extrabold mt-0.5">{formatCurrency(selectedPoint.sales)}</span>
              </div>
            )}
          </div>

          {/* Graph labels */}
          <div className="flex justify-between items-center px-4 mt-4 border-t border-gray-50 pt-4">
            {weekData.map((pt, i) => (
              <span key={i} className="text-[11px] font-bold text-gray-400">{pt.day}</span>
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
