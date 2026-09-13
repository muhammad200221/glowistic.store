import React, { useState, useMemo } from 'react';
import { X, Search, ArrowRight, ArrowLeft, Droplets, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductImage } from './ProductImage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const { language, isRTL, formatPrice, t } = useLanguage();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!isOpen || !query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchCkb = p.name.ckb.toLowerCase().includes(q) || p.subtitle.ckb.toLowerCase().includes(q);
      const matchAr = p.name.ar.toLowerCase().includes(q) || p.subtitle.ar.toLowerCase().includes(q);
      const matchEn = p.name.en.toLowerCase().includes(q) || p.subtitle.en.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      return matchCkb || matchAr || matchEn || matchBrand || matchCategory;
    });
  }, [isOpen, products, query]);

  if (!isOpen) return null;

  const quickPills = [
    { label: 'سێرۆم (Serum)', query: 'سێرۆم' },
    { label: 'سووراو (Lipstick)', query: 'سووراو' },
    { label: 'عوود (Oud)', query: 'عەتر' },
    { label: 'دژەخۆر (Sunscreen)', query: 'دژەخۆر' },
    { label: 'ئارگان (Argan)', query: 'ئارگان' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto">
      <div
        className="bg-[#FAF9F5] border border-[#DECFC0] w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden text-start animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-[#EAE3D9] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#8C532B] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-hidden text-[#1A1816]"
          />
          <button
            onClick={onClose}
            className="p-1.5 text-[#736456] hover:text-[#1A1816] rounded-full hover:bg-[#F3EDE2] transition-colors cursor-pointer"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 bg-[#F6F1E9] border-b border-[#EAE3D9] flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[#78695C] me-1">Popular Searches:</span>
          {quickPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => setQuery(pill.query)}
              className="px-2.5 py-1 rounded-sm bg-white border border-[#E0D5C7] text-xs text-[#2A241F] hover:border-[#8C532B] hover:text-[#8C532B] transition-colors cursor-pointer"
            >
              {pill.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-[#7A6D60]">
              <Sparkles className="w-6 h-6 text-[#9A8775] mx-auto mb-2 opacity-60" />
              <p>Type keywords to search through our luxury catalog</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A6D60]">
              <p>No formulations found matching "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3 rounded-sm bg-white border border-[#EAE3D9] hover:border-[#8C532B] hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-sm overflow-hidden bg-[#F3EDE6] shrink-0 border border-[#EAE3D9]">
                    <ProductImage
                      src={product.image}
                      alt={product.name[language] || product.name.en}
                      category={product.category}
                      className="w-full h-full"
                      logoSize="sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] tracking-wider uppercase text-[#8C532B] font-semibold block">
                      {product.brand}
                    </span>
                    <h4 className="text-xs sm:text-sm font-medium text-[#1A1816] truncate group-hover:text-[#8C532B] transition-colors">
                      {product.name[language] || product.name.en}
                    </h4>
                    <span className="text-xs font-mono font-bold text-[#1A1816] tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {isRTL ? (
                    <ArrowLeft className="w-4 h-4 text-[#A8988A] group-hover:text-[#8C532B] transition-colors" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#A8988A] group-hover:text-[#8C532B] transition-colors" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
