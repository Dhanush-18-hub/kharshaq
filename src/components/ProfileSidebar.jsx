import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, ShoppingBag, Heart, MapPin, CreditCard, Star, Bell, HelpCircle, LogOut, Ticket, ArrowRight 
} from 'lucide-react';

export default function ProfileSidebar({ activeTab }) {
  const { user, logout, rewardPoints, notifications } = useAuth();
  const navigate = useNavigate();

  const unreadCount = (notifications || []).filter(n => !n.read).length;

  const tabs = [
    { name: 'profile', label: 'My Profile', path: '/profile', icon: User },
    { name: 'orders', label: 'My Orders', path: '/orders', icon: ShoppingBag },
    { name: 'wishlist', label: 'My Wishlist', path: '/wishlist', icon: Heart, fill: true },
    { name: 'coupons', label: 'My Coupons', path: '/my-coupons', icon: Ticket },
    { name: 'addresses', label: 'My Addresses', path: '/addresses', icon: MapPin },
    { name: 'payments', label: 'Payment Methods', path: '/payments', icon: CreditCard },
    { name: 'rewards', label: 'My Rewards', path: '/rewards', icon: Star, showBadge: true, badgeValue: rewardPoints },
    { name: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell, showBadge: true, badgeValue: unreadCount, badgeColor: 'bg-[#D81B60]' },
    { name: 'help', label: 'Help & Support', path: '/help', icon: HelpCircle }
  ];

  return (
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
        <div className="overflow-hidden text-left">
          <h3 className="text-[16px] font-black text-gray-800 leading-tight truncate">{user?.name || 'Dhanush'}</h3>
          <p className="text-[11px] text-gray-400 font-bold leading-tight truncate mt-1">{user?.email || 'koppladk4@gmail.com'}</p>
          {user?.membership_level === 'Plus' || user?.membership_level === 'Karshaq Plus' ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary-green bg-light-green border border-emerald-50 px-2.5 py-0.5 rounded-full mt-2.5">
              Karshaq Plus 👑
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full mt-2.5">
              Standard Member
            </span>
          )}
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="bg-white border border-border-color rounded-3xl py-4 px-3 shadow-premium text-left flex flex-col gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-light-green text-primary-green font-extrabold' 
                  : 'hover:bg-light-green/30 text-gray-500 hover:text-gray-700 font-bold'
              } text-[14.5px]`}
            >
              <div className="flex items-center gap-3.5">
                <Icon 
                  className={`w-4.5 h-4.5 ${
                    isActive 
                      ? (tab.fill ? 'fill-primary-green text-primary-green animate-pulse' : 'text-primary-green') 
                      : 'text-gray-400'
                  }`} 
                />
                <span>{tab.label}</span>
              </div>
              {tab.showBadge && tab.badgeValue !== undefined && tab.badgeValue > 0 && (
                <span className={`${tab.badgeColor || 'bg-primary-green'} text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full`}>
                  {tab.badgeValue.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}

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
          Enjoy free delivery, exclusive offers and more amazing benefits!
        </p>
        <ul className="mt-4 flex flex-col gap-1.5 text-[11px] text-gray-600 font-bold">
          <li className="flex items-center gap-1.5">• Free Delivery on orders above ₹499</li>
          <li className="flex items-center gap-1.5">• Extra 5% off on all orders</li>
          <li className="flex items-center gap-1.5">• Early access to offers</li>
        </ul>
        <button
          onClick={() => navigate('/offers')}
          className="mt-5 px-4 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[12px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
        >
          Explore Benefits <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <div className="absolute right-[-15px] bottom-[-20px] opacity-15 pointer-events-none w-28">
          <img src="/category_vegetables.png" alt="benefits illustration" className="w-full mix-blend-multiply" />
        </div>
      </div>
    </div>
  );
}
