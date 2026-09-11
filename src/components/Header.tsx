import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  ChevronDown,
  ShoppingBag,
  Heart,
  Search,
  Sparkles,
  Menu,
  X,
  Check,
} from 'lucide-react';
import { Language, ProductCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenSearch: () => void;
  onNavigateHome: () => void;
  onNavigateShop: () => void;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenSearch,
  onNavigateHome,
  onNavigateShop,
  onSelectCategory,
  onOpenAbout,
  onOpenContact,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; subLabel: string; flag: string }[] = [
    { code: 'ckb', label: 'کوردی (سۆرانی)', subLabel: 'Kurdish Sorani', flag: '☀️' },
    { code: 'ar', label: 'العربية', subLabel: 'Arabic', flag: '✨' },
    { code: 'en', label: 'English', subLabel: 'English (UK/US)', flag: '🌐' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#EAE3D9]">
      <div className="bg-[#1A1816] text-[#FAF9F5] text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#E5B887] shrink-0" />
            <span className="text-[11px] sm:text-xs tracking-wide">
              {t('announcement')}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            {/* Exclusive Iraqi Dinar currency badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#E0D5C7] bg-[#2A241F] px-2.5 py-0.5 rounded-xs border border-[#3E352C]">
              <span className="font-semibold text-[#E5B887]">د.ع</span>
              <span className="text-[10px] text-[#A89C8F]">IQD</span>
            </div>

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-[11px] text-[#D0C5B8] hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#E5B887]" />
                <span className="font-medium">
                  {languages.find((l) => l.code === language)?.label.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {langDropdownOpen && (
                <div className="absolute top-full end-0 mt-2 w-48 bg-white border border-[#E0D5C7] rounded-sm shadow-xl py-1.5 z-50 text-start">
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-[#8C7D70] border-b border-[#F0EAE1]">
                    Select Language / هەڵبژاردنی زمان
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-start px-3 py-2 text-xs text-[#1A1816] hover:bg-[#F6F1E9] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{l.flag}</span>
                        <div>
                          <div className="font-semibold">{l.label}</div>
                          <div className="text-[10px] text-[#8C7D70]">{l.subLabel}</div>
                        </div>
                      </div>
                      {language === l.code && (
                        <Check className="w-4 h-4 text-[#8C532B]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1816] hover:bg-[#F3EDE2] rounded-sm transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={onNavigateHome}
              className="text-start flex flex-col group cursor-pointer"
            >
              <span className="text-xl sm:text-2xl font-serif tracking-tight font-semibold text-[#1A1816] group-hover:text-[#8C532B] transition-colors">
                GLOWISTIC
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#8C532B] font-medium hidden sm:block">
                {language === 'ckb' ? 'گلۆویستیک' : language === 'ar' ? 'غلويستيك' : 'Luxury Beauty & Cosmetics'}
              </span>
            </button>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-xs font-medium text-[#2A241F]">
            <button
              onClick={onNavigateHome}
              className="hover:text-[#8C532B] transition-colors cursor-pointer tracking-wide"
            >
              {t('home')}
            </button>

            <button
              onClick={onNavigateShop}
              className="hover:text-[#8C532B] transition-colors cursor-pointer tracking-wide"
            >
              {t('shop')}
            </button>

            <div className="relative group">
              <button
                onClick={onNavigateShop}
                className="flex items-center gap-1 hover:text-[#8C532B] transition-colors cursor-pointer tracking-wide py-2"
              >
                <span>{t('categories')}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <div className="absolute top-full start-0 w-44 bg-white border border-[#DECFC0] rounded-sm shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all text-start z-50">
                <button
                  onClick={() => onSelectCategory('skincare')}
                  className="w-full text-start px-4 py-2 text-xs text-[#2A241F] hover:bg-[#FAF6F0] hover:text-[#8C532B] cursor-pointer"
                >
                  {t('catSkincare')}
                </button>
                <button
                  onClick={() => onSelectCategory('makeup')}
                  className="w-full text-start px-4 py-2 text-xs text-[#2A241F] hover:bg-[#FAF6F0] hover:text-[#8C532B] cursor-pointer"
                >
                  {t('catMakeup')}
                </button>
                <button
                  onClick={() => onSelectCategory('haircare')}
                  className="w-full text-start px-4 py-2 text-xs text-[#2A241F] hover:bg-[#FAF6F0] hover:text-[#8C532B] cursor-pointer"
                >
                  {t('catHaircare')}
                </button>
                <button
                  onClick={() => onSelectCategory('fragrance')}
                  className="w-full text-start px-4 py-2 text-xs text-[#2A241F] hover:bg-[#FAF6F0] hover:text-[#8C532B] cursor-pointer"
                >
                  {t('catFragrance')}
                </button>
              </div>
            </div>

            <button
              onClick={onOpenAbout}
              className="hover:text-[#8C532B] transition-colors cursor-pointer tracking-wide"
            >
              {t('aboutUs')}
            </button>

            <button
              onClick={onOpenContact}
              className="hover:text-[#8C532B] transition-colors cursor-pointer tracking-wide"
            >
              {t('contact')}
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenSearch}
              className="p-2 text-[#2A241F] hover:text-[#8C532B] hover:bg-[#F3EDE2] rounded-full transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-[#2A241F] hover:text-[#8C532B] hover:bg-[#F3EDE2] rounded-full transition-colors cursor-pointer"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 end-1 w-4 h-4 bg-[#8C532B] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCart}
              className="relative p-2 text-[#2A241F] hover:text-[#8C532B] hover:bg-[#F3EDE2] rounded-full transition-colors cursor-pointer"
              aria-label="Shopping bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 end-1 w-4 h-4 bg-[#1A1816] text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EAE3D9] bg-[#FAF9F5] p-5 space-y-4 text-start">
          <div className="space-y-2 text-sm font-medium">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start py-2 text-[#1A1816] hover:text-[#8C532B]"
            >
              {t('home')}
            </button>
            <button
              onClick={() => {
                onNavigateShop();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start py-2 text-[#1A1816] hover:text-[#8C532B]"
            >
              {t('shop')}
            </button>
            <div className="ps-3 space-y-1.5 border-s border-[#DECFC0] my-2">
              <button
                onClick={() => {
                  onSelectCategory('skincare');
                  setMobileMenuOpen(false);
                }}
                className="block text-xs py-1 text-[#665A4E] hover:text-[#8C532B]"
              >
                {t('catSkincare')}
              </button>
              <button
                onClick={() => {
                  onSelectCategory('makeup');
                  setMobileMenuOpen(false);
                }}
                className="block text-xs py-1 text-[#665A4E] hover:text-[#8C532B]"
              >
                {t('catMakeup')}
              </button>
              <button
                onClick={() => {
                  onSelectCategory('haircare');
                  setMobileMenuOpen(false);
                }}
                className="block text-xs py-1 text-[#665A4E] hover:text-[#8C532B]"
              >
                {t('catHaircare')}
              </button>
              <button
                onClick={() => {
                  onSelectCategory('fragrance');
                  setMobileMenuOpen(false);
                }}
                className="block text-xs py-1 text-[#665A4E] hover:text-[#8C532B]"
              >
                {t('catFragrance')}
              </button>
            </div>
            <button
              onClick={() => {
                onOpenAbout();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start py-2 text-[#1A1816] hover:text-[#8C532B]"
            >
              {t('aboutUs')}
            </button>
            <button
              onClick={() => {
                onOpenContact();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start py-2 text-[#1A1816] hover:text-[#8C532B]"
            >
              {t('contact')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
