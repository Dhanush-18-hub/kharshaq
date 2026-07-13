import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Flame, Leaf, Clock, Star, Headset } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Hero() {
  const { homepageData } = useAuth();
  const hero = homepageData?.hero || {};
  const featuresList = homepageData?.features || [];

  // Fallbacks for Hero section
  const badge = hero.badge || "100% FARM FRESH";
  const heading = hero.heading || "From Our Farms";
  const highlightText = hero.highlight_text || "To Your Family";
  const description = hero.description || "Handpicked fruits, vegetables & spices delivered fresh to your doorstep.";
  const leftBtnText = hero.left_btn_text || "Shop Now";
  const leftBtnLink = hero.left_btn_link || "#bestsellers";
  const rightBtnText = hero.right_btn_text || "Explore Categories";
  const rightBtnLink = hero.right_btn_link || "#categories";
  const heroImage = hero.image || "/hero_wicker_basket.png";
  const bgGradient = hero.bg_gradient || "from-[#C8E6C9]/40 via-[#E8F5E9]/15 to-transparent";
  const bgImage = hero.bg_image || "";
  
  // Floating offer card details
  const discountPercentage = hero.discount_percentage || "20%";
  const couponCode = hero.coupon_code || "KAR20";
  const offerTitle = hero.offer_title || "FLAT";
  const offerDescription = hero.offer_description || "On First Order";
  const enableFloatingOffer = hero.enable_floating_offer ?? true;

  const handleScrollTo = (id) => {
    if (id.startsWith('#')) {
      const element = document.getElementById(id.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = id;
    }
  };

  const renderFeatureIcon = (iconName) => {
    const icons = {
      Truck: <Truck className="w-6 h-6 stroke-[2]" />,
      Leaf: <Leaf className="w-6 h-6 stroke-[2]" />,
      ShieldCheck: <ShieldCheck className="w-6 h-6 stroke-[2]" />,
      RotateCcw: <RotateCcw className="w-6 h-6 stroke-[2]" />,
      Clock: <Clock className="w-6 h-6 stroke-[2]" />,
      Star: <Star className="w-6 h-6 stroke-[2]" />,
      Headset: <Headset className="w-6 h-6 stroke-[2]" />,
      Flame: <Flame className="w-6 h-6 stroke-[2]" />
    };
    return icons[iconName] || <span className="text-xl">🌿</span>;
  };

  const heroOuterStyle = {
    backgroundImage: bgImage ? `url(${bgImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-[140px] pb-10">
      {/* Hero Outer Wrapper */}
      <div
        style={heroOuterStyle}
        className="relative w-full bg-white rounded-[32px] shadow-premium border border-border-color overflow-hidden flex flex-col justify-between"
      >
        
        {/* Decorative Green Bokeh/Farm Background Blur */}
        {!bgImage && (
          <>
            <div className={`absolute right-[-10%] top-[-10%] w-[70%] h-[120%] bg-radial ${bgGradient} rounded-full blur-3xl pointer-events-none z-0`} />
            <div className="absolute right-[20%] top-[40%] w-[120px] h-[120px] bg-[#81C784]/20 rounded-full blur-xl pointer-events-none z-0" />
            <div className="absolute right-[5%] top-[15%] w-[80px] h-[80px] bg-[#A5D6A7]/25 rounded-full blur-lg pointer-events-none z-0" />
          </>
        )}
        
        {/* Main Content Grid */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 px-8 lg:px-16 pt-16 pb-12 lg:pb-8 items-center gap-12">
          
          {/* Left Column (40%) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Green Badge */}
            {badge && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F5E9] text-primary-green rounded-full text-[13px] font-bold tracking-wider uppercase mb-6 shadow-sm select-none"
              >
                <span>{badge}</span>
                <span className="text-sm">🌿</span>
              </motion.div>
            )}
 
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-[44px] lg:text-[64px] font-black text-gray-800 leading-[1.08] tracking-tight mb-6"
            >
              {heading}<br />
              {highlightText && <span className="text-primary-green">{highlightText}</span>}
            </motion.h1>
 
            {/* Subtitle */}
            {description && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-500 text-[16px] lg:text-[18px] font-medium max-w-[420px] leading-relaxed mb-8"
              >
                {description}
              </motion.p>
            )}
 
            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 items-center"
            >
              {leftBtnText && (
                <button 
                  onClick={() => handleScrollTo(leftBtnLink)}
                  className="flex items-center gap-2 px-8 py-4 bg-primary-green text-white font-bold text-[16px] rounded-[14px] hover:bg-dark-green transition-all shadow-md hover:shadow-lg cursor-pointer hover:translate-x-0.5"
                >
                  {leftBtnText} <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
              {rightBtnText && (
                <button 
                  onClick={() => handleScrollTo(rightBtnLink)}
                  className="px-7 py-4 bg-white border border-gray-200 text-gray-700 font-semibold text-[16px] rounded-[14px] hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  {rightBtnText}
                </button>
              )}
            </motion.div>
          </div>

          {/* Right Column (60%) */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            {/* Main Image with hover zoom */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-full max-w-[580px] z-10"
            >
              <img
                src={heroImage}
                alt="Karshaq Hero Showcase"
                className="w-full object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.12)] hover:scale-103 transition-transform duration-700 ease-out"
              />
            </motion.div>

            {/* Floating Top Right Discount Card */}
            {enableFloatingOffer && (
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 10 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.4, type: 'spring' }}
                className="absolute right-[2%] top-[5%] bg-white p-5 rounded-[22px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-border-color z-20 flex flex-col items-center min-w-[130px] select-none"
              >
                {offerTitle && <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{offerTitle}</span>}
                {discountPercentage && (
                  <span className="text-[26px] font-black text-gray-800 leading-none my-1 flex items-start">
                    {discountPercentage} <span className="text-[12px] font-bold ml-0.5 text-gray-500 uppercase">OFF</span>
                  </span>
                )}
                {offerDescription && <span className="text-[11px] text-gray-500 font-semibold mb-2.5">{offerDescription}</span>}
                {couponCode && (
                  <div className="bg-light-green border border-emerald-200/50 px-3 py-1.5 rounded-xl">
                    <span className="text-[11px] font-extrabold text-primary-green tracking-wide">Use Code: {couponCode}</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Feature Strip (Floats inside Hero) */}
        {featuresList.length > 0 && (
          <div className="w-full relative z-20 border-t border-border-color bg-white/70 backdrop-blur-md px-8 py-5 flex flex-wrap justify-between items-center gap-6">
            <div className={`max-w-[1280px] mx-auto w-full grid grid-cols-2 md:grid-cols-${Math.min(4, featuresList.length)} gap-6`}>
              {featuresList.map((feat) => (
                <div key={feat.id} className="flex items-center gap-3.5 text-left">
                  <div className="w-12 h-12 rounded-[14px] bg-light-green flex items-center justify-center text-primary-green shrink-0">
                    {renderFeatureIcon(feat.icon)}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-800 leading-tight">{feat.title}</h4>
                    {feat.subtitle && <p className="text-[13px] text-gray-400 font-medium mt-0.5">{feat.subtitle}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-30 pointer-events-none pb-2">
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="w-4.5 h-2 rounded-full bg-primary-green" />
          <span className="w-2 h-2 rounded-full bg-gray-200" />
          <span className="w-2 h-2 rounded-full bg-gray-200" />
        </div>

      </div>
    </section>
  );
}
