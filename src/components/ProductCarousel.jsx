import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductCarousel({
  title,
  products = [],
  id = 'carousel',
  slider = true,
  autoplay = false,
  addToCart,
  getItemQuantity,
  updateQuantity,
  toggleWishlist,
  isInWishlist
}) {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 320; // card width + gap
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

  // Handle Autoplay
  useEffect(() => {
    if (!slider || !autoplay || !scrollContainerRef.current || products.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollContainerRef.current;
      if (container) {
        // If we scrolled to the end, reset to 0
        const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
        if (isEnd) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          handleScroll('right');
        }
      }
    }, 4000); // Scroll every 4 seconds

    return () => clearInterval(interval);
  }, [autoplay, slider, products]);

  if (!products || products.length === 0) return null;

  return (
    <section id={id} className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 relative animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] lg:text-[38px] font-black text-gray-800 tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <a
            href={`#${id}`}
            className="text-primary-green hover:text-dark-green text-[15px] lg:text-[16px] font-bold flex items-center gap-1 transition-colors group cursor-pointer"
          >
            View All <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>

      {slider ? (
        /* Carousel View */
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
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                getItemQuantity={getItemQuantity}
                updateQuantity={updateQuantity}
                toggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCart={addToCart}
              getItemQuantity={getItemQuantity}
              updateQuantity={updateQuantity}
              toggleWishlist={toggleWishlist}
              isInWishlist={isInWishlist}
            />
          ))}
        </div>
      )}
    </section>
  );
}
