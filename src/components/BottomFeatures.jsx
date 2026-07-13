import React from 'react';
import { Leaf, Clock, Headset, FlaskConical, Truck, ShieldCheck, RotateCcw, Star, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomFeatures() {
  const { homepageData } = useAuth();
  const list = homepageData?.features || [];

  // Filter features to render. If empty, fall back to default list
  const displayFeatures = list.length > 0 ? list : [
    { icon: 'Leaf', title: 'Direct from Farms', subtitle: 'No middlemen' },
    { icon: 'FlaskConical', title: 'Chemical Free', subtitle: 'Healthy & natural' },
    { icon: 'Clock', title: 'On Time Delivery', subtitle: 'Fast & reliable' },
    { icon: 'Headset', title: 'Customer Support', subtitle: "We're here to help" }
  ];

  const renderIcon = (iconName) => {
    const icons = {
      Leaf: <Leaf className="w-6 h-6" />,
      Clock: <Clock className="w-6 h-6" />,
      Headset: <Headset className="w-6 h-6" />,
      FlaskConical: <FlaskConical className="w-6 h-6" />,
      Truck: <Truck className="w-6 h-6" />,
      ShieldCheck: <ShieldCheck className="w-6 h-6" />,
      RotateCcw: <RotateCcw className="w-6 h-6" />,
      Star: <Star className="w-6 h-6" />,
      Flame: <Flame className="w-6 h-6" />
    };
    return icons[iconName] || <Leaf className="w-6 h-6" />;
  };

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8 animate-fadeIn">
      <div className="w-full bg-white rounded-[22px] border border-border-color shadow-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {displayFeatures.map((feat, index) => (
          <div 
            key={feat.id || index} 
            className="flex items-center gap-4 text-left w-full md:w-auto md:flex-1 justify-start md:justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-light-green text-primary-green flex items-center justify-center shrink-0">
              {renderIcon(feat.icon)}
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-gray-800 leading-tight">
                {feat.title}
              </h4>
              <p className="text-[13px] text-gray-400 font-semibold mt-0.5">
                {feat.subtitle || feat.desc}
              </p>
            </div>
            {index < displayFeatures.length - 1 && (
              <div className="hidden lg:block h-10 w-[1px] bg-gray-150 ml-10 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
