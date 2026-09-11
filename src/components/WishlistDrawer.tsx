import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductImage } from './ProductImage';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  wishlistIds: string[];
  onRemoveFromWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onClearWishlist?: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  products,
  wishlistIds,
  onRemoveFromWishlist,
  onAddToCart,
  onQuickView,
  onClearWishlist,
}) => {
  const { language, isRTL, formatPrice, t } = useLanguage();

  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 ${
          isRTL ? 'left-0' : 'right-0'
        } max-w-md w-full bg-[#FAF9F5] shadow-2xl flex flex-col justify-between z-50 text-start`}
      >
        <div className="p-5 border-b border-[#EAE3D9] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#8C532B] fill-[#8C532B]" />
            <h3 className="text-base font-semibold text-[#1A1816]">
              {t('wishlist')}
            </h3>
            <span className="text-xs font-mono text-[#8C7D70]">
              ({wishlistedProducts.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {wishlistedProducts.length > 0 && onClearWishlist && (
              <button
                type="button"
                onClick={onClearWishlist}
                className="text-[11px] text-[#8C7D70] hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                title={t('clearAll')}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearAll')}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#6B5E52] hover:text-[#1A1816] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3EDE2] text-[#8C532B] flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 opacity-40" />
              </div>
              <h4 className="text-base font-medium text-[#1A1816] mb-1">
                {t('emptyWishlist')}
              </h4>
              <p className="text-xs text-[#706456] max-w-xs mx-auto mb-6">
                {t('emptyWishlistSubtitle')}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1A1816] text-[#FAF9F5] text-xs font-medium rounded-sm hover:bg-[#322A23] transition-all cursor-pointer"
              >
                {t('startShopping')}
              </button>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 p-3 rounded-sm bg-white border border-[#EAE3D9]"
              >
                <div
                  onClick={() => {
                    onQuickView(product);
                    onClose();
                  }}
                  className="w-20 h-20 rounded-sm overflow-hidden bg-[#F3EDE6] shrink-0 border border-[#EAE3D9] cursor-pointer"
                >
                  <ProductImage
                    src={product.image}
                    alt={product.name[language] || product.name.en}
                    category={product.category}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          onQuickView(product);
                          onClose();
                        }}
                        className="text-xs font-medium text-[#1A1816] line-clamp-1 cursor-pointer hover:text-[#8C532B]"
                      >
                        {product.name[language] || product.name.en}
                      </h4>
                      <button
                        onClick={() => onRemoveFromWishlist(product)}
                        className="text-[#998A7D] hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-[#8C7D70]">
                      {product.volume}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EFE6]">
                    <span className="text-xs font-mono font-bold text-[#1A1816] tabular-nums">
                      {formatPrice(product.price)}
                    </span>

                    <button
                      onClick={() => {
                        onAddToCart(product);
                        onRemoveFromWishlist(product);
                      }}
                      className="px-3 py-1.5 bg-[#1A1816] text-[#FAF9F5] hover:bg-[#342D26] text-[11px] font-medium rounded-sm flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3 text-[#E5B887]" />
                      <span>{t('addToCart')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
