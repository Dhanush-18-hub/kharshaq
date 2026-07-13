import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  ShoppingBag,
  Leaf,
  ArrowRight,
  Grid,
  List,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Search,
  Minus,
  Plus,
  Sparkles
} from 'lucide-react';

import { productsData as categoryData } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import ProductCard from './ProductCard';

export default function CategoryPage({ type, addToCart, getItemQuantity, updateQuantity, selectedProductId, setSelectedProductId, toggleWishlist, isInWishlist }) {
  const { products, categories } = useAuth();
  const subcatSliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (subcatSliderRef.current) {
      const scrollAmount = direction === 'left' ? -240 : 240;
      subcatSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryData = () => {
    const normalizedType = type.toLowerCase().replace(/\s+/g, '');
    const dbProducts = (products || []).filter(p => {
      const pCat = (p.category || '').toLowerCase().replace(/\s+/g, '');
      return pCat === normalizedType;
    });

    const mappedProducts = dbProducts.map(p => ({
      ...p,
      price: Number(p.price),
      originalPrice: p.originalPrice ? Number(p.originalPrice) : Number(p.price),
      rating: p.rating ? Number(p.rating) : 4.5,
      reviews: p.reviews ? Number(p.reviews) : 50,
      stock: p.stock !== undefined ? Number(p.stock) : 100,
      availability: p.availability !== undefined ? Boolean(p.availability) : true
    }));

    const dynamicCategory = (categories || []).find(
      c => c.slug === normalizedType || c.name.toLowerCase().replace(/\s+/g, '') === normalizedType
    );

    const defaultPromos = [
      {
        title: 'Monsoon Mega Sale',
        desc: 'Up to 50% off on organic fresh picks.',
        btnText: 'Shop Sale',
        image: '/product_mango.png',
        bg: 'bg-[#F9FAF0]'
      },
      {
        title: 'Premium Quality Assured',
        desc: '100% certified farm fresh organic produce.',
        btnText: 'Explore More',
        image: '/category_vegetables.png',
        bg: 'bg-[#FAFAF2]'
      },
      {
        title: 'Express Delivery',
        desc: 'Get your groceries delivered within 2 hours.',
        btnText: 'Order Now',
        image: '/hero_wicker_basket.png',
        bg: 'bg-[#E8F5E9]/50'
      }
    ];

    if (dynamicCategory) {
      return {
        title: dynamicCategory.name,
        heroBadge: dynamicCategory.heroBadge || '100% QUALITY ASSURED',
        heroTitlePart1: dynamicCategory.heroTitle || `Fresh ${dynamicCategory.name}`,
        heroTitlePart2: '',
        heroDesc: dynamicCategory.heroSubtitle || '',
        heroImg: dynamicCategory.heroImage || dynamicCategory.image || '/category_fruits.png',
        heroBgColor: dynamicCategory.backgroundColor || '#FFFFFF',
        heroBg: dynamicCategory.backgroundImage || '',
        heroGradient: dynamicCategory.gradient || '',
        buttonText: dynamicCategory.buttonText || 'Shop Now',
        buttonLink: dynamicCategory.buttonLink || '#',
        features: dynamicCategory.features || [],
        subcategories: (dynamicCategory.subcategories || []).map(s => ({
          id: s.slug,
          title: s.name,
          image: s.icon || dynamicCategory.image
        })),
        products: mappedProducts,
        promos: dynamicCategory.promos && dynamicCategory.promos.length > 0 ? dynamicCategory.promos : defaultPromos
      };
    }

    const staticCategory = categoryData[normalizedType] || categoryData.fruits;

    return {
      ...staticCategory,
      products: mappedProducts,
      promos: staticCategory.promos || defaultPromos
    };
  };

  const data = getCategoryData();

  const [selectedSubcat, setSelectedSubcat] = useState('all');
  const [sortOption, setSortOption] = useState('best-selling');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products by subcategory filter and search query
  const filteredProducts = data.products.filter(product => {
    const matchesSubcat = selectedSubcat === 'all' || product.subcat === selectedSubcat;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubcat && matchesSearch;
  });

  // Handle scrolling and highlighting when a product is searched and clicked
  useEffect(() => {
    if (selectedProductId) {
      const targetProduct = data.products.find(p => p.id === selectedProductId);
      if (targetProduct) {
        // Adjust subcategory filters if necessary so the product is visible
        if (selectedSubcat !== 'all' && selectedSubcat !== targetProduct.subcat) {
          setSelectedSubcat(targetProduct.subcat);
        }
        // Clear local search if necessary
        if (searchQuery !== '') {
          setSearchQuery('');
        }

        // Wait a layout cycle for any filtering transitions to complete
        const timer = setTimeout(() => {
          const element = document.getElementById(`product-${selectedProductId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Auto reset selected product after highlight finishes
            const resetTimer = setTimeout(() => {
              if (setSelectedProductId) {
                setSelectedProductId(null);
              }
            }, 2500);
            return () => clearTimeout(resetTimer);
          }
        }, 150);

        return () => clearTimeout(timer);
      }
    }
  }, [selectedProductId, data.products, selectedSubcat, searchQuery, setSelectedProductId]);

  return (
    <div className="w-full bg-[#FCFDF9]/80 min-h-screen pt-[130px] pb-16 overflow-hidden">

      {/* Breadcrumb Navigation */}
      <div className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-4">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-400 select-none">
          <span className="hover:text-primary-green cursor-pointer transition-colors">Home</span>
          <span>&gt;</span>
          <span className="text-gray-600 capitalize">{data.title}</span>
        </div>
      </div>

      {/* Section 1: Hero Banner */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 relative">
        <div
          style={{
            backgroundColor: data.heroBgColor || '#FFFFFF',
            backgroundImage: data.heroBg ? `url(${data.heroBg})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-[32px] p-8 lg:p-12 border border-border-color shadow-premium relative overflow-hidden"
        >
          {data.heroGradient && (
            <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: data.heroGradient }} />
          )}

          {/* Leaves Decor Backdrop */}
          <div className="absolute right-[-10%] top-[-20%] w-[50%] h-[120%] bg-radial from-light-green/30 to-transparent blur-3xl pointer-events-none" />

          {/* Hero Left Info */}
          <div className="lg:col-span-7 flex flex-col items-start text-left relative z-10">
            {/* Green Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#E8F5E9] text-primary-green rounded-full text-[12px] font-black tracking-wider uppercase mb-6 shadow-sm select-none">
              <span>{data.heroBadge}</span>
              <span>🌿</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-[38px] md:text-[54px] font-black text-gray-800 leading-[1.08] tracking-tight mb-6">
              {data.heroTitlePart1}<br />
              {data.heroTitlePart2 && <span className="text-primary-green">{data.heroTitlePart2}</span>}
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-[15px] md:text-[17px] font-semibold leading-relaxed max-w-[480px] mb-8">
              {data.heroDesc}
            </p>

            {/* Banner Micro Features */}
            {data.features && data.features.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-2">
                {data.features.map((feat, idx) => {
                  const iconName = feat.icon || 'Sparkles';
                  const LeafIcon = iconName === 'Leaf' ? Leaf : 
                                   iconName === 'ShieldCheck' ? ShieldCheck :
                                   iconName === 'Star' ? Star :
                                   iconName === 'Truck' ? Truck : Sparkles;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-light-green/80 flex items-center justify-center text-primary-green shrink-0">
                        <LeafIcon className={`w-4 h-4 ${iconName === 'Star' ? 'fill-primary-green stroke-none' : ''}`} />
                      </div>
                      <div className="text-left">
                        <span className="text-[12px] font-black text-gray-800 block leading-none">{feat.title}</span>
                        <span className="text-[10px] text-gray-400 font-semibold mt-0.5 block leading-none">{feat.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hero Right Banner Image */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-[480px] z-10"
            >
              <img
                src={data.heroImg}
                alt={`${data.title} fresh basket`}
                className="w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] mix-blend-multiply"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Subcategory Circular Filters */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 relative group/slider">
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollSlider('left')}
          className="absolute left-2 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-border-color shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-primary-green hover:border-primary-green transition-all hover:scale-105 cursor-pointer opacity-0 group-hover/slider:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollSlider('right')}
          className="absolute right-2 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white border border-border-color shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-primary-green hover:border-primary-green transition-all hover:scale-105 cursor-pointer opacity-0 group-hover/slider:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={subcatSliderRef}
          className="bg-white rounded-3xl border border-border-color p-5 shadow-card flex items-stretch gap-4 overflow-x-auto scrollbar-none select-none scroll-smooth"
        >
          {/* Static All subcategory (only if 'all' is not already defined in database subcategories) */}
          {!data.subcategories.some(s => s.id === 'all') && (() => {
            const isAllActive = selectedSubcat === 'all';
            const allCount = data.products.length;
            return (
              <button
                onClick={() => setSelectedSubcat('all')}
                className={`flex flex-col items-center justify-between shrink-0 w-[115px] md:w-[130px] p-4.5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isAllActive
                    ? 'bg-[#E8F5E9]/40 border-primary-green shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-[70px] h-[70px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden flex items-center justify-center bg-gray-50/50 transition-all duration-300 ${
                  isAllActive ? 'scale-106' : 'hover:scale-103'
                }`}>
                  <img
                    src={data.heroImg}
                    alt={`All ${data.title}`}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </div>
                <div className="text-center mt-3 w-full">
                  <span className={`text-[13px] font-black block truncate leading-tight ${isAllActive ? 'text-primary-green' : 'text-gray-700'}`}>
                    All {data.title}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold block mt-1 select-none">
                    {allCount > 0 ? `${allCount}+` : '0'} Items
                  </span>
                </div>
              </button>
            );
          })()}

          {data.subcategories.map((sub) => {
            const isActive = selectedSubcat === sub.id;
            const count = sub.id === 'all' ? data.products.length : data.products.filter(p => p.subcat === sub.id).length;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcat(sub.id)}
                className={`flex flex-col items-center justify-between shrink-0 w-[115px] md:w-[130px] p-4.5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  isActive
                    ? 'bg-[#E8F5E9]/40 border-primary-green shadow-sm'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Circular image icon */}
                <div className={`w-[70px] h-[70px] md:w-[80px] md:h-[80px] rounded-full overflow-hidden flex items-center justify-center bg-gray-50/50 transition-all duration-300 ${
                  isActive ? 'scale-106' : 'hover:scale-103'
                }`}>
                  <img
                    src={sub.image}
                    alt={sub.title}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </div>
                <div className="text-center mt-3 w-full">
                  <span className={`text-[13px] font-black block truncate leading-tight ${isActive ? 'text-primary-green' : 'text-gray-700'}`}>
                    {sub.title}
                  </span>
                  <span className="text-[11px] text-gray-400 font-bold block mt-1 select-none">
                    {count > 0 ? `${count}+` : '0'} Items
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 3: Products Header & Grid */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">

        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Title & Count */}
          <div className="flex items-center gap-2">
            <h2 className="text-[26px] lg:text-[30px] font-black text-gray-800 tracking-tight capitalize flex items-center gap-1.5">
              {selectedSubcat === 'all' ? `All ${data.title}` : (data.subcategories.find(s => s.id === selectedSubcat)?.title || `All ${data.title}`)} <Leaf className="w-5.5 h-5.5 text-primary-green" />
            </h2>
            <span className="text-[14px] text-gray-400 font-semibold mt-1">
              ({filteredProducts.length} items found)
            </span>
          </div>

          {/* Sorting, view selection and Search */}
          <div className="flex flex-wrap items-center gap-3.5">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-border-color rounded-xl text-[14px] font-semibold text-gray-700 bg-white focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green"
              />
              <Search className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-4 py-2 border border-border-color rounded-xl cursor-pointer hover:bg-gray-50 transition-colors select-none">
              <span className="text-[13px] text-gray-400 font-bold uppercase tracking-wider">Sort by:</span>
              <span className="text-[14px] font-bold text-gray-700 flex items-center gap-1">
                Best Selling <ChevronDown className="w-4 h-4 text-gray-500" />
              </span>
            </div>

            {/* Grid/List View Toggles */}
            <div className="flex items-center border border-border-color rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-light-green text-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 cursor-pointer transition-colors ${viewMode === 'list' ? 'bg-light-green text-primary-green' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid display of products */}
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              addToCart={addToCart}
              getItemQuantity={getItemQuantity}
              updateQuantity={updateQuantity}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
              viewMode={viewMode}
            />
          ))}
        </div>
      </section>

      {/* Section 4: Promotional Banners (3 Cards Grid) */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.promos.map((promo, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className={`relative rounded-[22px] border border-border-color shadow-card hover:shadow-premium overflow-hidden p-8 flex flex-col justify-between min-h-[280px] text-left select-none group ${promo.bg}`}
            >
              <div className="max-w-[60%] z-10">
                <h3 className="text-[24px] font-black text-gray-800 leading-tight">
                  {promo.title}
                </h3>
                <p className="text-gray-500 text-[13px] font-semibold mt-2 leading-snug">
                  {promo.desc}
                </p>
              </div>

              <div className="mt-8 z-10">
                <button className="flex items-center gap-1.5 px-4.5 py-2.5 bg-primary-green text-white font-bold text-[13px] rounded-xl hover:bg-dark-green transition-all shadow-sm cursor-pointer">
                  {promo.btnText} <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>

              {/* Float Image */}
              <img
                src={promo.image}
                alt={promo.title}
                className="absolute right-[-20px] bottom-[-20px] w-[160px] h-[160px] object-cover rounded-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section 5: Micro Features Strip */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6 border-t border-border-color mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 bg-white/50 border border-border-color rounded-2xl px-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-gray-800 leading-tight">Handpicked Daily</h4>
              <p className="text-[12px] text-gray-400 font-semibold mt-0.5">Picked at peak ripeness</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-gray-800 leading-tight">No Chemicals</h4>
              <p className="text-[12px] text-gray-400 font-semibold mt-0.5">100% natural produce</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Star className="w-5 h-5 fill-primary-green stroke-none" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-gray-800 leading-tight">Secure Packaging</h4>
              <p className="text-[12px] text-gray-400 font-semibold mt-0.5">Safe & hygienic delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-light-green flex items-center justify-center text-primary-green shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-gray-800 leading-tight">On Time Delivery</h4>
              <p className="text-[12px] text-gray-400 font-semibold mt-0.5">Fast & reliable delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Call to Action Banner */}
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
        <div className="bg-[#E8F5E9]/50 border border-emerald-100 rounded-[28px] py-10 px-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden select-none">
          <div className="flex items-center gap-6 text-left">
            <div className="w-[100px] h-[100px] shrink-0 overflow-hidden mix-blend-multiply hidden md:block">
              <img src="/category_fruits.png" alt="fresh fruit mix" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-[26px] font-black text-gray-800 leading-tight">
                Craving something fresh?
              </h2>
              <p className="text-gray-500 text-[14px] font-semibold mt-1">
                Explore our wide range of farm fresh fruits.
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3.5 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-all shadow-md cursor-pointer shrink-0">
            Shop All {data.title} <ArrowRight className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </section>
    </div>
  );
}
