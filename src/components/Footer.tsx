import React, { useState } from 'react';
import { Send, Check, ShieldCheck, Heart, MessageCircle, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProductCategory } from '../types';
import { WHATSAPP_LINK, INSTAGRAM_LINK, INSTAGRAM_HANDLE } from '../constants/contact';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAbout,
  onOpenContact,
}) => {
  const { language, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#1C1815] text-[#FAF9F5] border-t border-[#312B25] pt-16 pb-12 text-start">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="pb-12 mb-12 border-b border-[#2E2822] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <h3 className="text-xl sm:text-2xl font-display font-medium text-white mb-2">
              {t('newsletterTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-[#A89A8D] max-w-md">
              {t('newsletterSubtitle')}
            </p>
          </div>

          <div className="lg:col-span-6">
            {isSubscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#26201B] border border-emerald-800/60 rounded-sm text-xs text-emerald-400">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t('subscribed')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('newsletterPlaceholder')}
                  className="flex-1 px-4 py-3 text-xs bg-[#29231E] border border-[#40362E] rounded-sm text-white placeholder-[#8A7C70] focus:outline-hidden focus:border-[#E5B887]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#8C532B] hover:bg-[#A36437] text-white text-xs font-medium tracking-wide rounded-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>{t('subscribe')}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12 text-xs">
          
          <div className="lg:col-span-2 space-y-4">
            <div>
              <span className="text-2xl font-serif font-semibold text-white tracking-tight">
                GLOWISTIC
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-[#E5B887] mt-1">
                {language === 'ckb' ? 'گلۆویستیک' : language === 'ar' ? 'غلويستيك' : 'Luxury Beauty & Cosmetics'}
              </span>
            </div>

            <p className="text-xs text-[#9E9084] leading-relaxed max-w-sm">
              {t('tagline')} — Authenticity, Botanical Science & Royal Elegance. Delivering pristine certified formulas directly to Kurdistan & Iraqi governorates.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#A8988A] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#E5B887]" />
              <span>{t('secureShoppingBadge')}</span>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#85E3A0] hover:text-white transition-colors text-xs font-medium cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{t('contactWhatsapp')}</span>
              </a>

              <a
                href={INSTAGRAM_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs bg-[#E1306C]/15 hover:bg-[#E1306C]/25 border border-[#E1306C]/35 text-[#F692B4] hover:text-white transition-colors text-xs font-medium cursor-pointer shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-[#E1306C]" />
                <span>{t('contactInstagram')}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-white text-xs mb-3">
              {t('categories')}
            </h4>
            <ul className="space-y-2 text-[#A89A8D]">
              <li>
                <button
                  onClick={() => onSelectCategory('skincare')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('catSkincare')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('makeup')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('catMakeup')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('haircare')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('catHaircare')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('fragrance')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('catFragrance')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-white text-xs mb-3">
              {t('aboutUs')}
            </h4>
            <ul className="space-y-2 text-[#A89A8D]">
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('aboutUs')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenContact}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  {t('contact')}
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('boutiqueTitle')}
                </span>
              </li>
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#65D285] hover:text-[#88E5A3] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{t('contactWhatsapp')}</span>
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#E7799B] hover:text-[#F3A4BC] transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>{t('contactInstagram')}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold uppercase tracking-wider text-white text-xs mb-3">
              {t('customerCare')}
            </h4>
            <ul className="space-y-2 text-[#A89A8D]">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('faq')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('returnPolicy')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Track Delivery
                </span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-[#29231E] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#85766A]">
          <p>© {new Date().getFullYear()} Glowistic. {t('allRightsReserved')}.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-[#E5B887] fill-[#E5B887]" />
            <span>for Erbil, Sulaymaniyah, Baghdad & Beyond</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
