import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, ShoppingBag, Heart, MapPin, CreditCard, Star, LogOut,
  ChevronDown, Search, ArrowRight, CheckCircle2, Truck, Clock, XCircle, Copy, ShoppingCart, HelpCircle, Bell, Plus, Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyOrders({ addToCart, getItemQuantity, updateQuantity }) {
  const { user, logout, rewardPoints, notifications, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;
  
  useEffect(() => {
    if (refreshUserProfile) {
      refreshUserProfile();
    }
  }, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
  const [expandedOrder, setExpandedOrder] = useState(null);

  const orders = user?.orders || [];

  // Metrics calculations
  const totalOrdersCount = orders.length;
  const processingCount = orders.filter(o => o.status === 'Processing').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
  const cancelledCount = orders.filter(o => o.status === 'Cancelled').length;
  const returnedCount = 0; // default mockup metric
  
  const totalSpent = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  // Filter orders by search query and status tab
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Order ID copied to clipboard!');
  };

  const handleReorder = (order) => {
    order.items.forEach(item => {
      // Add items back to cart
      addToCart({
        id: item.id,
        name: item.name,
        weight: item.weight,
        price: item.price,
        image: item.image,
        badge: 'Fresh',
        source: 'Farm Fresh'
      });
    });
    toast.success('All items added back to your cart!');
    navigate('/cart');
  };



  // Recommended products list ("You may also like")
  const recommendedProducts = [
    {
      id: 'f3',
      name: 'Alphonso Mango',
      weight: '1 kg',
      price: 199,
      originalPrice: 249,
      image: '/product_mango.png',
      badge: 'Organic'
    },
    {
      id: 'f2',
      name: 'Banana - Robusta',
      weight: '1 kg',
      price: 49,
      originalPrice: 60,
      image: '/product_bananas.png',
      badge: 'Naturally Sweet'
    },
    {
      id: 'f10',
      name: 'Farm Fresh Milk',
      weight: '1 L',
      price: 52,
      originalPrice: 60,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=260',
      badge: 'Pure & Organic'
    },
    {
      id: 'f11',
      name: 'Tomato - Hybrid',
      weight: '1 kg',
      price: 32,
      originalPrice: 40,
      image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=260',
      badge: 'Daily Essential'
    },
    {
      id: 'f4',
      name: 'Turmeric Powder',
      weight: '200 g',
      price: 85,
      originalPrice: 110,
      image: '/product_turmeric.png',
      badge: 'Pure Spices'
    }
  ];

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 select-none">
            {/* User Profile Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium text-left flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-light-green border border-emerald-100 flex items-center justify-center text-primary-green shrink-0">
                {user?.profile_image ? (
                  <img src={user.profile_image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-primary-green" />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-[16px] font-black text-gray-800 leading-tight truncate">{user?.name}</h3>
                <p className="text-[11px] text-gray-400 font-bold leading-tight truncate mt-1">{user?.email}</p>
                {user?.membership_level === 'Plus' || user?.membership_level === 'Karshaq Plus' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary-green bg-light-green border border-emerald-50 px-2 py-0.5 rounded-full mt-2.5">
                    Karshaq Plus +
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full mt-2.5">
                    Standard Member
                  </span>
                )}
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white border border-border-color rounded-3xl py-4 px-3 shadow-premium text-left flex flex-col gap-1">
              <button 
                onClick={() => navigate('/profile')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <User className="w-4.5 h-4.5" />
                <span>My Profile</span>
              </button>

              <button 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-light-green/60 text-[14px] font-black text-primary-green cursor-pointer transition-colors"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                <span>My Orders</span>
              </button>

              <button 
                onClick={() => navigate('/wishlist')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <Heart className="w-4.5 h-4.5" />
                <span>My Wishlist</span>
              </button>

              <button 
                onClick={() => navigate('/addresses')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <MapPin className="w-4.5 h-4.5" />
                <span>My Addresses</span>
              </button>

              <button 
                onClick={() => navigate('/payments')} 
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <CreditCard className="w-4.5 h-4.5" />
                <span>Payment Methods</span>
              </button>

              <button 
                onClick={() => navigate('/rewards')} 
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors group"
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
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors group"
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-light-green/30 text-[14px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5" />
                <span>Help & Support</span>
              </button>

              <div className="h-[1px] bg-gray-100 my-2 mx-4" />

              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-red-50 text-[14px] font-black text-red-655 cursor-pointer transition-colors"
              >
                <LogOut className="w-4.5 h-4.5 text-red-500" />
                <span className="text-red-500">Logout</span>
              </button>
            </div>

            {/* Karshaq Plus Promo */}
            <div className="bg-gradient-to-br from-[#EAF2E4] to-[#DBEAD1] border border-border-color rounded-3xl p-6 shadow-premium text-left relative overflow-hidden">
              <span className="text-[18px] block font-black text-gray-800 leading-tight">Karshaq Plus 👑</span>
              <p className="text-[12px] text-gray-500 font-bold mt-2 leading-relaxed">
                You're saving more with free delivery & exclusive offers
              </p>
              <button className="mt-5 px-4 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[12px] rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1">
                Explore Benefits <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none w-32">
                <img src="/category_vegetables.png" alt="Plus benefits illustration" className="w-full mix-blend-multiply" />
              </div>
            </div>
          </div>

          {/* ================= MAIN CONTENT ================= */}
          <div className="lg:col-span-9 flex flex-col gap-6 text-left">
            
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] lg:text-[34px] font-black text-gray-850 tracking-tight leading-none">
                  My Orders
                </h1>
                <p className="text-gray-400 text-[14px] font-bold mt-2">
                  Track, manage and reorder your purchases
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="self-start sm:self-auto px-4 py-2 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[13px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                ← Continue Shopping
              </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border border-border-color rounded-2xl p-4 shadow-card flex flex-col md:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <input 
                  type="text"
                  placeholder="Search your orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-border-color rounded-xl text-[14px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                />
                <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Mock Dropdowns */}
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white px-4 py-2.5 border border-border-color rounded-xl cursor-pointer hover:bg-gray-50 text-[13px] font-bold text-gray-700 select-none">
                  Filter Orders <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
                <button className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-white px-4 py-2.5 border border-border-color rounded-xl cursor-pointer hover:bg-gray-50 text-[13px] font-bold text-gray-700 select-none">
                  Last 6 Months <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="border-b border-border-color flex gap-6 overflow-x-auto scrollbar-none select-none">
              {[
                { label: 'All Orders', filterValue: 'All', count: totalOrdersCount },
                { label: 'Processing', filterValue: 'Processing', count: processingCount },
                { label: 'Shipped', filterValue: 'Shipped', count: shippedCount },
                { label: 'Delivered', filterValue: 'Delivered', count: deliveredCount },
                { label: 'Cancelled', filterValue: 'Cancelled', count: cancelledCount },
                { label: 'Returned', filterValue: 'Returned', count: returnedCount }
              ].map((tab) => {
                const isActive = statusFilter === tab.filterValue;
                return (
                  <button 
                    key={tab.label}
                    onClick={() => setStatusFilter(tab.filterValue)}
                    className={`pb-3 text-[14px] font-bold whitespace-nowrap relative transition-colors cursor-pointer ${
                      isActive ? 'text-primary-green' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.label} ({tab.count})
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-green rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Two-Column Details area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Orders List */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-border-color rounded-3xl p-12 text-center shadow-card select-none">
                    <div className="w-16 h-16 bg-light-green text-primary-green rounded-full flex items-center justify-center mx-auto mb-5">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="text-[18px] font-black text-gray-850">No Orders Found</h3>
                    <p className="text-gray-400 text-[13.5px] font-semibold mt-2 max-w-[280px] mx-auto leading-relaxed">
                      {statusFilter === 'All' 
                        ? "You haven't placed any orders yet. Complete checkout to see your history!"
                        : `No orders currently match status category '${statusFilter}'`
                      }
                    </p>
                    {statusFilter === 'All' && (
                      <button 
                        onClick={() => navigate('/')}
                        className="mt-6 px-5 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors shadow-md cursor-pointer"
                      >
                        Start Shopping
                      </button>
                    )}
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <div 
                        key={order.id}
                        className="bg-white border border-border-color rounded-3xl shadow-card p-5 flex flex-col gap-4 text-left transition-all"
                      >
                        {/* Order Main Header */}
                        <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-4 pb-4 border-b border-gray-50">
                          
                          {/* Order ID & Meta */}
                          <div className="flex gap-3">
                            {/* Overlayed item thumbnails */}
                            <div className="w-16 h-16 rounded-2xl bg-[#FAFAF9]/80 border border-gray-100 flex items-center justify-center p-1.5 shrink-0 select-none">
                              <img 
                                src={order.items[0]?.image || '/product_apples.png'} 
                                alt="items thumbnail" 
                                className="max-h-12 max-w-12 object-cover mix-blend-multiply rounded-full" 
                              />
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-[15px] font-black text-gray-850 flex items-center gap-1 truncate select-none">
                                Order #{order.id}
                                <Copy 
                                  onClick={() => copyToClipboard(order.id)}
                                  className="w-3.5 h-3.5 text-gray-400 hover:text-primary-green cursor-pointer shrink-0" 
                                />
                              </span>
                              <span className="text-[12px] text-gray-450 font-bold block mt-1 leading-none select-none">
                                {order.date}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold mt-2.5 select-none">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                <span className="truncate">{order.address}</span>
                              </div>
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 border border-gray-150 text-gray-500 rounded bg-gray-50 mt-2.5 inline-block leading-none select-none">
                                {order.paymentMethod}
                              </span>
                            </div>
                          </div>

                          {/* Status and expected delivery */}
                          <div>
                            {order.status === 'Processing' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 bg-blue-50 text-blue-700 rounded-full select-none">
                                <Clock className="w-3.5 h-3.5" /> Processing
                              </span>
                            )}
                            {order.status === 'Shipped' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 bg-amber-50 text-amber-700 rounded-full select-none">
                                <Truck className="w-3.5 h-3.5" /> Shipped
                              </span>
                            )}
                            {order.status === 'Delivered' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 bg-emerald-50 text-primary-green rounded-full select-none">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
                              </span>
                            )}
                            {order.status === 'Cancelled' && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide px-3 py-1 bg-red-50/70 text-red-650 rounded-full select-none">
                                <XCircle className="w-3.5 h-3.5" /> Cancelled
                              </span>
                            )}

                            <div className="text-[12.5px] font-bold text-gray-650 mt-3 leading-snug">
                              {order.status === 'Processing' && 'We are preparing your order. Will be shipped soon.'}
                              {order.status === 'Shipped' && `Expected delivery: ${order.expectedDelivery}`}
                              {order.status === 'Delivered' && `Delivered on ${order.expectedDelivery}`}
                              {order.status === 'Cancelled' && 'Cancelled. Amount refunded to your original payment method.'}
                            </div>

                            {/* Dropdown status details (Delivery Partner / Info Box) */}
                            {order.status !== 'Cancelled' && (
                              <div className="mt-3.5 bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex items-center justify-between text-[11.5px] text-gray-550 font-bold select-none leading-none">
                                <span className="flex items-center gap-1.5">
                                  <Truck className="w-4 h-4 text-primary-green" /> 
                                  {order.status === 'Delivered' ? 'Delivered to Home' : `Partner: ${order.deliveryPartner}`}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Total Cost and CTA */}
                          <div className="flex flex-col items-end md:items-end justify-between min-h-[90px] h-full self-stretch select-none">
                            <div className="text-right">
                              <span className="text-[20px] font-black text-gray-800">
                                ₹{order.total}
                              </span>
                              <span className="text-[12px] text-gray-400 font-bold block mt-0.5">
                                {order.itemsCount} Items
                              </span>
                            </div>
                            
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                              {order.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => handleReorder(order)}
                                  className="flex-1 md:flex-none border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] px-4 py-2 rounded-xl transition-colors cursor-pointer text-center"
                                >
                                  Reorder
                                </button>
                              )}
                              <button 
                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                className="flex-1 md:flex-none border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[12px] px-4 py-2 rounded-xl transition-colors cursor-pointer text-center"
                              >
                                {isExpanded ? 'Hide Details' : 'View Details'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Order Details (Items Review) */}
                        {isExpanded && (
                          <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                            <h4 className="text-[12.5px] font-black text-gray-700 uppercase tracking-wide select-none">Items in Order</h4>
                            <div className="flex flex-col gap-3">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 bg-white rounded-lg border border-gray-100 flex items-center justify-center p-1 shrink-0 select-none">
                                      <img src={item.image} alt={item.name} className="max-h-8 max-w-8 object-cover mix-blend-multiply rounded-full" />
                                    </div>
                                    <div>
                                      <span className="text-[13.5px] font-black text-gray-800 leading-tight block">{item.name}</span>
                                      <span className="text-[11px] text-gray-400 font-bold block mt-0.5">{item.weight} • ₹{item.price} each</span>
                                    </div>
                                  </div>
                                  <span className="text-[13px] font-bold text-gray-600">Qty: {item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* ================= RIGHT COLUMN METRICS ================= */}
              <div className="lg:col-span-4 flex flex-col gap-6 select-none text-left">
                
                {/* Orders Summary Panel */}
                <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium">
                  <h3 className="text-[18px] font-black text-gray-805 tracking-tight mb-5 flex items-center gap-2">
                    Orders Summary
                  </h3>
                  <div className="flex flex-col gap-3.5 text-[13.5px] font-semibold text-gray-500">
                    <div className="flex justify-between border-b border-gray-50 pb-2.5">
                      <span>Total Orders</span>
                      <span className="text-gray-800 font-black">{totalOrdersCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2.5">
                      <span>Delivered</span>
                      <span className="text-gray-800 font-black">{deliveredCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2.5">
                      <span>Processing</span>
                      <span className="text-gray-800 font-black">{processingCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2.5">
                      <span>Shipped</span>
                      <span className="text-gray-800 font-black">{shippedCount}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2.5">
                      <span>Cancelled</span>
                      <span className="text-gray-800 font-black">{cancelledCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Returned</span>
                      <span className="text-gray-800 font-black">{returnedCount}</span>
                    </div>
                  </div>

                  {/* Total Spent Box */}
                  <div className="mt-6 bg-[#E8F5E9]/50 border border-emerald-100 rounded-2xl p-4.5 flex justify-between items-center relative overflow-hidden">
                    <div className="z-10">
                      <span className="text-[12.5px] text-gray-550 font-bold block leading-none">Total Spent</span>
                      <span className="text-[11px] text-gray-400 font-bold block mt-1.5 leading-none">In Last 6 Months</span>
                    </div>
                    <span className="text-[24px] font-black text-primary-green z-10 leading-none">
                      ₹{totalSpent}
                    </span>
                  </div>
                </div>

                {/* Free Delivery Alert */}
                <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary-green shrink-0">
                      <Truck className="w-5 h-5 text-primary-green" />
                    </div>
                    <div>
                      <span className="text-[13.5px] font-black text-gray-800 block leading-tight">
                        You're just ₹254 away
                      </span>
                      <span className="text-[11px] text-gray-450 font-bold block mt-0.5">
                        from free delivery!
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-1.5 overflow-hidden">
                    <div className="bg-primary-green h-2 rounded-full w-[65%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-bold mt-[-5px]">
                    <span>₹0</span>
                    <span>₹499</span>
                  </div>

                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Shop More
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* ================= BOTTOM PRODUCT RECOMMENDATIONS ================= */}
        <section className="w-full py-8 border-t border-border-color mt-16 text-left">
          <div className="flex items-center justify-between mb-8 select-none">
            <h2 className="text-[22px] lg:text-[26px] font-black text-gray-800 tracking-tight flex items-center gap-1.5">
              You May Also Like ✨
            </h2>
            <span 
              onClick={() => navigate('/')} 
              className="text-primary-green hover:text-dark-green font-bold text-[14px] cursor-pointer flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-[22px] border border-border-color shadow-card p-4 flex flex-col justify-between select-none relative group transition-all duration-300 hover:-translate-y-1.5"
              >
                <div>
                  {/* Product image wrapper */}
                  <div className="w-full aspect-square bg-[#FAFAF9]/80 rounded-xl flex items-center justify-center p-3 mb-3 overflow-hidden relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-[110px] max-w-[110px] object-cover rounded-full mix-blend-multiply group-hover:scale-104 transition-transform duration-300"
                    />
                  </div>

                  {/* Details */}
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md tracking-wider mb-2.5 inline-block select-none leading-none">
                    {prod.badge}
                  </span>
                  <h4 className="text-[14px] md:text-[15px] font-black text-gray-850 leading-tight mb-1 truncate">
                    {prod.name}
                  </h4>
                  <span className="text-[12px] text-gray-400 font-bold block mb-1">
                    {prod.weight}
                  </span>
                </div>

                {/* Price & Add button footer */}
                <div className="flex items-center justify-between border-t border-gray-105 pt-3 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-black text-gray-805">
                      ₹{prod.price}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-[11px] font-bold text-gray-400 line-through leading-none mt-0.5">
                        ₹{prod.originalPrice}
                      </span>
                    )}
                  </div>

                  {getItemQuantity(prod.id) > 0 ? (
                    <div className="flex items-center border border-primary-green rounded-xl overflow-hidden bg-white select-none shrink-0">
                      <button 
                        onClick={() => updateQuantity(prod.id, -1)}
                        className="px-2 py-1 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-[13px] font-black text-gray-800 w-4 text-center">
                        {getItemQuantity(prod.id)}
                      </span>
                      <button 
                        onClick={() => updateQuantity(prod.id, 1)}
                        className="px-2 py-1 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => addToCart({
                        id: prod.id,
                        name: prod.name,
                        weight: prod.weight,
                        price: prod.price,
                        image: prod.image,
                        badge: prod.badge,
                        source: 'Farm Fresh'
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 border border-primary-green text-primary-green hover:bg-light-green text-[12px] font-extrabold rounded-lg transition-colors cursor-pointer select-none shrink-0"
                    >
                      Add +
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
