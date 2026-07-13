import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCarousel from './ProductCarousel';

export default function SeasonalCollections({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const { homepageData } = useAuth();
  const collections = homepageData?.seasonal_collections || [];

  if (!collections || collections.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-8 py-4 animate-fadeIn">
      {collections.map((col) => (
        <div key={col.id} className="w-full">
          {/* Banner Block */}
          {col.banner && (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-4">
              <div className="w-full h-[220px] rounded-[32px] overflow-hidden relative border border-border-color shadow-card select-none group">
                <img
                  src={col.banner}
                  alt={col.title}
                  className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent flex flex-col justify-center items-start px-8 lg:px-16 text-left">
                  <span className="text-[11px] font-extrabold px-3 py-1 bg-primary-green text-white rounded-full uppercase tracking-wider mb-3">
                    Seasonal Campaign
                  </span>
                  <h3 className="text-[28px] lg:text-[34px] font-black text-white leading-tight">
                    {col.title}
                  </h3>
                  {col.description && (
                    <p className="text-gray-200 text-[14px] lg:text-[16px] font-medium mt-2 max-w-[480px] line-clamp-2">
                      {col.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Products List inside Campaign */}
          <ProductCarousel
            title={col.banner ? "" : col.title}
            id={`seasonal-${col.slug}`}
            products={col.products || []}
            slider={true}
            autoplay={false}
            addToCart={addToCart}
            getItemQuantity={getItemQuantity}
            updateQuantity={updateQuantity}
            toggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
          />
        </div>
      ))}
    </div>
  );
}
