import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Copy, Check, Info, Calendar, ArrowRight, ShoppingCart, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProfileSidebar from './ProfileSidebar';

export default function MyCoupons() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [applicable, setApplicable] = useState([]);
  const [notApplicable, setNotApplicable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all', 'applicable', 'used_expired'
  const [copiedCode, setCopiedCode] = useState(null);

  // Load coupons from backend
  const fetchCouponsData = async () => {
    try {
      setLoading(true);
      // Fetch public coupons
      const listRes = await api.get('/api/coupons');
      if (listRes.data && listRes.data.coupons) {
        setCoupons(listRes.data.coupons);
      }
      
      // Fetch applicable/not-applicable breakdown based on cart
      const cartItems = user?.cart || [];
      const subtotal = cartItems.reduce((acc, item) => acc + (floatVal(item.price) * intVal(item.quantity)), 0);
      
      const appRes = await api.post('/api/coupons/applicable', {
        subtotal: subtotal,
        cartItems: cartItems,
        deviceId: localStorage.getItem('karshaq_device_id') || '',
        phoneNumber: user?.phone || '',
        email: user?.email || ''
      });
      
      if (appRes.data) {
        setApplicable(appRes.data.applicable || []);
        setNotApplicable(appRes.data.not_applicable || []);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
      toast.error('Could not fetch coupons list.');
    } finally {
      setLoading(false);
    }
  };

  const floatVal = (v) => parseFloat(v || 0.0);
  const intVal = (v) => parseInt(v || 1);

  useEffect(() => {
    fetchCouponsData();
  }, [user]);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filter list based on sub tab selection
  const getFilteredCoupons = () => {
    if (activeSubTab === 'applicable') {
      return applicable;
    }
    if (activeSubTab === 'used_expired') {
      // Find coupons that are either expired, or already used (remaining_uses === 0)
      const now = new Date();
      return coupons.filter(c => {
        const isExpired = c.end_date && new Date(c.end_date) < now;
        const isUsed = c.used || (c.remaining_uses !== undefined && c.remaining_uses === 0);
        return isExpired || isUsed;
      });
    }
    // 'all': active & un-used coupons
    const now = new Date();
    return coupons.filter(c => {
      const isExpired = c.end_date && new Date(c.end_date) < now;
      const isUsed = c.used || (c.remaining_uses !== undefined && c.remaining_uses === 0);
      return !isExpired && !isUsed;
    });
  };

  const filteredList = getFilteredCoupons();

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">My Coupons</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Reusable Sidebar Navigation */}
          <ProfileSidebar activeTab="coupons" />

          {/* Main content area */}
          <div className="lg:col-span-9 flex flex-col gap-6 text-left">
            {/* Header section */}
            <div className="bg-white border border-border-color rounded-3xl p-6 md:p-8 shadow-premium flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-[26px] font-black text-gray-800 tracking-tight leading-tight flex items-center gap-2">
                  My Coupons & Offers <Ticket className="w-6 h-6 text-primary-green" />
                </h1>
                <p className="text-[13px] text-gray-400 font-bold mt-1.5 leading-relaxed">
                  View and manage your discount coupons. Double savings on every checkout!
                </p>
              </div>
              <button 
                onClick={fetchCouponsData}
                disabled={loading}
                className="self-start md:self-auto bg-light-green/30 hover:bg-light-green/60 text-primary-green px-4.5 py-2.5 rounded-xl text-[13px] font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            {/* Sub Tabs selectors */}
            <div className="flex border-b border-gray-100 gap-6 select-none">
              <button
                onClick={() => setActiveSubTab('all')}
                className={`pb-3 text-[14.5px] font-black relative cursor-pointer ${
                  activeSubTab === 'all' ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Active Coupons ({coupons.filter(c => !c.used && (!c.end_date || new Date(c.end_date) >= new Date())).length})
                {activeSubTab === 'all' && (
                  <motion.div layoutId="couponTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-green rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('applicable')}
                className={`pb-3 text-[14.5px] font-black relative cursor-pointer ${
                  activeSubTab === 'applicable' ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Applicable to Cart ({applicable.length})
                {activeSubTab === 'applicable' && (
                  <motion.div layoutId="couponTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-green rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveSubTab('used_expired')}
                className={`pb-3 text-[14.5px] font-black relative cursor-pointer ${
                  activeSubTab === 'used_expired' ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Used & Expired
                {activeSubTab === 'used_expired' && (
                  <motion.div layoutId="couponTabUnderline" className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-primary-green rounded-full" />
                )}
              </button>
            </div>

            {/* Grid display */}
            {loading ? (
              <div className="bg-white border border-border-color rounded-3xl p-16 text-center shadow-premium flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary-green border-t-transparent animate-spin" />
                <span className="text-[13px] text-gray-400 font-bold">Scanning for offers...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="bg-white border border-border-color rounded-3xl p-12 text-center shadow-premium flex flex-col items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-gray-800">No coupons found</h3>
                  <p className="text-[12px] text-gray-400 font-bold mt-1 max-w-sm mx-auto leading-relaxed">
                    {activeSubTab === 'applicable' 
                      ? 'Add items to your cart or increase order value to satisfy coupon minimum amount requirements!'
                      : 'Check back later for new promotional campaigns and savings!'}
                  </p>
                </div>
                {activeSubTab === 'applicable' && (
                  <button 
                    onClick={() => navigate('/products')}
                    className="bg-primary-green hover:bg-dark-green text-white px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                  >
                    Browse Products <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredList.map((coupon) => {
                    const isApplicable = applicable.some(a => a.code === coupon.code);
                    const now = new Date();
                    const isExpired = coupon.end_date && new Date(coupon.end_date) < now;
                    
                    return (
                      <motion.div 
                        key={coupon.code}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`bg-white border rounded-3xl p-6 shadow-premium relative overflow-hidden flex flex-col justify-between min-h-[190px] transition-all ${
                          isExpired || coupon.used
                            ? 'border-gray-200 opacity-60 bg-gray-50/50'
                            : isApplicable 
                              ? 'border-emerald-200 bg-emerald-50/10'
                              : 'border-border-color hover:border-gray-300'
                        }`}
                      >
                        {/* Status Tag */}
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 select-none">
                          {coupon.used ? (
                            <span className="text-[10px] font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">
                              Used
                            </span>
                          ) : isExpired ? (
                            <span className="text-[10px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">
                              Expired
                            </span>
                          ) : coupon.is_welcome_coupon ? (
                            <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Welcome offer 🌟
                            </span>
                          ) : isApplicable ? (
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full uppercase">
                              Eligible
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">
                              Locked 🔒
                            </span>
                          )}
                        </div>

                        {/* Top: Info */}
                        <div className="flex gap-4 items-start pr-16 text-left">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isExpired || coupon.used 
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-light-green text-primary-green'
                          }`}>
                            <Ticket className="w-5.5 h-5.5" />
                          </div>
                          <div>
                            <h3 className="text-[16px] font-black text-gray-800 leading-tight">{coupon.code}</h3>
                            <p className="text-[13px] text-gray-600 font-bold mt-1 leading-snug">{coupon.description}</p>
                            
                            {/* Limitations */}
                            <div className="flex flex-col gap-1 mt-3">
                              <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" /> Min Order: ₹{coupon.minimum_order}
                              </span>
                              {coupon.maximum_discount && (
                                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                  <Info className="w-3.5 h-3.5" /> Max Discount: ₹{coupon.maximum_discount}
                                </span>
                              )}
                              {coupon.end_date && (
                                <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" /> Valid till: {new Date(coupon.end_date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bottom: Copy/Action buttons */}
                        <div className="mt-5 border-t border-dashed border-gray-100 pt-4 flex items-center justify-between gap-4">
                          <button
                            onClick={() => handleCopy(coupon.code)}
                            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-[12.5px] px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 select-none"
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Code
                              </>
                            )}
                          </button>

                          {isApplicable && !coupon.used && !isExpired && (
                            <button
                              onClick={() => {
                                // Save code to session storage and navigate to cart to apply
                                sessionStorage.setItem('karshaq_pending_coupon', coupon.code);
                                navigate('/cart');
                              }}
                              className="bg-primary-green hover:bg-dark-green text-white text-[12.5px] px-4 py-1.5 rounded-xl font-black transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                            >
                              Use Now <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
