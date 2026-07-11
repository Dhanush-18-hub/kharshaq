import React from 'react';
import { Leaf, Clock, Headset, FlaskConical } from 'lucide-react';

export default function BottomFeatures() {
  const features = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: 'Direct from Farms',
      desc: 'No middlemen',
    },
    {
      icon: <FlaskConical className="w-6 h-6" />,
      title: 'Chemical Free',
      desc: 'Healthy & natural',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'On Time Delivery',
      desc: 'Fast & reliable',
    },
    {
      icon: <Headset className="w-6 h-6" />,
      title: 'Customer Support',
      desc: "We're here to help",
    },
  ];

  return (
    <section className="w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
      <div className="w-full bg-white rounded-[22px] border border-border-color shadow-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {features.map((feat, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 text-left w-full md:w-auto md:flex-1 justify-start md:justify-center"
          >
            <div className="w-12 h-12 rounded-xl bg-light-green text-primary-green flex items-center justify-center shrink-0">
              {feat.icon}
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-gray-800 leading-tight">
                {feat.title}
              </h4>
              <p className="text-[13px] text-gray-400 font-semibold mt-0.5">
                {feat.desc}
              </p>
            </div>
            {index < features.length - 1 && (
              <div className="hidden lg:block h-10 w-[1px] bg-gray-150 ml-10 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
