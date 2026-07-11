import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingBag, Leaf, MapPin, CreditCard, CheckCircle2, ShieldCheck, Plus, Minus, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Checkout({ cartItems, updateQuantity, removeFromCart }) {
  const { user, placeOrder } = useAuth();
  const navigate = useNavigate();
  
  const [selectedAddress, setSelectedAddress] = useState('Hyderabad, TS');
  const [selectedPayment, setSelectedPayment] = useState('online'); // 'online' or 'cod'
  const [isPlacing, setIsPlacing] = useState(false);

  const addresses = [
    { id: 'addr1', title: 'Home Address (Default)', value: 'Hyderabad, TS', desc: 'Flat 405, Green Meadows, Gachibowli, Hyderabad, TS - 500032' },
    { id: 'addr2', title: 'Office Address', value: 'Bangalore, KA', desc: '3rd Floor, Tech Park, Whitefield, Bangalore, KA - 560066' }
  ];

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
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 font-sans">
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
                <h3 className="text-[18px] font-black text-gray-800 tracking-tight mb-4 flex items-center gap-2 select-none">
                  <span>2.</span> Shipping Address
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress === addr.value;
                    return (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.value)}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all select-none flex items-start gap-3 relative ${
                          isSelected ? 'border-primary-green bg-light-green/20' : 'border-border-color hover:bg-gray-50'
                        }`}
                      >
                        <MapPin className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary-green' : 'text-gray-400'}`} />
                        <div>
                          <span className="text-[13.5px] font-extrabold text-gray-850 block leading-tight">{addr.title}</span>
                          <span className="text-[12px] text-gray-400 font-semibold block mt-1 leading-normal">{addr.desc}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 text-primary-green">
                            <CheckCircle2 className="w-4 h-4 fill-primary-green text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      <div className={`p-2.5 rounded-xl ${selectedPayment === 'online' ? 'bg-emerald-50 text-primary-green' : 'bg-gray-150 text-gray-400'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-[14px] font-extrabold text-gray-800 block leading-tight">Pay Online (Card / UPI / NetBanking)</span>
                        <span className="text-[11px] text-gray-450 font-bold block mt-0.5">Pay securely with Razorpay / Stripe</span>
                      </div>
                    </div>
                    {selectedPayment === 'online' && (
                      <CheckCircle2 className="w-4 h-4 fill-primary-green text-white shrink-0" />
                    )}
                  </div>

                  {/* Cash On Delivery option */}
                  <div 
                    onClick={() => setSelectedPayment('cod')}
                    className={`border rounded-2xl p-4 cursor-pointer transition-all select-none flex items-center justify-between ${
                      selectedPayment === 'cod' ? 'border-primary-green bg-light-green/20' : 'border-border-color hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${selectedPayment === 'cod' ? 'bg-emerald-50 text-primary-green' : 'bg-gray-150 text-gray-400'}`}>
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="text-[14px] font-extrabold text-gray-800 block leading-tight">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-gray-450 font-bold block mt-0.5">Pay cash or scan QR upon delivery at doorstep</span>
                      </div>
                    </div>
                    {selectedPayment === 'cod' && (
                      <CheckCircle2 className="w-4 h-4 fill-primary-green text-white shrink-0" />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Checkout Summary */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Summary Card */}
              <div className="bg-white rounded-3xl border border-border-color p-6 shadow-card text-left select-none">
                <h3 className="text-[20px] font-black text-gray-800 tracking-tight mb-6">
                  Checkout Summary
                </h3>

                <div className="flex flex-col gap-4 text-[14px] font-semibold text-gray-600 pb-5 border-b border-gray-100">
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
    </div>
  );
}
