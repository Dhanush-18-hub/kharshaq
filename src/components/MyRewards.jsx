import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, Bell, Star, 
  ArrowRight, User, ShoppingBag, MapPin, CreditCard, 
  LogOut, HelpCircle, Award, Gift, Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyRewards({ 
  rewardPoints, 
  setRewardPoints, 
  rewardTransactions, 
  setRewardTransactions, 
  rewardVouchers, 
  setRewardVouchers 
}) {
  const { user, logout, notifications } = useAuth();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Vouchers', 'Special Offers', 'Transactions'
  const [sortOption, setSortOption] = useState('Popular');

  // Lifetime metrics
  const lifetimeEarned = rewardTransactions
    .filter(t => t.type === 'Earned')
    .reduce((sum, t) => sum + t.points, 0);

  const lifetimeRedeemed = Math.abs(rewardTransactions
    .filter(t => t.type === 'Redeemed')
    .reduce((sum, t) => sum + t.points, 0));

  // Equivalent currency value of points (10 points = ₹1.00)
  const pointsValue = (rewardPoints / 10).toFixed(2);

  // pre-defined vouchers available to redeem
  const redeemableOffers = [
    {
      id: 'ro1',
      title: '₹100 Off',
      subtitle: 'Min. 1,000 Points',
      cost: 1000,
      value: 100,
      badge: 'Popular',
      badgeStyle: 'bg-[#E8F5E9] text-[#2E7D32] border-emerald-100',
      color: 'green',
      couponStyle: 'from-[#4CAF50] to-[#2E7D32]'
    },
    {
      id: 'ro2',
      title: '₹250 Off',
      subtitle: 'Min. 2,000 Points',
      cost: 2000,
      value: 250,
      badge: 'Best Value',
      badgeStyle: 'bg-[#FFF3E0] text-[#EF6C00] border-orange-100',
      color: 'yellow',
      couponStyle: 'from-[#FFA726] to-[#EF6C00]'
    },
    {
      id: 'ro3',
      title: '₹500 Off',
      subtitle: 'Min. 4,000 Points',
      cost: 4000,
      value: 500,
      badge: 'Super Saver',
      badgeStyle: 'bg-[#E0F7FA] text-[#00838F] border-cyan-100',
      color: 'teal',
      couponStyle: 'from-[#00ACC1] to-[#00838F]'
    },
    {
      id: 'ro4',
      title: 'Free Delivery',
      subtitle: 'Min. 500 Points',
      cost: 500,
      value: 'Free Delivery',
      badge: '',
      badgeStyle: '',
      color: 'purple',
      couponStyle: 'from-[#8E24AA] to-[#5E35B1]'
    }
  ];

  // Redeem Action handler
  const handleRedeem = (offer) => {
    if (rewardPoints < offer.cost) {
      toast.error(`Insufficient available points! You need ${offer.cost - rewardPoints} more points to redeem this voucher.`);
      return;
    }

    const confirm = window.confirm(`Redeem ${offer.cost} points for a "${offer.title} Voucher"?`);
    if (!confirm) return;

    // Deduct points
    setRewardPoints(prev => prev - offer.cost);

    // Format current date
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const today = new Date().toLocaleDateString('en-GB', options); // e.g. "11 Jul 2026"

    // Append Transaction
    const newTransaction = {
      id: `rt${Date.now()}`,
      type: 'Redeemed',
      details: `${offer.title} Voucher`,
      points: -offer.cost,
      date: today
    };
    setRewardTransactions(prev => [newTransaction, ...prev]);

    // Append Voucher to inventory
    const newCode = `KSQ${offer.value.toString().replace(/\s/g, '').toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const newVoucher = {
      id: `rv${Date.now()}`,
      code: newCode,
      title: `${offer.title} Voucher`,
      value: offer.value,
      minPoints: offer.cost,
      date: 'Valid till 31 Dec 2026'
    };
    setRewardVouchers(prev => [newVoucher, ...prev]);

    toast.success(`Successfully redeemed ${offer.cost} points! Your voucher code is: ${newCode}`);
  };

  // Sort and filter redeemable offers (if needed, mockup shows standard list)
  const sortedOffers = [...redeemableOffers].sort((a, b) => {
    if (sortOption === 'Points: Low to High') return a.cost - b.cost;
    if (sortOption === 'Points: High to Low') return b.cost - a.cost;
    return 0; // Default Popular sorting
  });

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">My Rewards</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= COLUMN 1: LEFT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 select-none">
            {/* User Profile Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium text-left flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-light-green border border-emerald-100 flex items-center justify-center text-primary-green shrink-0 overflow-hidden">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary-green" />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-[16px] font-black text-gray-800 leading-tight truncate">{user?.name || 'Dhanush Kumar'}</h3>
                <p className="text-[11px] text-gray-400 font-bold leading-tight truncate mt-1">{user?.email || 'koppladk4@gmail.com'}</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary-green bg-light-green border border-emerald-50 px-2.5 py-0.5 rounded-full mt-2.5">
                  Karshaq Plus 👑
                </span>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white border border-border-color rounded-3xl py-4 px-3 shadow-premium text-left flex flex-col gap-1">
              <button 
                onClick={() => navigate('/profile')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <User className="w-4.5 h-4.5 text-gray-400" />
                <span>My Profile</span>
              </button>

              <button 
                onClick={() => navigate('/orders')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4.5 h-4.5 text-gray-400" />
                <span>My Orders</span>
              </button>

              <button 
                onClick={() => navigate('/wishlist')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <Heart className="w-4.5 h-4.5 text-gray-400" />
                <span>My Wishlist</span>
              </button>

              <button 
                onClick={() => navigate('/addresses')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <MapPin className="w-4.5 h-4.5 text-gray-400" />
                <span>My Addresses</span>
              </button>

              <button 
                onClick={() => navigate('/payments')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <CreditCard className="w-4.5 h-4.5 text-gray-400" />
                <span>Payment Methods</span>
              </button>
 
              <button 
                onClick={() => navigate('/rewards')} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-light-green text-primary-green text-[14.5px] font-extrabold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Star className="w-4.5 h-4.5 fill-primary-green text-primary-green" />
                  <span>My Rewards</span>
                </div>
                <span className="bg-primary-green text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  {rewardPoints !== undefined ? rewardPoints.toLocaleString() : 0}
                </span>
              </button>
 
              <button 
                onClick={() => navigate('/notifications')} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <Bell className="w-4.5 h-4.5 text-gray-400" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-[#D81B60] text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => navigate('/help')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5 text-gray-400" />
                <span>Help & Support</span>
              </button>

              <div className="h-[1px] bg-gray-100 my-2 mx-4" />

              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-red-50 text-[14.5px] font-black text-red-500 cursor-pointer transition-colors"
              >
                <LogOut className="w-4.5 h-4.5 text-red-500" />
                <span>Logout</span>
              </button>
            </div>

            {/* Karshaq Plus Rewards Promo Card */}
            <div className="bg-gradient-to-br from-[#EAF2E4] to-[#DBEAD1] border border-border-color rounded-3xl p-6 shadow-premium text-left relative overflow-hidden">
              <span className="text-[17px] block font-black text-gray-800 leading-tight">Karshaq Plus 👑</span>
              <p className="text-[12px] text-gray-500 font-bold mt-2 leading-relaxed">
                Unlock more rewards, exclusive offers and faster deliveries!
              </p>
              <ul className="mt-4 flex flex-col gap-1.5 text-[11px] text-gray-600 font-bold">
                <li className="flex items-center gap-1.5">• Earn 2x Reward Points</li>
                <li className="flex items-center gap-1.5">• Birthday & Anniversary Bonuses</li>
                <li className="flex items-center gap-1.5">• Exclusive Member Offers</li>
                <li className="flex items-center gap-1.5">• Priority Customer Support</li>
              </ul>
              
              <div className="mt-5 flex items-center justify-between gap-2.5">
                <button 
                  onClick={() => toast.success('Upgrade checkout window launched!')}
                  className="px-4.5 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[12.5px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-14 select-none">
                  <img src="/category_others.png" alt="gift box" className="w-full mix-blend-multiply drop-shadow" />
                </div>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: MIDDLE MAIN CONTENT ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            
            {/* Header Titles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight leading-none">
                    My Rewards
                  </h1>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-3.5 py-1.5 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    ← Continue Shopping
                  </button>
                </div>
                <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                  Earn points on every order and redeem exciting rewards!
                </p>
              </div>
            </div>

            {/* 1. Large Rewards Summary Green Dashboard Box */}
            <div className="bg-[#1B4332] rounded-[32px] p-6 text-white grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-lg border border-[#0D251C]">
              
              {/* Left stats grid (8 cols) */}
              <div className="md:col-span-8 grid grid-cols-3 gap-4 border-r border-[#ffffff15] pr-4">
                
                {/* Col 1: Available Points */}
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] text-emerald-300 font-extrabold uppercase tracking-wide opacity-80 select-none">Available Points</span>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="w-6 h-6 bg-yellow-400 border border-yellow-300 rounded-full flex items-center justify-center text-[#1B4332] text-[12px] font-black select-none">🪙</span>
                    <span className="text-[24px] lg:text-[28px] font-black leading-none">{rewardPoints.toLocaleString()}</span>
                  </div>
                  <span className="text-[12.5px] text-emerald-100 font-semibold mt-2 opacity-90 select-none">
                    ≈ ₹{pointsValue}
                  </span>
                </div>

                {/* Col 2: Points Earned */}
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] text-emerald-300 font-extrabold uppercase tracking-wide opacity-80 select-none">Points Earned</span>
                  <span className="text-[24px] lg:text-[28px] font-black leading-none mt-2.5">{lifetimeEarned.toLocaleString()}</span>
                  <span className="text-[11px] text-emerald-200/60 font-bold mt-2 select-none">Lifetime</span>
                </div>

                {/* Col 3: Points Redeemed */}
                <div className="flex flex-col text-left">
                  <span className="text-[11.5px] text-emerald-300 font-extrabold uppercase tracking-wide opacity-80 select-none">Points Redeemed</span>
                  <span className="text-[24px] lg:text-[28px] font-black leading-none mt-2.5">{lifetimeRedeemed.toLocaleString()}</span>
                  <span className="text-[11px] text-emerald-200/60 font-bold mt-2 select-none">Lifetime</span>
                </div>

              </div>

              {/* Right tier section (4 cols) */}
              <div className="md:col-span-4 flex flex-col text-left pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-yellow-400 select-none text-[15px]">
                    👑
                  </div>
                  <div>
                    <span className="text-[14px] font-black block leading-tight">Karshaq Plus</span>
                    <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider block mt-0.5">Gold Member</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-100/70 font-semibold mt-3.5 leading-snug">
                  You are 750 points away from Platinum tier
                </p>

                {/* Progress bar */}
                <div className="w-full bg-[#ffffff10] border border-[#ffffff05] rounded-full h-2 mt-2.5 overflow-hidden">
                  <div className="bg-yellow-400 h-full rounded-full" style={{ width: '75%' }} />
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-200/50 font-bold mt-1.5">
                  <span>2,250</span>
                  <span>3,000</span>
                </div>
              </div>

            </div>

            {/* 2. Quick Info Columns Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-border-color rounded-3xl p-5 shadow-card select-none">
              
              <div className="flex items-center gap-3 text-left p-1 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-primary-green flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[12.5px] font-black text-gray-800 block leading-tight">How It Works</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Learn more</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left p-1 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EF6C00] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[12.5px] font-black text-gray-800 block leading-tight">Earn Points</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">See ways to earn</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left p-1 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#E8EAF6] text-[#3F51B5] flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[12.5px] font-black text-gray-800 block leading-tight">Redeem Points</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">View rewards</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-left p-1 cursor-pointer hover:bg-gray-50 rounded-2xl transition-colors" onClick={() => setActiveTab('Vouchers')}>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[12.5px] font-black text-gray-800 block leading-tight">My Vouchers</span>
                  <span className="text-[10px] text-gray-400 font-bold block mt-0.5">View all vouchers</span>
                </div>
              </div>

            </div>

            {/* Tabs Row */}
            <div className="flex flex-wrap gap-2 pb-2 select-none border-b border-gray-150/40">
              {[
                { id: 'All', label: 'All Rewards' },
                { id: 'Vouchers', label: 'Vouchers' },
                { id: 'Special Offers', label: 'Special Offers' },
                { id: 'Transactions', label: 'Transactions' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-[13px] font-bold transition-all cursor-pointer relative ${
                    activeTab === tab.id 
                      ? 'text-primary-green font-extrabold' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.span 
                      layoutId="activeRewardTabLine" 
                      className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-primary-green rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Condition Rendering by tab selections */}
            {activeTab !== 'Transactions' && activeTab !== 'Vouchers' && (
              <>
                {/* 3. Redeem Grid Section */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  <h3 className="text-[18px] font-black text-gray-800 tracking-tight">Redeem Your Points</h3>
                  <div className="flex items-center gap-1.5 select-none">
                    <span className="text-[12px] font-bold text-gray-400">Sort by:</span>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="border border-border-color rounded-xl px-2 py-1.5 text-[12.5px] font-bold text-gray-700 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="Popular">Popular</option>
                      <option value="Points: Low to High">Points: Low to High</option>
                      <option value="Points: High to Low">Points: High to Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {sortedOffers.map((offer) => (
                    <div 
                      key={offer.id}
                      className="bg-white border border-border-color rounded-3xl p-5 shadow-card hover:shadow-premium flex flex-col justify-between items-stretch gap-4 relative overflow-hidden"
                    >
                      {/* Popular tag badge */}
                      {offer.badge && (
                        <span className={`absolute top-3 left-3 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border select-none ${offer.badgeStyle}`}>
                          {offer.badge}
                        </span>
                      )}

                      {/* Coupon Graphic Container */}
                      <div className="pt-4 flex justify-center select-none">
                        {offer.title === 'Free Delivery' ? (
                          <div className={`w-[120px] h-[80px] rounded-2xl bg-gradient-to-br ${offer.couponStyle} text-white flex flex-col items-center justify-center p-2 relative shadow-md`}>
                            <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Delivery</span>
                            <span className="text-[15px] font-black mt-0.5 leading-none">FREE</span>
                            <span className="text-[9px] opacity-75 mt-1.5">No min purchase</span>
                          </div>
                        ) : (
                          <div className={`w-[120px] h-[80px] rounded-2xl bg-gradient-to-br ${offer.couponStyle} text-white flex flex-col items-center justify-center p-2 relative shadow-md`}>
                            <span className="text-[17px] font-black">{offer.title.split(' ')[0]}</span>
                            <span className="text-[11px] uppercase font-bold tracking-wider mt-0.5 leading-none">OFF</span>
                            <span className="text-[8px] opacity-60 mt-1">Limited Voucher</span>
                          </div>
                        )}
                      </div>

                      {/* Info Details block */}
                      <div className="text-center flex flex-col gap-1 mt-2">
                        <span className="text-[15px] font-black text-gray-800 block leading-tight">{offer.title}</span>
                        <span className="text-[11.5px] text-gray-400 font-bold block">{offer.subtitle}</span>
                        <div className="flex items-center justify-center gap-1 mt-1 text-[12px] text-gray-500 font-bold select-none">
                          <span>🪙</span>
                          <span>{offer.cost.toLocaleString()} Points</span>
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => handleRedeem(offer)}
                        className={`w-full py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[12.5px] rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-1.5`}
                      >
                        Redeem Now
                      </button>

                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Vouchers list tab content */}
            {activeTab === 'Vouchers' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight mt-2">My Active Vouchers</h3>
                {rewardVouchers.length === 0 ? (
                  <div className="bg-white border border-border-color rounded-[32px] p-12 text-center py-16">
                    <span className="text-[32px] block">🎫</span>
                    <h4 className="text-[16px] font-black text-gray-800 mt-2">No active vouchers</h4>
                    <p className="text-[12.5px] text-gray-400 font-semibold mt-1">Redeem your available points to unlock discount coupons!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rewardVouchers.map(v => (
                      <div key={v.id} className="bg-white border border-border-color rounded-3xl p-5 shadow-card flex items-center justify-between gap-4 border-l-4 border-l-primary-green relative overflow-hidden">
                        <div>
                          <span className="text-[10px] text-primary-green font-extrabold uppercase tracking-wide select-none">Active Coupon</span>
                          <h4 className="text-[16px] font-black text-gray-800 leading-tight mt-1">{v.title}</h4>
                          <span className="text-[11.5px] text-gray-400 font-semibold mt-0.5 block">{v.date}</span>
                          
                          {/* Code string */}
                          <div className="mt-3.5 flex items-center gap-1.5">
                            <span className="bg-gray-50 border border-gray-150 px-2.5 py-1 rounded-lg text-[12px] font-mono font-bold text-gray-700 select-all">
                              {v.code}
                            </span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(v.code);
                                toast.success('Code copied to clipboard!');
                              }}
                              className="text-[10px] text-primary-green font-black uppercase hover:underline cursor-pointer select-none"
                            >
                              Copy
                            </button>
                          </div>
                        </div>

                        {/* Gift Illustration */}
                        <div className="w-12 text-center shrink-0 opacity-80 select-none">
                          🎁
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Special Offers tab content */}
            {activeTab === 'Special Offers' && (
              <div className="bg-white border border-border-color rounded-[32px] p-12 text-center py-16">
                <span className="text-[32px] block">✨</span>
                <h4 className="text-[16px] font-black text-gray-800 mt-2">No special offers</h4>
                <p className="text-[12.5px] text-gray-400 font-semibold mt-1">Special member campaigns and exclusive offers will appear here when active.</p>
              </div>
            )}

            {/* 4. Recent Transactions Section */}
            {activeTab !== 'Vouchers' && activeTab !== 'Special Offers' && (
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-[18px] font-black text-gray-800 tracking-tight">Recent Transactions</h3>
                  <button 
                    onClick={() => setActiveTab('Transactions')}
                    className="text-[12.5px] font-black text-primary-green hover:underline cursor-pointer select-none inline-flex items-center gap-1"
                  >
                    View All Transactions <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white border border-border-color rounded-3xl p-6 shadow-card flex flex-col divide-y divide-gray-50">
                  {rewardTransactions.slice(0, activeTab === 'Transactions' ? undefined : 4).map((t) => (
                    <div key={t.id} className="py-4.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      
                      {/* Left icon and details stack */}
                      <div className="flex items-center gap-3.5 text-left">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[14px] font-bold select-none ${
                          t.type === 'Earned' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-red-50 text-red-500'
                        }`}>
                          {t.type === 'Earned' ? '+' : '-'}
                        </div>
                        <div>
                          <span className="text-[14px] font-black text-gray-800 block leading-tight">{t.type === 'Earned' ? 'Points Earned' : 'Points Redeemed'}</span>
                          <span className="text-[11.5px] text-gray-400 font-bold mt-1 block">{t.details}</span>
                        </div>
                      </div>

                      {/* Right points value and date */}
                      <div className="text-right">
                        <span className={`text-[15px] font-black block leading-tight ${
                          t.type === 'Earned' ? 'text-[#2E7D32]' : 'text-red-500'
                        }`}>
                          {t.type === 'Earned' ? `+${t.points}` : t.points} Points
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold mt-1 block">{t.date}</span>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions full tab view fallback list */}
            {activeTab === 'Transactions' && (
              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight">All Transactions Log</h3>
                <div className="bg-white border border-border-color rounded-3xl p-6 shadow-card flex flex-col divide-y divide-gray-50">
                  {rewardTransactions.map((t) => (
                    <div key={t.id} className="py-4.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3.5 text-left">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[14px] font-bold select-none ${
                          t.type === 'Earned' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-red-50 text-red-500'
                        }`}>
                          {t.type === 'Earned' ? '+' : '-'}
                        </div>
                        <div>
                          <span className="text-[14px] font-black text-gray-800 block leading-tight">{t.type === 'Earned' ? 'Points Earned' : 'Points Redeemed'}</span>
                          <span className="text-[11.5px] text-gray-400 font-bold mt-1 block">{t.details}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-[15px] font-black block leading-tight ${
                          t.type === 'Earned' ? 'text-[#2E7D32]' : 'text-red-500'
                        }`}>
                          {t.type === 'Earned' ? `+${t.points}` : t.points} Points
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold mt-1 block">{t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ================= COLUMN 3: RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">
            
            {/* Rewards Summary */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <Star className="w-4.5 h-4.5 text-primary-green fill-primary-green" /> Rewards Summary
              </h3>
              
              <div className="flex flex-col gap-3 font-semibold text-[13.5px] text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Available Points</span>
                  <span className="font-black text-gray-800">{rewardPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Points Value</span>
                  <span className="font-black text-gray-800">₹{pointsValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lifetime Earned</span>
                  <span className="font-black text-gray-800">{lifetimeEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Lifetime Redeemed</span>
                  <span className="font-black text-gray-800">{lifetimeRedeemed.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('Vouchers')}
                className="w-full py-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[13.5px] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                View My Vouchers ({rewardVouchers.length})
              </button>
            </div>

            {/* How You Earn Points */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5 relative overflow-hidden">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2">
                🪙 How You Earn Points
              </h3>
              
              <ul className="flex flex-col gap-3 text-[12.5px] text-gray-600 font-bold mt-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">🛒</span>
                  <div>
                    <span className="text-gray-800 font-black block leading-none">1 Point</span>
                    <span className="text-[10.5px] text-gray-400 font-semibold block mt-1">For every ₹1 spent</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">📦</span>
                  <div>
                    <span className="text-gray-800 font-black block leading-none">50 Points</span>
                    <span className="text-[10.5px] text-gray-400 font-semibold block mt-1">For first order (One time)</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">✍️</span>
                  <div>
                    <span className="text-gray-800 font-black block leading-none">100 Points</span>
                    <span className="text-[10.5px] text-gray-400 font-semibold block mt-1">Write a product review</span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">👥</span>
                  <div>
                    <span className="text-gray-800 font-black block leading-none">250 Points</span>
                    <span className="text-[10.5px] text-gray-400 font-semibold block mt-1">Refer a friend</span>
                  </div>
                </li>
              </ul>
              
              {/* Graphic box */}
              <div className="mt-4 border border-gray-100/50 rounded-2xl bg-gray-50/50 p-4 flex items-center justify-center gap-3 relative select-none overflow-hidden">
                <div className="w-10 select-none shrink-0 opacity-80">
                  🎁
                </div>
                <div className="text-left">
                  <span className="text-[11.5px] font-black text-gray-800 block leading-tight">Referral Active</span>
                  <span className="text-[9.5px] text-gray-400 font-extrabold block mt-0.5">Share with friends to earn points</span>
                </div>
              </div>
            </div>

            {/* Expiry Information Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2">
                ⚠️ Expiry Information
              </h3>
              <p className="text-[12.5px] text-gray-500 font-semibold leading-relaxed">
                Points earned are valid for 12 months from the date of earning.
              </p>
              
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex flex-col gap-1 text-[11.5px] text-gray-500">
                <span className="font-bold text-gray-800 block text-[12px] leading-tight">Expiring Soon:</span>
                <span className="font-semibold block mt-1 text-gray-700">
                  You have <span className="text-amber-700 font-extrabold">250 points</span> expiring on <span className="font-extrabold">18 Oct 2025</span>.
                </span>
              </div>

              <button 
                onClick={() => toast.info('No other points expiring in the next 90 days!')}
                className="w-full py-2.5 border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                View Expiring Points
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
