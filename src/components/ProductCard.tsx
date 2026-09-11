import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star, Check } from 'lucide-react';
import { Product, ProductShade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useReviews } from '../context/ReviewsContext';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, shade?: ProductShade) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const { getProductStats } = useReviews();
  const stats = getProductStats(product.id);
  const displayRating = stats.reviewsCount > 0 ? stats.rating.toFixed(1) : '-';
  const displayCount = stats.reviewsCount;

  const [selectedShade, setSelectedShade] = useState<ProductShade | undefined>(
    product.shades ? product.shades[0] : undefined
  );
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedShade);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  };

  const badgeText = product.isCollection
    ? (language === 'ckb' ? 'سێت / کۆڵێکشن' : language === 'ar' ? 'طقم / مجموعة' : 'Value Set / Duo')
    : product.isBestSeller
    ? t('bestSeller')
    : product.isTrending
    ? t('trending')
    : product.isNew
    ? t('newArrival')
    : undefined;

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative bg-[#FAF9F5] border border-[#EAE3D9] hover:border-[#D5C4B0] rounded-sm overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col justify-between cursor-pointer"
    >
      <div className="relative aspect-4/3 sm:aspect-1/1 w-full overflow-hidden bg-[#F4EFEA]">
        <ProductImage
          src={product.image}
          alt={product.name[language] || product.name.en}
          category={product.category}
          className="w-full h-full"
          badge={badgeText}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 end-3 z-10 p-2 rounded-full bg-white/85 backdrop-blur-xs text-[#2C2723] hover:text-[#8C532B] hover:bg-white shadow-xs transition-colors cursor-pointer"
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? 'fill-[#8C532B] text-[#8C532B]' : ''
            }`}
          />
        </button>

        <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2 bg-white/95 backdrop-blur-xs hover:bg-white text-[#1A1816] text-xs font-medium tracking-wide rounded-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-[#8C532B]" />
            <span>{t('quickView')}</span>
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between text-start">
        <div>
          <div className="flex items-center gap-2 text-[11px] text-[#786B5E] mb-1.5 font-sans">
            <span className="uppercase tracking-wider">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.volume}</span>
          </div>

          <h3 className="text-sm sm:text-base font-medium text-[#1A1816] group-hover:text-[#8C532B] transition-colors line-clamp-1 mb-1">
            {product.name[language] || product.name.en}
          </h3>

          <p className="text-xs text-[#6B5E52] line-clamp-1 mb-3">
            {product.subtitle[language] || product.subtitle.en}
          </p>

          {product.shades && product.shades.length > 0 && (
            <div className="flex items-center gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
              <span className="text-[10px] text-[#8A7B6E] me-1">{t('shade')}:</span>
              {product.shades.map((shade) => (
                <button
                  key={shade.id}
                  onClick={() => setSelectedShade(shade)}
                  className={`w-4 h-4 rounded-full border transition-all cursor-pointer ${
                    selectedShade?.id === shade.id
                      ? 'ring-1 ring-[#1A1816] scale-110'
                      : 'border-black/10'
                  }`}
                  style={{ backgroundColor: shade.hex }}
                  title={shade.name[language] || shade.name.en}
                />
              ))}
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#EFE8DE] flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-sm sm:text-base font-bold text-[#1A1816] font-mono tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#8F8174] line-through font-mono tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-[#E5B887] text-[#E5B887]" />
              <span className="text-[11px] font-mono text-[#5C5248]">
                {displayRating}
              </span>
              <span className="text-[10px] text-[#8A7B6E]">
                ({displayCount})
              </span>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={justAdded}
            className={`px-3 py-2 rounded-sm text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1A1816] text-[#FAF9F5] hover:bg-[#322A23] shadow-xs'
            }`}
            aria-label="Add to bag"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t('addedToCart')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#E5B887]" />
                <span className="hidden xs:inline">{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
