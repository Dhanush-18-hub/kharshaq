import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Plus, Minus, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function BestSellers({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const scrollContainerRef = useRef(null);
  const { products } = useAuth();

  // Pick best sellers dynamically from database
  const bestSellersList = (products || []).filter(
    p => p.best_seller === true || p.bestSeller === true || p.rating >= 4.6
  ).slice(0, 8);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // Approximately card width + gap
      const newScrollLeft =
        direction === 'left'
          ? container.scrollLeft - scrollAmount
          : container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="bestsellers" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 relative">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] lg:text-[38px] font-black text-gray-800 tracking-tight">
          Best Sellers
        </h2>
        <div className="flex items-center gap-4">
          <a
            href="#bestsellers"
            className="text-primary-green hover:text-dark-green text-[15px] lg:text-[16px] font-bold flex items-center gap-1 transition-colors group cursor-pointer"
          >
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>

      {/* Carousel Wrapper */}
      <div className="relative group/carousel">

        {/* Navigation Arrows */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white text-gray-800 border border-border-color w-12 h-12 rounded-full flex items-center justify-center shadow-premium z-30 hover:bg-gray-50 transition-colors opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 duration-300 cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600 stroke-[2.5]" />
        </button>

        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white text-gray-800 border border-border-color w-12 h-12 rounded-full flex items-center justify-center shadow-premium z-30 hover:bg-gray-50 transition-colors opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 duration-300 cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 stroke-[2.5]" />
        </button>

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="w-full flex gap-6 overflow-x-auto scrollbar-none pb-6 scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bestSellersList.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -6 }}
              className="min-w-[280px] md:min-w-[300px] max-w-[300px] flex-1 bg-white rounded-[22px] border border-border-color shadow-card hover:shadow-premium transition-all duration-300 p-5 flex flex-col justify-between text-left group select-none relative"
            >
              <div>
                {/* Top Row: Badge */}
                <div className="flex justify-between items-start mb-3 w-full">
                  <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${product.badgeColor || 'bg-[#E8F5E9] text-primary-green'}`}>
                    {product.badge || 'Fresh'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product);
                    }}
                    className={`p-2 bg-white rounded-full border border-border-color transition-colors shadow-sm cursor-pointer ${
                      isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                </div>

                {/* Product Image */}
                <div className="w-full aspect-square bg-[#FAFAF9]/60 rounded-2xl flex items-center justify-center p-4 mb-4 overflow-hidden relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-[150px] object-cover rounded-full mix-blend-multiply group-hover:scale-106 transition-transform duration-300"
                  />
                </div>

                {/* Title & Weight */}
                <h3 className="text-[17px] font-bold text-gray-800 leading-tight group-hover:text-primary-green transition-colors line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <span className="text-[13px] text-gray-400 font-semibold block mb-2.5">
                  {product.weight}
                </span>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-5">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 stroke-none" />
                  </div>
                  <span className="text-[13px] font-extrabold text-gray-700">{product.rating || 4.5}</span>
                  <span className="text-[12px] text-gray-400 font-semibold">({product.reviews || 50})</span>
                </div>
              </div>

              {/* Price and Cart Buttons */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[22px] font-black text-gray-800">
                  ₹{product.price}
                </span>

                <div className="flex items-center gap-2">
                  {product.stock <= 0 || !product.availability ? (
                    <button
                      disabled
                      className="flex items-center gap-1 px-4 py-2.5 bg-gray-200 text-gray-400 font-bold text-[13px] rounded-xl cursor-not-allowed select-none"
                    >
                      Out Of Stock
                    </button>
                  ) : getItemQuantity(product.id) > 0 ? (
                    <div className="flex items-center border border-primary-green rounded-xl overflow-hidden bg-white select-none">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="px-3 py-2 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-[14px] font-black text-gray-800 w-6 text-center">
                        {getItemQuantity(product.id)}
                      </span>
                      <button
                        onClick={() => {
                          const currentQty = getItemQuantity(product.id);
                          if (currentQty >= product.stock) {
                            toast.error(`Only ${product.stock} items available in stock.`);
                            return;
                          }
                          updateQuantity(product.id, 1);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          weight: product.weight,
                          price: product.price,
                          image: product.image,
                          badge: product.badge || 'Fresh',
                          source: 'Farm Fresh'
                        })}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-green text-white font-bold text-[13px] rounded-xl hover:bg-dark-green transition-colors shadow-sm hover:shadow cursor-pointer animate-fade-in"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          weight: product.weight,
                          price: product.price,
                          image: product.image,
                          badge: product.badge || 'Fresh',
                          source: 'Farm Fresh'
                        })}
                        className="p-2.5 border border-primary-green text-primary-green rounded-xl hover:bg-light-green transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-4.5 h-4.5 stroke-[2.2]" />
                      </button>
                    </>
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
