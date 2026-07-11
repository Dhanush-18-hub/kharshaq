import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Categories({ setActiveTab }) {
  const { categories } = useAuth();

  const dynamicCategories = categories && categories.length > 0 ? categories.map(cat => {
    let tabId = 'Fruits';
    const catNameLower = cat.name.toLowerCase();
    if (catNameLower.includes('fruit')) tabId = 'Fruits';
    else if (catNameLower.includes('veg')) tabId = 'Vegetables';
    else if (catNameLower.includes('spice')) tabId = 'Spices';
    else if (catNameLower.includes('dry')) tabId = 'Dry Fruits';
    else if (catNameLower.includes('other')) tabId = 'Offers';

    return {
      id: cat.name.toLowerCase().replace(/\s+/g, ''),
      title: cat.name,
      image: cat.image || '/category_fruits.png',
      bg: 'bg-white',
      tabId: tabId
    };
  }) : [
    { id: 'fruits', title: 'Fruits', image: '/category_fruits.png', bg: 'bg-white', tabId: 'Fruits' },
    { id: 'vegetables', title: 'Vegetables', image: '/category_vegetables.png', bg: 'bg-white', tabId: 'Vegetables' },
    { id: 'spices', title: 'Spices', image: '/category_spices.png', bg: 'bg-white', tabId: 'Spices' },
    { id: 'dryfruits', title: 'Dry Fruits', image: '/category_dryfruits.png', bg: 'bg-white', tabId: 'Dry Fruits' }
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 animate-fadeIn">
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
            onClick={() => setActiveTab(cat.tabId)}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className={`relative rounded-[22px] p-5 ${cat.bg} border border-border-color shadow-card hover:shadow-premium transition-all duration-300 flex flex-col items-center cursor-pointer overflow-hidden group select-none`}
          >
            {/* Circle Accent behind product */}
            <div className="w-[120px] h-[120px] rounded-full bg-light-green/40 absolute top-4 group-hover:scale-110 transition-transform duration-300 -z-0" />

            {/* Product Image */}
            <div className="w-full aspect-square flex items-center justify-center mb-4 relative z-10">
              <img
                src={cat.image}
                alt={cat.title}
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
