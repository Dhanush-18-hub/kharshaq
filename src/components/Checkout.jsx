import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Leaf, MapPin, CreditCard, CheckCircle2, ShieldCheck, Plus, Minus, Info, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Checkout({ cartItems, updateQuantity, removeFromCart, addresses, setAddresses }) {
  const { user, placeOrder } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPayment, setSelectedPayment] = useState('online'); // 'online' or 'cod'
  const [isPlacing, setIsPlacing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const actualAddresses = (addresses && addresses.length > 0) ? addresses : [];

  const [selectedAddress, setSelectedAddress] = useState(() => {
    const defaultAddr = actualAddresses.find(a => a.isDefault) || actualAddresses[0];
    return defaultAddr 
      ? `${defaultAddr.street}, ${defaultAddr.area}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pincode}`
      : '';
  });

  // Auto-select default/first address when loaded
  useEffect(() => {
    if (!selectedAddress && actualAddresses.length > 0) {
      const defaultAddr = actualAddresses.find(a => a.isDefault) || actualAddresses[0];
      if (defaultAddr) {
        setSelectedAddress(`${defaultAddr.street}, ${defaultAddr.area}, ${defaultAddr.city}, ${defaultAddr.state} - ${defaultAddr.pincode}`);
      }
    }
  }, [actualAddresses, selectedAddress]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    tag: 'Home',
    customTag: '',
    street: '',
    area: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    country: 'India',
    deliverNote: '',
    isDefault: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

    const newId = `a${Date.now()}`;
    const newAddress = { ...cleanAddress, id: newId };
    const addressStr = `${newAddress.street}, ${newAddress.area}, ${newAddress.city}, ${newAddress.state} - ${newAddress.pincode}`;

    const isFirst = actualAddresses.length === 0;
    const finalAddress = { ...newAddress, isDefault: isFirst || formData.isDefault };

    if (finalAddress.isDefault) {
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: false })).concat(finalAddress));
    } else {
      setAddresses(prev => [...prev, finalAddress]);
    }

    setSelectedAddress(addressStr);
    setIsModalOpen(false);
    toast.success('New address added successfully!');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Apply default 16.3% discount matching Cart behavior
  const discount = Math.round(subtotal * 0.1632);
  const isFreeDelivery = subtotal >= 499;
  const deliveryCharge = isFreeDelivery ? 0 : 40;
  const finalTotal = Math.max(0, subtotal - discount + deliveryCharge);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    if (!selectedAddress) {
      toast.error('Please select or add a shipping address.');
      return;
    }
    
    setIsPlacing(true);
    const orderId = `KSQ${Math.floor(10000 + Math.random() * 90000)}`;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newOrder = {
      id: orderId,
      date: `${dateStr} • ${timeStr}`,
      address: selectedAddress,
      paymentMethod: selectedPayment === 'cod' ? 'Cash on Delivery' : 'Paid Online',
      paymentStatus: selectedPayment === 'cod' ? 'Pending' : 'Paid',
      status: 'Processing',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        weight: item.weight,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      total: finalTotal,
      itemsCount: totalItemCount,
      deliveryPartner: 'Blinkit Express',
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    try {
      await placeOrder(newOrder);
      toast.success(`Order placed successfully! Reference #${orderId}`);
      navigate('/orders');
    } catch (err) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans relative">
      {/* Breadcrumb */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400 select-none">
          <span onClick={() => navigate('/')} className="hover:text-primary-green cursor-pointer transition-colors">Home</span>
          <span>&gt;</span>
          <span onClick={() => navigate('/cart')} className="hover:text-primary-green cursor-pointer transition-colors">Cart</span>
          <span>&gt;</span>
          <span className="text-gray-600 font-bold">Checkout</span>
        </div>
      </div>

      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4 text-left">
        <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight flex items-center gap-2 select-none">
          Secure Checkout <ShieldCheck className="w-8 h-8 text-primary-green" />
        </h1>
        <p className="text-gray-400 text-[15px] font-semibold mt-1">
          Verify your items and delivery details to complete your order
        </p>
      </section>

      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border-color p-12 text-center shadow-card select-none">
            <div className="w-20 h-20 bg-light-green text-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-[24px] font-black text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-400 text-[15px] font-semibold mt-2 max-w-[320px] mx-auto leading-relaxed">
              You must add items to your cart before checking out.
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 px-6 py-3.5 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-colors cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              Back to Store <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Review Items, Address, Payments */}
            <div className="lg:col-span-8 flex flex-col gap-6 text-left">
              
              {/* Review Items Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2 select-none">
                  <span>1.</span> Review Items
                </h3>
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-none">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 p-1 shrink-0 select-none">
                          <img src={item.image} alt={item.name} className="max-h-10 max-w-10 object-cover mix-blend-multiply rounded-full" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-black text-gray-800 leading-tight">{item.name}</h4>
                          <span className="text-[12px] text-gray-400 font-bold block mt-0.5">{item.weight} • ₹{item.price} each</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-gray-500 font-semibold">Qty: {item.quantity}</span>
                        <span className="text-[14px] font-black text-gray-800 w-16 text-right">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Selection */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-[18px] font-black text-gray-800 tracking-tight flex items-center gap-2 select-none">
                    <span>2.</span> Shipping Address
                  </h3>
                  <button 
                    onClick={() => {
                      setFormData({
                        name: user?.name || '',
                        phone: user?.phone?.replace('+91 ', '') || '',
                        tag: 'Home',
                        customTag: '',
                        street: '',
                        area: '',
                        city: 'Hyderabad',
                        state: 'Telangana',
                        pincode: '',
                        country: 'India',
                        deliverNote: '',
                        isDefault: actualAddresses.length === 0
                      });
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-primary-green hover:text-dark-green text-[13px] font-bold transition-colors cursor-pointer border border-primary-green/20 bg-primary-green/5 hover:bg-primary-green/10 px-3.5 py-1.5 rounded-xl"
                  >
                    <Plus className="w-4 h-4" /> Add Address
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {actualAddresses.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 border border-dashed border-border-color rounded-2xl p-8 text-center bg-gray-50/50 flex flex-col items-center select-none">
                      <MapPin className="w-10 h-10 text-gray-300 mb-3" />
                      <h4 className="text-[14px] font-black text-gray-700">No saved addresses found</h4>
                      <p className="text-[12px] text-gray-400 font-bold mt-1 leading-normal max-w-[280px]">
                        Please add a delivery address to complete your checkout.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-4 flex items-center gap-1.5 px-4 py-2.5 bg-primary-green hover:bg-dark-green text-white text-[13px] font-bold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Shipping Address
                      </button>
                    </div>
                  ) : (
                    actualAddresses.map((addr) => {
                      const addrStr = `${addr.street}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
                      const isSelected = selectedAddress === addrStr;
                      return (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddress(addrStr)}
                          className={`border rounded-2xl p-4 cursor-pointer transition-all select-none flex items-start gap-3 relative ${
                            isSelected ? 'border-primary-green bg-light-green/20' : 'border-border-color hover:bg-gray-50'
                          }`}
                        >
                          <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${isSelected ? 'text-primary-green' : 'text-gray-400'}`} />
                          <div>
                            <span className="text-[13.5px] font-extrabold text-gray-850 block leading-tight">
                              {addr.tag === 'Other' && addr.customTag ? addr.customTag : `${addr.tag} Address`}
                              {addr.isDefault && ' (Default)'}
                            </span>
                            <span className="text-[12px] text-gray-400 font-semibold block mt-1.5 leading-normal">
                              {addr.name} • {addr.phone}<br/>
                              {addrStr}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-3 right-3 text-primary-green">
                              <CheckCircle2 className="w-4 h-4 fill-primary-green text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2 select-none">
                  <span>3.</span> Payment Method
                </h3>
                <div className="flex flex-col gap-3">
                  {/* Paid Online Card option */}
                  <div 
                    onClick={() => setSelectedPayment('online')}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all select-none flex items-center justify-between ${
                      selectedPayment === 'online' ? 'border-primary-green bg-light-green/20' : 'border-border-color hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 ${selectedPayment === 'online' ? 'text-primary-green' : 'text-gray-405'}`} />
                      <div>
                        <span className="text-[13.5px] font-extrabold text-gray-850 block leading-tight">Pay Online (Card/UPI)</span>
                        <span className="text-[12px] text-gray-400 font-semibold block mt-0.5">Secure payment via PhonePe gateway</span>
                      </div>
                    </div>
                    {selectedPayment === 'online' && <CheckCircle2 className="w-4 h-4 fill-primary-green text-white" />}
                  </div>

                  {/* Cash on Delivery option */}
                  <div 
                    onClick={() => setSelectedPayment('cod')}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all select-none flex items-center justify-between ${
                      selectedPayment === 'cod' ? 'border-primary-green bg-light-green/20' : 'border-border-color hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Leaf className={`w-5 h-5 ${selectedPayment === 'cod' ? 'text-primary-green' : 'text-gray-405'}`} />
                      <div>
                        <span className="text-[13.5px] font-extrabold text-gray-850 block leading-tight">Cash on Delivery (COD)</span>
                        <span className="text-[12px] text-gray-400 font-semibold block mt-0.5">Pay in cash or UPI at the time of delivery</span>
                      </div>
                    </div>
                    {selectedPayment === 'cod' && <CheckCircle2 className="w-4 h-4 fill-primary-green text-white" />}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Order Summary & Place Order */}
            <div className="lg:col-span-4 flex flex-col gap-6 text-left">
              
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card">
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight border-b border-gray-50 pb-4 mb-4 select-none">
                  Order Summary
                </h3>
                
                {/* Details list */}
                <div className="flex flex-col gap-3.5 border-b border-gray-50 pb-4 select-none">
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Subtotal ({totalItemCount} Items)</span>
                    <span className="text-gray-800 font-black">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Discount (WELCOME20)</span>
                    <span className="text-red-500 font-black">-₹{discount}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold">Delivery Charges</span>
                    <span className="text-gray-800 font-black">₹{deliveryCharge > 0 ? deliveryCharge : '0'}</span>
                  </div>
                </div>

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

                {/* Place Order Button */}
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-primary-green hover:bg-dark-green text-white font-bold text-[15px] rounded-[16px] transition-colors shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {isPlacing ? 'Placing Order...' : 'Confirm & Place Order'}
                </button>

                <div className="flex items-start gap-2 text-[11px] text-gray-450 mt-4 leading-normal bg-gray-50 border border-gray-100 rounded-xl p-3">
                  <Info className="w-4 h-4 text-primary-green shrink-0 mt-0.5" />
                  <span>By placing order, you agree to our standard terms. Expected shipping takes 2 days via Blinkit Express.</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </section>

      {/* Add New Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <div className="bg-white border border-border-color rounded-[32px] shadow-premium p-6 md:p-8 w-full max-w-[500px] z-10 text-left relative overflow-y-auto max-h-[90vh] font-sans">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 p-2 bg-gray-50 border border-border-color hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <h3 className="text-[20px] font-black text-gray-800 tracking-tight leading-none mb-2">
              Add New Address
            </h3>
            <p className="text-[12px] text-gray-400 font-bold border-b border-gray-50 pb-4 mb-5">
              Specify delivery details to complete your checkout.
            </p>

            {/* Form */}
            <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
              {/* 1. Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dhanush Kumar"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Phone Number</label>
                  <div className="flex rounded-xl border border-border-color overflow-hidden focus-within:border-primary-green">
                    <span className="bg-gray-50 border-r border-border-color px-3 py-2 text-[13px] font-black text-gray-500 select-none">+91</span>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      maxLength="10"
                      className="w-full px-3 py-2 text-[13px] font-bold text-gray-700 focus:outline-none border-none"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Address Tag Selector */}
              <div>
                <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1.5">Address Tag</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'Home', label: 'Home 🏠' },
                    { id: 'Work', label: 'Work 💼' },
                    { id: 'Other', label: 'Other 🌟' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tag: t.id, customTag: t.id === 'Other' ? 'Parents\' Home' : '' }))}
                      className={`px-3.5 py-1.5 border rounded-xl text-[12px] font-bold transition-all cursor-pointer ${formData.tag === t.id
                          ? 'bg-primary-green border-primary-green text-white shadow-sm'
                          : 'bg-white border-border-color text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Custom Tag Input */}
              {formData.tag === 'Other' && (
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Custom Tag Name</label>
                  <input
                    type="text"
                    name="customTag"
                    value={formData.customTag}
                    onChange={handleInputChange}
                    placeholder="e.g. Friends' Place"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
              )}

              {/* 4. Street Address */}
              <div>
                <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g. Flat 302, Green Meadows"
                  className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                />
              </div>

              {/* 5. Area & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Madhapur"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="500081"
                    maxLength="6"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
              </div>

              {/* 6. City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Hyderabad"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 font-extrabold uppercase block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Telangana"
                    className="w-full px-3.5 py-2 border border-border-color rounded-xl text-[13px] font-bold text-gray-700 focus:outline-none focus:border-primary-green"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-primary-green hover:bg-dark-green text-white font-bold text-[14px] rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Save and Select Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
