import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { PRODUCTS } from './data/products';
import { Product, ProductCategory, CartItem, ProductShade } from './types';
import {
  subscribeToLiveProducts,
  getCachedMergedProducts,
} from './utils/productManager';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBadges } from './components/TrustBadges';
import { FeaturedCategories } from './components/FeaturedCategories';
import { ProductCard } from './components/ProductCard';
import { PromoBanner } from './components/PromoBanner';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { AboutModal, ContactModal } from './components/InfoModals';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { ComingSoon } from './components/ComingSoon';
import { LAUNCH_TIMESTAMP, checkIsStoreLaunched } from './constants/launch';
import { ArrowRight, ArrowLeft, Sparkles, Settings } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isRTL, t } = useLanguage();

  const [storeLaunched, setStoreLaunched] = useState(() => checkIsStoreLaunched());
  const [currentView, setCurrentView] = useState<'coming_soon' | 'home' | 'shop'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('preview') === 'true' || params.get('admin') === 'true') {
      return 'home';
    }
    return checkIsStoreLaunched() ? 'home' : 'coming_soon';
  });
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Live products managed dynamically by store owner
  const [liveProducts, setLiveProducts] = useState<Product[]>(() => getCachedMergedProducts());

  // Subscribe to real-time additions, price edits, and deletions
  useEffect(() => {
    const unsubscribe = subscribeToLiveProducts((merged) => {
      setLiveProducts(merged);
    });
    return () => unsubscribe();
  }, []);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('glowistic_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('glowistic_wishlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('glowistic_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('glowistic_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutGiftWrap, setCheckoutGiftWrap] = useState(false);

  // Hidden shortcut for store owner to open management modal: Ctrl+Shift+A or URL ?admin=true
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    if (window.location.search.includes('admin=true') || window.location.search.includes('admin=1')) {
      setIsAdminOpen(true);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-launch store when countdown timer expires
  useEffect(() => {
    if (storeLaunched) return;
    const checkLaunch = () => {
      if (checkIsStoreLaunched()) {
        setStoreLaunched(true);
        setCurrentView('home');
      }
    };
    checkLaunch();
    const interval = setInterval(checkLaunch, 1000);
    return () => clearInterval(interval);
  }, [storeLaunched]);

  const handleClearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('glowistic_cart');
    } catch {
      // ignore
    }
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
    try {
      localStorage.removeItem('glowistic_wishlist');
    } catch {
      // ignore
    }
  };

  const handleAddToCart = (product: Product, shade?: ProductShade, quantity = 1) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedShade?.id === shade?.id
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }

      return [...prev, { product, selectedShade: shade, quantity }];
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index].quantity = quantity;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id) ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
  };

  const handleSelectCategory = (category: ProductCategory) => {
    setSelectedCategory(category);
    setCurrentView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartCheckout = (discountPercent: number, hasGiftWrap: boolean) => {
    setCheckoutDiscount(discountPercent);
    setCheckoutGiftWrap(hasGiftWrap);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  if (currentView === 'coming_soon' && !storeLaunched) {
    return (
      <ComingSoon
        onTimerExpired={() => {
          setStoreLaunched(true);
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onEnterStore={
          new URLSearchParams(window.location.search).get('preview') === 'true'
            ? () => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#1A1816]">
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateShop={() => {
          setSelectedCategory('all');
          setCurrentView('shop');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectCategory={handleSelectCategory}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <main className="flex-grow">
        {currentView === 'home' ? (
          <>
            <Hero
              onShopClick={() => {
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onExploreClick={() => {
                const el = document.getElementById('featured-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <TrustBadges />

            <FeaturedCategories onSelectCategory={handleSelectCategory} products={liveProducts} />

            {/* Trending / Cult Favorites Section */}
            <section id="featured-section" className="py-16 sm:py-20 bg-[#FAF9F5] border-t border-[#EAE3D9]">
              <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 mb-10 border-b border-[#EAE3D9] gap-4 text-start">
                  <div>
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#8C532B] block mb-2">
                      Cult Favorites
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-medium text-[#1A1816]">
                      {t('trendingProducts')}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentView('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-2 text-xs font-semibold text-[#8C532B] hover:text-[#5E371C] transition-colors cursor-pointer"
                  >
                    <span>View Full Catalog</span>
                    {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {liveProducts.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.includes(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <PromoBanner
              onShopSale={() => {
                setCurrentView('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <ProductCatalog
            products={liveProducts}
            initialCategory={selectedCategory}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        )}
      </main>

      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={quickViewProduct ? wishlistIds.includes(quickViewProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={handleStartCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        products={liveProducts}
        wishlistIds={wishlistIds}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={(p) => handleAddToCart(p)}
        onQuickView={setQuickViewProduct}
        onClearWishlist={handleClearWishlist}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={liveProducts}
        onSelectProduct={setQuickViewProduct}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        discountPercent={checkoutDiscount}
        hasGiftWrap={checkoutGiftWrap}
        onOrderCompleted={handleOrderCompleted}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Store Owner Product Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={liveProducts}
        onOpenProductDetail={(p) => {
          setQuickViewProduct(p);
          setIsAdminOpen(false);
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ReviewsProvider>
        <MainContent />
      </ReviewsProvider>
    </LanguageProvider>
  );
}
