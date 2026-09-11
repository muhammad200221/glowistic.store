import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Truck,
  Check,
  Minus,
  Plus,
  Share2,
  MessageSquare,
  PenLine,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Product, ProductShade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useReviews } from '../context/ReviewsContext';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, shade?: ProductShade, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

interface ProductDetailContentProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, shade?: ProductShade, quantity?: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

const ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) => {
  const { language, formatPrice, t } = useLanguage();
  const { getReviewsForProduct, getProductStats, addReview } = useReviews();

  const reviews = getReviewsForProduct(product.id);
  const stats = getProductStats(product.id);

  const [selectedShade, setSelectedShade] = useState<ProductShade | undefined>(
    product.shades ? product.shades[0] : undefined
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'ingredients' | 'safety'>('desc');
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Customer review form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setFormError(t('reviewRequiredError'));
      return;
    }
    setFormError('');
    addReview(product.id, {
      author: authorName,
      city: authorCity,
      rating,
      comment,
    });
    setAuthorName('');
    setAuthorCity('');
    setComment('');
    setRating(5);
    setIsFormOpen(false);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4500);
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedShade, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div
        className="relative bg-[#FAF9F5] border border-[#DECFC0] rounded-sm max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl my-auto text-start"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-[#1A1816] shadow-xs transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="relative aspect-1/1 w-full rounded-sm overflow-hidden bg-[#F3EDE6] border border-[#EAE3D9]">
              <ProductImage
                src={product.image}
                alt={product.name[language] || product.name.en}
                category={product.category}
                className="w-full h-full"
                badge={product.isBestSeller ? t('bestSeller') : undefined}
              />
            </div>

            <div className="bg-white p-3.5 rounded-sm border border-[#EAE3D9] space-y-2 text-xs text-[#5D5246]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8C532B] shrink-0" />
                <span>100% Original Prestige Formulation</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#8C532B] shrink-0" />
                <span>Express 24-48h Delivery across Erbil & Iraq</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 text-xs text-[#8A7B6E]">
                  <span className="uppercase tracking-widest font-semibold text-[#8C532B]">
                    {product.brand}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{product.volume}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="text-xs text-[#786B5D] hover:text-[#1A1816] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Share product"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{copiedShare ? 'Copied Link!' : t('shareProduct')}</span>
                </button>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1A1816] mb-2 leading-snug">
                {product.name[language] || product.name.en}
              </h2>

              <p className="text-xs sm:text-sm text-[#665A4E] mb-4">
                {product.subtitle[language] || product.subtitle.en}
              </p>

              <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#EAE3D9]">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        stats.reviewsCount > 0 && i < Math.round(stats.rating)
                          ? 'fill-[#E5B887] text-[#E5B887]'
                          : 'text-[#D5C9BD]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-medium text-[#1A1816]">
                  {stats.reviewsCount > 0 ? stats.rating.toFixed(1) : '-'}
                </span>
                <span className="text-xs text-[#8A7B6E]">
                  ({stats.reviewsCount} {t('reviews')})
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-mono font-bold text-[#1A1816] tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-mono text-[#8C7D6F] line-through tabular-nums">
                      {formatPrice(product.originalPrice * quantity)}
                    </span>
                  )}
                </div>

                <div className="text-end">
                  {product.inStock ? (
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                      {product.stockCount <= 10
                        ? t('onlyLeft', { count: product.stockCount })
                        : t('inStock')}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#B94E1A] bg-[#FAF1E8] px-2.5 py-1 rounded border border-[#E9D6C5] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#B94E1A]" />
                      <span>{t('currentlyUnavailable')}</span>
                    </span>
                  )}
                </div>
              </div>

              {product.shades && product.shades.length > 0 && (
                <div className="mb-6 p-4 rounded-sm bg-white/70 border border-[#EAE3D9]">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="font-medium text-[#1A1816]">{t('shade')}:</span>
                    <span className="text-[#8C532B] font-semibold">
                      {selectedShade?.name[language] || selectedShade?.name.en}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {product.shades.map((shade) => (
                      <button
                        key={shade.id}
                        onClick={() => setSelectedShade(shade)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-sm border transition-all cursor-pointer ${
                          selectedShade?.id === shade.id
                            ? 'border-[#1A1816] bg-[#FAF9F5] shadow-xs ring-1 ring-[#1A1816]'
                            : 'border-[#E0D7CC] hover:border-[#B5A593] bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: shade.hex }}
                        />
                        <span className="text-xs text-[#2A241F]">
                          {shade.name[language] || shade.name.en}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.isCollection && product.collectionItems && product.collectionItems.length > 0 && (
                <div className="mb-6 p-4 rounded-sm bg-[#F5EFEB] border border-[#E0D5C7]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8C532B] uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C532B]" />
                    <span>
                      {language === 'ckb'
                        ? 'ئەم کۆڵێکشنە پێکهاتووە لە ٢ بەرهەمی ئەسڵی:'
                        : language === 'ar'
                        ? 'تحتوي هذه المجموعة على منتجين بالحجم الكامل:'
                        : 'This Collection Includes 2 Full-Size Products:'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {product.collectionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 text-xs bg-white/95 p-2.5 rounded-sm border border-[#EAE3D9] shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#8C532B]/10 text-[#8C532B] font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-[#1A1816]">
                            {item.name[language] || item.name.en}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#8C532B] bg-[#F4EFEA] px-2 py-0.5 rounded-xs font-medium shrink-0">
                          {item.volume}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!product.inStock && (
                <div className="mb-6 p-4 rounded bg-[#FAF2E8] border border-[#ECDCCF] text-start flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#B94E1A] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-[#8C4A1E]">
                      {t('currentlyUnavailable')}
                    </div>
                    <div className="text-[#965A2C] leading-relaxed">
                      {t('restockingSoon')}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-8">
                {product.inStock && (
                  <div className="flex items-center border border-[#DECFC0] rounded-sm bg-white h-11">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 h-full text-[#54483C] hover:text-[#1A1816] disabled:opacity-40 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-[#1A1816] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={quantity >= product.stockCount}
                      className="px-3 h-full text-[#54483C] hover:text-[#1A1816] disabled:opacity-40 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || addedSuccess}
                  className={`flex-1 h-11 px-6 rounded-sm text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
                    !product.inStock
                      ? 'bg-[#EAE3DA] text-[#86786B] border border-[#DCD1C4] cursor-not-allowed shadow-none'
                      : addedSuccess
                      ? 'bg-emerald-700 text-white cursor-pointer shadow-md'
                      : 'bg-[#1A1816] text-[#FAF9F5] hover:bg-[#332A22] cursor-pointer shadow-md'
                  }`}
                >
                  {!product.inStock ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-[#86786B]" />
                      <span>{t('currentlyUnavailable')}</span>
                    </>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('addedToCart')}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#E5B887]" />
                      <span>{t('addToCart')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className="h-11 w-11 border border-[#DECFC0] rounded-sm bg-white hover:bg-[#F3EDE2] text-[#1A1816] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isWishlisted ? 'fill-[#8C532B] text-[#8C532B]' : 'text-[#5A4E42]'
                    }`}
                  />
                </button>
              </div>

              <div className="border-t border-[#EAE3D9] pt-6">
                <div className="flex border-b border-[#EAE3D9] mb-4 gap-6 overflow-x-auto text-xs font-medium">
                  <button
                    onClick={() => setActiveTab('desc')}
                    className={`pb-2 transition-colors cursor-pointer whitespace-nowrap relative ${
                      activeTab === 'desc'
                        ? 'text-[#1A1816] font-semibold border-b-2 border-[#8C532B]'
                        : 'text-[#7D6E60] hover:text-[#1A1816]'
                    }`}
                  >
                    {t('tabDescription')}
                  </button>

                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`pb-2 transition-colors cursor-pointer whitespace-nowrap relative ${
                      activeTab === 'usage'
                        ? 'text-[#1A1816] font-semibold border-b-2 border-[#8C532B]'
                        : 'text-[#7D6E60] hover:text-[#1A1816]'
                    }`}
                  >
                    {t('tabHowToUse')}
                  </button>

                  <button
                    onClick={() => setActiveTab('ingredients')}
                    className={`pb-2 transition-colors cursor-pointer whitespace-nowrap relative ${
                      activeTab === 'ingredients'
                        ? 'text-[#1A1816] font-semibold border-b-2 border-[#8C532B]'
                        : 'text-[#7D6E60] hover:text-[#1A1816]'
                    }`}
                  >
                    {t('tabIngredients')}
                  </button>

                  <button
                    onClick={() => setActiveTab('safety')}
                    className={`pb-2 transition-colors cursor-pointer whitespace-nowrap relative ${
                      activeTab === 'safety'
                        ? 'text-[#1A1816] font-semibold border-b-2 border-[#8C532B]'
                        : 'text-[#7D6E60] hover:text-[#1A1816]'
                    }`}
                  >
                    {t('tabSafety')}
                  </button>
                </div>

                <div className="text-xs text-[#52463B] leading-relaxed min-h-[90px]">
                  {activeTab === 'desc' && (
                    <p>{product.description[language] || product.description.en}</p>
                  )}
                  {activeTab === 'usage' && (
                    <p>{product.howToUse[language] || product.howToUse.en}</p>
                  )}
                  {activeTab === 'ingredients' && (
                    <p>{product.ingredients[language] || product.ingredients.en}</p>
                  )}
                  {activeTab === 'safety' && (
                    <p>{product.safetyNotes[language] || product.safetyNotes.en}</p>
                  )}
                </div>

                {/* Customer Reviews Section */}
                <div className="mt-6 pt-6 border-t border-[#EAE3D9]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                        {t('customerReviews')}
                      </h4>
                      {reviews.length > 0 ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-[#F2ECE4] rounded-full text-[11px] font-mono text-[#5C5042]">
                          <Star className="w-3 h-3 fill-[#E5B887] text-[#E5B887]" />
                          <span>{stats.rating.toFixed(1)}</span>
                          <span className="text-[#8C7D70]">({reviews.length})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[#8C7D70] font-mono">(0)</span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen((prev) => !prev);
                        setFormError('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1816] text-[#FAF9F5] hover:bg-[#322A23] text-xs font-medium rounded-sm transition-colors cursor-pointer shadow-xs"
                    >
                      <PenLine className="w-3.5 h-3.5 text-[#E5B887]" />
                      <span>{isFormOpen ? t('cancelReview') : t('writeReview')}</span>
                    </button>
                  </div>

                  {reviewSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs flex items-center gap-2 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{t('reviewSubmitted')}</span>
                    </div>
                  )}

                  {isFormOpen && (
                    <form
                      onSubmit={handleSubmitReview}
                      className="mb-5 p-4 bg-[#F5EFE8] border border-[#DECFC0] rounded-sm space-y-3.5 animate-in fade-in"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-[#E8DDD0]">
                        <span className="text-xs font-medium text-[#2C251F]">{t('ratingLabel')}:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starVal) => (
                            <button
                              key={starVal}
                              type="button"
                              onClick={() => setRating(starVal)}
                              onMouseEnter={() => setHoverRating(starVal)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                              aria-label={`${starVal} stars`}
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  starVal <= (hoverRating ?? rating)
                                    ? 'fill-[#E5B887] text-[#E5B887]'
                                    : 'text-[#D5C9BD]'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold text-[#8C532B] ms-2">
                            {(hoverRating ?? rating)} / 5
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-medium text-[#4A4036] mb-1">
                            {t('reviewerName')} <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder={t('reviewerNamePlaceholder')}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-sm focus:outline-none focus:border-[#8C532B]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-[#4A4036] mb-1">
                            {t('reviewerCity')}
                          </label>
                          <input
                            type="text"
                            value={authorCity}
                            onChange={(e) => setAuthorCity(e.target.value)}
                            placeholder={t('reviewerCityPlaceholder')}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-sm focus:outline-none focus:border-[#8C532B]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#4A4036] mb-1">
                          {t('reviewComment')} <span className="text-rose-600">*</span>
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                          placeholder={t('reviewCommentPlaceholder')}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-sm focus:outline-none focus:border-[#8C532B] resize-none"
                          required
                        />
                      </div>

                      {formError && (
                        <div className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 p-2 rounded-sm border border-rose-200">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFormOpen(false);
                            setFormError('');
                          }}
                          className="px-3 py-1.5 text-xs text-[#6B5E52] hover:text-[#1A1816] transition-colors cursor-pointer"
                        >
                          {t('cancelReview')}
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#1A1816] text-[#FAF9F5] hover:bg-[#322A23] text-xs font-medium rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[#E5B887]" />
                          <span>{t('submitReview')}</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {reviews.length === 0 && !isFormOpen && (
                    <div className="text-center py-7 px-4 bg-white/60 rounded-sm border border-dashed border-[#DACCC0]">
                      <MessageSquare className="w-7 h-7 text-[#C2B2A3] mx-auto mb-2" />
                      <p className="text-xs font-semibold text-[#3D332A] mb-1">
                        {t('noReviewsYet')}
                      </p>
                      <p className="text-[11px] text-[#7C6E61] max-w-sm mx-auto mb-3">
                        {t('beFirstToReview')}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsFormOpen(true);
                          setFormError('');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F5] border border-[#BFAFA0] hover:border-[#8C532B] text-[#2C241E] text-xs font-medium rounded-sm transition-all cursor-pointer shadow-xs"
                      >
                        <PenLine className="w-3.5 h-3.5 text-[#8C532B]" />
                        <span>{t('writeReview')}</span>
                      </button>
                    </div>
                  )}

                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      {reviews.map((rev) => {
                        const commentText =
                          typeof rev.comment === 'string'
                            ? rev.comment
                            : rev.comment[language] || rev.comment.en || '';

                        return (
                          <div
                            key={rev.id}
                            className="bg-white/85 p-3.5 rounded-sm border border-[#EFE7DE] shadow-xs"
                          >
                            <div className="flex items-center justify-between text-[11px] mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#1A1816]">{rev.author}</span>
                                {rev.city && (
                                  <span className="text-[#8C7D70] font-normal text-[10px]">
                                    · {rev.city}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#A29486] font-mono">{rev.date}</span>
                            </div>

                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3 h-3 ${
                                    idx < rev.rating
                                      ? 'fill-[#E5B887] text-[#E5B887]'
                                      : 'text-[#DCD2C6]'
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-xs text-[#4A4036] leading-relaxed whitespace-pre-line">
                              {commentText}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export const ProductDetailModal: React.FC<ProductDetailModalProps> = (props) => {
  if (!props.product) return null;
  return <ProductDetailContent key={props.product.id} {...props} product={props.product} />;
};
