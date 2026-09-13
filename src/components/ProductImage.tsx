import React, { useState } from 'react';
import { Sparkles, Droplets, Sparkle } from 'lucide-react';
import { ProductCategory } from '../types';
import brandLogoImg from '../assets/images/instagram_profile_logo_1789135947210.jpg';

export interface ProductImageProps {
  src?: string;
  alt: string;
  category?: ProductCategory;
  className?: string;
  badge?: string;
  showBrandLogo?: boolean;
  logoSize?: 'sm' | 'md' | 'lg';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category = 'skincare',
  className = '',
  badge,
  showBrandLogo = true,
  logoSize = 'md',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const categoryGradients: Record<ProductCategory, { bg: string; iconColor: string; label: string }> = {
    all: { bg: 'from-[#F7F3EE] to-[#EFE8DE]', iconColor: 'text-[#9A7356]', label: 'Glowistic' },
    skincare: { bg: 'from-[#FAF4EF] via-[#F4EBE1] to-[#EBDCCF]', iconColor: 'text-[#A0704F]', label: 'Botanical Skincare' },
    makeup: { bg: 'from-[#FDF2F2] via-[#F8E2E4] to-[#ECD1D4]', iconColor: 'text-[#963749]', label: 'Haute Makeup' },
    haircare: { bg: 'from-[#FAF6EE] via-[#F4EBD7] to-[#E5D7BE]', iconColor: 'text-[#8A6A32]', label: 'Pure Haircare' },
    fragrance: { bg: 'from-[#F7F3EE] via-[#EFE6DC] to-[#DECFC0]', iconColor: 'text-[#7D5C40]', label: 'Haute Parfumerie' },
  };

  const currentTheme = categoryGradients[category] || categoryGradients.skincare;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${currentTheme.bg} flex items-center justify-center ${className}`}>
      {src && !hasError ? (
        <>
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center animate-pulse">
              <Droplets className={`w-8 h-8 ${currentTheme.iconColor} opacity-40 mb-2`} />
              <span className="text-[11px] tracking-widest uppercase font-serif text-[#6D5A4B] opacity-60">
                {currentTheme.label}
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center transition-transform duration-700 group-hover:scale-105">
          <div className="w-16 h-16 rounded-full bg-white/70 backdrop-blur-xs border border-[#E6D8C8] flex items-center justify-center mb-3 shadow-xs">
            {category === 'makeup' ? (
              <Sparkles className={`w-7 h-7 ${currentTheme.iconColor}`} />
            ) : category === 'fragrance' ? (
              <Sparkle className={`w-7 h-7 ${currentTheme.iconColor}`} />
            ) : (
              <Droplets className={`w-7 h-7 ${currentTheme.iconColor}`} />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-widest uppercase text-[#876E5B]">
            {currentTheme.label}
          </span>
          <span className="text-xs font-serif italic text-[#635143] mt-1 line-clamp-1 max-w-[85%]">
            {alt}
          </span>
        </div>
      )}

      {badge && (
        <div className="absolute top-3 start-3 z-10">
          <span className="inline-block px-2.5 py-1 text-[11px] tracking-wide font-medium bg-[#1A1816]/90 text-white backdrop-blur-xs rounded-sm shadow-xs">
            {badge}
          </span>
        </div>
      )}

      {/* Brand Official Logo Watermark & Authenticity Seal */}
      {showBrandLogo && (
        <>
          {logoSize === 'sm' && (
            <div
              className="absolute bottom-1.5 start-1.5 z-10 pointer-events-none select-none drop-shadow-sm"
              title="GLOWISTIC Verified"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden p-[1px] bg-white/95 backdrop-blur-xs border border-[#D5B085]/80 shadow-xs flex items-center justify-center">
                <img
                  src={brandLogoImg}
                  alt="GLOWISTIC Brand Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          )}

          {logoSize === 'md' && (
            <div
              className="absolute bottom-2.5 start-2.5 z-10 pointer-events-none select-none transition-all duration-300 sm:group-hover:bottom-12 drop-shadow-sm"
              title="GLOWISTIC Verified Authentic"
            >
              <div className="flex items-center gap-1.5 py-1 ps-1 pe-2.5 rounded-full bg-white/92 backdrop-blur-md border border-[#E2D5C3]/90 shadow-sm transition-transform group-hover:scale-105">
                <div className="w-5 h-5 rounded-full overflow-hidden border border-[#C69C6D]/80 shrink-0 bg-[#1A1816]">
                  <img
                    src={brandLogoImg}
                    alt="GLOWISTIC"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[9.5px] font-serif font-bold tracking-widest text-[#1A1816] uppercase leading-none">
                  GLOWISTIC
                </span>
              </div>
            </div>
          )}

          {logoSize === 'lg' && (
            <div
              className="absolute bottom-3.5 start-3.5 z-10 pointer-events-none select-none drop-shadow-md"
              title="GLOWISTIC Boutique Verified Authentic"
            >
              <div className="flex items-center gap-2.5 py-1.5 ps-1.5 pe-3.5 rounded-full bg-white/95 backdrop-blur-md border border-[#D5B085]/70 shadow-md">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-[#C69C6D] shrink-0 bg-[#1A1816]">
                  <img
                    src={brandLogoImg}
                    alt="GLOWISTIC Brand Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col text-start">
                  <span className="text-[11px] font-serif font-bold tracking-widest text-[#1A1816] uppercase leading-tight">
                    GLOWISTIC
                  </span>
                  <span className="text-[8px] tracking-wider text-[#8C532B] font-medium uppercase leading-none">
                    Official Boutique · 100% Original
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
