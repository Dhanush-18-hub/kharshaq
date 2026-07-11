import React from 'react';
import { motion } from 'framer-motion';
import { 
  Percent, 
  Truck, 
  Wallet, 
  Gift, 
  ArrowRight,
  Leaf
} from 'lucide-react';

export default function Offers({ setActiveTab }) {
  const coupons = [
    {
      title: 'First Order Offer',
      desc: 'Get 20% OFF on your first order',
      code: 'WELCOME20',
      icon: Percent,
      iconBg: 'bg-emerald-50 text-emerald-600',
      isCoupon: true
    },
    {
      title: 'Free Delivery',
      desc: 'On all orders above ₹499',
      icon: Truck,
      iconBg: 'bg-blue-50 text-blue-600',
      isCoupon: false
    },
    {
      title: 'Combo Offers',
      desc: 'Buy more, save more!',
      icon: Percent,
      iconBg: 'bg-amber-50 text-amber-600',
      isCoupon: false
    },
    {
      title: 'Bank Offers',
      desc: 'Extra discounts on all prepaid orders',
      icon: Wallet,
      iconBg: 'bg-indigo-50 text-indigo-600',
      isCoupon: false
    },
    {
      title: 'Weekend Special',
      desc: 'Exclusive deals every weekend',
      icon: Gift,
      iconBg: 'bg-rose-50 text-rose-600',
      isCoupon: false
    }
  ];

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 overflow-hidden">
      
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400 select-none">
          <span onClick={() => setActiveTab('Home')} className="hover:text-primary-green cursor-pointer transition-colors">Home</span>
          <span>&gt;</span>
          <span className="text-gray-600">Offers</span>
        </div>
      </div>

      {/* Title & Subtitle */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4 text-left">
        <h1 className="text-[28px] lg:text-[34px] font-black text-gray-800 tracking-tight flex items-center gap-1.5">
          Exciting Offers Just for You <Leaf className="w-6 h-6 text-primary-green" />
        </h1>
        <p className="text-gray-400 text-[15px] font-semibold mt-1">
          Grab the best deals on farm fresh produce and more
        </p>
      </section>

      {/* Main Promo Grid Layout */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Large Banner (Mango Bonanza - 65% width equivalent) */}
          <div className="lg:col-span-8 bg-gradient-to-r from-[#FFFDEB] to-[#FFF9D6] border border-amber-200/50 rounded-[32px] p-8 lg:p-12 relative flex flex-col justify-between overflow-hidden shadow-card select-none group min-h-[460px]">
            {/* Limited Time Offer floating sticker */}
            <div className="absolute top-6 right-6 bg-dark-green text-white w-18 h-18 rounded-full flex flex-col justify-center items-center shadow-lg border-2 border-white z-20 rotate-12">
              <span className="text-[10px] font-black leading-none text-center">Limited</span>
              <span className="text-[10px] font-black leading-none text-center mt-0.5">Time</span>
              <span className="text-[10px] font-black leading-none text-center mt-0.5">Offer</span>
            </div>

            <div className="max-w-[55%] z-10 flex flex-col items-start text-left">
              {/* Badge */}
              <span className="text-[11px] font-black tracking-widest text-[#E65100] bg-orange-50 border border-orange-100 px-3.5 py-1.5 rounded-full uppercase mb-6 shadow-sm">
                SEASON SPECIAL
              </span>

              {/* Title */}
              <h2 className="text-[38px] md:text-[54px] font-black text-gray-800 leading-[1.08] tracking-tight mb-2">
                <span className="text-primary-green">Mango</span> <br />
                <span className="font-serif italic text-amber-500 font-extrabold pr-2">Bonanza</span>
              </h2>

              {/* Bullet texts */}
              <p className="text-gray-600 text-[14px] md:text-[16px] font-bold mt-2 leading-relaxed">
                Juicy, Sweet & Irresistible
              </p>
              <p className="text-gray-400 text-[13px] md:text-[14px] font-semibold leading-normal mt-1">
                Handpicked mangos at unbeatable prices!
              </p>

              {/* Discount Box & Shop Button */}
              <div className="flex items-center gap-4 mt-8 flex-wrap">
                {/* Discount Card */}
                <div className="border-2 border-dashed border-emerald-500 bg-white/80 rounded-2xl px-5 py-3 text-center flex flex-col justify-center">
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase leading-none">UP TO</span>
                  <span className="text-[26px] font-black text-primary-green leading-none my-1">25%</span>
                  <span className="text-[11px] text-primary-green font-black uppercase leading-none">OFF</span>
                </div>

                <button 
                  onClick={() => setActiveTab('Fruits')} 
                  className="flex items-center gap-2 px-6 py-4 bg-primary-green text-white font-bold text-[15px] rounded-[16px] hover:bg-dark-green transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Shop Mangoes <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Mango Image Floating Right */}
            <div className="absolute right-[-40px] bottom-[-20px] w-[50%] max-w-[380px] z-10 select-none pointer-events-none group-hover:scale-103 transition-transform duration-500 ease-out">
              <img 
                src="/category_fruits.png" 
                alt="Ripe yellow mangoes" 
                className="w-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          {/* Right Column Stack (Two Banners - 35% width equivalent) */}
          <div className="lg:col-span-4 flex flex-col gap-6 items-stretch">
            
            {/* Top Card (Spices Essentials) */}
            <div className="flex-1 bg-[#F4FAF5] border border-emerald-100 rounded-[28px] p-6 lg:p-8 relative flex flex-col justify-between overflow-hidden shadow-card select-none group min-h-[220px]">
              <div className="max-w-[60%] z-10 flex flex-col items-start text-left">
                {/* Badge */}
                <span className="text-[9px] font-black tracking-widest text-primary-green bg-white border border-emerald-100 px-2.5 py-1 rounded-full uppercase mb-4">
                  SPICE UP YOUR KITCHEN
                </span>
                
                {/* Title */}
                <h3 className="text-[22px] lg:text-[24px] font-black text-gray-800 leading-tight mb-1">
                  Spices Essentials
                </h3>
                <p className="text-gray-400 text-[12px] font-semibold leading-snug">
                  Pure spices for flavorful meals
                </p>

                {/* Flat Discount Badge & Button */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="border border-dashed border-emerald-400 bg-white/90 rounded-xl px-3 py-1 flex flex-col justify-center items-center">
                    <span className="text-[8px] text-gray-400 font-extrabold leading-none">FLAT</span>
                    <span className="text-[14px] font-black text-primary-green leading-none my-0.5">15%</span>
                    <span className="text-[8px] text-primary-green font-black leading-none">OFF</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('Spices')} 
                    className="flex items-center gap-1 px-4 py-2 bg-primary-green text-white font-bold text-[12px] rounded-xl hover:bg-dark-green transition-colors cursor-pointer"
                  >
                    Shop Spices <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Float Image */}
              <div className="absolute right-[-15px] bottom-[-15px] w-[140px] h-[140px] z-10 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/category_spices.png" 
                  alt="spices arrangement" 
                  className="w-full h-full object-cover rounded-full mix-blend-multiply"
                />
              </div>
            </div>

            {/* Bottom Card (Dry Fruits Bonanza) */}
            <div className="flex-1 bg-[#FFF5F6] border border-rose-100 rounded-[28px] p-6 lg:p-8 relative flex flex-col justify-between overflow-hidden shadow-card select-none group min-h-[220px]">
              <div className="max-w-[60%] z-10 flex flex-col items-start text-left">
                {/* Badge */}
                <span className="text-[9px] font-black tracking-widest text-rose-600 bg-white border border-rose-100 px-2.5 py-1 rounded-full uppercase mb-4">
                  HEALTHY & DELICIOUS
                </span>

                {/* Title */}
                <h3 className="text-[22px] lg:text-[24px] font-black text-gray-800 leading-tight mb-1">
                  Dry Fruits Bonanza
                </h3>
                <p className="text-gray-400 text-[12px] font-semibold leading-snug">
                  Goodness of nutrition in every bite
                </p>

                {/* Flat Discount Badge & Button */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="border border-dashed border-rose-400 bg-white/90 rounded-xl px-3 py-1 flex flex-col justify-center items-center">
                    <span className="text-[8px] text-gray-400 font-extrabold leading-none">UP TO</span>
                    <span className="text-[14px] font-black text-rose-600 leading-none my-0.5">20%</span>
                    <span className="text-[8px] text-rose-600 font-black leading-none">OFF</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('Dry Fruits')} 
                    className="flex items-center gap-1 px-4 py-2 bg-rose-600 text-white font-bold text-[12px] rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Shop Dry Fruits <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Float Image */}
              <div className="absolute right-[-15px] bottom-[-15px] w-[140px] h-[140px] z-10 pointer-events-none group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/category_dryfruits.png" 
                  alt="dry fruits pack" 
                  className="w-full h-full object-cover rounded-full mix-blend-multiply"
                />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section 4: Offer Coupon strip */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 select-none">
        <div className="w-full bg-white border border-border-color rounded-[24px] p-6 shadow-card flex items-center justify-between gap-6 overflow-x-auto scrollbar-none">
          {coupons.map((coupon, idx) => (
            <div key={idx} className="flex items-center gap-4 shrink-0 min-w-[220px] max-w-[280px] text-left border-r last:border-0 border-gray-100 pr-6 last:pr-0">
              {/* Icon Container */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${coupon.iconBg}`}>
                <coupon.icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              
              {/* Info */}
              <div>
                <h4 className="text-[14px] font-black text-gray-800 leading-tight">{coupon.title}</h4>
                <p className="text-[12px] text-gray-400 font-semibold mt-1 leading-snug">{coupon.desc}</p>
                {coupon.isCoupon && (
                  <div className="mt-2.5 bg-emerald-50 border border-emerald-200/50 rounded-lg px-2.5 py-1 inline-block select-all">
                    <span className="text-[11px] font-black text-primary-green">Code: {coupon.code}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Call to Action bottom banner (Don't Miss Out!) */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="bg-[#FFFCEB] border border-amber-200/40 rounded-[28px] py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none">
          {/* Left Side: Fruit Basket + Info */}
          <div className="flex items-center gap-6 text-left z-10">
            <div className="w-[100px] h-[100px] shrink-0 overflow-hidden mix-blend-multiply hidden md:block">
              <img src="/category_fruits.png" alt="fresh fruits" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-[26px] font-black text-gray-800 leading-tight">
                Don't Miss Out!
              </h2>
              <p className="text-gray-500 text-[14px] font-semibold mt-1 max-w-[460px]">
                New offers every week. Stay tuned and save more on farm fresh essentials.
              </p>
            </div>
          </div>

          {/* Right Side Button */}
          <button 
            onClick={() => setActiveTab('Home')}
            className="flex items-center gap-2 px-6 py-3.5 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 z-10"
          >
            Explore All Offers <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>

          {/* Leaf backgrounds */}
          <div className="absolute left-[30%] bottom-[-10px] opacity-15 rotate-45 pointer-events-none">
            <span className="text-4xl">🍃</span>
          </div>
          <div className="absolute right-[10%] top-[10px] opacity-15 -rotate-12 pointer-events-none">
            <span className="text-4xl">🍃</span>
          </div>
        </div>
      </section>

    </div>
  );
}
