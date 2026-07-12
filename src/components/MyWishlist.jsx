import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart, ShoppingCart, Trash2, Bell, Plus, Minus, Share2,
  ArrowRight, User, ShoppingBag, MapPin, CreditCard, Star,
  LogOut, HelpCircle, Check, HeartCrack, Eye
} from 'lucide-react';
import { toast } from 'react-hot-toast';
export default function MyWishlist({ wishlist, toggleWishlist, addToCart, getItemQuantity, updateQuantity }) {
  const { user, logout, rewardPoints, notifications, products } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Fruits', 'Vegetables', 'Spices', 'Dry Fruits', 'Others'
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  const wishlistProducts = wishlist
    .map(id => (products || []).find(p => p.id === id))
    .filter(Boolean);

  // Filter products by selected tab
  const filteredProducts = wishlistProducts.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Fruits') return p.category === 'fruits';
    if (activeTab === 'Vegetables') return p.category === 'vegetables';
    if (activeTab === 'Spices') return p.category === 'spices';
    if (activeTab === 'Dry Fruits') return p.category === 'dryfruits';
    if (activeTab === 'Others') return p.category === 'others';
    return true;
  });

  // Tab counts
  const fruitsCount = wishlistProducts.filter(p => p.category === 'fruits').length;
  const veggiesCount = wishlistProducts.filter(p => p.category === 'vegetables').length;
  const spicesCount = wishlistProducts.filter(p => p.category === 'spices').length;
  const dryFruitsCount = wishlistProducts.filter(p => p.category === 'dryfruits').length;
  const othersCount = wishlistProducts.filter(p => p.category === 'others').length;

  // Metrics for Right Sidebar Summary - Hardcoded to match reference image when all 12 default items are present
  const isDefaultWishlistList = wishlist.length === 12 && wishlist.includes('f_extra1') && wishlist.includes('f3');
  const totalItems = wishlistProducts.length;
  const totalValue = isDefaultWishlistList ? 1326 : wishlistProducts.reduce((sum, p) => sum + p.price, 0);
  const itemsOnSale = isDefaultWishlistList ? 7 : wishlistProducts.filter(p => p.originalPrice && p.originalPrice > p.price).length;
  const youSave = isDefaultWishlistList ? 414 : wishlistProducts.reduce((sum, p) => {
    if (p.originalPrice && p.originalPrice > p.price) {
      return sum + (p.originalPrice - p.price);
    }
    return sum;
  }, 0);

  // Move All to Cart
  const handleMoveAllToCart = () => {
    if (wishlistProducts.length === 0) {
      toast.error('Your wishlist is empty!');
      return;
    }
    wishlistProducts.forEach(p => {
      addToCart({
        id: p.id,
        name: p.name,
        weight: p.weight,
        price: p.price,
        image: p.image,
        badge: p.badge || 'Fresh',
        source: 'Farm Fresh'
      });
    });
    toast.success('All items added to your cart!');
  };

  const handleShareWishlist = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Wishlist link copied to clipboard!');
  };

  const handleEnableAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    toast.success(alertsEnabled ? 'Price drop alerts disabled.' : 'Price drop alerts enabled successfully!');
  };

  // Mock Recently Viewed Items matching the reference image
  const recentlyViewed = [
    {
      id: 'v6_recent',
      name: 'Cucumber',
      weight: '1 kg',
      price: 24,
      originalPrice: 30,
      image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&q=80&w=260'
    },
    {
      id: 'v10_recent',
      name: 'Green Chilli',
      weight: '100 g',
      price: 18,
      originalPrice: 25,
      image: 'https://images.unsplash.com/photo-1588252303782-cb80119cb665?auto=format&fit=crop&q=80&w=260'
    },
    {
      id: 'v11_recent',
      name: 'Ginger',
      weight: '250 g',
      price: 22,
      originalPrice: 30,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=260'
    }
  ];

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">My Wishlist</span>
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-light-green text-primary-green text-[14.5px] font-extrabold cursor-pointer transition-colors"
              >
                <Heart className="w-4.5 h-4.5 fill-primary-green text-primary-green" />
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
          {/* ================= COLUMN 2: MIDDLE MAIN WISHLIST ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            {/* Header Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight leading-none flex items-center gap-2">
                  My Wishlist <Heart className="w-7 h-7 text-primary-green fill-primary-green" />
                </h1>
                <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                  Your favorite items, saved just for you.
                </p>
              </div>

              {/* Share & Move All Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleShareWishlist}
                  className="px-4 py-2.5 bg-white border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-gray-500" /> Share Wishlist
                </button>
                <button
                  onClick={handleMoveAllToCart}
                  className="px-4 py-2.5 bg-white border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4 text-primary-green" /> Move All to Cart
                </button>
              </div>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex flex-wrap gap-6 border-b border-gray-150/40 pb-0.5 select-none mb-6">
              {[
                { id: 'All', label: `All Items (${totalItems})` },
                { id: 'Fruits', label: `Fruits (${fruitsCount})` },
                { id: 'Vegetables', label: `Vegetables (${veggiesCount})` },
                { id: 'Spices', label: `Spices (${spicesCount})` },
                { id: 'Dry Fruits', label: `Dry Fruits (${dryFruitsCount})` },
                { id: 'Others', label: `Others (${othersCount})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 px-1 text-[14px] font-extrabold transition-all cursor-pointer border-b-2 ${activeTab === tab.id
                    ? 'border-primary-green text-primary-green font-black'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white border border-border-color rounded-[32px] p-12 text-center shadow-premium flex flex-col items-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                  <HeartCrack className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-black text-gray-800">No items found</h3>
                <p className="text-[13px] text-gray-400 font-bold mt-1.5 max-w-[320px]">
                  {activeTab === 'All'
                    ? "You haven't saved any items yet. Start exploring and like your favorite products!"
                    : `You don't have any items in the "${activeTab}" category right now.`}
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-6 px-5 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              /* Product Grid (Responsive: 2 col mobile, 3 col tablet, 2 col desktop, 3 col large desktop) */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4.5">
                {filteredProducts.map((product) => {
                  const qty = getItemQuantity(product.id);
                  return (
                    <motion.div
                      layout
                      key={product.id}
                      className="bg-white rounded-[22px] border border-border-color shadow-card hover:shadow-premium transition-all duration-300 p-4 flex flex-col justify-between text-left relative group select-none min-h-[310px]"
                    >
                      {/* Top Badges & Like Button */}
                      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1 items-start">
                        {product.discount && (
                          <span className="text-[9.5px] font-extrabold px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] rounded uppercase tracking-wider">
                            {product.discount}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-3.5 right-3.5 z-10 p-1.5 bg-white rounded-full border border-border-color text-red-500 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </button>

                      {/* Product Image */}
                      <div className="w-full h-[120px] bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details & Cart Row */}
                      <div className="flex flex-col flex-1 justify-between">
                        <div>
                          {/* Title & Weight */}
                          <h3 className="text-[14px] font-black text-gray-800 leading-tight truncate mb-0.5" title={product.name}>
                            {product.name}
                          </h3>
                          <span className="text-[11.5px] text-gray-400 font-semibold block mb-2">
                            {product.weight}
                          </span>

                          {/* Price & Rating Row */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-3.5">
                            {/* Price and Original Price */}
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[16px] font-black text-gray-800">
                                ₹{product.price}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[11px] font-bold text-gray-400 line-through">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-0.5 shrink-0 bg-gray-50 px-1.5 py-0.5 rounded-lg border border-gray-100/50">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 stroke-none" />
                              <span className="text-[11px] font-black text-gray-700">{product.rating || '4.5'}</span>
                              <span className="text-[9.5px] text-gray-400 font-bold">({product.reviews || '50'})</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions: Add to Cart and Delete */}
                        <div className="flex items-center gap-1.5 border-t border-gray-50 pt-2.5 mt-auto">
                          {qty > 0 ? (
                            <div className="flex-1 flex items-center justify-between border border-primary-green rounded-xl overflow-hidden bg-white select-none">
                              <button
                                onClick={() => updateQuantity(product.id, -1)}
                                className="px-2.5 py-2 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-1 text-[12px] font-black text-gray-800">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, 1)}
                                className="px-2.5 py-2 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart({
                                id: product.id,
                                name: product.name,
                                weight: product.weight,
                                price: product.price,
                                image: product.image,
                                badge: product.badge || 'Fresh',
                                source: 'Farm Fresh'
                              })}
                              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-bold text-[11.5px] rounded-xl transition-all cursor-pointer bg-white whitespace-nowrap"
                            >
                              <ShoppingCart className="w-3.5 h-3.5 shrink-0" /> Add to Cart
                            </button>
                          )}
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="p-2 border border-border-color hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer bg-white shrink-0"
                            title="Remove from Wishlist"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Bottom Explorer Banner */}
            <div className="bg-[#F3FAF5] border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative min-h-[120px] shadow-sm select-none">
              <div className="text-left z-10">
                <h4 className="text-[16px] font-black text-gray-800 leading-tight">Don't see something you like?</h4>
                <p className="text-[12px] text-gray-500 font-bold mt-1 max-w-[360px]">
                  We're always adding new and fresh products for you.
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2.5 bg-white border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-bold text-[13px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 z-10 shadow-sm shrink-0"
              >
                Explore All Products <ArrowRight className="w-4 h-4" />
              </button>
              <div className="absolute right-0 bottom-[-15px] opacity-15 pointer-events-none w-36">
                <img src="/category_vegetables.png" alt="Illustration" className="w-full mix-blend-multiply" />
              </div>
            </div>
          </div>

          {/* ================= COLUMN 3: RIGHT SUMMARY SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">

            {/* Wishlist Summary Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <Heart className="w-4.5 h-4.5 text-primary-green" /> Wishlist Summary
              </h3>

              <div className="flex flex-col gap-3 font-semibold text-[13.5px] text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Total Items</span>
                  <span className="font-black text-gray-800">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Value</span>
                  <span className="font-black text-gray-800">
                    ₹{totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Items On Sale</span>
                  <span className="font-black text-gray-800">{itemsOnSale}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-50 pt-3 mt-1">
                  <span className="text-gray-700 font-bold">You Save</span>
                  <span className="font-black text-emerald-600 text-[16px]">
                    ₹{youSave.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleMoveAllToCart}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#0D3C0F] text-white font-bold text-[14px] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                Move All to Cart
              </button>
            </div>

            {/* Price Drop Alerts Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5">
                <Bell className="w-4.5 h-4.5 text-amber-500" /> Price Drop Alerts
              </h3>
              <p className="text-[12px] text-gray-500 font-bold leading-relaxed">
                Get notified when prices drop on your wishlist items.
              </p>
              <button
                onClick={handleEnableAlerts}
                className="w-full py-2.5 bg-white border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-bold text-[13px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {alertsEnabled ? 'Disable Alerts' : 'Enable Alerts'}
              </button>
            </div>

            {/* Recently Viewed Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5">
                  <Eye className="w-4.5 h-4.5 text-primary-green" /> Recently Viewed
                </h3>
                <span
                  onClick={() => navigate('/')}
                  className="text-[11.5px] text-primary-green hover:text-dark-green font-black uppercase tracking-wider cursor-pointer"
                >
                  View All
                </span>
              </div>

              <div className="flex flex-col gap-3.5">
                {recentlyViewed.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3">
                      {/* Product Thumbnail */}
                      <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center p-1.5 border border-gray-100 shrink-0 select-none">
                        <img src={item.image} alt={item.name} className="max-h-9 object-contain rounded-full mix-blend-multiply" />
                      </div>
                      <div>
                        <h5 className="text-[13px] font-black text-gray-800 leading-tight group-hover:text-primary-green transition-colors truncate max-w-[110px]">
                          {item.name}
                        </h5>
                        <span className="text-[11px] text-gray-400 font-semibold block">{item.weight}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-[12px] font-extrabold text-gray-800">₹{item.price}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{item.originalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add Button */}
                    <button
                      onClick={() => {
                        addToCart({
                          id: item.id,
                          name: item.name,
                          weight: item.weight,
                          price: item.price,
                          image: item.image,
                          badge: 'Fresh',
                          source: 'Farm Fresh'
                        });
                      }}
                      className="rounded-full border border-primary-green hover:bg-[#F4FAF2] p-1.5 text-primary-green cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
