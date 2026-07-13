import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function PromoSection() {
  const { homepageData } = useAuth();
  const navigate = useNavigate();

  // Load from homepageData, or fallback
  const promosList = homepageData?.promos || [];

  const displayPromos = promosList.length > 0 ? promosList : [
    {
      id: 'mock1',
      title: 'Mango Season',
      description: 'Sweet. Juicy. Fresh.',
      discount: '25% OFF',
      image: '/product_mango.png',
      btn_text: 'Shop Now',
      btn_link: '/category/fruits',
      bg_color: '#F9FAF0'
    },
    {
      id: 'mock2',
      title: 'Spice Essentials',
      description: 'Pure spices for flavorful meals.',
      discount: '15% OFF',
      image: '/category_spices.png',
      btn_text: 'Shop Now',
      btn_link: '/category/spices',
      bg_color: '#FAFAF2'
    },
    {
      id: 'mock3',
      title: 'Get Karshaq App',
      description: 'Faster delivery, exclusive offers & more!',
      discount: '',
      image: '/app_mockup_phone.png',
      btn_text: 'Download App',
      btn_link: '#download',
      bg_color: '#E8F5E9/50',
      isAppCard: true
    }
  ];

  const handlePromoClick = (link) => {
    if (!link) return;
    if (link.startsWith('#') || link.startsWith('http')) {
      window.location.href = link;
    } else {
      navigate(link);
    }
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayPromos.map((promo, idx) => {
          const bg = promo.bg_color || '#FFFFFF';
          const isApp = promo.isAppCard || promo.title.toLowerCase().includes('app');

          return (
            <motion.div
              key={promo.id || idx}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              style={{ backgroundColor: bg.startsWith('#') && !bg.includes('/') ? bg : undefined }}
              className={`relative rounded-[22px] border border-border-color shadow-card hover:shadow-premium overflow-hidden p-8 flex flex-col justify-between min-h-[300px] text-left select-none group ${
                bg.includes('/') ? 'bg-[#E8F5E9]/50' : !bg.startsWith('#') ? bg : 'bg-[#F9FAF0]'
              }`}
            >
              {/* Discount Badge */}
              {promo.discount && (
                <div className={`absolute right-6 top-6 w-14 h-14 rounded-full flex flex-col justify-center items-center shadow-md z-20 ${
                  idx % 2 === 0 ? 'bg-primary-green' : 'bg-[#FFA726]'
                } text-white`}>
                  <span className="text-[11px] font-black leading-none text-center uppercase px-0.5">{promo.discount}</span>
                </div>
              )}

              <div className="max-w-[60%] z-10">
                <h3 className="text-[22px] lg:text-[26px] font-black text-gray-800 leading-tight capitalize">
                  {promo.title}
                </h3>
                <p className="text-gray-500 text-[13px] font-semibold mt-2.5 leading-snug">
                  {promo.description}
                </p>
                
                {isApp && (
                  /* Play/App Store links for App Card */
                  <div className="flex flex-col gap-2 mt-4.5">
                    <a href="#playstore" className="hover:opacity-90 transition-opacity">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                        alt="Get it on Google Play"
                        className="h-10 object-contain"
                      />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-8 z-10">
                <button
                  onClick={() => handlePromoClick(promo.btn_link)}
                  className="flex items-center gap-1.5 px-5 py-3 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  {promo.btn_text || 'Shop Now'} <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Floating Image right */}
              <img
                src={promo.image || '/product_mango.png'}
                alt={promo.title}
                loading="lazy"
                className={`absolute ${
                  isApp 
                    ? 'right-[-10px] bottom-0 w-[140px] h-[250px] object-contain object-bottom'
                    : 'right-[-20px] bottom-[-20px] w-[180px] h-[180px] object-cover rounded-full mix-blend-multiply'
                } group-hover:scale-105 transition-transform duration-300`}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
