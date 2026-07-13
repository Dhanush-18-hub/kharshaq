import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Testimonials() {
  const { homepageData } = useAuth();
  const testimonials = homepageData?.testimonials || [];

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[12px] font-bold text-primary-green tracking-wider uppercase bg-[#E8F5E9] px-3 py-1.5 rounded-full">
          Customer Stories
        </span>
        <h2 className="text-[32px] lg:text-[38px] font-black text-gray-800 tracking-tight mt-3">
          What Our Customers Say
        </h2>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[26px] p-8 border border-border-color shadow-card hover:shadow-premium relative flex flex-col justify-between text-left select-none group"
          >
            {/* Top quote icon decoration */}
            <Quote className="absolute right-8 top-8 w-10 h-10 text-emerald-100 group-hover:text-emerald-200 transition-colors pointer-events-none" />

            <div>
              {/* Rating stars */}
              <div className="flex items-center gap-1.5 mb-5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < t.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-200'}`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-500 text-[15px] font-semibold leading-relaxed mb-6 italic">
                "{t.review}"
              </p>
            </div>

            {/* Author profile row */}
            <div className="flex items-center gap-4 border-t border-gray-50 pt-5">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-light-green/30 border border-emerald-100 flex items-center justify-center shrink-0">
                {t.photo ? (
                  <img src={t.photo} alt={t.customer_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-green font-bold text-sm">{t.customer_name.charAt(0)}</span>
                )}
              </div>
              <div>
                <h4 className="text-[16px] font-bold text-gray-800 leading-tight">
                  {t.customer_name}
                </h4>
                <span className="text-[12px] text-gray-400 font-semibold mt-0.5 block">
                  Verified Purchaser
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
