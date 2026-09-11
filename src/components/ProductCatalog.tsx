import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import { Product, ProductCategory, SkinType, FilterState, ProductShade } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  initialCategory?: ProductCategory;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, shade?: ProductShade) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  initialCategory = 'all',
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
}) => {
  const { formatPrice, t } = useLanguage();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 150,
    brand: 'all',
    skinType: 'all',
    sortBy: 'featured',
    searchQuery: '',
  });

  const brands = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.brand)));
    return ['all', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category !== 'all' && p.category !== filters.category) return false;
        if (p.price < filters.minPrice || p.price > filters.maxPrice) return false;
        if (filters.brand !== 'all' && p.brand !== filters.brand) return false;
        if (filters.skinType !== 'all') {
          if (!p.skinType.includes(filters.skinType) && !p.skinType.includes('all')) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        const scoreA = (a.isBestSeller ? 2 : 0) + (a.isTrending ? 1 : 0);
        const scoreB = (b.isBestSeller ? 2 : 0) + (b.isTrending ? 1 : 0);
        return scoreB - scoreA;
      });
  }, [products, filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 150,
      brand: 'all',
      skinType: 'all',
      sortBy: 'featured',
      searchQuery: '',
    });
  };

  const categoriesList: { id: ProductCategory; labelKey: string }[] = [
    { id: 'all', labelKey: 'allCategories' },
    { id: 'skincare', labelKey: 'catSkincare' },
    { id: 'makeup', labelKey: 'catMakeup' },
    { id: 'haircare', labelKey: 'catHaircare' },
    { id: 'fragrance', labelKey: 'catFragrance' },
  ];

  const skinTypesList: { id: SkinType; labelKey: string }[] = [
    { id: 'all', labelKey: 'skinAll' },
    { id: 'dry', labelKey: 'skinDry' },
    { id: 'oily', labelKey: 'skinOily' },
    { id: 'sensitive', labelKey: 'skinSensitive' },
    { id: 'combination', labelKey: 'skinCombination' },
  ];

  return (
    <div className="py-10 sm:py-14 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b border-[#EAE3D9] gap-4 text-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8C532B] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Catalog & Formulary</span>
            </div>
            <h1 className="text-3xl font-display font-medium text-[#1A1816]">
              {t('shop')}
            </h1>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#DECFC0] bg-white rounded-sm text-xs font-medium text-[#1A1816]"
            >
              <Filter className="w-4 h-4 text-[#8C532B]" />
              <span>{t('filters')}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#736557] hidden sm:inline">
                {t('sortBy')}:
              </span>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
                }
                className="px-3 py-2 bg-white border border-[#DECFC0] rounded-sm text-xs font-medium text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] cursor-pointer"
              >
                <option value="featured">{t('sortFeatured')}</option>
                <option value="price-asc">{t('sortPriceAsc')}</option>
                <option value="price-desc">{t('sortPriceDesc')}</option>
                <option value="rating">{t('sortRating')}</option>
                <option value="newest">{t('sortNewest')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <aside
            className={`lg:col-span-3 ${
              isMobileFiltersOpen ? 'block' : 'hidden'
            } lg:block bg-white p-6 rounded-sm border border-[#EAE3D9] shadow-xs sticky top-24 space-y-6 text-start`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE7DE]">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1816]">
                <SlidersHorizontal className="w-4 h-4 text-[#8C532B]" />
                <span>{t('filters')}</span>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#8A7B6E] hover:text-[#8C532B] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t('clearFilters')}</span>
              </button>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
                {t('filterByCategory')}
              </h4>
              <div className="space-y-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFilters({ ...filters, category: cat.id })}
                    className={`w-full text-start px-2.5 py-1.5 rounded-sm text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filters.category === cat.id
                        ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold'
                        : 'text-[#5C5247] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <span>{t(cat.labelKey)}</span>
                    {filters.category === cat.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C532B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                  {t('filterByPrice')}
                </h4>
                <span className="text-xs font-mono font-medium text-[#8C532B]">
                  {formatPrice(filters.maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={150}
                step={5}
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-[#8C532B] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C7D70] font-mono mt-1">
                <span>{formatPrice(0)}</span>
                <span>{formatPrice(150)}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
                {t('filterBySkinType')}
              </h4>
              <div className="space-y-1">
                {skinTypesList.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilters({ ...filters, skinType: st.id })}
                    className={`w-full text-start px-2.5 py-1.5 rounded-sm text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filters.skinType === st.id
                        ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold'
                        : 'text-[#5C5247] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <span>{t(st.labelKey)}</span>
                    {filters.skinType === st.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C532B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
                {t('filterByBrand')}
              </h4>
              <div className="space-y-1">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilters({ ...filters, brand: b })}
                    className={`w-full text-start px-2.5 py-1.5 rounded-sm text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      filters.brand === b
                        ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold'
                        : 'text-[#5C5247] hover:bg-[#F9F6F0]'
                    }`}
                  >
                    <span className="truncate">{b === 'all' ? 'All Brands' : b}</span>
                    {filters.brand === b && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C532B]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

          </aside>

          <main className="lg:col-span-9 text-start">
            <div className="flex items-center justify-between mb-4 text-xs text-[#6F6254]">
              <span>
                {t('showingProducts', { count: filteredProducts.length })}
              </span>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm border border-[#EAE3D9] text-center my-8">
                <Sparkles className="w-8 h-8 text-[#B8A796] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[#1A1816] mb-1">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-[#706456] mb-6">
                  Try adjusting your price range or skin type filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-[#1A1816] text-white text-xs font-medium rounded-sm hover:bg-[#322A23] cursor-pointer"
                >
                  {t('clearFilters')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(product.id)}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};
