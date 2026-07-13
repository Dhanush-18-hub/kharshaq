import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCarousel from './ProductCarousel';

export default function BestSellers({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const { homepageData } = useAuth();

  // Pick best sellers dynamically from homepageData, or fallback
  const bestSellersList = homepageData?.best_sellers || [];
  const settings = homepageData?.settings || {};

  const slider = settings.best_sellers_slider ?? true;
  const autoplay = settings.best_sellers_autoplay ?? false;

  if (!bestSellersList || bestSellersList.length === 0) return null;

  return (
    <ProductCarousel
      title="Best Sellers"
      id="bestsellers"
      products={bestSellersList}
      slider={slider}
      autoplay={autoplay}
      addToCart={addToCart}
      getItemQuantity={getItemQuantity}
      updateQuantity={updateQuantity}
      toggleWishlist={toggleWishlist}
      isInWishlist={isInWishlist}
    />
  );
}
