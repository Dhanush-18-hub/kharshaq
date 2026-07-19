import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Check, Info, Lock } from 'lucide-react';

export default function CouponSelectionModal({ 
  isOpen, 
  onClose, 
  applicableCoupons = [], 
  notApplicableCoupons = [], 
  onApplyCoupon, 
  activeCouponCode 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Modal content box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-lg rounded-3xl border border-gray-100 shadow-premium overflow-hidden z-10 flex flex-col max-h-[85vh] relative"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-[20px] font-black text-gray-800 flex items-center gap-2">
                Available Coupons <Ticket className="w-5 h-5 text-primary-green" />
              </h2>
              <p className="text-[12px] text-gray-400 font-bold mt-1">Select from eligible coupons to apply savings</p>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body List */}
          <div className="p-6 overflow-y-auto flex flex-col gap-5 text-left">
            
            {/* Applicable Section */}
            {applicableCoupons.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[12.5px] font-extrabold text-emerald-700 uppercase tracking-wider select-none">
                  Eligible Coupons ({applicableCoupons.length})
                </h3>
                
                {applicableCoupons.map((coupon) => {
                  const isActive = activeCouponCode === coupon.code;
                  return (
                    <div 
                      key={coupon.code}
                      onClick={() => {
                        onApplyCoupon(coupon.code);
                        onClose();
                      }}
                      className={`border rounded-2xl p-4.5 transition-all cursor-pointer flex justify-between items-center gap-4 relative group ${
                        isActive 
                          ? 'border-primary-green bg-emerald-50/20' 
                          : 'border-emerald-100 bg-emerald-50/5 hover:border-primary-green/50'
                      }`}
                    >
                      <div className="flex gap-3.5 items-start">
                        <div className="w-10 h-10 rounded-xl bg-light-green text-primary-green flex items-center justify-center shrink-0 mt-0.5">
                          <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[15px] font-black text-gray-800 flex items-center gap-1.5">
                            {coupon.code}
                            {isActive && (
                              <span className="text-[9px] bg-primary-green text-white font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                                Applied
                              </span>
                            )}
                          </span>
                          <p className="text-[13px] text-gray-600 font-bold mt-0.5 leading-snug">{coupon.description}</p>
                          <p className="text-[11px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5" /> Min Purchase: ₹{coupon.minimum_order}
                          </p>
                        </div>
                      </div>

                      <button
                        className={`text-[12.5px] font-black px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                          isActive 
                            ? 'bg-primary-green text-white shadow-sm' 
                            : 'bg-emerald-100/50 hover:bg-primary-green text-primary-green hover:text-white'
                        }`}
                      >
                        {isActive ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Locked Section */}
            {notApplicableCoupons.length > 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-[12.5px] font-extrabold text-amber-700 uppercase tracking-wider select-none mt-2">
                  Locked Coupons ({notApplicableCoupons.length})
                </h3>
                
                {notApplicableCoupons.map((coupon) => (
                  <div 
                    key={coupon.code}
                    className="border border-gray-150 bg-gray-50/50 rounded-2xl p-4.5 flex justify-between items-center gap-4 opacity-75 select-none"
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[15px] font-extrabold text-gray-400 flex items-center gap-1.5">
                          {coupon.code}
                        </span>
                        <p className="text-[13px] text-gray-400 font-bold mt-0.5 leading-snug">{coupon.description}</p>
                        <p className="text-[11.5px] text-amber-600 font-extrabold mt-2 flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg w-max">
                          <Info className="w-3.5 h-3.5 shrink-0" /> {coupon.eligibility_message || `Min order ₹${coupon.minimum_order} required.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {applicableCoupons.length === 0 && notApplicableCoupons.length === 0 && (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Ticket className="w-8 h-8" />
                <span className="text-[13px] font-bold">No coupons available right now.</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
