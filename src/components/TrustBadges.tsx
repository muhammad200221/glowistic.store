import React from 'react';
import { ShieldCheck, Truck, Sparkles, RotateCcw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  const badges = [
    {
      icon: ShieldCheck,
      title: t('trust1Title'),
      desc: t('trust1Desc'),
    },
    {
      icon: Truck,
      title: t('trust2Title'),
      desc: t('trust2Desc'),
    },
    {
      icon: Sparkles,
      title: t('trust3Title'),
      desc: t('trust3Desc'),
    },
    {
      icon: RotateCcw,
      title: t('trust4Title'),
      desc: t('trust4Desc'),
    },
  ];

  return (
    <section className="bg-[#FAF9F5] border-b border-[#EAE3D9] py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {badges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 rounded-sm bg-white/50 border border-[#EFE8DE] hover:border-[#DECFC0] transition-colors"
              >
                <div className="w-10 h-10 rounded-sm bg-[#F4EDE4] text-[#8C532B] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <h3 className="text-sm font-semibold text-[#1A1816] mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-xs text-[#6B5E52] leading-relaxed">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
