import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Trash2, Bell, Plus, Star, 
  ArrowRight, User, ShoppingBag, MapPin, CreditCard, 
  LogOut, HelpCircle, Check, ShieldCheck, X, MoreVertical, Smartphone, Key
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProfileSidebar from './ProfileSidebar';

export default function PaymentMethods({ paymentMethods, setPaymentMethods }) {
  const { user, logout, rewardPoints, notifications } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Cards', 'UPI', 'Wallets'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Modal Form State
  const [methodType, setMethodType] = useState('Card'); // 'Card' or 'UPI'
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    upiProvider: 'Google Pay',
    isDefault: false
  });

  // Tab counts
  const cardsCount = paymentMethods.filter(p => p.type === 'Card').length;
  const upiCount = paymentMethods.filter(p => p.type === 'UPI').length;
  const walletsCount = paymentMethods.filter(p => p.type === 'Wallet').length;
  const totalCount = paymentMethods.length;

  // Filter list by tab
  const filteredMethods = paymentMethods.filter(pm => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Cards') return pm.type === 'Card';
    if (activeTab === 'UPI') return pm.type === 'UPI';
    if (activeTab === 'Wallets') return pm.type === 'Wallet';
    return true;
  });

  // Get active default method
  const defaultMethod = paymentMethods.find(p => p.isDefault);

  // Form inputs change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'cardNumber') {
      // Format card number: digits only, space every 4 digits, max 16 digits
      const digits = value.replace(/\D/g, '').substring(0, 16);
      const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits;
      setFormData(prev => ({ ...prev, cardNumber: formatted }));
    } else if (name === 'expiryDate') {
      // Format expiry MM/YY
      const digits = value.replace(/\D/g, '').substring(0, 4);
      let formatted = digits;
      if (digits.length > 2) {
        formatted = `${digits.substring(0, 2)}/${digits.substring(2)}`;
      }
      setFormData(prev => ({ ...prev, expiryDate: formatted }));
    } else if (name === 'cvv') {
      const digits = value.replace(/\D/g, '').substring(0, 3);
      setFormData(prev => ({ ...prev, cvv: digits }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Open add payment method modal
  const openAddModal = () => {
    setFormData({
      cardNumber: '',
      cardholderName: user?.name || 'Dhanush Kumar',
      expiryDate: '',
      cvv: '',
      upiId: '',
      upiProvider: 'Google Pay',
      isDefault: paymentMethods.length === 0
    });
    setMethodType('Card');
    setIsModalOpen(true);
  };

  // Save new payment method
  const handleSavePaymentMethod = (e) => {
    e.preventDefault();

    if (methodType === 'Card') {
      const cardNoDigits = formData.cardNumber.replace(/\s/g, '');
      if (cardNoDigits.length !== 16) return toast.error('Please enter a valid 16-digit card number');
      if (!formData.cardholderName.trim()) return toast.error('Cardholder name is required');
      if (formData.expiryDate.length !== 5) return toast.error('Please enter expiry in MM/YY format');
      if (formData.cvv.length !== 3) return toast.error('Please enter a 3-digit CVV');

      // Resolve card brand
      let brand = 'Visa';
      if (formData.cardNumber.startsWith('5')) {
        brand = 'Mastercard';
      } else if (formData.cardNumber.startsWith('6')) {
        brand = 'RuPay';
      }

      const newMethod = {
        id: `pm${Date.now()}`,
        type: 'Card',
        brand: brand,
        cardNo: `${brand} •••• ${cardNoDigits.substring(12)}`,
        expiry: formData.expiryDate,
        name: formData.cardholderName,
        isDefault: formData.isDefault
      };

      saveMethod(newMethod);
    } else {
      // UPI ID validation
      if (!formData.upiId.trim() || !formData.upiId.includes('@')) {
        return toast.error('Please enter a valid UPI ID (e.g. username@bank)');
      }

      const newMethod = {
        id: `pm${Date.now()}`,
        type: 'UPI',
        brand: formData.upiProvider,
        upiId: formData.upiId.trim(),
        isDefault: formData.isDefault
      };

      saveMethod(newMethod);
    }
  };

  const saveMethod = (newMethod) => {
    if (newMethod.isDefault) {
      setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: false })).concat(newMethod));
    } else {
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    toast.success('Payment method saved successfully!');
    setIsModalOpen(false);
  };

  // Delete payment method
  const handleDeleteMethod = (id) => {
    const confirm = window.confirm('Are you sure you want to delete this payment method?');
    if (!confirm) return;

    const methodToDelete = paymentMethods.find(p => p.id === id);
    setPaymentMethods(prev => {
      const remaining = prev.filter(p => p.id !== id);
      if (methodToDelete?.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
    toast.success('Payment method removed successfully.');
    setActiveMenuId(null);
  };

  // Set method as default
  const handleSetDefault = (id) => {
    setPaymentMethods(prev => prev.map(p => ({
      ...p,
      isDefault: p.id === id
    })));
    toast.success('Default payment method updated.');
    setActiveMenuId(null);
  };

  // Render Brand Logo
  const renderBrandLogo = (brand) => {
    if (brand === 'Visa') {
      return (
        <span className="text-[17px] font-black italic text-[#1A1F71] tracking-tight select-none">
          VISA
        </span>
      );
    }
    if (brand === 'Mastercard') {
      return (
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-[#EB001B] relative z-10" />
          <div className="w-5 h-5 rounded-full bg-[#F79E1B] relative left-[-10px]" />
        </div>
      );
    }
    if (brand === 'Google Pay') {
      return (
        <div className="flex items-center gap-0.5">
          <span className="text-gray-700 font-extrabold text-[12px] uppercase select-none">G Pay</span>
        </div>
      );
    }
    if (brand === 'PhonePe') {
      return (
        <span className="text-purple-700 font-black text-[13px] tracking-wide select-none">
          पे PhonePe
        </span>
      );
    }
    return <CreditCard className="w-6 h-6 text-gray-400" />;
  };

  // Render Verification Badge
  const renderRightLogoBadge = (brand) => {
    if (brand === 'Visa') return <span className="text-[10px] font-bold text-gray-400 select-none">RuPay</span>;
    if (brand === 'Mastercard') return <span className="text-[10px] font-bold text-gray-400 select-none">mastercard</span>;
    return <span className="text-[10px] font-bold text-gray-400 select-none">UPI</span>;
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">Payment Methods</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= COLUMN 1: LEFT SIDEBAR ================= */}
          <ProfileSidebar activeTab="payments" />

          {/* ================= COLUMN 2: MIDDLE MAIN CONTENT ================= */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            
            {/* Header Title & toolbar */}
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight leading-none">
                    Payment Methods
                  </h1>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-3.5 py-1.5 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    ← Continue Shopping
                  </button>
                </div>
                <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                  Manage your saved cards, UPI IDs and wallet for a faster checkout
                </p>
              </div>

              <button
                onClick={openAddModal}
                className="px-4.5 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
            </div>

            {/* Filter Category Tabs */}
            <div className="flex flex-wrap gap-2 pb-2 select-none border-b border-gray-150/40">
              {[
                { id: 'All', label: `All Methods (${totalCount})` },
                { id: 'Cards', label: `Cards (${cardsCount})` },
                { id: 'UPI', label: `UPI (${upiCount})` },
                { id: 'Wallets', label: `Wallets (${walletsCount})` }
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
                      layoutId="activePaymentTabLine" 
                      className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-primary-green rounded-full" 
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Saved Payment Methods Header Label */}
            <h3 className="text-[15px] font-black text-gray-700 tracking-tight uppercase leading-none select-none mt-2">
              Saved Payment Methods
            </h3>

            {/* Methods Stack */}
            {filteredMethods.length === 0 ? (
              <div className="bg-white border border-border-color rounded-[32px] p-12 text-center shadow-premium flex flex-col items-center py-16">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-primary-green mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h3 className="text-[18px] font-black text-gray-800">No payment methods</h3>
                <p className="text-[13px] text-gray-400 font-bold mt-1.5 max-w-[320px]">
                  You haven't saved any payment methods under this category yet.
                </p>
                <button 
                  onClick={openAddModal}
                  className="mt-6 px-5 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredMethods.map((pm) => (
                  <motion.div
                    layout
                    key={pm.id}
                    className={`bg-white rounded-3xl border px-6 py-5 flex items-center justify-between gap-4 transition-all duration-300 relative shadow-card hover:shadow-premium ${
                      pm.isDefault ? 'border-primary-green' : 'border-border-color'
                    }`}
                  >
                    {/* Left Icon and detail stack */}
                    <div className="flex items-center gap-5 flex-1 overflow-hidden">
                      {/* Logo Frame */}
                      <div className="w-16 h-10 border border-gray-100 rounded-xl bg-gray-50/50 flex items-center justify-center shrink-0 p-2 shadow-sm select-none">
                        {renderBrandLogo(pm.brand)}
                      </div>

                      {/* Brand strings */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-[15.5px] font-black text-gray-800 leading-tight truncate">
                            {pm.type === 'Card' ? pm.cardNo : pm.upiId}
                          </h4>
                        </div>
                        
                        <p className="text-[12px] text-gray-400 font-bold mt-1 tracking-wide leading-none flex items-center gap-1.5 flex-wrap">
                          {pm.type === 'Card' ? (
                            <>
                              <span>Expires {pm.expiry}</span>
                              <span className="text-gray-300">•</span>
                              <span className="truncate">{pm.name}</span>
                            </>
                          ) : (
                            <>
                              <span>{pm.brand}</span>
                              <span className="text-gray-300">•</span>
                              <span>UPI</span>
                            </>
                          )}
                        </p>

                        {pm.isDefault && (
                          <div className="mt-2 flex">
                            <span className="text-[8.5px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] border border-emerald-100 rounded px-1.5 py-0.5 uppercase tracking-wide inline-flex items-center gap-0.5 leading-none">
                              Default 👑
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right side verification badge & action dropdown */}
                    <div className="flex items-center gap-6 shrink-0 relative">
                      
                      {/* Verification Stamp */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        <span className="w-12 text-right shrink-0 flex justify-end">
                          {renderRightLogoBadge(pm.brand)}
                        </span>
                        <div className="flex items-center gap-1 text-[11.5px] text-[#2E7D32] font-black select-none">
                          <ShieldCheck className="w-4.5 h-4.5 stroke-[2.5]" />
                          <span>{pm.type === 'Card' ? 'Secure' : 'Verified'}</span>
                        </div>
                      </div>

                      {/* Dropdown Action Trigger */}
                      <div>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === pm.id ? null : pm.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === pm.id && (
                          <>
                            {/* Backdrop overlay to dismiss menu */}
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setActiveMenuId(null)}
                            />
                            
                            {/* Menu stack */}
                            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-border-color rounded-2xl shadow-premium py-1.5 z-20 text-[13px] font-bold text-gray-700 flex flex-col">
                              {!pm.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(pm.id)}
                                  className="w-full text-left px-4 py-2 hover:bg-light-green/30 text-primary-green cursor-pointer transition-colors flex items-center gap-2"
                                >
                                  <Check className="w-3.5 h-3.5" /> Make Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMethod(pm.id)}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-500 cursor-pointer transition-colors flex items-center gap-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" /> Delete Method
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                    </div>

                  </motion.div>
                ))}
              </div>
            )}

            {/* PCI / Encryption Trust Banner */}
            <div className="bg-white border border-border-color rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm select-none">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary-green shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <h4 className="text-[14.5px] font-black text-gray-800 leading-tight">100% Secure Payments</h4>
                  <p className="text-[12px] text-gray-400 font-bold mt-1 leading-snug">
                    Your payment details are encrypted and safe with us.
                  </p>
                </div>
              </div>
              
              {/* Payment standard seals */}
              <div className="flex items-center gap-3.5 opacity-60 flex-wrap justify-center mt-2 md:mt-0">
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 border border-gray-300 rounded text-gray-500 uppercase tracking-widest leading-none">PCI DSS</span>
                <span className="text-[11px] font-extrabold italic text-sky-800 tracking-tighter">RuPay</span>
                <span className="text-[12px] font-black italic text-blue-900 leading-none">VISA</span>
                <div className="flex items-center gap-0.5">
                  <div className="w-3 h-3 rounded-full bg-[#EB001B]" />
                  <div className="w-3 h-3 rounded-full bg-[#F79E1B] relative left-[-6px]" />
                </div>
                <span className="text-[11px] font-extrabold tracking-tight text-emerald-800">UPI</span>
              </div>
            </div>

            {/* Bottom wallets promo banner */}
            <div className="bg-[#F3FAF5] border border-emerald-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative min-h-[120px] shadow-sm select-none">
              <div className="text-left z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary-green shrink-0">
                  <Smartphone className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[16px] font-black text-gray-800 leading-tight">Add More. Pay Your Way.</h4>
                  <p className="text-[12px] text-gray-500 font-bold mt-1 max-w-[360px]">
                    Add cards, UPI IDs or wallets and enjoy a seamless shopping experience.
                  </p>
                </div>
              </div>
              
              <div className="absolute right-0 bottom-[-15px] opacity-15 pointer-events-none w-36">
                <img src="/category_vegetables.png" alt="Illustration" className="w-full mix-blend-multiply" />
              </div>
            </div>

          </div>

          {/* ================= COLUMN 3: RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">
            
            {/* Payment Summary */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <CreditCard className="w-4.5 h-4.5 text-primary-green fill-primary-green" /> Payment Summary
              </h3>
              
              <div className="flex flex-col gap-3 font-semibold text-[13.5px] text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Total Methods</span>
                  <span className="font-black text-gray-800">{totalCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cards</span>
                  <span className="font-black text-gray-800">{cardsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>UPI IDs</span>
                  <span className="font-black text-gray-800">{upiCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Wallets</span>
                  <span className="font-black text-gray-800">{walletsCount}</span>
                </div>
                
                {defaultMethod && (
                  <div className="border-t border-gray-50 pt-3.5 mt-1.5 flex flex-col gap-1 text-[12px] text-gray-400 font-semibold leading-relaxed">
                    <span className="text-gray-700 font-bold block text-[13px] uppercase tracking-wider mb-1">Default Method</span>
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <div>
                        <span className="font-bold text-gray-700 block text-[13px] leading-tight">
                          {defaultMethod.type === 'Card' ? defaultMethod.cardNo : defaultMethod.upiId}
                        </span>
                        <span className="text-[10px] text-gray-400 font-extrabold mt-1 block">
                          {defaultMethod.type === 'Card' ? `Expires ${defaultMethod.expiry}` : defaultMethod.brand}
                        </span>
                      </div>
                      <div className="w-12 h-8 border border-gray-200 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm shrink-0">
                        {renderBrandLogo(defaultMethod.brand)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Why Save Payment Methods */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-green" /> Why Save Payment Methods?
              </h3>
              
              <ul className="flex flex-col gap-3 text-[12.5px] text-gray-600 font-bold mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Faster checkout in just one click
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Secure & encrypted transactions
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Easy refunds to original method
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Manage all payments in one place
                </li>
              </ul>
              
              {/* Shield graphic */}
              <div className="mt-4 border border-gray-100/50 rounded-2xl bg-gray-50/50 p-4 flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary-green shadow-sm shrink-0">
                  <Key className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="text-[11.5px] font-black text-gray-800 block leading-tight">Tokenized Protection</span>
                  <span className="text-[9.5px] text-gray-400 font-extrabold block mt-0.5">Compliant with RBI Card Rules</span>
                </div>
              </div>
            </div>

            {/* Need Help? Card */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2">
                📞 Need Help?
              </h3>
              <p className="text-[12.5px] text-gray-500 font-semibold leading-relaxed">
                We're here to help you with all your payment queries.
              </p>
              <button 
                onClick={() => toast.success('Support channel opened in dashboard!')}
                className="w-full py-2.5 border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                Contact Support <ArrowRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ================= ADD PAYMENT METHOD MODAL ================= */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-border-color rounded-[32px] shadow-premium p-6 md:p-8 w-full max-w-[500px] z-10 text-left relative overflow-y-auto max-h-[90vh] font-sans"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-gray-50 border border-border-color hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <h3 className="text-[22px] font-black text-gray-800 tracking-tight leading-none mb-2.5">
                Add Payment Method
              </h3>
              <p className="text-[13px] text-gray-400 font-bold border-b border-gray-50 pb-4 mb-6">
                Save your credit/debit card or UPI handle for frictionless checkout.
              </p>

              {/* Selector for payment types */}
              <div className="flex items-center gap-3 mb-6">
                {[
                  { id: 'Card', label: 'Credit/Debit Card 💳' },
                  { id: 'UPI', label: 'UPI Handle 📱' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setMethodType(type.id)}
                    className={`px-4 py-2 border rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                      methodType === type.id 
                        ? 'bg-primary-green border-primary-green text-white shadow-sm' 
                        : 'bg-white border-border-color text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* Form implementation */}
              <form onSubmit={handleSavePaymentMethod} className="flex flex-col gap-4">
                
                {methodType === 'Card' ? (
                  <>
                    {/* Card fields */}
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Card Number</label>
                      <input 
                        type="text" 
                        name="cardNumber" 
                        value={formData.cardNumber} 
                        onChange={handleInputChange}
                        placeholder="4111 2222 3333 4444"
                        maxLength="19"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Cardholder Name</label>
                      <input 
                        type="text" 
                        name="cardholderName" 
                        value={formData.cardholderName} 
                        onChange={handleInputChange}
                        placeholder="e.g. Dhanush Kumar"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Expiration Date</label>
                        <input 
                          type="text" 
                          name="expiryDate" 
                          value={formData.expiryDate} 
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">CVV Code</label>
                        <input 
                          type="password" 
                          name="cvv" 
                          value={formData.cvv} 
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength="3"
                          className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* UPI fields */}
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">UPI Provider</label>
                      <select 
                        name="upiProvider" 
                        value={formData.upiProvider} 
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green bg-white cursor-pointer"
                      >
                        <option value="Google Pay">Google Pay</option>
                        <option value="PhonePe">PhonePe</option>
                        <option value="Paytm">Paytm</option>
                        <option value="BHIM UPI">BHIM UPI</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">UPI ID (VPA)</label>
                      <input 
                        type="text" 
                        name="upiId" 
                        value={formData.upiId} 
                        onChange={handleInputChange}
                        placeholder="dhanushkumar@okicici"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                  </>
                )}

                {/* Default checkbox */}
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="isDefaultPayment"
                    name="isDefault" 
                    checked={formData.isDefault} 
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-primary-green focus:ring-primary-green accent-primary-green cursor-pointer"
                  />
                  <label htmlFor="isDefaultPayment" className="text-[13px] text-gray-600 font-bold select-none cursor-pointer">
                    Set as default payment method
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors shadow-sm cursor-pointer"
                  >
                    Save Method
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
