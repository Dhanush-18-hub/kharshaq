import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PromoSection() {
  const { offers } = useAuth();

  // Pick up to 2 active offers from database, or fallback
  const displayOffers = offers && offers.length > 0 ? offers.slice(0, 2) : [
    {
      id: 'mock1',
      title: 'Mango Season',
      description: 'Sweet. Juicy. Fresh.',
      discount: '25% OFF',
      image: '/product_mango.png',
      isFallback: true
    },
    {
      id: 'mock2',
      title: 'Spice Essentials',
      description: 'Pure spices for flavorful meals.',
      discount: '15% OFF',
      image: '/category_spices.png',
      isFallback: true
    }
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {displayOffers.map((offer, idx) => (
          <motion.div
            key={offer.id || idx}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-[22px] border border-border-color shadow-card hover:shadow-premium overflow-hidden p-8 flex flex-col justify-between min-h-[300px] text-left select-none group ${
              idx === 0 ? 'bg-[#F9FAF0]' : 'bg-[#FAFAF2]'
            }`}
          >
            {/* Discount Badge */}
            {offer.discount && (
              <div className={`absolute right-6 top-6 w-14 h-14 rounded-full flex flex-col justify-center items-center shadow-md z-20 ${
                idx === 0 ? 'bg-primary-green' : 'bg-[#FFA726]'
              } text-white`}>
                <span className="text-[11px] font-black leading-none text-center uppercase px-0.5">{offer.discount}</span>
              </div>
            )}

            <div className="max-w-[60%] z-10">
              <h3 className="text-[24px] lg:text-[28px] font-black text-gray-800 leading-tight capitalize">
                {offer.title}
              </h3>
              <p className="text-gray-500 text-[14px] font-semibold mt-2.5 leading-snug">
                {offer.description}
              </p>
            </div>

            <div className="mt-8 z-10">
              <button className="flex items-center gap-1.5 px-5 py-3 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-all shadow-sm hover:shadow cursor-pointer">
                Shop Now <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Float image right */}
            <img
              src={offer.image || '/product_mango.png'}
              alt={offer.title}
              className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] object-cover rounded-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
            />
          </motion.div>
        ))}

        {/* Card 3: Get Karshaq App */}
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="relative bg-[#E8F5E9]/50 rounded-[22px] border border-border-color shadow-card hover:shadow-premium overflow-hidden p-8 pb-0 flex flex-col justify-between min-h-[300px] text-left select-none group"
        >
          <div className="max-w-[65%] z-10">
            <h3 className="text-[22px] lg:text-[24px] font-black text-gray-800 leading-tight">
              Get Karshaq App
            </h3>
            <p className="text-gray-500 text-[13px] font-semibold mt-2 leading-relaxed">
              Faster delivery, exclusive offers & more!
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col gap-2 mt-4.5">
              <a href="#playstore" className="hover:opacity-90 transition-opacity">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-10 object-contain"
                />
              </a>
              <a href="#appstore" className="hover:opacity-90 transition-opacity">
                <img
                  src="/app_store_badge.svg"
                  alt="Download on the App Store"
                  className="h-10 object-contain"
                />
              </a>
            </div>
          </div>

          {/* App phone mockup floating right */}
          <div className="absolute right-[-10px] bottom-0 w-[140px] h-[260px] flex items-end">
            <img
              src="/app_mockup_phone.png"
              alt="Karshaq Mobile App"
              className="w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)] group-hover:scale-103 transition-transform duration-300"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
