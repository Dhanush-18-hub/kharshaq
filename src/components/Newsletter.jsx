import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Newsletter() {
  const { homepageData } = useAuth();
  const newsletter = homepageData?.newsletter || {};

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter a valid email address.');

    setSubmitting(true);
    setTimeout(() => {
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
      setSubmitting(false);
    }, 1000);
  };

  if (!newsletter.heading) return null;

  // Custom inline styles for background color or image
  const cardStyle = {
    backgroundColor: newsletter.bg_color || '#E8F5E9',
    backgroundImage: newsletter.bg_image ? `url(${newsletter.bg_image})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <section id="newsletter" className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-10 animate-fadeIn">
      <div
        style={cardStyle}
        className="w-full rounded-[32px] border border-border-color shadow-premium p-8 lg:p-16 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-10 select-none"
      >
        {/* Background Decorative Blur (only shown when no custom background image) */}
        {!newsletter.bg_image && (
          <div className="absolute right-[-10%] bottom-[-20%] w-[350px] h-[350px] bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* Content Block */}
        <div className="text-left max-w-xl z-10">
          {newsletter.offer && (
            <span className="inline-flex items-center gap-1 text-[12px] font-extrabold text-primary-green tracking-wide uppercase bg-white border border-emerald-100 px-3.5 py-1.5 rounded-full mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> {newsletter.offer}
            </span>
          )}
          <h2 className="text-[30px] lg:text-[40px] font-black text-gray-800 leading-tight">
            {newsletter.heading}
          </h2>
          {newsletter.description && (
            <p className="text-gray-500 text-[15px] lg:text-[17px] font-semibold mt-3 max-w-[460px] leading-relaxed">
              {newsletter.description}
            </p>
          )}
        </div>

        {/* Form Block */}
        <form onSubmit={handleSubscribe} className="w-full lg:w-auto min-w-[320px] sm:min-w-[460px] z-10">
          <div className="relative w-full flex items-center bg-white p-2 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-gray-150 focus-within:border-primary-green transition-all">
            <Mail className="w-5 h-5 text-gray-400 ml-3.5 shrink-0" />
            <input
              type="email"
              placeholder="Enter your email address"
              className="w-full px-3 py-3 bg-transparent text-[15px] font-semibold text-gray-700 placeholder-gray-400 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3.5 bg-primary-green text-white font-bold text-[14px] rounded-xl hover:bg-dark-green transition-colors cursor-pointer shrink-0 disabled:opacity-70"
            >
              {submitting ? 'Subscribing...' : newsletter.btn_text || 'Subscribe'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
