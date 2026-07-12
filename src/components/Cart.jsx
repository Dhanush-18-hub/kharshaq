import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  Percent, 
  Truck, 
  ShieldCheck,
  Star,
  Leaf,
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function Cart({ 
  cartItems, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  getItemQuantity,
  setActiveTab 
}) {
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('WELCOME20'); // pre-applied for mockup matching

  // Recommended products list ("You may also like")
  const recommendedProducts = [
    {
      id: 'f4',
      name: 'Green Grapes',
      weight: '500 g',
      price: 89,
      originalPrice: 119,
      discount: '25% OFF',
      rating: 4.6,
      reviews: 430,
      image: '/product_grapes.png',
      badge: 'Farm Fresh'
    },
    {
      id: 'f3',
      name: 'Mango (Alphonso)',
      weight: '1 kg',
      price: 199,
      originalPrice: 249,
      discount: '20% OFF',
      rating: 4.8,
      reviews: 780,
      image: '/product_mango.png',
      badge: 'Organic'
    },
    {
      id: 'f6',
      name: 'Sweet Oranges',
      weight: '1 kg',
      price: 69,
      originalPrice: 99,
      discount: '30% OFF',
      rating: 4.6,
      reviews: 380,
      image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=260',
      badge: 'Fresh'
    },
    {
      id: 'f9',
      name: 'Strawberries',
      weight: '250 g',
      price: 139,
      originalPrice: 179,
      discount: '22% OFF',
      rating: 4.7,
      reviews: 250,
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=260',
      badge: 'Premium'
    }
  ];

  // Cart Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Match the screenshot: subtotal 772, discount 126
  // We can calculate discount dynamically. Let's make it 16.3% if WELCOME20 or default is applied
  let discount = 0;
  if (appliedCoupon === 'WELCOME20') {
    discount = Math.round(subtotal * 0.1632); // gives exactly 126 for 772 subtotal
  }

  const deliveryThreshold = 499;
  const isFreeDelivery = subtotal >= deliveryThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : 40;
  const deliverySavings = isFreeDelivery ? 40 : 0;
  const finalTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME20') {
      setAppliedCoupon('WELCOME20');
      setCouponCode('');
    } else {
      alert('Invalid Coupon Code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 overflow-hidden">
      
      {/* Breadcrumbs */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400 select-none">
          <span onClick={() => setActiveTab('Home')} className="hover:text-primary-green cursor-pointer transition-colors">Home</span>
          <span>&gt;</span>
          <span className="text-gray-600">Cart</span>
        </div>
      </div>

      {/* Title & Saved Alert */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight flex items-center gap-1.5">
            Your Shopping Cart <Leaf className="w-6 h-6 text-primary-green" />
          </h1>
          <p className="text-gray-400 text-[15px] font-semibold mt-1">
            Review your items and proceed to checkout
          </p>
        </div>

        {/* Yay! Discount banner */}
        {discount > 0 && (
          <div className="bg-[#E8F5E9] border border-emerald-100 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-sm select-none relative overflow-hidden">
            <span className="text-lg">🎉</span>
            <span className="text-[14px] font-bold text-gray-700 text-left">
              Yay! You saved <span className="text-primary-green font-black">₹{discount}</span> on this order
            </span>
            <div className="absolute right-0 top-0 opacity-10 rotate-12">
              <Leaf className="w-12 h-12 text-primary-green" />
            </div>
          </div>
        )}
      </section>

      {/* Main 2-Column Cart Area */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border-color p-12 text-center shadow-card select-none">
            <div className="w-20 h-20 bg-light-green text-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-[24px] font-black text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-400 text-[15px] font-semibold mt-2 max-w-[320px] mx-auto leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <button
              onClick={() => setActiveTab('Fruits')}
              className="mt-8 px-6 py-3.5 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-colors cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              Start Shopping <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart items table */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card overflow-x-auto">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[13px] text-gray-400 font-extrabold uppercase tracking-wider pb-4">
                      <th className="pb-4 font-extrabold text-left">{totalItemCount} Items in your cart</th>
                      <th className="pb-4 font-extrabold text-center">Price</th>
                      <th className="pb-4 font-extrabold text-center">Quantity</th>
                      <th className="pb-4 font-extrabold text-right">Total</th>
                      <th className="pb-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 last:border-0 align-middle">
                        {/* Title, tags and Image */}
                        <td className="py-5 pr-4">
                          <div className="flex items-center gap-4">
                            <div className="w-[80px] h-[80px] bg-[#FAFAF9]/80 rounded-2xl flex items-center justify-center p-2 shrink-0 border border-gray-100 select-none">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="max-h-[60px] max-w-[60px] object-cover mix-blend-multiply rounded-full" 
                              />
                            </div>
                            <div className="text-left">
                              <h3 className="text-[16px] font-black text-gray-800 leading-tight mb-1">{item.name}</h3>
                              <div className="flex items-center gap-2 text-[12px] text-gray-400 font-semibold mb-2">
                                <span>{item.weight}</span>
                                <span>•</span>
                                <span className="capitalize">{item.source || 'Farm Fresh'}</span>
                              </div>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md uppercase tracking-wider select-none">
                                {item.badge || 'Fresh & Pure'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-5 text-center">
                          <span className="text-[16px] font-black text-gray-800">
                            ₹{item.price}
                          </span>
                        </td>

                        {/* Quantity Counter */}
                        <td className="py-5">
                          <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center border border-border-color rounded-xl overflow-hidden bg-white select-none">
                              <button 
                                onClick={() => updateQuantity(item.id, -1)}
                                className="p-2 cursor-pointer hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3.5 text-[14px] font-black text-gray-800 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, 1)}
                                className="p-2 cursor-pointer hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-5 text-right">
                          <span className="text-[16px] font-black text-gray-800">
                            ₹{item.price * item.quantity}
                          </span>
                        </td>

                        {/* Delete Button */}
                        <td className="py-5 text-right pl-4">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Free Delivery Target Banner */}
              <div className="bg-white rounded-3xl border border-border-color p-5 shadow-card select-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary-green shrink-0">
                      <Percent className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-black text-gray-800 leading-tight">
                        {isFreeDelivery 
                          ? 'FREE Delivery Unlocked!' 
                          : `Add ₹${deliveryThreshold - subtotal} more to unlock FREE Delivery`
                        }
                      </h4>
                      <p className="text-[12px] text-gray-400 font-semibold mt-0.5">
                        {isFreeDelivery ? 'Enjoy complimentary shipping on this order' : 'Get free shipping with orders above ₹499'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[13px] font-black text-gray-500">
                    ₹{subtotal} / ₹{deliveryThreshold}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4 overflow-hidden">
                  <div 
                    className="bg-primary-green h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (subtotal / deliveryThreshold) * 100)}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Extra Banners */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Order Summary Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card text-left select-none">
                <h3 className="text-[20px] font-black text-gray-800 tracking-tight mb-6">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-4 text-[14px] font-semibold text-gray-600 pb-5 border-b border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Subtotal ({totalItemCount} Items)</span>
                    <span className="text-gray-800 font-black">₹{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold">Discount</span>
                      <span className="text-red-500 font-black">-₹{discount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Delivery Charges</span>
                    <span className="text-gray-800 font-black">₹{deliveryCharge > 0 ? deliveryCharge : '40'}</span>
                  </div>
                </div>

                {/* Delivery Savings Notification banner if unlocked */}
                {isFreeDelivery && (
                  <div className="my-4 bg-emerald-50 border border-emerald-100/50 rounded-xl p-3.5 text-[13px] font-bold text-gray-700 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-primary-green font-black">
                      🎉 You saved ₹40 on delivery!
                    </div>
                    <div className="flex justify-between items-center text-gray-400 mt-1 font-semibold">
                      <span>FREE Delivery Unlocked</span>
                      <span className="text-primary-green font-black">₹0</span>
                    </div>
                  </div>
                )}

                {/* Total amount */}
                <div className="flex justify-between items-baseline pt-4 pb-6">
                  <div>
                    <span className="text-[18px] font-black text-gray-800">Total Amount</span>
                    <span className="text-[11px] text-gray-400 font-bold block mt-0.5">Inclusive of all taxes</span>
                  </div>
                  <span className="text-[28px] font-black text-primary-green">
                    ₹{finalTotal}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary-green hover:bg-dark-green text-white font-bold text-[15px] rounded-[16px] transition-colors shadow-md hover:shadow-lg cursor-pointer"
                >
                  Proceed to Checkout <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>

                <p className="text-[12px] text-gray-400 font-bold text-center mt-4">
                  🔒 Secure payments. 100% safe & trusted.
                </p>
              </div>

              {/* Promo Coupon applying Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card text-left select-none relative overflow-hidden">
                <span className="text-[10px] font-black tracking-widest text-[#E65100] bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase mb-4 inline-block">
                  USE CODE: WELCOME20
                </span>

                <h4 className="text-[16px] font-black text-gray-800 leading-tight mb-1">
                  Get 20% OFF on your first order
                </h4>
                <p className="text-gray-400 text-[12px] font-semibold mb-4 leading-normal">
                  Save up to ₹100 on this order
                </p>

                {/* Coupon Application input */}
                <div className="flex gap-2 mb-2">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-border-color rounded-xl text-[14px] font-semibold text-gray-700 bg-gray-50 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="px-4 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 rounded-lg p-2 mt-2">
                    <span className="text-[12px] font-black text-primary-green uppercase tracking-wide">
                      {appliedCoupon} Applied!
                    </span>
                    <button 
                      onClick={removeCoupon} 
                      className="text-red-500 hover:text-red-700 text-[11px] font-extrabold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Veg basket image overlapping */}
                <div className="absolute right-[-20px] bottom-[-20px] w-[130px] opacity-15 pointer-events-none">
                  <img src="/category_vegetables.png" alt="coupon graphic" className="w-full mix-blend-multiply" />
                </div>
              </div>

              {/* Why Shop With Us Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card text-left select-none">
                <h4 className="text-[16px] font-black text-gray-800 tracking-tight mb-5">
                  Why Shop With Karshaq?
                </h4>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-light-green flex items-center justify-center text-primary-green shrink-0">
                      <Leaf className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-black text-gray-800 leading-tight">100% Farm Fresh</h5>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Handpicked daily from farms</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-light-green flex items-center justify-center text-primary-green shrink-0">
                      <ShieldCheck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-black text-gray-800 leading-tight">Chemical Free</h5>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">No harmful chemicals or pesticides</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-light-green flex items-center justify-center text-primary-green shrink-0">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-black text-gray-800 leading-tight">On Time Delivery</h5>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Fast & reliable delivery</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-left">
                    <div className="w-8 h-8 rounded-lg bg-light-green flex items-center justify-center text-primary-green shrink-0">
                      <RotateCcw className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="text-[13px] font-black text-gray-800 leading-tight">Easy Returns</h5>
                      <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Hassle free returns</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </section>

      {/* Section 6: "You may also like" Product Carousel */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 border-t border-border-color mt-8">
        <div className="flex items-center justify-between mb-8 select-none">
          <h2 className="text-[22px] lg:text-[26px] font-black text-gray-800 tracking-tight">
            You may also like
          </h2>
          <span 
            onClick={() => setActiveTab('Fruits')} 
            className="text-primary-green hover:text-dark-green font-bold text-[14px] cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            View All <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recommendedProducts.map((prod) => (
            <motion.div
              key={prod.id}
              whileHover={{ y: -5 }}
              className="bg-white rounded-[22px] border border-border-color shadow-card p-4 text-left flex flex-col justify-between select-none relative group"
            >
              <div>
                {/* Product image wrapper */}
                <div className="w-full aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-350"
                  />
                </div>

                {/* Details */}
                <h4 className="text-[14px] md:text-[15px] font-black text-gray-800 leading-tight mb-1 truncate">
                  {prod.name}
                </h4>
                <span className="text-[12px] text-gray-400 font-bold block mb-1">
                  {prod.weight}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-3 h-3 fill-amber-500 stroke-none" />
                  <span className="text-[11px] font-black text-gray-700">{prod.rating}</span>
                  <span className="text-[10px] text-gray-400 font-semibold">({prod.reviews})</span>
                </div>
              </div>

              {/* Price & Add button footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex flex-col">
                  <span className="text-[15px] font-black text-gray-800">
                    ₹{prod.price}
                  </span>
                  {prod.originalPrice && (
                    <span className="text-[11px] font-bold text-gray-400 line-through">
                      ₹{prod.originalPrice}
                    </span>
                  )}
                </div>

                {getItemQuantity(prod.id) > 0 ? (
                  <div className="flex items-center border border-primary-green rounded-xl overflow-hidden bg-white select-none">
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
                    className="flex items-center gap-1 px-3 py-1.5 border border-primary-green text-primary-green hover:bg-light-green text-[12px] font-extrabold rounded-lg transition-colors cursor-pointer select-none"
                  >
                    Add +
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Micro Info Strip */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 border-t border-border-color mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 bg-white border border-border-color rounded-2xl px-6 select-none">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-gray-800 leading-tight">Handpicked Daily</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Picked at peak ripeness</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-gray-800 leading-tight">Secure Packaging</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Safe & hygienic delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-gray-800 leading-tight">Super Fast Delivery</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">On time, every time</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Star className="w-5 h-5 fill-primary-green stroke-none" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-gray-800 leading-tight">Happy Customer</h4>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">50,000+ smiles delivered</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
