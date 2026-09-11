import React from 'react';
import { ArrowLeft, ArrowRight, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroProps {
  onShopClick: () => void;
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick, onExploreClick }) => {
  const { isRTL, t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-[#F5EFE6] border-b border-[#E8DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start z-10 text-start">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8C532B] mb-4">
              <span>{t('heroBadge')}</span>
              <span aria-hidden="true" className="text-[#C5B3A1]">·</span>
              <span>2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#1A1816] tracking-normal leading-[1.3] sm:leading-[1.25] mb-6">
              {t('heroTitle')}
            </h1>

            <p className="text-base sm:text-lg text-[#5A5046] font-normal leading-relaxed mb-8 max-w-2xl">
              {t('heroSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onShopClick}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1A1816] text-[#FAF9F5] text-sm font-medium tracking-wide rounded-sm hover:bg-[#322A23] transition-all flex items-center justify-center gap-3 group cursor-pointer shadow-md hover:shadow-lg"
              >
                <span>{t('shopNow')}</span>
                {isRTL ? (
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-7 py-3.5 border border-[#D5C7B7] bg-white/70 text-[#2C2621] text-sm font-medium tracking-wide rounded-sm hover:bg-white hover:border-[#1A1816] transition-all cursor-pointer"
              >
                {t('exploreCollection')}
              </button>
            </div>

            {/* Claims metrics */}
            <div className="mt-12 pt-8 border-t border-[#E5DACE] grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-xl text-start">
              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#1A1816] tabular-nums">
                  100%
                </div>
                <div className="text-xs text-[#706456] mt-0.5 leading-snug">
                  {t('heroStat1')}
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#1A1816] tabular-nums">
                  25k+
                </div>
                <div className="text-xs text-[#706456] mt-0.5 leading-snug">
                  {t('heroStat2')}
                </div>
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#1A1816] tabular-nums">
                  24-48h
                </div>
                <div className="text-xs text-[#706456] mt-0.5 leading-snug">
                  {t('heroStat3')}
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-sm overflow-hidden shadow-2xl border border-[#E8DFD3] bg-[#EAE2D5] aspect-4/3 sm:aspect-16/11 lg:aspect-4/5 group">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80"
                alt="Luxury cosmetics and skincare collection"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

              <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} bg-white/95 backdrop-blur-md p-3.5 rounded-sm border border-white/60 shadow-lg max-w-[260px] text-start`}>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-[#8C532B]" />
                  <span className="text-[11px] font-semibold text-[#1A1816]">
                    Authenticity Certified
                  </span>
                </div>
                <p className="text-[11px] text-[#6E6153] leading-snug">
                  Direct from Paris & Seoul ateliers with temperature-controlled vaults.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
