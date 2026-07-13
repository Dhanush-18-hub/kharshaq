import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCarousel from './ProductCarousel';

export default function NewArrivals({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const { homepageData } = useAuth();
  const products = homepageData?.new_arrivals || [];
  const settings = homepageData?.settings || {};
  
  const isSlider = settings.new_arrivals_slider ?? true;
  const isAutoplay = settings.new_arrivals_autoplay ?? false;

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      title="New Arrivals"
      id="new-arrivals"
      products={products}
      slider={isSlider}
      autoplay={isAutoplay}
      addToCart={addToCart}
      getItemQuantity={getItemQuantity}
      updateQuantity={updateQuantity}
      toggleWishlist={toggleWishlist}
      isInWishlist={isInWishlist}
    />
  );
}
