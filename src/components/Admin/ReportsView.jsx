import React from 'react';
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  Layers,
  ShoppingBag,
  TrendingUp,
  Percent
} from 'lucide-react';

export default function ReportsView({ stats }) {
  // Convert numbers to Indian format (e.g. ₹2,45,680)
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const revenueVal = stats?.revenue ?? 245680;
  const ordersVal = stats?.ordersCount ?? 1248;
  const customersVal = stats?.customersCount ?? 3265;
  const conversionRate = "3.8%";

  // Monthly sales mockup data
  const monthlySales = [
    { month: 'January 2026', orders: 198, revenue: 38200, conversion: '3.4%' },
    { month: 'February 2026', orders: 245, revenue: 46800, conversion: '3.6%' },
    { month: 'March 2026', orders: 310, revenue: 59000, conversion: '3.9%' },
    { month: 'April 2026', orders: 280, revenue: 54100, conversion: '3.7%' },
    { month: 'May 2026', orders: 326, revenue: 61400, conversion: '3.8%' },
    { month: 'June 2026', orders: 380, revenue: 72000, conversion: '4.1%' }
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Financial Reports & Auditing</h2>
          <p className="text-xs text-gray-400 font-semibold mt-1">Audit detailed conversion, store metrics and quarterly performance</p>
        </div>
        <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span>Yearly (2026)</span>
        </div>
      </div>

      {/* Grid overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Average Order Value</span>
            <h3 className="text-lg font-black text-gray-800 mt-2">{formatCurrency(revenueVal / (ordersVal || 1))}</h3>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+3.2% vs last month</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Conversion Rate</span>
            <h3 className="text-lg font-black text-gray-800 mt-2">{conversionRate}</h3>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+0.4% vs last month</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">New Registered Profiles</span>
            <h3 className="text-lg font-black text-gray-800 mt-2">+{Math.round(customersVal * 0.12)}</h3>
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+14.8% vs last month</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Monthly Sales details table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm shadow-gray-50/50">
        <div className="px-6 py-4 border-b border-gray-100 select-none">
          <h4 className="font-extrabold text-sm text-gray-800">Monthly Sales Ledger</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Orders count</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {monthlySales.map((ledger, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-4 font-bold text-gray-800">{ledger.month}</td>
                  <td className="py-3 px-4 font-semibold">{ledger.orders} orders</td>
                  <td className="py-3 px-4 font-extrabold text-gray-800">{formatCurrency(ledger.revenue)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">{ledger.conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
