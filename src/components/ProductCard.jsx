import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Minus, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProductCard({
  product,
  addToCart,
  getItemQuantity,
  updateQuantity,
  toggleWishlist,
  isInWishlist,
  viewMode = 'grid'
}) {
  // Set fallback image URL if the image fails to load or is empty
  const defaultFallback = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=260';
  const [imgSrc, setImgSrc] = useState(product.image || defaultFallback);

  const handleImageError = () => {
    setImgSrc(defaultFallback);
  };

  const isFavorite = typeof isInWishlist === 'function' ? isInWishlist(product.id) : true;
  const qty = typeof getItemQuantity === 'function' ? getItemQuantity(product.id) : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={
        viewMode === 'grid'
          ? "w-full h-[320px] bg-white rounded-[20px] border border-border-color shadow-sm hover:shadow-premium transition-all duration-250 p-3 flex flex-col justify-between text-left group select-none relative"
          : "w-full bg-white rounded-[20px] border border-border-color shadow-sm hover:shadow-premium transition-all duration-250 p-4 flex flex-row items-center gap-4 text-left justify-between select-none relative group"
      }
    >
      {/* Top Overlays */}
      <div className="absolute top-3 left-3 z-10 flex justify-between items-center w-[calc(100%-24px)] pointer-events-none">
        {product.badge ? (
          <span className={`text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider pointer-events-auto ${
            product.badgeColor || 'bg-light-green text-primary-green border border-emerald-100/50'
          }`}>
            {product.badge}
          </span>
        ) : (
          <div className="w-1" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof toggleWishlist === 'function') {
              toggleWishlist(product);
            }
          }}
          className={`p-1.5 bg-white rounded-full border border-border-color transition-colors shadow-sm cursor-pointer pointer-events-auto ${
            isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {viewMode === 'grid' ? (
        /* GRID MODE */
        <>
          {/* Product Image Wrapper (occupies ~55-60% of card height) */}
          <div className="w-full h-[145px] bg-white rounded-xl overflow-hidden relative flex items-center justify-center mt-4 mb-2 shrink-0">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-250"
            />
          </div>

          {/* Details & Cart Row */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="space-y-0.5">
              {/* Product Name (Fixed Height for Consistent Card Heights) */}
              <h3 className="text-[13.5px] font-bold text-gray-800 leading-snug line-clamp-2 h-[38px] group-hover:text-primary-green transition-colors" title={product.name}>
                {product.name}
              </h3>
              
              {/* Weight */}
              <span className="text-[11px] text-gray-400 font-semibold block">
                {product.weight}
              </span>

              {/* Rating */}
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 stroke-none" />
                <span className="font-extrabold text-gray-700">{product.rating || 4.5}</span>
                <span>({product.reviews || 50})</span>
              </div>
            </div>

            {/* Price & Actions Row */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2.5 w-full">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-[15.5px] font-black text-gray-800">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] font-bold text-gray-400 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.discount && (
                  <span className="text-[9px] font-extrabold text-red-500 bg-red-50 px-1 py-0.5 rounded leading-none w-max mt-0.5">
                    {product.discount}
                  </span>
                )}
              </div>

              {/* Add to Cart Button or Quantity Controls */}
              <div className="flex items-center gap-1 shrink-0">
                {product.stock <= 0 || !product.availability ? (
                  <button
                    disabled
                    className="px-2.5 py-1.5 bg-gray-100 text-gray-400 font-bold text-[10px] rounded-lg cursor-not-allowed select-none"
                  >
                    Out of Stock
                  </button>
                ) : qty > 0 ? (
                  <div className="flex items-center border border-primary-green rounded-lg overflow-hidden bg-white select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(product.id, -1);
                      }}
                      className="px-2 py-1 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-1.5 text-[11px] font-black text-gray-800 w-4 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (qty >= product.stock) {
                          toast.error(`Only ${product.stock} items available in stock.`);
                          return;
                        }
                        updateQuantity(product.id, 1);
                      }}
                      className="px-2 py-1 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        name: product.name,
                        weight: product.weight,
                        price: product.price,
                        image: product.image,
                        badge: product.badge || 'Fresh',
                        source: 'Farm Fresh'
                      });
                    }}
                    className="px-3 py-1.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[11.5px] rounded-lg transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* LIST MODE */
        <>
          <div className="w-[100px] h-[100px] bg-white rounded-xl overflow-hidden relative flex items-center justify-center p-1.5 border border-gray-50 shrink-0">
            <img
              src={imgSrc}
              alt={product.name}
              loading="lazy"
              onError={handleImageError}
              className="max-w-full max-h-full object-contain group-hover:scale-[1.03] transition-transform duration-250"
            />
          </div>

          <div className="flex-1 flex flex-col justify-between h-[100px] pl-2">
            <div className="space-y-0.5">
              <h3 className="text-[14px] font-bold text-gray-800 leading-snug line-clamp-1 group-hover:text-primary-green transition-colors" title={product.name}>
                {product.name}
              </h3>
              <span className="text-[11px] text-gray-400 font-semibold block">
                {product.weight}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 stroke-none" />
                <span className="font-extrabold text-gray-700">{product.rating || 4.5}</span>
                <span>({product.reviews || 50})</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[16px] font-black text-gray-800">
                  ₹{product.price}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-[11px] font-bold text-gray-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="text-[9.5px] font-extrabold text-red-500 bg-red-50 px-1 py-0.5 rounded leading-none ml-1">
                    {product.discount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {product.stock <= 0 || !product.availability ? (
                  <button
                    disabled
                    className="px-2.5 py-1.5 bg-gray-100 text-gray-400 font-bold text-[10px] rounded-lg cursor-not-allowed select-none"
                  >
                    Out of Stock
                  </button>
                ) : qty > 0 ? (
                  <div className="flex items-center border border-primary-green rounded-lg overflow-hidden bg-white select-none">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(product.id, -1);
                      }}
                      className="px-2.5 py-1.5 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-2 text-[12px] font-black text-gray-800 w-5 text-center">
                      {qty}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (qty >= product.stock) {
                          toast.error(`Only ${product.stock} items available in stock.`);
                          return;
                        }
                        updateQuantity(product.id, 1);
                      }}
                      className="px-2.5 py-1.5 cursor-pointer hover:bg-light-green text-primary-green hover:text-dark-green transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        id: product.id,
                        name: product.name,
                        weight: product.weight,
                        price: product.price,
                        image: product.image,
                        badge: product.badge || 'Fresh',
                        source: 'Farm Fresh'
                      });
                    }}
                    className="px-3.5 py-1.5 bg-primary-green hover:bg-dark-green text-white font-bold text-[11.5px] rounded-lg transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
