import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingBag, ShieldCheck, MapPin, CreditCard, Gift, ArrowLeft 
} from 'lucide-react';

export default function MockProtectedPage({ type }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const configs = {
    wishlist: {
      title: 'My Wishlist',
      desc: 'View and manage items you have saved for later.',
      icon: <Heart className="w-8 h-8 text-red-500" />,
      color: 'bg-red-50 border-red-100',
    },
    checkout: {
      title: 'Checkout secure gateway',
      desc: 'Verify items, select delivery address, and proceed to pay.',
      icon: <ShoppingBag className="w-8 h-8 text-primary-green" />,
      color: 'bg-green-50 border-green-100',
    },
    orders: {
      title: 'My Orders',
      desc: 'Track active deliveries and view complete order history.',
      icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-50 border-blue-100',
    },
    addresses: {
      title: 'Saved Addresses',
      desc: 'Manage your home, office, and other delivery address entries.',
      icon: <MapPin className="w-8 h-8 text-amber-500" />,
      color: 'bg-amber-50 border-amber-100',
    },
    payments: {
      title: 'Saved Payments',
      desc: 'Manage cards, UPI profiles, and digital wallet links.',
      icon: <CreditCard className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-50 border-purple-100',
    },
    rewards: {
      title: 'My Rewards & Coins',
      desc: 'Check points balance, milestones, and unlock claim coupons.',
      icon: <Gift className="w-8 h-8 text-pink-500" />,
      color: 'bg-pink-50 border-pink-100',
    }
  };

  const config = configs[type] || configs.wishlist;

  return (
    <div className="w-full max-w-[800px] mx-auto px-6 py-10 pt-[130px] min-h-[60vh] flex flex-col justify-center">
      {/* Breadcrumb */}
      <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none">
        <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
        <span>&gt;</span>
        <span className="text-gray-700">{config.title}</span>
      </div>

      <div className={`border rounded-[28px] p-8 md:p-12 text-left shadow-premium bg-white`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl flex items-center justify-center ${config.color}`}>
            {config.icon}
          </div>
          <div>
            <h1 className="text-[28px] font-black text-gray-800 tracking-tight leading-none">{config.title}</h1>
            <p className="text-[13px] text-gray-400 font-bold mt-1.5">{config.desc}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col gap-4">
          <div className="bg-brand-bg rounded-2xl p-5 border border-border-color">
            <h3 className="text-[14px] font-black text-gray-700 mb-3 uppercase tracking-wider">Account Mapping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-gray-400 font-bold block uppercase">Customer</span>
                <span className="text-[13px] font-bold text-gray-800">{user?.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold block uppercase">Tier Level</span>
                <span className="text-[13px] font-bold text-primary-green">{user?.membership_level} Member</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold block uppercase">Email</span>
                <span className="text-[13px] font-bold text-gray-800">{user?.email}</span>
              </div>
              <div>
                <span className="text-[11px] text-gray-400 font-bold block uppercase">Phone</span>
                <span className="text-[13px] font-bold text-gray-800">{user?.phone || 'Not linked'}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-2xl p-5 mt-2 text-center md:text-left">
            <h4 className="text-[14px] font-black text-emerald-800 leading-tight">Grocery Platform Integration Live</h4>
            <p className="text-[12px] text-emerald-700/80 font-bold mt-1">
              Your cart items and profile points are linked to this session. Your secure authentication handshake with the backend is fully validated.
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-8 flex items-center gap-1.5 text-primary-green hover:text-dark-green font-bold text-[14px] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Shopping
        </button>
      </div>
    </div>
  );
}
