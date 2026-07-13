import React from 'react';
import { useAuth } from '../context/AuthContext';
import ProductCarousel from './ProductCarousel';

export default function TrendingProducts({ addToCart, getItemQuantity, updateQuantity, toggleWishlist, isInWishlist }) {
  const { homepageData } = useAuth();
  const products = homepageData?.trending_products || [];
  const settings = homepageData?.settings || {};
  
  const isSlider = settings.trending_products_slider ?? true;
  const isAutoplay = settings.trending_products_autoplay ?? false;

  if (!products || products.length === 0) return null;

  return (
    <ProductCarousel
      title="Trending Products"
      id="trending-products"
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
