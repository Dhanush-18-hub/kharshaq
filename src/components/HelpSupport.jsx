import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, ShoppingBag, MapPin, CreditCard, Star, 
  LogOut, HelpCircle, Check, ShieldCheck, ArrowRight, 
  User, Bell, Search, ChevronDown, MessageSquare, Phone, Mail, X, Send, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function HelpSupport() {
  const { user, logout, rewardPoints, notifications } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  
  // Simulated Order Tracking State
  const [orderIdInput, setOrderIdInput] = useState('');
  
  // Simulated Chat Box State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! I am Karshaq Assist. How can I help you today?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Categories list
  const categories = [
    {
      id: 'cat1',
      title: 'Orders & Delivery',
      description: 'Track orders, delivery times and related queries',
      icon: '🚚'
    },
    {
      id: 'cat2',
      title: 'Returns & Refunds',
      description: 'Return products, refund status and policies',
      icon: '📦'
    },
    {
      id: 'cat3',
      title: 'Payments & Offers',
      description: 'Payment methods, offers and cashback',
      icon: '💳'
    },
    {
      id: 'cat4',
      title: 'Account & Profile',
      description: 'Manage your account, password and profile',
      icon: '👤'
    },
    {
      id: 'cat5',
      title: 'Products & Quality',
      description: 'Product quality, freshness and other concerns',
      icon: '🍃'
    }
  ];

  // FAQ list
  const faqs = [
    {
      question: 'How can I track my order?',
      answer: "You can track your order by clicking on 'My Orders' in the sidebar or entering your order ID in the 'Order Support' search box on the right. We also send live updates via WhatsApp and Email."
    },
    {
      question: 'What is your return and refund policy?',
      answer: "We have a no-questions-asked 24-hour return policy for fresh fruits and vegetables. For other items, you can return within 7 days of delivery. Refunds are credited to the original payment method within 3-5 business days."
    },
    {
      question: 'How long does delivery take?',
      answer: "We deliver between 7:00 AM and 10:00 PM. Same-day delivery is available for orders placed before 4:00 PM. Express delivery takes under 2 hours for eligible locations."
    },
    {
      question: 'What payment methods do you accept?',
      answer: "We accept Visa, Mastercard, RuPay cards, UPI (via GPay, PhonePe, Paytm), and major Net Banking providers."
    },
    {
      question: 'How can I use my reward points?',
      answer: "You can redeem points on the 'My Rewards' page to unlock discount coupons (e.g. ₹100 Off) or Free Delivery vouchers. These can be applied in your shopping cart before checkout."
    },
    {
      question: 'How do I cancel or modify my order?',
      answer: "Orders can be cancelled or modified directly from the 'My Orders' screen within 15 minutes of placing them. After that, please contact our support team immediately."
    }
  ];

  // Popular searches handler
  const handlePopularSearch = (term) => {
    setSearchQuery(term);
    toast.success(`Search populated for: ${term}`);
  };

  // Expand / collapse faq toggle
  const toggleFaq = (index) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  // Simulate Order Tracking
  const handleOrderTrack = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      return toast.error('Please enter a valid Order ID');
    }

    const cleanId = orderIdInput.trim().toUpperCase();
    
    // Simulating checking database
    toast.loading('Checking order status...', { id: 'orderStatus' });
    setTimeout(() => {
      if (cleanId.match(/^KSQ\d+$/) || cleanId.startsWith('#KSQ')) {
        toast.success(`Order ${cleanId} is OUT FOR DELIVERY! Expected delivery in 35 mins.`, { id: 'orderStatus', duration: 5000 });
      } else {
        // Fallback successful simulation for any entered text
        toast.success(`Order #${cleanId} has been Packed & Ready. Delivery scheduled for today.`, { id: 'orderStatus', duration: 5000 });
      }
    }, 1200);
  };

  // Send message in simulated chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput.trim(), time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate bot reply
    setTimeout(() => {
      let botText = "Thank you for reaching out! Our support agent will connect with you shortly.";
      const query = userMsg.text.toLowerCase();
      if (query.includes('track') || query.includes('order')) {
        botText = "To track your order, please navigate to the 'My Orders' tab or provide your Order ID in this chat window.";
      } else if (query.includes('refund') || query.includes('return')) {
        botText = "Fresh items can be returned within 24 hours of delivery. Let me transfer you to a support executive for quick processing.";
      } else if (query.includes('hi') || query.includes('hello')) {
        botText = "Hello Dhanush! How may I help you with your order today?";
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botText, time: 'Just now' }]);
    }, 1000);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">Help & Support</span>
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
                  <Star className="w-4.5 h-4.5 text-gray-400" />
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-light-green text-primary-green text-[14.5px] font-extrabold cursor-pointer transition-colors"
              >
                <HelpCircle className="w-4.5 h-4.5 fill-primary-green text-primary-green" />
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

            {/* Karshaq Plus Help Promo Card */}
            <div className="bg-gradient-to-br from-[#EAF2E4] to-[#DBEAD1] border border-border-color rounded-3xl p-6 shadow-premium text-left relative overflow-hidden">
              <span className="text-[17px] block font-black text-gray-800 leading-tight">Karshaq Plus 👑</span>
              <p className="text-[12px] text-gray-500 font-bold mt-2 leading-relaxed">
                Unlock exclusive benefits and faster deliveries!
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
                <div className="w-14 select-none shrink-0">
                  <img src="/category_others.png" alt="headphones illustration" className="w-full mix-blend-multiply drop-shadow" />
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
                    Help & Support
                  </h1>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-3.5 py-1.5 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    ← Continue Shopping
                  </button>
                </div>
                <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                  We're here to help you with any questions or concerns.
                </p>
              </div>
            </div>

            {/* 1. Large Search Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="How can we help you today?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border-color rounded-2xl text-[14px] font-bold text-gray-700 bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                  />
                  <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <button 
                  onClick={() => toast.success(`Searching for: ${searchQuery}`)}
                  className="px-6 py-3 bg-primary-green hover:bg-dark-green text-white font-extrabold text-[14px] rounded-2xl transition-all cursor-pointer shadow-sm"
                >
                  Search
                </button>
              </div>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[12px] font-bold text-gray-400 select-none">
                <span>Popular searches:</span>
                {[
                  { id: 'track', label: 'Order tracking' },
                  { id: 'del', label: 'Delivery' },
                  { id: 'ret', label: 'Returns' },
                  { id: 'ref', label: 'Refunds' },
                  { id: 'pay', label: 'Payment' }
                ].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handlePopularSearch(tag.label)}
                    className="text-primary-green hover:underline font-extrabold cursor-pointer"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Help Categories Section */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[18px] font-black text-gray-800 tracking-tight">How can we help you?</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 select-none">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white border border-border-color rounded-3xl p-4.5 flex flex-col justify-between items-center text-center shadow-card hover:shadow-premium hover:border-primary-green transition-all duration-300"
                  >
                    <span className="text-[32px] block mb-2">{cat.icon}</span>
                    <div>
                      <h4 className="text-[13.5px] font-black text-gray-800 leading-tight block">{cat.title}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-snug max-w-[100px] mx-auto truncate-2-lines">
                        {cat.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handlePopularSearch(cat.title)}
                      className="mt-4 px-3 py-1.5 border border-border-color hover:border-primary-green hover:bg-[#F4FAF2] text-gray-500 hover:text-primary-green font-extrabold text-[10.5px] rounded-lg transition-colors cursor-pointer block w-full text-center"
                    >
                      View Articles →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. FAQ Section */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight">Frequently Asked Questions</h3>
                <button 
                  onClick={() => handlePopularSearch('')}
                  className="text-[12.5px] font-black text-primary-green hover:underline cursor-pointer select-none inline-flex items-center gap-1"
                >
                  View All FAQs <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Accordions Stack */}
              <div className="flex flex-col bg-white border border-border-color rounded-3xl overflow-hidden divide-y divide-gray-100 shadow-card">
                {filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="flex flex-col text-left">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-4.5 flex items-center justify-between gap-4 hover:bg-gray-50/50 cursor-pointer transition-colors text-left"
                    >
                      <span className="text-[14px] font-black text-gray-800">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${
                        expandedFaqIndex === idx ? 'rotate-180 text-primary-green' : ''
                      }`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {expandedFaqIndex === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden bg-[#FAFAF9]/50"
                        >
                          <p className="px-6 pb-5 pt-1 text-[13px] text-gray-500 font-semibold leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {filteredFaqs.length === 0 && (
                  <div className="p-8 text-center text-gray-400 font-bold">
                    No FAQs matching your search query. Try other keywords!
                  </div>
                )}
              </div>
            </div>

            {/* 4. Bottom Support Agent Banner */}
            <div className="bg-[#EAF2E4]/80 border border-emerald-100/50 rounded-[32px] p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center overflow-hidden relative shadow-sm">
              
              {/* Center left info (6 cols) */}
              <div className="md:col-span-7 flex flex-col gap-2 z-10">
                <h4 className="text-[17px] font-black text-gray-800 leading-tight">Still need help?</h4>
                <p className="text-[12.5px] text-gray-500 font-semibold leading-relaxed max-w-[320px]">
                  Our support team is ready to assist you from 7 AM to 10 PM, every day.
                </p>
                <span className="text-[13px] font-extrabold text-primary-green mt-2 block select-none">
                  📞 +91 98765 43210
                </span>
              </div>

              {/* Center right actions (5 cols) */}
              <div className="md:col-span-5 flex flex-col sm:flex-row items-center gap-3.5 z-10 md:justify-end">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-5 py-2.5 bg-primary-green hover:bg-dark-green text-white font-extrabold text-[13px] rounded-xl transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  Chat with Us
                </button>
                <button
                  onClick={() => toast.success('Calling customer care support hotline...')}
                  className="px-5 py-2.5 border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-extrabold text-[13px] rounded-xl transition-colors cursor-pointer w-full sm:w-auto bg-white"
                >
                  Call Us
                </button>
              </div>

              {/* Graphic illustration absolute */}
              <div className="absolute right-6 bottom-[-20px] opacity-10 pointer-events-none w-36">
                <img src="/category_others.png" alt="illustration support" className="w-full mix-blend-multiply" />
              </div>
            </div>

          </div>

          {/* ================= COLUMN 3: RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">
            
            {/* Support Summary */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                <Award className="w-4.5 h-4.5 text-primary-green fill-primary-green" /> Support Summary
              </h3>
              
              <div className="flex flex-col gap-4 font-semibold text-[13px] text-gray-500 mt-1">
                <div className="flex items-center gap-3">
                  <span className="text-[16px]">⏱️</span>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10.5px] uppercase tracking-wider">Average Response Time</span>
                    <span className="font-black text-gray-800 text-[14px]">2 min</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[16px]">✔️</span>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10.5px] uppercase tracking-wider">Resolution Rate</span>
                    <span className="font-black text-gray-800 text-[14px]">98%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[16px]">😊</span>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10.5px] uppercase tracking-wider">Happy Customers</span>
                    <span className="font-black text-gray-800 text-[14px]">10,000+</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[16px]">📅</span>
                  <div>
                    <span className="text-gray-400 font-bold block text-[10.5px] uppercase tracking-wider">Support Hours</span>
                    <span className="font-black text-gray-800 text-[13.5px]">7 AM - 10 PM (All Days)</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#0D3C0F] text-white font-bold text-[14px] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                Contact Support
              </button>
            </div>

            {/* Order Support tracker */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                🚚 Order Support
              </h3>
              
              <p className="text-[12.5px] text-gray-400 font-semibold leading-relaxed">
                Need help with a specific order?
              </p>

              <form onSubmit={handleOrderTrack} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g. #KSQ12345)"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                />
                
                <button
                  type="submit"
                  className="w-full py-2.5 border border-primary-green hover:bg-[#F4FAF2] text-primary-green font-extrabold text-[13px] rounded-xl transition-colors cursor-pointer text-center bg-white shadow-sm"
                >
                  Track & Get Help
                </button>
              </form>
            </div>

            {/* Other Ways to Reach Us */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                Other Ways to Reach Us
              </h3>
              
              <div className="flex flex-col gap-1 text-[13.5px]">
                
                <a 
                  href="https://wa.me/9876543210" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 text-[14px]">💬</span>
                    <div>
                      <span className="text-gray-800 font-black block leading-none">WhatsApp Support</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">+91 98765 43210</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-green" />
                </a>

                <a 
                  href="mailto:support@karshaq.com"
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 text-[14px]">✉️</span>
                    <div>
                      <span className="text-gray-800 font-black block leading-none">Email Support</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">support@karshaq.com</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-green" />
                </a>

                <a 
                  href="tel:+919876543210"
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="w-8 h-8 rounded-full bg-orange-50 text-[#EF6C00] flex items-center justify-center shrink-0 text-[14px]">📞</span>
                    <div>
                      <span className="text-gray-800 font-black block leading-none">Call Support</span>
                      <span className="text-[10px] text-gray-400 font-bold block mt-1">+91 98765 43210</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-green" />
                </a>

              </div>
            </div>

            {/* Safety & Trust */}
            <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5 relative overflow-hidden">
              <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-green" /> Safety & Trust
              </h3>
              
              <ul className="flex flex-col gap-2.5 text-[12.5px] text-gray-600 font-bold mt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> 100% Secure
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Privacy Protected
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary-green shrink-0" /> Trusted by 10,000+ Customers
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>

      {/* ================= FLOATING MOCK CHAT OVERLAY WINDOW ================= */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed bottom-6 right-6 z-[999] w-[350px] sm:w-[380px] bg-white border border-border-color rounded-[24px] shadow-2xl flex flex-col overflow-hidden font-sans">
            
            {/* Chat Header */}
            <div className="bg-[#1B4332] p-4 flex items-center justify-between text-white select-none">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[18px]">
                  💁‍♀️
                </div>
                <div>
                  <h4 className="text-[14px] font-black leading-tight">Karshaq Assist</h4>
                  <span className="text-[10px] text-emerald-300 font-extrabold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Active support
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white/80 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-4 overflow-y-auto max-h-[300px] min-h-[250px] bg-gray-50 flex flex-col gap-3">
              {chatMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <div className={`p-3 rounded-2xl text-[13px] text-left leading-normal ${
                    msg.sender === 'user' 
                      ? 'bg-primary-green text-white rounded-br-none' 
                      : 'bg-white border border-gray-150 text-gray-700 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold mt-1 px-1">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-border-color flex gap-2 bg-white">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
              />
              <button
                type="submit"
                className="p-2.5 bg-primary-green hover:bg-dark-green text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
