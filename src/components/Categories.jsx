import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Categories({ setActiveTab }) {
  const { homepageData } = useAuth();
  const navigate = useNavigate();

  // Load from homepageData, or fallback
  const list = homepageData?.categories || [];
  
  const dynamicCategories = list.length > 0 ? list.map(cat => ({
    id: cat.id,
    slug: cat.slug,
    title: cat.name,
    image: cat.image || '/category_fruits.png',
    bg: cat.bg_color || 'bg-white',
    link: cat.link
  })) : [
    { id: 'fruits', slug: 'fruits', title: 'Fruits', image: '/category_fruits.png', bg: '#FFF', link: '/fruits' },
    { id: 'vegetables', slug: 'vegetables', title: 'Vegetables', image: '/category_vegetables.png', bg: '#FFF', link: '/vegetables' },
    { id: 'spices', slug: 'spices', title: 'Spices', image: '/category_spices.png', bg: '#FFF', link: '/spices' },
    { id: 'dryfruits', slug: 'dryfruits', title: 'Dry Fruits', image: '/category_dryfruits.png', bg: '#FFF', link: '/dryfruits' }
  ];

  const handleCardClick = (cat) => {
    if (cat.link) {
      if (cat.link.startsWith('http')) {
        window.location.href = cat.link;
      } else {
        navigate(cat.link);
      }
    } else {
      setActiveTab(cat.slug);
    }
  };

  return (
    <section id="categories" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[32px] lg:text-[38px] font-black text-gray-800 tracking-tight">
          Shop by Category
        </h2>
        <a
          href="#categories"
          className="text-primary-green hover:text-dark-green text-[15px] lg:text-[16px] font-bold flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          View All Categories <span className="group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {dynamicCategories.map((cat, index) => (
          <motion.div
            key={cat.id}
            onClick={() => handleCardClick(cat)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            style={{ backgroundColor: cat.bg.startsWith('#') ? cat.bg : undefined }}
            className={`relative rounded-[22px] p-5 ${!cat.bg.startsWith('#') ? cat.bg : 'bg-white'} border border-border-color shadow-card hover:shadow-premium transition-all duration-300 flex flex-col items-center cursor-pointer overflow-hidden group select-none`}
          >
            {/* Circle Accent behind product */}
            <div className="w-[120px] h-[120px] rounded-full bg-light-green/40 absolute top-4 group-hover:scale-110 transition-transform duration-300 -z-0" />

            {/* Product Image */}
            <div className="w-full aspect-square flex items-center justify-center mb-4 relative z-10">
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="max-h-[110px] max-w-[110px] object-cover rounded-full mix-blend-multiply group-hover:scale-108 transition-transform duration-300"
              />
            </div>

            {/* Category Title */}
            <h3 className="text-[16px] lg:text-[17px] font-extrabold text-gray-800 group-hover:text-primary-green transition-colors relative z-10 capitalize">
              {cat.title}
            </h3>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
