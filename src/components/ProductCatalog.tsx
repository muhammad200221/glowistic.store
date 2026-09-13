import React, { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal, RotateCcw, Sparkles, Tag, X } from 'lucide-react';
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

  // Keep filters in sync if initialCategory prop changes (e.g., from header/footer navigation)
  useEffect(() => {
    if (initialCategory) {
      setFilters((prev) => ({
        ...prev,
        category: initialCategory,
      }));
    }
  }, [initialCategory]);

  // Dynamically extract all brands present in products
  const brands = useMemo(() => {
    const list = Array.from(
      new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b && b.trim())))
    ).sort();
    return ['all', ...list];
  }, [products]);

  // Dynamic brand count contextual to the active category
  const getBrandCount = (brandName: string) => {
    return products.filter((p) => {
      const matchCategory = filters.category === 'all' || p.category === filters.category;
      const matchBrand = brandName === 'all' || p.brand === brandName;
      return matchCategory && matchBrand;
    }).length;
  };

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

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.brand !== 'all' ||
    filters.skinType !== 'all' ||
    filters.maxPrice < 150;

  return (
    <div className="py-10 sm:py-14 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Catalog Header */}
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
              className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#DECFC0] bg-white rounded-sm text-xs font-medium text-[#1A1816] shadow-xs"
            >
              <Filter className="w-4 h-4 text-[#8C532B]" />
              <span>{t('filters')}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#8C532B]" />
              )}
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
          
          {/* Filters Sidebar */}
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

            {/* 1. Category Filter */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
                {t('filterByCategory')}
              </h4>
              <div className="space-y-1">
                {categoriesList.map((cat) => {
                  const catCount =
                    cat.id === 'all'
                      ? products.length
                      : products.filter((p) => p.category === cat.id).length;
                  const isSelected = filters.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilters({ ...filters, category: cat.id })}
                      className={`w-full text-start px-2.5 py-1.5 rounded-sm text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold border-s-2 border-[#8C532B]'
                          : 'text-[#5C5247] hover:bg-[#F9F6F0]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{t(cat.labelKey)}</span>
                        <span className="text-[10px] font-mono text-[#8C7E72]">
                          ({catCount})
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C532B]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Brand Filter - Placed directly after Category as requested */}
            <div className="pt-2 border-t border-[#F2ECE3]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#8C532B]" />
                  <span>{t('filterByBrand')}</span>
                </h4>
                {filters.brand !== 'all' && (
                  <button
                    onClick={() => setFilters({ ...filters, brand: 'all' })}
                    className="text-[10px] text-[#8C532B] hover:underline cursor-pointer font-medium"
                  >
                    {t('allBrands')}
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {brands.map((b) => {
                  const count = getBrandCount(b);
                  const isSelected = filters.brand === b;
                  return (
                    <button
                      key={b}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          brand: isSelected && b !== 'all' ? 'all' : b,
                        })
                      }
                      className={`w-full text-start px-2.5 py-1.5 rounded-sm text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold border-s-2 border-[#8C532B]'
                          : 'text-[#5C5247] hover:bg-[#F9F6F0]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate">{b === 'all' ? t('allBrands') : b}</span>
                        <span className="text-[10px] font-mono text-[#8C7E72]">
                          ({count})
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8C532B] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Price Filter */}
            <div className="pt-2 border-t border-[#F2ECE3]">
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

            {/* 4. Skin Type Filter */}
            <div className="pt-2 border-t border-[#F2ECE3]">
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
                        ? 'bg-[#F2ECE3] text-[#1A1816] font-semibold border-s-2 border-[#8C532B]'
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

          </aside>

          {/* Main Products Grid & Quick Brand Bar */}
          <main className="lg:col-span-9 text-start">
            
            {/* Quick Brand Selector Pills Bar */}
            <div className="bg-white p-3 sm:p-4 rounded-sm border border-[#EAE3D9] mb-4 shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#1A1816]">
                  <Tag className="w-3.5 h-3.5 text-[#8C532B]" />
                  <span>{t('filterByBrand')}</span>
                </div>
                {filters.brand !== 'all' && (
                  <button
                    onClick={() => setFilters({ ...filters, brand: 'all' })}
                    className="text-[11px] text-[#8C532B] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <span>{t('allBrands')}</span>
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable Brand Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {brands.map((b) => {
                  const count = getBrandCount(b);
                  const isSelected = filters.brand === b;
                  return (
                    <button
                      key={b}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          brand: isSelected && b !== 'all' ? 'all' : b,
                        })
                      }
                      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#1A1816] text-[#E5B887] shadow-xs'
                          : 'bg-[#FAF6F0] text-[#5C5247] hover:bg-[#F2ECE3] hover:text-[#1A1816] border border-[#EAE3D9]'
                      }`}
                    >
                      <span>{b === 'all' ? t('allBrands') : b}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-[#322A23] text-[#E5B887]'
                            : 'bg-white text-[#8C7E72]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Filters summary & count */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-[#6F6254]">
              <div className="flex flex-wrap items-center gap-1.5">
                <span>{t('showingProducts', { count: filteredProducts.length })}</span>
                
                {/* Active Category badge */}
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F2ECE3] text-[#1A1816] rounded-sm text-[11px] font-medium border border-[#DECFC0]">
                    <span>{t(categoriesList.find((c) => c.id === filters.category)?.labelKey || 'allCategories')}</span>
                    <button
                      onClick={() => setFilters({ ...filters, category: 'all' })}
                      className="hover:text-[#8C532B] cursor-pointer"
                      title="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Active Brand badge */}
                {filters.brand !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1A1816] text-[#E5B887] rounded-sm text-[11px] font-medium">
                    <span>{filters.brand}</span>
                    <button
                      onClick={() => setFilters({ ...filters, brand: 'all' })}
                      className="hover:text-white cursor-pointer"
                      title="Remove brand filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {/* Active Skin Type badge */}
                {filters.skinType !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F2ECE3] text-[#1A1816] rounded-sm text-[11px] font-medium border border-[#DECFC0]">
                    <span>{t(skinTypesList.find((s) => s.id === filters.skinType)?.labelKey || 'skinAll')}</span>
                    <button
                      onClick={() => setFilters({ ...filters, skinType: 'all' })}
                      className="hover:text-[#8C532B] cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[#8C532B] hover:underline cursor-pointer font-medium"
                >
                  {t('clearFilters')}
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-sm border border-[#EAE3D9] text-center my-8">
                <Sparkles className="w-8 h-8 text-[#B8A796] mx-auto mb-3" />
                <h3 className="text-base font-semibold text-[#1A1816] mb-1">
                  {t('noProductsFound')}
                </h3>
                <p className="text-xs text-[#706456] mb-6">
                  {filters.brand !== 'all'
                    ? `No products found for "${filters.brand}" with current filters.`
                    : 'Try adjusting your price range, brand, or skin type filters.'}
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
