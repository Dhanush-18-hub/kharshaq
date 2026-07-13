import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCarousel from './ProductCarousel';

export default function FeaturedProducts({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const { homepageData } = useAuth();
  const products = homepageData?.featured_products || [];
  const settings = homepageData?.settings || {};
  
  const isSlider = settings.featured_products_slider ?? true;
  const isAutoplay = settings.featured_products_autoplay ?? false;

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      title="Featured Products"
      id="featured-products"
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
