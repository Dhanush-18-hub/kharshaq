import React, { useState, useEffect } from 'react';
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

export default function CategoryPage({ type, addToCart, getItemQuantity, updateQuantity, selectedProductId, setSelectedProductId, toggleWishlist, isInWishlist }) {
  const { products, categories } = useAuth();

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
      <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-6">
        <div className="bg-white rounded-2xl border border-border-color p-4 shadow-card flex items-center gap-6 overflow-x-auto scrollbar-none select-none">
          {data.subcategories.map((sub) => {
            const isActive = selectedSubcat === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcat(sub.id)}
                className={`flex flex-col items-center gap-2 shrink-0 py-1.5 px-3 rounded-2xl cursor-pointer transition-all duration-200 ${isActive ? 'bg-light-green border border-emerald-100' : 'border border-transparent'
                  }`}
              >
                {/* Circular image icon */}
                <div className={`w-[60px] h-[60px] rounded-full border border-border-color overflow-hidden flex items-center justify-center bg-gray-50 transition-transform ${isActive ? 'scale-106' : 'hover:scale-103'
                  }`}>
                  <img
                    src={sub.image}
                    alt={sub.title}
                    className="max-h-[50px] max-w-[50px] object-cover mix-blend-multiply"
                  />
                </div>
                <span className={`text-[12.5px] font-bold ${isActive ? 'text-primary-green' : 'text-gray-600'}`}>
                  {sub.title}
                </span>
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
              All {data.title} <Leaf className="w-5.5 h-5.5 text-primary-green" />
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
          ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredProducts.map((prod) => (
            <motion.div
              key={prod.id}
              id={`product-${prod.id}`}
              whileHover={{ y: -6 }}
              className={`bg-white rounded-3xl border border-border-color shadow-card hover:shadow-premium transition-all duration-300 p-5 flex select-none relative ${viewMode === 'grid' ? 'flex-col justify-between text-left' : 'flex-row items-center gap-6 text-left justify-between'
                } ${selectedProductId === prod.id ? 'product-highlight' : ''}`}
            >
              {/* Badge & Like Button */}
              <div className="absolute top-4 left-4 z-10">
                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${prod.badgeColor || 'bg-emerald-50 text-emerald-700'}`}>
                  {prod.badge}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(prod);
                }}
                className={`absolute top-4 right-4 z-10 p-2 bg-white rounded-full border border-border-color transition-colors shadow-sm cursor-pointer ${isInWishlist(prod.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* Product Image */}
              <div className={`bg-[#FAFAF9]/60 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative ${viewMode === 'grid' ? 'w-full aspect-square mb-4' : 'w-[140px] h-[140px] shrink-0'
                }`}>
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="max-h-[120px] object-cover rounded-full mix-blend-multiply group-hover:scale-106 transition-transform duration-300"
                />
              </div>

              {/* Details & Cart Row */}
              <div className={viewMode === 'grid' ? 'w-full' : 'flex-1 flex flex-col justify-center'}>
                {/* Title & Weight */}
                <h3 className="text-[16px] md:text-[17px] font-black text-gray-800 leading-tight mb-1">
                  {prod.name}
                </h3>
                <span className="text-[13px] text-gray-400 font-semibold block mb-2">
                  {prod.weight}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4 select-none">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                  </div>
                  <span className="text-[12px] font-black text-gray-700">{prod.rating}</span>
                  <span className="text-[11px] text-gray-400 font-bold">({prod.reviews})</span>
                </div>

                {/* Price and Cart Buttons */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[20px] font-black text-gray-800">
                      ₹{prod.price}
                    </span>
                    {prod.originalPrice && (
                      <span className="text-[12px] font-bold text-gray-400 line-through">
                        ₹{prod.originalPrice}
                      </span>
                    )}
                    {prod.discount && (
                      <span className="text-[11px] font-extrabold text-red-500 ml-1 bg-red-50 px-1.5 py-0.5 rounded-md leading-none">
                        {prod.discount}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {prod.stock <= 0 || !prod.availability ? (
                      <button
                        disabled
                        className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-400 font-bold text-[12px] rounded-xl cursor-not-allowed select-none"
                      >
                        Out Of Stock
                      </button>
                    ) : getItemQuantity(prod.id) > 0 ? (
                      <div className="flex items-center border border-primary-green rounded-xl overflow-hidden bg-white select-none">
                        <button
                          onClick={() => updateQuantity(prod.id, -1)}
                          className="px-2.5 py-1.5 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-[13px] font-black text-gray-800 w-5 text-center">
                          {getItemQuantity(prod.id)}
                        </span>
                        <button
                          onClick={() => {
                            const currentQty = getItemQuantity(prod.id);
                            if (currentQty >= prod.stock) {
                              toast.error(`Only ${prod.stock} items available in stock.`);
                              return;
                            }
                            updateQuantity(prod.id, 1);
                          }}
                          className="px-2.5 py-1.5 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart({
                          id: prod.id,
                          name: prod.name,
                          weight: prod.weight,
                          price: prod.price,
                          image: prod.image,
                          badge: prod.badge,
                          source: 'Farm Fresh'
                        })}
                        className="flex items-center gap-1 px-3 py-2 bg-primary-green text-white font-bold text-[12px] rounded-xl hover:bg-dark-green transition-colors shadow-sm cursor-pointer select-none"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
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
