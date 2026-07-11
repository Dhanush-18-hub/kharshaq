import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Trash2, Bell, Plus, Edit2,
  ArrowRight, User, ShoppingBag, MapPin, CreditCard, Star,
  LogOut, HelpCircle, Check, Briefcase, ShieldCheck, Search, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function MyAddresses({ addresses, setAddresses }) {
  const { user, logout, rewardPoints, notifications } = useAuth();
  const navigate = useNavigate();
  const unreadCount = notifications ? notifications.filter(n => !n.isRead).length : 0;

  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Home', 'Work', 'Others'
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    tag: 'Home',
    customTag: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    deliverNote: '',
    isDefault: false
  });

  const [isChangeDefaultOpen, setIsChangeDefaultOpen] = useState(false);

  // Filter tab counts
  const homeCount = addresses.filter(a => a.tag === 'Home').length;
  const workCount = addresses.filter(a => a.tag === 'Work').length;
  const othersCount = addresses.filter(a => a.tag === 'Other').length;
  const totalCount = addresses.length;

  // Filter addresses by search query and tab
  const filteredAddresses = addresses.filter(addr => {
    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Home' && addr.tag === 'Home') ||
      (activeTab === 'Work' && addr.tag === 'Work') ||
      (activeTab === 'Others' && addr.tag === 'Other');

    const combinedString = `${addr.name} ${addr.street || addr.addressLine || ''} ${addr.area || ''} ${addr.city} ${addr.state} ${addr.pincode} ${addr.customTag || ''}`.toLowerCase();
    const matchesSearch = combinedString.includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Get active default address
  const defaultAddress = addresses.find(a => a.isDefault);

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open Add Address Modal
  const openAddModal = () => {
    setFormData({
      id: '',
      name: user?.name || 'Dhanush Kumar',
      tag: 'Home',
      customTag: '',
      street: '',
      area: '',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '',
      country: 'India',
      phone: user?.phone || '9876543210',
      deliverNote: '',
      isDefault: addresses.length === 0 // If it's the first address, make it default
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open Edit Address Modal
  const openEditModal = (addr) => {
    setFormData({
      ...addr,
      // Strips country prefix for simple edit if needed, or keep it
      phone: addr.phone.replace('+91 ', '')
    });
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Handle Save Address
  const handleSaveAddress = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) return toast.error('Full Name is required');
    if (!formData.phone.trim()) return toast.error('Phone number is required');
    if (!formData.street.trim()) return toast.error('Street address is required');
    if (!formData.area.trim()) return toast.error('Area/Locality is required');
    if (!formData.city.trim()) return toast.error('City is required');
    if (!formData.state.trim()) return toast.error('State is required');
    if (!formData.pincode.trim() || formData.pincode.length !== 6) return toast.error('Please enter a valid 6-digit Pincode');

    const cleanPhone = formData.phone.startsWith('+91') ? formData.phone : `+91 ${formData.phone.trim()}`;
    const cleanAddress = {
      ...formData,
      phone: cleanPhone
    };

    if (modalMode === 'add') {
      const newId = `a${Date.now()}`;
      const newAddress = { ...cleanAddress, id: newId };

      if (formData.isDefault) {
        // Remove default status from all others
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(newAddress));
      } else {
        setAddresses(prev => [...prev, newAddress]);
      }
      toast.success('New address added successfully!');
    } else {
      // Edit Mode
      setAddresses(prev => {
        return prev.map(a => {
          if (a.id === formData.id) {
            return cleanAddress;
          }
          if (formData.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
      });
      toast.success('Address updated successfully!');
    }

    setIsModalOpen(false);
  };

  // Handle Delete Address
  const handleDeleteAddress = (id) => {
    const confirm = window.confirm('Are you sure you want to delete this address?');
    if (!confirm) return;

    const addressToDelete = addresses.find(a => a.id === id);
    setAddresses(prev => {
      const remaining = prev.filter(a => a.id !== id);
      // If we deleted the default address, set the first remaining one as default
      if (addressToDelete?.isDefault && remaining.length > 0) {
        remaining[0].isDefault = true;
      }
      return remaining;
    });
    toast.success('Address deleted successfully!');
  };

  // Change Default Address
  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({
      ...a,
      isDefault: a.id === id
    })));
    toast.success('Default address updated!');
    setIsChangeDefaultOpen(false);
  };

  // Get Tag Icon Helper
  const getTagIcon = (tag) => {
    if (tag === 'Home') return <MapPin className="w-5 h-5 text-[#2E7D32]" />;
    if (tag === 'Work') return <Briefcase className="w-5 h-5 text-[#EF6C00]" />;
    return <Star className="w-5 h-5 text-[#3F51B5]" />;
  };

  // Get Tag Background color classes
  const getTagStyle = (tag) => {
    if (tag === 'Home') return 'bg-[#E8F5E9] border-emerald-100 text-[#2E7D32]';
    if (tag === 'Work') return 'bg-[#FFF3E0] border-orange-100 text-[#EF6C00]';
    return 'bg-[#E8EAF6] border-indigo-100 text-[#3F51B5]';
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Breadcrumbs */}
        <div className="text-[13px] font-bold text-gray-400 mb-6 flex items-center gap-1.5 select-none text-left">
          <span className="cursor-pointer hover:text-primary-green transition-colors" onClick={() => navigate('/')}>Home</span>
          <span>&gt;</span>
          <span className="text-gray-700">My Addresses</span>
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
                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl bg-light-green text-primary-green text-[14.5px] font-extrabold cursor-pointer transition-colors"
              >
                <MapPin className="w-4.5 h-4.5 fill-primary-green text-primary-green" />
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
            {/* ================= COLUMN 2: MIDDLE MAIN CONTENT ================= */}
            <div className="lg:col-span-6 flex flex-col gap-6 text-left">
              {/* Header Title & Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight leading-none">
                      My Addresses
                    </h1>
                    <button 
                      onClick={() => navigate('/')}
                      className="px-3.5 py-1.5 border border-primary-green hover:bg-light-green text-primary-green font-bold text-[12px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      ← Continue Shopping
                    </button>
                  </div>
                  <p className="text-gray-400 text-[14px] font-semibold mt-2.5">
                    Manage your saved delivery addresses
                  </p>
                </div>

                {/* Search input & Add New Address button */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search addresses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green w-[200px]"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  
                  <button
                    onClick={openAddModal}
                    className="px-4.5 py-2 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-all cursor-pointer inline-flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
              </div>

              {/* Filter Category Tabs */}
              <div className="flex flex-wrap gap-2 pb-2 select-none border-b border-gray-150/40">
                {[
                  { id: 'All', label: `All Addresses (${totalCount})` },
                  { id: 'Home', label: `Home (${homeCount})` },
                  { id: 'Work', label: `Work (${workCount})` },
                  { id: 'Others', label: `Others (${othersCount})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-[13px] font-bold transition-all cursor-pointer relative ${activeTab === tab.id
                        ? 'text-primary-green font-extrabold'
                        : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.span
                        layoutId="activeAddressTabLine"
                        className="absolute bottom-[-10px] left-0 right-0 h-[2.5px] bg-primary-green rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Address List stack */}
              {filteredAddresses.length === 0 ? (
                <div className="bg-white border border-border-color rounded-[32px] p-12 text-center shadow-premium flex flex-col items-center py-16">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-primary-green mb-4">
                    <MapPin className="w-8 h-8" />
                  </div>
                  <h3 className="text-[18px] font-black text-gray-800">No addresses found</h3>
                  <p className="text-[13px] text-gray-400 font-bold mt-1.5 max-w-[320px]">
                    {searchQuery.trim() !== ''
                      ? "We couldn't find any addresses matching your search terms."
                      : `You haven't added any addresses under the "${activeTab}" tab yet.`}
                  </p>
                  <button
                    onClick={openAddModal}
                    className="mt-6 px-5 py-2.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[13px] rounded-xl transition-colors cursor-pointer"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredAddresses.map((addr) => (
                    <motion.div
                      layout
                      key={addr.id}
                      className={`bg-white rounded-3xl border p-6 flex flex-col sm:flex-row justify-between items-start gap-4 transition-all duration-300 relative shadow-card hover:shadow-premium ${addr.isDefault ? 'border-primary-green' : 'border-border-color'
                        }`}
                    >
                      {/* Left details grid */}
                      <div className="flex-1 flex gap-4 text-left">
                        {/* Tag Icon block */}
                        <div className="flex flex-col items-center select-none">
                          <div className={`w-10 h-10 border rounded-xl flex items-center justify-center shrink-0 ${getTagStyle(addr.tag)}`}>
                            {getTagIcon(addr.tag)}
                          </div>
                          {addr.isDefault && (
                            <span className="text-[8.5px] font-extrabold text-[#2E7D32] bg-[#E8F5E9] border border-emerald-100 rounded-md px-1.5 py-0.5 uppercase tracking-wide mt-2 block whitespace-nowrap leading-none text-center">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Main address detail strings */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[15.5px] font-black text-gray-800 leading-tight">
                              {addr.customTag || addr.tag}
                            </h4>
                            {addr.isDefault && (
                              <span className="text-[10px] text-gray-400 font-extrabold select-none">
                                (Default Address)
                              </span>
                            )}
                          </div>

                          <span className="text-[14px] font-bold text-gray-800 block mt-2.5">
                            {addr.name}
                          </span>

                          <p className="text-[13px] text-gray-500 font-semibold leading-relaxed mt-1.5 max-w-[420px]">
                            {addr.street || addr.addressLine || ''}{addr.area ? `, ${addr.area}` : ''}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}
                          </p>

                          {/* Details grid row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 pt-3.5 border-t border-gray-50">
                            <div className="flex items-center gap-2 text-[12.5px] text-gray-500 font-semibold">
                              <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">📞</span>
                              <span className="text-gray-700 font-bold">{addr.phone}</span>
                            </div>
                            {addr.deliverNote && (
                              <div className="flex items-center gap-2 text-[12.5px] text-gray-500 font-semibold">
                                <span className="w-5 h-5 rounded bg-gray-50 flex items-center justify-center shrink-0 text-gray-400 select-none">📍</span>
                                <span className="truncate" title={addr.deliverNote}>{addr.deliverNote}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Edit/Delete actions */}
                      <div className="flex sm:flex-col items-stretch gap-2.5 shrink-0 self-stretch sm:justify-start justify-end w-full sm:w-auto">
                        <button
                          onClick={() => openEditModal(addr)}
                          className="px-4.5 py-2 border border-border-color hover:border-primary-green hover:bg-[#F4FAF2] text-gray-700 hover:text-primary-green font-bold text-[12.5px] rounded-xl cursor-pointer transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="px-4.5 py-2 border border-red-100 hover:border-red-300 bg-white hover:bg-red-50 text-red-500 font-bold text-[12.5px] rounded-xl cursor-pointer transition-all inline-flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>

                    </motion.div>
                  ))}
                </div>
              )}

              {/* Bottom Add Address Promo Banner */}
              <div className="bg-[#F3FAF5] border border-emerald-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative min-h-[120px] shadow-sm select-none">
                <div className="text-left z-10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary-green shrink-0">
                    <MapPin className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-gray-800 leading-tight">Add multiple addresses and enjoy faster checkout!</h4>
                    <p className="text-[12px] text-gray-500 font-bold mt-1 max-w-[360px]">
                      Save addresses for home, work or your loved ones.
                    </p>
                  </div>
                </div>
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 bg-white border border-border-color hover:bg-gray-50 text-gray-700 font-bold text-[13px] rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5 z-10 shadow-sm shrink-0"
                >
                  Add New Address <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
                <div className="absolute right-0 bottom-[-15px] opacity-15 pointer-events-none w-36">
                  <img src="/category_vegetables.png" alt="Illustration" className="w-full mix-blend-multiply" />
                </div>
              </div>
            </div>

            {/* ================= COLUMN 3: RIGHT SUMMARY SIDEBAR ================= */}
            <div className="lg:col-span-3 flex flex-col gap-6 text-left select-none">

              {/* Address Summary Card */}
              <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-4">
                <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-1.5 border-b border-gray-50 pb-3">
                  <MapPin className="w-4.5 h-4.5 text-primary-green fill-primary-green" /> Address Summary
                </h3>

                <div className="flex flex-col gap-3 font-semibold text-[13.5px] text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>Total Addresses</span>
                    <span className="font-black text-gray-800">{totalCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Home</span>
                    <span className="font-black text-gray-800">{homeCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Work</span>
                    <span className="font-black text-gray-800">{workCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Others</span>
                    <span className="font-black text-gray-800">{othersCount}</span>
                  </div>

                  {defaultAddress && (
                    <div className="border-t border-gray-50 pt-3.5 mt-1.5 flex flex-col gap-1 text-[12px] text-gray-400 font-semibold leading-relaxed">
                      <span className="text-gray-700 font-bold block text-[13px] uppercase tracking-wider select-none mb-1">Default Address</span>
                      <span className="font-bold text-gray-700 block text-[13.5px] leading-tight flex items-center gap-1.5">
                        🏠 {defaultAddress.customTag || defaultAddress.tag}
                      </span>
                      <p className="text-gray-500 font-semibold mt-1">
                        {((defaultAddress.street || defaultAddress.addressLine || '').split(',').pop() || '').trim()}, {defaultAddress.area || defaultAddress.city}
                        <br />{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsChangeDefaultOpen(!isChangeDefaultOpen)}
                  className="w-full py-3 bg-[#1B5E20] hover:bg-[#0D3C0F] text-white font-bold text-[14px] rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  Change Default
                </button>

                {/* Change Default dropdown stack */}
                {isChangeDefaultOpen && (
                  <div className="border border-border-color rounded-2xl p-3 bg-gray-50 mt-1 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider px-1">Select Default:</span>
                    {addresses.map(a => (
                      <button
                        key={a.id}
                        onClick={() => handleSetDefault(a.id)}
                        className={`w-full text-left p-2 rounded-xl text-[12.5px] font-bold flex items-center justify-between transition-colors cursor-pointer ${a.isDefault ? 'bg-primary-green text-white' : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-150'
                          }`}
                      >
                        <span className="truncate">{a.customTag || a.tag}: {a.street.substring(0, 18)}...</span>
                        {a.isDefault && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Address Security Highlights Card */}
              <div className="bg-white border border-border-color rounded-3xl p-6 shadow-premium flex flex-col gap-3.5 relative overflow-hidden">
                <h3 className="text-[16px] font-black text-gray-800 leading-none flex items-center gap-2 z-10">
                  <ShieldCheck className="w-5 h-5 text-primary-green" /> Your Addresses are Safe
                </h3>
                <p className="text-[12px] text-gray-400 font-semibold leading-relaxed z-10 mt-1 select-none">
                  We keep your address details secure and confidential.
                </p>

                <ul className="flex flex-col gap-2.5 text-[12.5px] text-gray-600 font-bold z-10 mt-1">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-green shrink-0" /> Encrypted & Secure
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-green shrink-0" /> Used only for deliveries
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary-green shrink-0" /> Trusted by 10,000+ customers
                  </li>
                </ul>

                {/* Graphic representation */}
                <div className="mt-4 border border-gray-100/50 rounded-2xl bg-gray-50/50 p-4 flex items-center justify-center gap-4 relative select-none">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary-green shadow-sm shrink-0">
                    <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11.5px] font-black text-gray-800 block leading-tight">SSL Security Active</span>
                    <span className="text-[9.5px] text-gray-400 font-extrabold block mt-0.5">End-to-End Database Encryption</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ================= ADD / EDIT ADDRESS DIALOG MODAL ================= */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              {/* Dark Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 15 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 15 }}
                className="bg-white border border-border-color rounded-[32px] shadow-premium p-6 md:p-8 w-full max-w-[550px] z-10 text-left relative overflow-y-auto max-h-[90vh] font-sans"
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
                  {modalMode === 'add' ? 'Add New Address' : 'Edit Saved Address'}
                </h3>
                <p className="text-[13px] text-gray-400 font-bold border-b border-gray-50 pb-4 mb-6">
                  Specify delivery location details for a frictionless checkout experience.
                </p>

                {/* Form starts */}
                <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">

                  {/* 1. Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Dhanush Kumar"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Phone Number</label>
                      <div className="flex rounded-xl border border-border-color overflow-hidden focus-within:border-primary-green focus-within:ring-1 focus-within:ring-primary-green">
                        <span className="bg-gray-50 border-r border-border-color px-3.5 py-2.5 text-[13.5px] font-black text-gray-500 select-none">+91</span>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="9876543210"
                          maxLength="10"
                          className="w-full px-3.5 py-2.5 text-[13.5px] font-bold text-gray-700 focus:outline-none border-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Tag selector buttons */}
                  <div>
                    <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-2">Address Tag</label>
                    <div className="flex items-center gap-3">
                      {[
                        { id: 'Home', label: 'Home 🏠' },
                        { id: 'Work', label: 'Work 💼' },
                        { id: 'Other', label: 'Other 🌟' }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tag: t.id, customTag: t.id === 'Other' ? 'Parents\' Home' : '' }))}
                          className={`px-4 py-2 border rounded-xl text-[13px] font-bold transition-all cursor-pointer ${formData.tag === t.id
                              ? 'bg-primary-green border-primary-green text-white shadow-sm'
                              : 'bg-white border-border-color text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Custom Tag Input (Shown only when tag is 'Other') */}
                  {formData.tag === 'Other' && (
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Custom Tag Name</label>
                      <input
                        type="text"
                        name="customTag"
                        value={formData.customTag}
                        onChange={handleInputChange}
                        placeholder="e.g. Friends' Place, Parents' Home"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                  )}

                  {/* 4. Street / Building address */}
                  <div>
                    <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Street Address / Building / Flat No.</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="H.No. 12-3-456/7, Flat 302, Green Meadows"
                      className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                    />
                  </div>

                  {/* 5. Area & Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Area / Locality / Sector</label>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        placeholder="Madhapur"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="500081"
                        maxLength="6"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  {/* 6. City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Hyderabad"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Telangana"
                        className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  {/* 7. Delivery note / Instruction */}
                  <div>
                    <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Delivery Instruction / Instruction Note</label>
                    <input
                      type="text"
                      name="deliverNote"
                      value={formData.deliverNote}
                      onChange={handleInputChange}
                      placeholder="e.g. Ring bell, Leave at security gate"
                      className="w-full px-3.5 py-2.5 border border-border-color rounded-xl text-[13.5px] font-bold text-gray-700 focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
                    />
                  </div>

                  {/* 8. Default checkbox */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded text-primary-green focus:ring-primary-green accent-primary-green cursor-pointer"
                    />
                    <label htmlFor="isDefault" className="text-[13px] text-gray-600 font-bold select-none cursor-pointer">
                      Set as default delivery address
                    </label>
                  </div>

                  {/* Submit Actions */}
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
                      Save Address
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
