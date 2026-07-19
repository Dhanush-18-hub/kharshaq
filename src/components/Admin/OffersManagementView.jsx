import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Calendar,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Percent,
  CheckCircle,
  Ban,
  Clock,
  Ticket
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OffersManagementView({ globalSearch = '' }) {
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Coupon Form States
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('300');
  const [value, setValue] = useState('10');
  const [type, setType] = useState('Percentage');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [usageLimitGlobal, setUsageLimitGlobal] = useState('');
  const [usageLimitPerUser, setUsageLimitPerUser] = useState('1');
  const [isWelcomeCoupon, setIsWelcomeCoupon] = useState(false);
  const [deviceRestricted, setDeviceRestricted] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCouponsAndAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/coupons');
      if (res.data && res.data.coupons) {
        setCoupons(res.data.coupons);
      }
      
      const statsRes = await api.get('/api/coupons/admin/analytics');
      if (statsRes.data) {
        setAnalytics(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to load coupons or analytics:', err);
      toast.error('Failed to load coupon configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponsAndAnalytics();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Coupon Code is required.');
    if (!discount.trim()) return toast.error('Discount Description is required.');

    try {
      setSubmitting(true);
      const payload = {
        code: code.trim().toUpperCase(),
        discount: discount.trim(),
        minPurchase: parseFloat(minPurchase || 0.0),
        value: parseFloat(value || 0.0),
        type,
        maximum_discount: maxDiscount ? parseFloat(maxDiscount) : null,
        usage_limit_global: usageLimitGlobal ? parseInt(usageLimitGlobal) : null,
        usage_limit_per_user: usageLimitPerUser ? parseInt(usageLimitPerUser) : null,
        is_welcome_coupon: isWelcomeCoupon,
        device_restricted: deviceRestricted,
        phone_verification_required: phoneVerification,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null
      };

      const res = await api.post('/api/admin/coupons', payload);
      toast.success('Coupon created successfully!');
      setCoupons(prev => [res.data.coupon, ...prev]);
      
      // Clear inputs
      setCode('');
      setDiscount('');
      setMinPurchase('300');
      setValue('10');
      setMaxDiscount('');
      setUsageLimitGlobal('');
      setUsageLimitPerUser('1');
      setIsWelcomeCoupon(false);
      setDeviceRestricted(false);
      setPhoneVerification(false);
      setStartDate('');
      setEndDate('');
      
      // Refresh analytics
      fetchCouponsAndAnalytics();
    } catch (err) {
      console.error('Failed to create coupon:', err);
      toast.error(err.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (idOrCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${idOrCode}?`)) return;
    try {
      await api.delete(`/api/admin/coupons/${idOrCode}`);
      toast.success('Coupon deleted successfully.');
      setCoupons(prev => prev.filter(c => c.code !== idOrCode && c.id !== idOrCode));
      fetchCouponsAndAnalytics();
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      toast.error('Failed to delete coupon.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await api.put(`/api/admin/coupons/${coupon.id}`, {
        is_active: !coupon.is_active
      });
      toast.success(`Coupon status updated!`);
      setCoupons(prev => prev.map(c => c.id === coupon.id ? res.data.coupon : c));
    } catch (err) {
      console.error('Failed to toggle coupon status:', err);
      toast.error('Failed to update status.');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-left text-xs">
      
      {/* Analytics dashboard cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block select-none">Total Campaign Code</span>
              <span className="text-xl font-black text-gray-800 mt-1 block">{analytics.totalCoupons}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block select-none">Active / Total Uses</span>
              <span className="text-xl font-black text-gray-800 mt-1 block">
                {analytics.activeCoupons} / {analytics.totalRedemptions}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block select-none">Revenue Impact</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">₹{analytics.revenueImpact?.toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-bold block select-none">Device Abuse Blocks</span>
              <span className="text-xl font-black text-rose-600 mt-1 block">{analytics.deviceAbuseBlocks} Blocks</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Active Coupons List */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-base text-gray-800 select-none">Active Campaign Codes</h3>
            <span className="text-[11px] font-bold text-gray-400">{filteredCoupons.length} coupons</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[580px] pr-1 scrollbar-thin select-none">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-20 bg-gray-50 border border-gray-100 rounded-2xl animate-pulse" />
              ))
            ) : filteredCoupons.map((c) => (
              <div 
                key={c.code} 
                className={`p-4 border rounded-2xl transition-all relative overflow-hidden bg-gray-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  c.is_active ? 'border-gray-100 hover:border-emerald-100' : 'border-dashed border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    c.is_active 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-black text-sm text-gray-800 tracking-tight">{c.code}</h4>
                      {c.is_welcome_coupon && (
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                          Welcome
                        </span>
                      )}
                      {c.device_restricted && (
                        <span className="text-[9px] bg-rose-50 border border-rose-100 text-rose-600 font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                          Fingerprinted
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 font-bold mt-1">{c.description || c.discount}</p>
                    
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px] text-gray-400 font-bold">
                      <span>Min purchase: ₹{c.minimum_order}</span>
                      {c.maximum_discount && <span>Max Cap: ₹{c.maximum_discount}</span>}
                      {c.usage_limit_global && (
                        <span>Uses: {c.usage_count} / {c.usage_limit_global}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-auto border-t border-gray-50 md:border-none pt-3 md:pt-0">
                  {/* Status Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(c)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                      c.is_active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {c.is_active ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => handleDeleteCoupon(c.id || c.code)}
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {!loading && coupons.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 font-semibold bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs">No active coupons created yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Create Coupon Form Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-5 flex flex-col">
          <h3 className="font-extrabold text-base text-gray-800 mb-6 select-none">Create Coupon spec</h3>
          
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Coupon Code *</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-mono font-bold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                placeholder="e.g. MEGA50"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Discount description *</label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                placeholder="e.g. ₹50 OFF on first purchase"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Type</label>
                <select
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed">Fixed Amount</option>
                  <option value="Free Shipping">Free Shipping</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Value</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  placeholder="10"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Min Order (₹)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  placeholder="300"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Max Cap (₹)</label>
                <input
                  type="number"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                  placeholder="e.g. 150"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                />
              </div>
            </div>

            {/* Anti-abuse Switches */}
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/20 space-y-3.5">
              <h4 className="font-extrabold text-[11px] text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2">Anti-Abuse Settings</h4>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWelcomeCoupon}
                  onChange={(e) => {
                    setIsWelcomeCoupon(e.target.checked);
                    if (e.target.checked) {
                      setDeviceRestricted(true);
                      setPhoneVerification(true);
                      setUsageLimitPerUser('1');
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="text-left">
                  <span className="font-extrabold text-gray-700 block">Is Welcome Offer?</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Strict welcome rule (1 use per customer/device/phone number)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deviceRestricted}
                  onChange={(e) => setDeviceRestricted(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="text-left">
                  <span className="font-extrabold text-gray-700 block">Restricted by Device?</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Fails validation if browser fingerprint matches usage history</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={phoneVerification}
                  onChange={(e) => setPhoneVerification(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div className="text-left">
                  <span className="font-extrabold text-gray-700 block">Verified Phone Required?</span>
                  <span className="text-[10px] text-gray-400 font-semibold">Only verified Indian numbers can claim coupon</span>
                </div>
              </label>
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Start Date</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition text-[11px]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-50 border border-gray-150 rounded-xl px-3.5 py-2.5 font-semibold text-gray-850 focus:outline-none focus:bg-white focus:border-emerald-500 transition text-[11px]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[13px] font-extrabold hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95 cursor-pointer shadow-md mt-4"
            >
              {submitting ? 'Saving spec...' : 'Publish Coupon Spec'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
