import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ShoppingBag, MapPin, CreditCard, Star, 
  LogOut, HelpCircle, Check, ShieldCheck, ArrowRight, 
  User, Bell, Trash2, Settings, Gift, Briefcase, Tag, AlertCircle, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Notifications({ notifications, setNotifications }) {
  const { user, logout, rewardPoints } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('All');
  
  // Manage Preference Toggles State
  const [preferences, setPreferences] = useState({
    orders: true,
    offers: true,
    priceAlerts: true,
    rewards: true,
    newArrivals: false
  });

  const handleTogglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Notification preferences updated!');
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  // Click on a notification to mark it as read
  const handleNotificationClick = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Delete notification
  const handleDeleteNotification = (e, id) => {
    e.stopPropagation(); // Avoid triggering mark as read when clicking delete
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  // Dynamic counts based on active notification list
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const ordersCount = notifications.filter(n => n.category === 'Orders').length;
  const offersCount = notifications.filter(n => n.category === 'Offers').length;
  const updatesCount = notifications.filter(n => n.category === 'Updates').length;
  const remindersCount = notifications.filter(n => n.category === 'Reminders').length;

  // Filter notifications list
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Orders') return n.category === 'Orders';
    if (activeTab === 'Offers') return n.category === 'Offers';
    if (activeTab === 'Updates') return n.category === 'Updates';
    if (activeTab === 'Reminders') return n.category === 'Reminders';
    return true;
  });

  // Get Custom Styled Icon for each category
  const renderCategoryIcon = (category) => {
    if (category === 'Orders') {
      return (
        <div className="w-12 h-12 bg-[#E8F5E9] text-[#2E7D32] border border-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <Briefcase className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (category === 'Offers') {
      return (
        <div className="w-12 h-12 bg-[#FFF8E1] text-[#FFB300] border border-amber-100 rounded-full flex items-center justify-center shrink-0">
          <Star className="w-5.5 h-5.5" />
        </div>
      );
    }
    if (category === 'Updates') {
      return (
        <div className="w-12 h-12 bg-[#F3E5F5] text-[#8E24AA] border border-purple-100 rounded-full flex items-center justify-center shrink-0">
          <Tag className="w-5.5 h-5.5" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 bg-[#FCE4EC] text-[#D81B60] border border-pink-100 rounded-full flex items-center justify-center shrink-0">
        <Gift className="w-5.5 h-5.5" />
      </div>
    );
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">Notifications</span>
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
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14.5px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <Star className="w-4.5 h-4.5 text-gray-400 group-hover:text-primary-green" />
                  <span>My Rewards</span>
                </div>
                <span className="bg-primary-green text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                  {rewardPoints !== undefined ? rewardPoints.toLocaleString() : 0}
                </span>
              </button>

              <button 
                onClick={() => navigate('/notifications')} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-light-green text-primary-green text-[14.5px] font-extrabold cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <Bell className="w-4.5 h-4.5 fill-primary-green text-primary-green" />
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

            {/* Karshaq Plus Promo Card */}
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
              <button 
                onClick={() => toast.success('Upgrade menu launched!')}
                className="mt-5 px-4 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[12px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                Upgrade Now <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-[-15px] bottom-[-20px] opacity-15 pointer-events-none w-28">
                <img src="/category_vegetables.png" alt="benefits illustration" className="w-full mix-blend-multiply" />
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: MIDDLE MAIN CONTENT ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            
            {/* Title toolbar */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight leading-none">
                    Notifications
                  </h1>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-3.5 py-1.5 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    ← Continue Shopping
                  </button>
                </div>
                <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                  Stay updated with your orders, offers and important updates.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="px-4.5 py-2.5 border border-border-color hover:bg-gray-50 text-gray-700 font-extrabold text-[13px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm bg-white"
                  >
                    <Check className="w-4 h-4 text-primary-green stroke-[2.5]" /> Mark all as read
                  </button>
                )}
                
                <button
                  onClick={() => toast.info('Notification preferences settings are on the right sidebar.')}
                  className="p-2.5 border border-border-color hover:bg-gray-50 text-gray-500 rounded-xl transition-colors cursor-pointer bg-white"
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 pb-2 select-none border-b border-gray-150/40">
              {[
                { id: 'All', label: `All (${totalCount})` },
                { id: 'Orders', label: `Orders (${ordersCount})` },
                { id: 'Offers', label: `Offers (${offersCount})` },
                { id: 'Updates', label: `Updates (${updatesCount})` },
                { id: 'Reminders', label: `Reminders (${remindersCount})` }
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
                      layoutId="activeNotificationTabLine" 
                      className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-primary-green rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Notifications Grid Stack list */}
            {filteredNotifications.length === 0 ? (
              <div className="bg-white border border-border-color rounded-[32px] p-12 text-center py-16 shadow-premium flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-primary-green mb-4">
                  <Bell className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-black text-gray-800">Clean inbox!</h3>
                <p className="text-[13px] text-gray-400 font-semibold mt-1.5 max-w-[280px]">
                  No saved notifications under the "{activeTab}" tab category.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((n) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      key={n.id}
                      onClick={() => handleNotificationClick(n.id)}
                      className={`bg-white rounded-3xl border p-5 flex items-start justify-between gap-4 transition-all duration-300 relative shadow-card hover:shadow-premium group cursor-pointer ${
                        !n.isRead ? 'border-l-4 border-l-primary-green' : 'border-border-color'
                      }`}
                    >
                      {/* Left icon circle & content */}
                      <div className="flex-1 flex gap-4 text-left overflow-hidden">
                        {renderCategoryIcon(n.category)}
                        
                        <div className="flex-1 overflow-hidden pr-3">
                          <h4 className="text-[14.5px] font-black text-gray-800 block leading-tight">
                            {n.title}
                          </h4>
                          
                          <p className="text-[13px] text-gray-500 font-semibold leading-relaxed mt-2">
                            {n.desc}
                          </p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(n.link);
                            }}
                            className="mt-3.5 text-[11.5px] text-primary-green hover:text-dark-green font-black uppercase tracking-wider inline-flex items-center gap-1 select-none hover:underline"
                          >
                            {n.linkLabel} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Right stamp and delete actions */}
                      <div className="flex flex-col items-end justify-between shrink-0 self-stretch">
                        
                        {/* Date and time stamp */}
                        <div className="text-right flex flex-col gap-1">
                          <span className="text-[11px] text-gray-400 font-extrabold block tracking-wide">{n.date}</span>
                          <span className="text-[10px] text-gray-400 font-bold block">{n.time}</span>
                        </div>

                        {/* Unread dot and delete triggers */}
                        <div className="flex items-center gap-3.5 mt-auto">
                          
                          {/* Unread circle dot */}
                          {!n.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D81B60] shrink-0 block" title="Unread" />
                          )}

                          {/* Delete button (displays highlighted on hover, always accessible) */}
                          <button
                            onClick={(e) => handleDeleteNotification(e, n.id)}
                            className="p-1.5 border border-transparent hover:border-red-100 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer transition-all opacity-40 group-hover:opacity-100"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>

                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Load More trigger */}
            {totalCount > 0 && (
              <button
                onClick={() => toast.success('No more notifications to load.')}
                className="py-3 px-5 border border-border-color hover:bg-gray-50 text-gray-700 font-extrabold text-[13px] rounded-2xl transition-colors cursor-pointer self-center inline-flex items-center gap-1.5 shadow-sm bg-white"
              >
                Load More Notifications <ArrowRight className="w-4 h-4 text-gray-500 rotate-90" />
              </button>
            )}

          </div>

          {/* ================= COLUMN 3: RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">
            
            {/* Notification Summary */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <Bell className="w-4.5 h-4.5 text-primary-green fill-primary-green" /> Notification Summary
              </h3>
              
              <div className="flex flex-col gap-3.5 font-semibold text-[13.5px] text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Total Notifications</span>
                  <span className="font-black text-gray-800">{totalCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Unread</span>
                  <span className={`font-black ${unreadCount > 0 ? 'text-[#D81B60] font-black' : 'text-gray-800'}`}>
                    {unreadCount}
                  </span>
                </div>

                <div className="h-[1px] bg-gray-50 my-1" />

                <div className="flex justify-between items-center">
                  <span>Orders</span>
                  <span className="font-black text-gray-800">{ordersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Offers</span>
                  <span className="font-black text-gray-800">{offersCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Updates</span>
                  <span className="font-black text-gray-800">{updatesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reminders</span>
                  <span className="font-black text-gray-800">{remindersCount}</span>
                </div>
              </div>

              <button 
                onClick={() => setActiveTab('All')}
                className="w-full py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-all shadow-sm cursor-pointer text-center mt-2"
              >
                View All
              </button>
            </div>

            {/* Manage Preferences Toggle Switches */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <Settings className="w-4.5 h-4.5 text-primary-green" /> Manage Notifications
              </h3>
              
              <p className="text-[12.5px] text-gray-400 font-semibold leading-relaxed">
                Choose what you want to be notified about.
              </p>

              <div className="flex flex-col gap-4 mt-1.5 font-bold text-[13px] text-gray-700">
                
                {/* 1. Order Updates */}
                <div className="flex items-center justify-between gap-4">
                  <span>Order Updates</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreference('orders')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      preferences.orders ? 'bg-primary-green' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.orders ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 2. Offers & Discounts */}
                <div className="flex items-center justify-between gap-4">
                  <span>Offers & Discounts</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreference('offers')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      preferences.offers ? 'bg-primary-green' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.offers ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 3. Price Alerts */}
                <div className="flex items-center justify-between gap-4">
                  <span>Price Alerts</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreference('priceAlerts')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      preferences.priceAlerts ? 'bg-primary-green' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.priceAlerts ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 4. Reward Updates */}
                <div className="flex items-center justify-between gap-4">
                  <span>Reward Updates</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreference('rewards')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      preferences.rewards ? 'bg-primary-green' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.rewards ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 5. New Arrivals */}
                <div className="flex items-center justify-between gap-4">
                  <span>New Arrivals</span>
                  <button
                    type="button"
                    onClick={() => handleTogglePreference('newArrivals')}
                    className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                      preferences.newArrivals ? 'bg-primary-green' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200 ${
                      preferences.newArrivals ? 'translate-x-4.5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

              </div>

              <button 
                onClick={() => toast.success('Notification preferences saved.')}
                className="w-full py-2.5 border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-extrabold text-[12.5px] rounded-xl transition-colors cursor-pointer bg-white mt-2 shadow-sm text-center"
              >
                Manage Preferences
              </button>
            </div>

            {/* Never miss an offer banner card */}
            <div className="bg-[#F3FAF5] border border-emerald-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
              <h4 className="text-[15px] font-black text-gray-800 leading-tight">Never miss an offer!</h4>
              <p className="text-[12px] text-gray-500 font-semibold leading-relaxed max-w-[200px]">
                Enable notifications and be the first to know about exclusive offers and deals.
              </p>
              
              <button 
                onClick={() => toast.success('Push notification services enabled!')}
                className="px-4.5 py-2.5 bg-white border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[12.5px] rounded-xl transition-colors cursor-pointer shadow-sm w-full text-center mt-2 inline-flex items-center justify-center gap-1.5 z-10"
              >
                Enable Notifications
              </button>

              {/* Absolute bell graphic */}
              <div className="absolute right-[-10px] bottom-[-10px] opacity-25 w-24 pointer-events-none select-none">
                🔔
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
