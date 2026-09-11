import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface PromoBannerProps {
  onShopSale: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onShopSale }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 36,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('GLOW20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-[#24201C] text-[#FAF9F5] py-12 sm:py-16 border-y border-[#38322B] relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8C532B]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 text-start">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E5B887] mb-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('limitedOffer')}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-medium text-white mb-4">
              {t('promoTitle')}
            </h2>

            <p className="text-sm sm:text-base text-[#D0C5B8] leading-relaxed mb-6 max-w-xl">
              {t('promoSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-[#52473D] bg-[#1A1715] rounded-sm px-3.5 py-2.5">
                <span className="font-mono text-sm tracking-wider font-bold text-[#E5B887] me-3">
                  GLOW20
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-xs text-[#A89A8C] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy discount code"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">{t('codeCopied')}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{t('copyCode')}</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={onShopSale}
                className="px-6 py-2.5 bg-[#8C532B] hover:bg-[#A36437] text-white text-xs font-medium tracking-wide rounded-sm transition-all cursor-pointer shadow-md"
              >
                {t('shopPromo')}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
            <div className="bg-[#1A1715]/80 border border-[#3D352D] p-6 rounded-sm w-full max-w-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#352D26]">
                <div className="flex items-center gap-2 text-xs font-medium text-[#E5B887]">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('endsIn')}</span>
                </div>
                <span className="text-[11px] font-mono text-[#8C7D70]">
                  SPRING-SALE-2026
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#2A241F] border border-[#423830] p-3 rounded-sm">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white block tabular-nums">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-[#A39486]">
                    {t('hours')}
                  </span>
                </div>

                <div className="bg-[#2A241F] border border-[#423830] p-3 rounded-sm">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-white block tabular-nums">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-[#A39486]">
                    {t('minutes')}
                  </span>
                </div>

                <div className="bg-[#2A241F] border border-[#423830] p-3 rounded-sm">
                  <span className="text-2xl sm:text-3xl font-mono font-bold text-[#E5B887] block tabular-nums">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase text-[#A39486]">
                    {t('seconds')}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
