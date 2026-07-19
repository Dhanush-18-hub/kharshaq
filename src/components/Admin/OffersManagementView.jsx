import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import {
  Plus,
  Trash2,
  Percent,
  Tag,
  Sparkles,
  Calendar,
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OffersManagementView({ globalSearch = '' }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form States
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minPurchase, setMinPurchase] = useState('₹300');
  const [value, setValue] = useState('10');
  const [type, setType] = useState('Percentage');
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/coupons');
      if (res.data && res.data.coupons) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Failed to fetch admin coupons:', err);
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Coupon Code is required.');
    if (!discount.trim()) return toast.error('Discount Description is required.');

    try {
      setSubmitting(true);
      const res = await api.post('/api/admin/coupons', {
        code: code.trim().toUpperCase(),
        discount,
        minPurchase,
        value: parseInt(value),
        type
      });
      toast.success('Coupon created successfully!');
      setCoupons(prev => [...prev, res.data.coupon]);
      setCode('');
      setDiscount('');
      setMinPurchase('₹300');
      setValue('10');
    } catch (err) {
      console.error('Failed to create coupon:', err);
      toast.error(err.response?.data?.error || 'Failed to create coupon.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponCode) => {
    if (!window.confirm(`Delete coupon ${couponCode} permanently?`)) return;
    try {
      await api.delete(`/api/admin/coupons/${couponCode}`);
      toast.success('Coupon deleted');
      setCoupons(prev => prev.filter(c => c.code !== couponCode));
    } catch (err) {
      console.error('Failed to delete coupon:', err);
      toast.error('Failed to delete coupon.');
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(globalSearch.toLowerCase()) ||
    c.discount.toLowerCase().includes(globalSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
      {/* Active Coupons List */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-7 flex flex-col">
        <h3 className="font-extrabold text-base text-gray-800 mb-6 select-none">Active Coupons & Codes</h3>
        <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-1 scrollbar-thin select-none">
          {loading ? (
            Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : filteredCoupons.map((c) => (
            <div key={c.code} className="flex justify-between items-center p-4 border border-gray-100 rounded-2xl hover:border-emerald-100 transition group relative overflow-hidden bg-gray-50/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-mono font-black text-sm text-gray-800 tracking-tight">{c.code}</h4>
                  <span className="text-[10px] text-gray-400 block mt-0.5">{c.discount} • Min order: {c.minPurchase}</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteCoupon(c.code)}
                className="p-2 text-gray-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                title="Delete coupon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {!loading && coupons.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 font-semibold">
              <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-xs">No active coupons created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Coupon Form Panel */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm shadow-gray-50 lg:col-span-5 flex flex-col">
        <h3 className="font-extrabold text-base text-gray-800 mb-6 select-none">Create Coupon spec</h3>
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Coupon Code *</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-mono font-bold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              placeholder="e.g. MEGA50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Discount description *</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              placeholder="e.g. ₹50 OFF on first purchase"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Discount Type</label>
              <select
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed Amount</option>
                <option value="Free Shipping">Free Shipping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Discount Value</label>
              <input
                type="number"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
                placeholder="10"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 select-none">Min Purchase Requirement</label>
            <input
              type="text"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3.5 py-2.5 font-semibold text-gray-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition"
              placeholder="₹300"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95 cursor-pointer mt-4"
          >
            {submitting ? 'Saving spec...' : 'Publish Coupon'}
          </button>
        </form>
      </div>
    </div>
  );
}
