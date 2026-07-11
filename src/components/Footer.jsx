import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 pb-10">
      <div className="w-full bg-dark-green text-white rounded-[32px] p-8 lg:p-14 shadow-premium relative overflow-hidden">
        
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-10 border-b border-white/10">
          
          {/* Left Side: Newsletter (5 columns) */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h3 className="text-[24px] lg:text-[28px] font-black tracking-tight leading-tight mb-2">
              Stay Updated with Karshaq
            </h3>
            <p className="text-gray-300 text-[14px] lg:text-[15px] font-medium mb-6">
              Get the best offers, new arrivals & health tips.
            </p>
            
            {/* Input Form */}
            <form onSubmit={(e) => e.preventDefault()} className="w-full max-w-[420px] flex items-center bg-white rounded-xl p-1.5 shadow-sm">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-transparent px-4 py-2.5 text-gray-800 placeholder-gray-400 text-[14px] font-medium outline-none"
                required
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-green hover:bg-[#205C23] text-white font-bold text-[14px] rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Right Side: Columns (7 columns) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 text-left">
            {/* Column 1: About Us */}
            <div>
              <h4 className="text-[15px] font-extrabold text-white uppercase tracking-wider mb-4.5">
                About Us
              </h4>
              <ul className="flex flex-col gap-3 text-[14px] font-semibold text-gray-300">
                <li><a href="#story" className="hover:text-white transition-colors">Our Story</a></li>
                <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#blog" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            {/* Column 2: Help */}
            <div>
              <h4 className="text-[15px] font-extrabold text-white uppercase tracking-wider mb-4.5">
                Help
              </h4>
              <ul className="flex flex-col gap-3 text-[14px] font-semibold text-gray-300">
                <li><a href="#faqs" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#shipping" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#returns" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div>
              <h4 className="text-[15px] font-extrabold text-white uppercase tracking-wider mb-4.5">
                Legal
              </h4>
              <ul className="flex flex-col gap-3 text-[14px] font-semibold text-gray-300">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Column 4: Follow Us */}
            <div>
              <h4 className="text-[15px] font-extrabold text-white uppercase tracking-wider mb-4.5">
                Follow Us
              </h4>
              <div className="flex items-center gap-3">
                <a 
                  href="#instagram" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5 text-[#E1306C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a 
                  href="#facebook" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </a>
                <a 
                  href="#whatsapp" 
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                  aria-label="WhatsApp"
                >
                  <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-[13px] font-semibold text-gray-300">
            © 2026 Karshaq. All rights reserved.
          </p>

          {/* Payment Badges */}
          <div className="flex items-center gap-3.5 select-none opacity-90">
            <span className="text-[11px] font-extrabold text-gray-400 tracking-wider uppercase mr-1">We Accept</span>
            {/* Visa */}
            <div className="bg-white/95 text-blue-900 font-extrabold text-[12px] px-3 py-1 rounded shadow-sm flex items-center justify-center h-6.5">
              VISA
            </div>
            {/* Mastercard */}
            <div className="bg-white/95 text-red-600 font-extrabold text-[12px] px-2.5 py-1 rounded shadow-sm flex items-center justify-center h-6.5">
              mastercard
            </div>
            {/* UPI */}
            <div className="bg-white/95 text-cyan-600 font-extrabold text-[12px] px-3 py-1 rounded shadow-sm flex items-center justify-center h-6.5">
              UPI
            </div>
            {/* GPay */}
            <div className="bg-white/95 text-gray-800 font-extrabold text-[12px] px-3 py-1 rounded shadow-sm flex items-center justify-center h-6.5">
              G Pay
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
