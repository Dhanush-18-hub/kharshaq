import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Award, 
  Users, 
  Heart, 
  MapPin, 
  Scale, 
  Truck, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  FlaskConicalOff,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function AboutUs() {
  const scrollRef = useRef(null);

  const stats = [
    { number: '4,000+', label: 'Happy Farmers', icon: Users },
    { number: '1M+', label: 'Happy Customers', icon: Heart },
    { number: '10,000+', label: 'Products Delivered Daily', icon: Truck },
    { number: '20+', label: 'States Covered', icon: Globe },
  ];

  const promiseCards = [
    {
      title: '100% Chemical Free',
      description: 'We ensure every product is grown without harmful chemicals, pesticides or synthetic fertilizers.',
      icon: Leaf,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'Uncompromising Quality',
      description: 'Our products go through multiple quality checks so you get only the best.',
      icon: Award,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'Support Farmers',
      description: 'We work directly with 4,000+ farmers and ensure they get fair prices for their hard work.',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'Delighting Families',
      description: 'We deliver freshness, nutrition and peace of mind to millions of happy families.',
      icon: Heart,
      iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ];

  const farmers = [
    {
      name: 'Ramesh Yadav',
      role: 'Vegetable Farmer',
      location: 'Nashik, Maharashtra',
      image: '/about_farmer1.png',
    },
    {
      name: 'Lakshmi Bai',
      role: 'Organic Farmer',
      location: 'Warangal, Telangana',
      image: '/about_farmer2.png',
    },
    {
      name: 'Suresh Patel',
      role: 'Fruit Farmer',
      location: 'Ahmedabad, Gujarat',
      image: '/about_farmer3.png',
    },
    {
      name: 'Savita Kumari',
      role: 'Herb Farmer',
      location: 'Bangalore, Karnataka',
      image: '/about_farmer4.png',
    },
  ];

  const commitments = [
    { label: 'No Chemicals', icon: FlaskConicalOff },
    { label: 'No Preservatives', icon: ShieldAlert },
    { label: 'No Artificial Ripeners', icon: Sparkles },
    { label: 'Sustainably Grown', icon: Leaf },
    { label: 'Better For You', icon: Heart },
    { label: 'Better For Earth', icon: Globe },
  ];

  const handleScroll = (direction) => {
    const container = scrollRef.current;
    if (container) {
      const scrollAmount = 300;
      container.scrollTo({
        left: direction === 'left' ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 overflow-hidden">
      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400 select-none">
          <span className="hover:text-primary-green cursor-pointer transition-colors">Home</span>
          <span>&gt;</span>
          <span className="text-gray-600">About Us</span>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 relative">
        {/* Leaf Accent Background */}
        <div className="absolute left-[-2%] top-[10%] opacity-20 pointer-events-none -scale-x-100">
          <svg className="w-24 h-24 fill-primary-green" viewBox="0 0 24 24">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7.04,18.5C10.75,17.97 14.23,15.66 16.8,11.87C18.37,9.55 19.12,6.86 19,4C16.15,3.88 13.46,4.63 11.14,6.2C7.35,8.77 5.04,12.25 4.5,15.96L1,14.63L1.66,12.74C6.83,10.66 13,8.5 17,8Z" />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center bg-white rounded-[32px] p-8 lg:p-12 border border-border-color shadow-premium relative overflow-hidden">
          {/* Decorative radial gradients */}
          <div className="absolute right-[-10%] top-[-20%] w-[50%] h-[100%] bg-radial from-light-green/30 to-transparent blur-3xl pointer-events-none" />

          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left relative z-10">
            {/* Pill Badge */}
            <div className="flex items-center gap-1 px-4 py-2 bg-light-green border border-emerald-200/50 rounded-full text-[12px] font-black text-primary-green tracking-wider uppercase mb-6 shadow-sm select-none">
              <span>ABOUT KARSHAQ</span>
            </div>

            {/* Title */}
            <h1 className="text-[38px] md:text-[54px] font-black text-gray-800 leading-[1.1] tracking-tight mb-6">
              Cultivating a <br />
              <span className="text-primary-green">Healthier Tomorrow</span>
            </h1>

            {/* Description Paragraph */}
            <p className="text-gray-500 text-[15px] md:text-[17px] font-semibold leading-relaxed max-w-[560px] mb-8">
              At Karshaq, we believe food is more than just fuel—it's the foundation of a healthy, happy life. 
              We bring you farm-fresh, chemical-free produce directly from trusted farmers to your home.
            </p>

            {/* Green leaf floating decor (decorative bottom-left leaves in container) */}
            <div className="flex items-center gap-1 select-none">
              <span className="text-3xl">🌿</span>
              <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">100% Natural Quality</span>
            </div>
          </div>

          {/* Hero Right Banner Image */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Image Wrapper */}
            <div className="relative rounded-[28px] overflow-hidden border border-border-color shadow-premium w-full aspect-[4/3] lg:aspect-square max-w-[480px]">
              <img 
                src="/about_hero_farmer.png" 
                alt="Karshaq farming community" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating Chemical Free circular badge */}
            <div className="absolute bottom-[-20px] left-[-20px] lg:bottom-[20px] lg:left-[-35px] z-20 w-[130px] h-[130px] bg-white rounded-full p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.1)] border border-emerald-100 flex items-center justify-center">
              <div className="relative w-full h-full bg-[#E8F5E9]/60 rounded-full border-2 border-dashed border-primary-green flex items-center justify-center">
                {/* Circular Text SVG */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_15s_linear_infinite] origin-center">
                  <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                  <text className="text-[8.5px] font-black fill-dark-green tracking-[2.5px] uppercase">
                    <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                      • 100% Chemical Free • Pure Food
                    </textPath>
                  </text>
                </svg>
                {/* Leaf Logo inside */}
                <Leaf className="w-7 h-7 text-primary-green stroke-[2.5]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Karshaq Promise */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-12 text-center">
        <span className="text-[12px] font-extrabold tracking-widest text-primary-green uppercase block mb-3">OUR PROMISE</span>
        <h2 className="text-[32px] lg:text-[40px] font-black text-gray-800 tracking-tight mb-12">
          The Karshaq Promise
        </h2>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {promiseCards.map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="bg-white rounded-[24px] border border-border-color p-8 text-center flex flex-col items-center shadow-card hover:shadow-premium transition-all duration-300 select-none"
            >
              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 mb-6 ${card.iconBg}`}>
                <card.icon className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Card Title */}
              <h3 className="text-[18px] font-black text-gray-800 mb-3">{card.title}</h3>

              {/* Card Description */}
              <p className="text-gray-400 text-[13.5px] font-medium leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 3: Our Story / From Farms to Families */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Story Left Column */}
          <div className="lg:col-span-6 text-left flex flex-col items-start">
            <span className="text-[12px] font-extrabold tracking-widest text-primary-green uppercase block mb-3">OUR STORY</span>
            <h2 className="text-[32px] lg:text-[40px] font-black text-gray-800 leading-tight tracking-tight mb-6">
              From Farms <br />
              <span className="text-primary-green">To Families</span>
            </h2>

            <div className="text-gray-500 text-[15px] font-semibold leading-relaxed space-y-4 mb-8">
              <p>
                Karshaq was born out of a simple idea — to make clean, healthy, and natural food accessible to everyone. 
                We work hand-in-hand with farmers who follow sustainable and traditional farming methods.
              </p>
              <p>
                By cutting out middlemen and bringing produce straight from the source, we ensure better quality for you 
                and better livelihoods for farmers.
              </p>
            </div>

            {/* List with Circular Green Icons */}
            <div className="space-y-4.5 w-full">
              {/* Item 1 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center text-primary-green shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-800 leading-none">Direct Sourcing</h4>
                  <p className="text-[13px] text-gray-400 font-semibold mt-1">We buy directly from farms.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center text-primary-green shrink-0">
                  <Scale className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-800 leading-none">Fair Prices</h4>
                  <p className="text-[13px] text-gray-400 font-semibold mt-1">Farmers earn better, you pay fair.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-light-green flex items-center justify-center text-primary-green shrink-0">
                  <Truck className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[15px] font-black text-gray-800 leading-none">Fresh & Fast Delivery</h4>
                  <p className="text-[13px] text-gray-400 font-semibold mt-1">From farm to home in 24-48 hrs.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Story Right Column */}
          <div className="lg:col-span-6 flex flex-col gap-8 w-full">
            {/* Stats Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-border-color p-4.5 flex flex-col items-center justify-center shadow-card select-none">
                  <stat.icon className="w-5 h-5 text-primary-green mb-2.5 stroke-[2]" />
                  <span className="text-[20px] font-black text-gray-800 leading-none">{stat.number}</span>
                  <span className="text-[11px] text-gray-400 font-extrabold text-center mt-1.5 leading-snug">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Farm Sunrise Image overlapping Quote Card */}
            <div className="relative w-full pt-4">
              {/* Main Sunrise Image */}
              <div className="w-full h-[280px] rounded-[28px] overflow-hidden border border-border-color shadow-premium relative">
                <img 
                  src="/about_farm_sunrise.png" 
                  alt="Sunrise over farm field" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>

              {/* Overlapping Quote Card */}
              <div className="absolute bottom-[-30px] right-[-10px] md:right-[20px] bg-white rounded-[22px] border border-border-color p-6 shadow-[0_12px_40px_rgba(0,0,0,0.12)] max-w-[280px] md:max-w-[340px] text-left select-none z-20">
                <span className="text-[52px] font-serif font-extrabold text-[#A5D6A7]/80 leading-none block h-8 -mt-2">“</span>
                <p className="text-gray-700 text-[13px] md:text-[14px] font-bold leading-relaxed -mt-1 mb-4">
                  We don't just sell produce, we build relationships with our farmers and nourish communities.
                </p>
                <div className="flex items-center gap-3">
                  <img 
                    src="/about_founder.png" 
                    alt="Rajesh Kumar" 
                    className="w-10 h-10 rounded-full object-cover border border-emerald-100 shadow-sm"
                  />
                  <div>
                    <h5 className="text-[13px] font-black text-gray-800 leading-none">Rajesh Kumar</h5>
                    <span className="text-[11px] font-bold text-primary-green tracking-wide mt-1 block">Founder, Karshaq</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Meet Our Farmers */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Farmers Title Block (Left 25%) */}
          <div className="lg:col-span-3 text-left flex flex-col items-start">
            <span className="text-[12px] font-extrabold tracking-widest text-primary-green uppercase block mb-3">MEET OUR FARMERS</span>
            <h2 className="text-[32px] font-black text-gray-800 leading-tight tracking-tight mb-4">
              The Heart Behind Karshaq
            </h2>
            <p className="text-gray-400 text-[14px] font-semibold leading-relaxed mb-6">
              Every farmer we work with is a partner in our mission to build a healthier world.
            </p>
            <button className="flex items-center gap-2 px-5 py-3 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-all shadow-md cursor-pointer">
              Meet Our Farmers <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Farmers Carousel (Right 75%) */}
          <div className="lg:col-span-9 relative group/carousel">
            
            {/* Carousel Arrow Buttons */}
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white text-gray-800 border border-border-color w-10 h-10 rounded-full flex items-center justify-center shadow-premium z-30 hover:bg-gray-50 transition-colors opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 duration-300 cursor-pointer"
              aria-label="Previous Farmer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 stroke-[2.5]" />
            </button>

            <button
              onClick={() => handleScroll('right')}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white text-gray-800 border border-border-color w-10 h-10 rounded-full flex items-center justify-center shadow-premium z-30 hover:bg-gray-50 transition-colors opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 duration-300 cursor-pointer"
              aria-label="Next Farmer"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 stroke-[2.5]" />
            </button>

            {/* Scroll Area */}
            <div 
              ref={scrollRef}
              className="w-full flex gap-5 overflow-x-auto scrollbar-none pb-4 scroll-smooth px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {farmers.map((farmer, idx) => (
                <div 
                  key={idx}
                  className="min-w-[210px] sm:min-w-[230px] flex-1 bg-white rounded-2xl border border-border-color overflow-hidden shadow-card hover:shadow-premium transition-all duration-300 flex flex-col group/card cursor-pointer select-none"
                >
                  {/* Photo Container */}
                  <div className="w-full aspect-[4/5] bg-gray-50 overflow-hidden relative border-b border-border-color">
                    <img 
                      src={farmer.image} 
                      alt={farmer.name} 
                      className="w-full h-full object-cover group-hover/card:scale-104 transition-transform duration-500 ease-out"
                    />
                  </div>
                  {/* Details Block */}
                  <div className="p-4 flex flex-col text-left">
                    <h4 className="text-[15px] font-black text-gray-800 leading-none group-hover/card:text-primary-green transition-colors">{farmer.name}</h4>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mt-2 block">{farmer.role}</span>
                    <span className="text-[12px] text-gray-500 font-semibold mt-1 block">{farmer.location}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Our Commitment to You */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 select-none">
        <div className="bg-[#E8F5E9]/45 border border-emerald-100 rounded-[28px] py-10 px-8 relative overflow-hidden flex flex-col items-center">
          {/* Leaves Decorative Endpoints */}
          <div className="absolute left-[3%] bottom-[10%] opacity-15 rotate-12 pointer-events-none">
            <span className="text-5xl">🌿</span>
          </div>
          <div className="absolute right-[3%] bottom-[10%] opacity-15 -rotate-12 pointer-events-none">
            <span className="text-5xl">🌿</span>
          </div>

          <span className="text-[12px] font-extrabold tracking-widest text-primary-green uppercase block mb-3">OUR COMMITMENT TO YOU</span>
          <h2 className="text-[26px] lg:text-[32px] font-black text-gray-800 leading-tight text-center tracking-tight mb-8">
            Pure Food. Honest Practices. Better Future.
          </h2>

          {/* 6 Icons row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 w-full max-w-[1100px] justify-center">
            {commitments.map((commit, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                {/* Round Badge */}
                <div className="w-12 h-12 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-primary-green mb-3 group-hover:scale-106 transition-transform">
                  <commit.icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                {/* Label */}
                <span className="text-[12.5px] font-extrabold text-gray-700 leading-snug group-hover:text-primary-green transition-colors">
                  {commit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
