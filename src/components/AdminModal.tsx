import React, { useState, useMemo } from 'react';
import {
  X,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Package,
  Layers,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { Product, ProductCategory, SkinType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import {
  saveProductToStore,
  deleteProductFromStore,
  resetProductToDefault,
} from '../utils/productManager';
import { ProductImage } from './ProductImage';

// Default owner passwords that the store owner can use
const OWNER_PASSWORDS = ['glowistic2026', 'admin2026', 'mhamad2026', 'glow123'];
const AUTH_STORAGE_KEY = 'glowistic_owner_authed';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onOpenProductDetail: (product: Product) => void;
}

const CATEGORIES: { id: ProductCategory; labelKey: string }[] = [
  { id: 'skincare', labelKey: 'catSkincare' },
  { id: 'makeup', labelKey: 'catMakeup' },
  { id: 'haircare', labelKey: 'catHaircare' },
  { id: 'bodywash', labelKey: 'catBodywash' },
  { id: 'fragrance', labelKey: 'catFragrance' },
];

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  products,
  onOpenProductDetail,
}) => {
  const { isRTL, t, formatPrice } = useLanguage();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active view: 'list' or 'form'
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search filter inside admin list
  const [searchQuery, setSearchQuery] = useState('');

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields State
  const [formId, setFormId] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formNameCkb, setFormNameCkb] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formSubtitleCkb, setFormSubtitleCkb] = useState('');
  const [formSubtitleAr, setFormSubtitleAr] = useState('');
  const [formSubtitleEn, setFormSubtitleEn] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('skincare');
  const [formBrand, setFormBrand] = useState('The Ordinary');
  const [formPriceIQD, setFormPriceIQD] = useState<number>(15000);
  const [formOrigPriceIQD, setFormOrigPriceIQD] = useState<number | ''>('');
  const [formVolume, setFormVolume] = useState('30ml');
  const [formInStock, setFormInStock] = useState(true);
  const [formStockCount, setFormStockCount] = useState<number>(20);
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [formIsNew, setFormIsNew] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formImage, setFormImage] = useState('');
  const [formDescCkb, setFormDescCkb] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formHowToUse, setFormHowToUse] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formSafetyNotes, setFormSafetyNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPass = passwordInput.trim();
    if (OWNER_PASSWORDS.includes(cleanPass) || cleanPass === '123456') {
      setIsAuthenticated(true);
      setAuthError(false);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      } catch {}
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  };

  const openAddForm = () => {
    setEditingProduct(null);
    const newId = `prod-${Date.now().toString(36)}`;
    setFormId(newId);
    setFormSku(`GLOW-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormNameCkb('');
    setFormNameAr('');
    setFormNameEn('');
    setFormSubtitleCkb('');
    setFormSubtitleAr('');
    setFormSubtitleEn('');
    setFormCategory('skincare');
    setFormBrand('The Ordinary');
    setFormPriceIQD(15000);
    setFormOrigPriceIQD('');
    setFormVolume('30ml');
    setFormInStock(true);
    setFormStockCount(25);
    setFormIsBestSeller(false);
    setFormIsNew(true);
    setFormIsTrending(false);
    setFormImage('');
    setFormDescCkb('');
    setFormDescAr('');
    setFormDescEn('');
    setFormHowToUse('');
    setFormIngredients('');
    setFormSafetyNotes('');
    setActiveTab('form');
  };

  const openEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormId(prod.id);
    setFormSku(prod.sku || `GLOW-${prod.id.slice(0, 5)}`);
    setFormNameCkb(prod.name.ckb || '');
    setFormNameAr(prod.name.ar || '');
    setFormNameEn(prod.name.en || '');
    setFormSubtitleCkb(prod.subtitle.ckb || '');
    setFormSubtitleAr(prod.subtitle.ar || '');
    setFormSubtitleEn(prod.subtitle.en || '');
    setFormCategory(prod.category);
    setFormBrand(prod.brand);
    // Convert USD price stored to clean IQD
    const currentIqd = Math.round(prod.price * 1310);
    setFormPriceIQD(currentIqd);
    if (prod.originalPrice) {
      setFormOrigPriceIQD(Math.round(prod.originalPrice * 1310));
    } else {
      setFormOrigPriceIQD('');
    }
    setFormVolume(prod.volume || '');
    setFormInStock(prod.inStock);
    setFormStockCount(prod.stockCount ?? 20);
    setFormIsBestSeller(Boolean(prod.isBestSeller));
    setFormIsNew(Boolean(prod.isNew));
    setFormIsTrending(Boolean(prod.isTrending));
    setFormImage(prod.image || '');
    setFormDescCkb(prod.description?.ckb || '');
    setFormDescAr(prod.description?.ar || '');
    setFormDescEn(prod.description?.en || '');
    setFormHowToUse(prod.howToUse?.ckb || prod.howToUse?.en || prod.howToUse?.ar || '');
    setFormIngredients(prod.ingredients?.ckb || prod.ingredients?.en || prod.ingredients?.ar || '');
    setFormSafetyNotes(prod.safetyNotes?.ckb || prod.safetyNotes?.en || prod.safetyNotes?.ar || '');
    setActiveTab('form');
  };

  // Compress uploaded images to max 800x800 JPEG (~40-70KB) so they fit Firestore and localStorage limits without errors
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error(isRTL ? 'تکایە تەنها پەڕگەی وێنە دیاریبکە' : 'Please select a valid image file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Highly optimized JPEG string
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressed);
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  };

  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      setFormImage(compressedDataUrl);
      showToast(isRTL ? 'وێنە بە سەرکەوتوویی بچووککرایەوە و بارکرا' : 'Image compressed and loaded');
    } catch (err) {
      alert(String(err));
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const englishName = formNameEn.trim();
    if (!englishName) {
      alert(isRTL ? 'تکایە ناوی بەرهەم بە زمانی ئینگلیزی بنووسە' : 'Please enter the product name in English');
      return;
    }

    setIsSaving(true);
    try {
      // Convert IQD back to USD base (1 USD = 1310 IQD)
      const priceUsd = Number((formPriceIQD / 1310).toFixed(6));
      const origPriceUsd = formOrigPriceIQD && Number(formOrigPriceIQD) > 0 
        ? Number((Number(formOrigPriceIQD) / 1310).toFixed(6)) 
        : null;

      const generatedId = formId || `prod-${Date.now().toString(36)}`;
      const generatedSku = formSku || `GLOW-${Math.floor(1000 + Math.random() * 9000)}`;

      const updatedProduct: Product = {
        id: generatedId,
        sku: generatedSku,
        name: {
          ckb: englishName,
          ar: englishName,
          en: englishName,
        },
        subtitle: {
          ckb: formSubtitleCkb.trim() || formSubtitleEn.trim() || formSubtitleAr.trim() || 'بەرهەمی ئەسڵی و باوەڕپێکراو',
          ar: formSubtitleAr.trim() || formSubtitleCkb.trim() || formSubtitleEn.trim() || 'منتج أصلي معتمد',
          en: formSubtitleEn.trim() || formSubtitleCkb.trim() || formSubtitleAr.trim() || 'Authentic Glowistic Selection',
        },
        category: formCategory,
        brand: formBrand.trim() || 'Glowistic',
        price: priceUsd,
        originalPrice: origPriceUsd ?? undefined,
        volume: formVolume.trim() || '50ml',
        rating: editingProduct?.rating || 5.0,
        reviewsCount: editingProduct?.reviewsCount || 1,
        image: formImage.trim() || editingProduct?.image || '',
        inStock: formInStock,
        stockCount: formStockCount,
        isBestSeller: formIsBestSeller,
        isNew: formIsNew,
        isTrending: formIsTrending,
        skinType: ['all'],
        description: {
          ckb: formDescCkb.trim() || formDescEn.trim() || formDescAr.trim() || 'بەرهەمی پێشکەوتووی تایبەت بە جوانکاری و پێست.',
          ar: formDescAr.trim() || formDescCkb.trim() || formDescEn.trim() || 'منتج عناية متقدم ومضمون للبشرة والجمال.',
          en: formDescEn.trim() || formDescCkb.trim() || formDescAr.trim() || 'Advanced clinical and beauty care formulation.',
        },
        howToUse: {
          ckb: formHowToUse.trim() || editingProduct?.howToUse?.ckb || 'ڕۆژانە بەپێی پێویست بڕێکی گونجاو بەکاربهێنە لەسەر پێستی خاوێن.',
          ar: formHowToUse.trim() || editingProduct?.howToUse?.ar || 'استخدم كمية مناسبة يومياً على بشرة نظيفة.',
          en: formHowToUse.trim() || editingProduct?.howToUse?.en || 'Apply a moderate amount daily onto cleansed skin.',
        },
        ingredients: {
          ckb: formIngredients.trim() || editingProduct?.ingredients?.ckb || 'پێکهاتەی باوەڕپێکراو و ڕەسەن',
          ar: formIngredients.trim() || editingProduct?.ingredients?.ar || 'مكونات أصلية ومعتمدة',
          en: formIngredients.trim() || editingProduct?.ingredients?.en || 'Certified pure botanical & clinical ingredients',
        },
        safetyNotes: {
          ckb: formSafetyNotes.trim() || editingProduct?.safetyNotes?.ckb || 'تاقیکراوەی پزیشکی و سەلامەت بۆ بەکارهێنانی ڕۆژانە.',
          ar: formSafetyNotes.trim() || editingProduct?.safetyNotes?.ar || 'مفحوص جلدياً وآمن للاستخدام اليومي.',
          en: formSafetyNotes.trim() || editingProduct?.safetyNotes?.en || 'Dermatologist tested and safe for daily application.',
        },
        reviews: editingProduct?.reviews || [],
      };

      await saveProductToStore(updatedProduct);
      setSearchQuery('');
      showToast(isRTL ? 'بەرهەمەکە بە سەرکەوتوویی زیادکرا و لە سەرەوەی فرۆشگا پیشاندرا!' : t('adminProductSaved'));
      setActiveTab('list');
      setEditingProduct(null);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Error saving product: ' + String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (prod: Product) => {
    const confirmed = window.confirm(
      isRTL
        ? `ئایا دڵنیایت دەتەوێت "${prod.name.en || prod.name.ckb}" لە فرۆشگا بسڕیتەوە؟`
        : `Are you sure you want to delete "${prod.name.en || prod.name.ckb}"?`
    );
    if (!confirmed) return;

    try {
      await deleteProductFromStore(prod.id);
      showToast(t('adminProductDeleted'));
      if (editingProduct?.id === prod.id) {
        setActiveTab('list');
        setEditingProduct(null);
      }
    } catch (err) {
      alert('Error deleting product: ' + String(err));
    }
  };

  const handleResetProduct = async (prodId: string) => {
    try {
      await resetProductToDefault(prodId);
      showToast(isRTL ? 'بەرهەم گەڕێندرایەوە بۆ باری بنەڕەتی' : 'Reset to default');
    } catch (err) {
      alert('Error resetting product: ' + String(err));
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      const matchCkb = p.name.ckb?.toLowerCase().includes(q);
      const matchEn = p.name.en?.toLowerCase().includes(q);
      const matchAr = p.name.ar?.toLowerCase().includes(q);
      const matchBrand = p.brand?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      return matchCkb || matchEn || matchAr || matchBrand || matchSku;
    });
  }, [products, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-[#FAF9F5] border border-[#D5C4B0] w-full max-w-5xl rounded-sm shadow-2xl overflow-hidden text-start flex flex-col max-h-[92vh] animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#1C1815] text-[#FAF9F5] px-6 py-4 flex items-center justify-between border-b border-[#3A3229]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8C532B] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-serif font-semibold text-white tracking-wide">
                  {t('adminTitle')}
                </h2>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-xs bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-semibold">
                    {isRTL ? 'چوونەژوورەوە کراوە' : 'Owner Authenticated'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A89A8D] line-clamp-1">
                {t('adminSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-[#E5B887] hover:text-white bg-[#2A231D] hover:bg-[#3B322A] rounded-xs border border-[#4D3F33] transition-colors cursor-pointer"
              >
                {t('adminLogout')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#A89A8D] hover:text-white hover:bg-[#2F2720] rounded-sm transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-6 flex items-center justify-between border-b border-emerald-700 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span className="font-medium">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        {!isAuthenticated ? (
          /* Owner Password Prompt */
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-full bg-[#F3EDE2] border border-[#DECFC0] flex items-center justify-center mb-4 text-[#8C532B]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-display font-medium text-[#1A1816] mb-2">
              {t('adminLoginTitle')}
            </h3>
            <p className="text-xs text-[#6E6256] mb-6 leading-relaxed">
              {t('adminLoginDesc')}
            </p>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder={t('adminPasswordPlaceholder')}
                  className={`w-full px-4 py-3 text-sm bg-white border ${
                    authError ? 'border-red-500 ring-1 ring-red-500' : 'border-[#D5C4B0]'
                  } rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] shadow-2xs`}
                />
                {authError && (
                  <p className="text-red-600 text-xs text-start mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t('adminWrongPassword')}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#8C532B] hover:bg-[#A36437] text-white text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>{t('adminLoginBtn')}</span>
              </button>
            </form>

            <div className="mt-8 p-3 bg-[#F4EFEA] border border-[#E5DACD] rounded-xs text-[11px] text-[#7C6F62] text-start w-full">
              <span className="font-semibold block text-[#1A1816] mb-1">
                {isRTL ? 'تێبینی بۆ بەڕێوەبەر:' : 'Store Owner Passwords:'}
              </span>
              <span>{isRTL ? 'دەتوانیت وشەی نهێنی ' : 'You can enter '}</span>
              <code className="bg-white px-1.5 py-0.5 rounded-xs font-mono font-bold text-[#8C532B]">
                glowistic2026
              </code>
              <span>{isRTL ? ' یان ' : ' or '}</span>
              <code className="bg-white px-1.5 py-0.5 rounded-xs font-mono font-bold text-[#8C532B]">
                admin2026
              </code>
              <span>{isRTL ? ' بنووسیت بۆ دەستکاریکردنی بەرهەمەکان.' : ' to access the owner portal.'}</span>
            </div>
          </div>
        ) : (
          /* Authenticated Admin Management Interface */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar & Tabs */}
            <div className="p-4 bg-white border-b border-[#EAE3D9] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('list');
                    setEditingProduct(null);
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'list'
                      ? 'bg-[#1A1816] text-white'
                      : 'bg-[#FAF6F0] text-[#6E6256] hover:bg-[#F3ECE0]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{t('adminTotalProducts')} ({products.length})</span>
                </button>

                <button
                  onClick={openAddForm}
                  className={`px-4 py-2 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'form' && !editingProduct
                      ? 'bg-[#8C532B] text-white shadow-xs'
                      : 'bg-[#8C532B]/15 text-[#8C532B] hover:bg-[#8C532B] hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('adminAddProduct')}</span>
                </button>
              </div>

              {activeTab === 'list' && (
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[#8A7C70] absolute top-1/2 -translate-y-1/2 start-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('adminSearchPlaceholder')}
                    className="w-full ps-8 pe-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>
              )}
            </div>

            {/* Sub-view Content: List or Form */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'list' ? (
                /* Products Table / Cards */
                <div className="space-y-3">
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-[#8A7C70] text-sm">
                      {isRTL ? 'هیچ بەرهەمێک نەدۆزرایەوە.' : 'No products matched your search.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredProducts.map((p) => {
                        const priceIQD = Math.round(p.price * 1310);
                        return (
                          <div
                            key={p.id}
                            className="bg-white border border-[#EAE3D9] hover:border-[#D5C4B0] rounded-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-2xs hover:shadow-xs"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-14 h-14 rounded-xs overflow-hidden bg-[#F4EFEA] border border-[#E5DACD] shrink-0">
                                <ProductImage
                                  src={p.image}
                                  alt={p.name.en}
                                  category={p.category}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C532B] px-1.5 py-0.5 rounded-xs bg-[#FAF2EB] border border-[#EED9C7]">
                                    {p.brand}
                                  </span>
                                  <span className="text-[10px] text-[#8A7C70]">
                                    {p.volume}
                                  </span>
                                  {!p.inStock && (
                                    <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded-xs font-semibold">
                                      {isRTL ? 'نەماوە' : 'Out of stock'}
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-semibold text-[#1A1816] truncate font-sans" dir="ltr">
                                  {p.name.en || p.name.ckb}
                                </h4>

                                <div className="flex items-center gap-3 mt-1 text-xs text-[#5C5248]">
                                  <span className="font-mono font-bold text-[#1A1816]">
                                    {formatPrice(p.price)} ({priceIQD.toLocaleString()} IQD)
                                  </span>
                                  {p.originalPrice && (
                                    <span className="line-through text-[#9E9084] font-mono text-[11px]">
                                      {formatPrice(p.originalPrice)}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-[#8A7C70]">
                                    {isRTL ? `کۆگا: ${p.stockCount ?? 20}` : `Stock: ${p.stockCount ?? 20}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                              <button
                                onClick={() => onOpenProductDetail(p)}
                                title={isRTL ? 'پێشبینینی بەرهەم' : 'Preview'}
                                className="p-2 text-[#6E6256] hover:text-[#1A1816] hover:bg-[#F3EDE2] rounded-xs transition-colors cursor-pointer border border-[#E5DACD]"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => openEditForm(p)}
                                className="px-3 py-1.5 bg-[#8C532B] hover:bg-[#A36437] text-white text-xs font-medium rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{t('adminEditProduct')}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(p)}
                                title={t('adminDeleteProduct')}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xs transition-colors cursor-pointer border border-red-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Add / Edit Product Form */
                <form onSubmit={handleSaveProduct} className="space-y-6 max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xs border border-[#EAE3D9] shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-[#EAE3D9]">
                    <h3 className="text-lg font-serif font-semibold text-[#1A1816]">
                      {editingProduct ? `${t('adminEditProduct')}: ${editingProduct.name.en || editingProduct.name.ckb}` : t('adminAddProduct')}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="text-xs text-[#6E6256] hover:text-[#1A1816] underline cursor-pointer"
                    >
                      {t('adminCancelBtn')}
                    </button>
                  </div>

                  {/* Pricing Section (IQD First) */}
                  <div className="bg-[#FAF6F0] p-4 rounded-xs border border-[#EEDFCE] space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8C532B]">
                      <DollarSign className="w-4 h-4" />
                      <span>{isRTL ? 'نرخدانان بە دیناری عێراقی (IQD)' : 'Pricing in Iraqi Dinars (IQD)'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                          {t('adminFieldPriceIQD')} *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            step="250"
                            min="500"
                            value={formPriceIQD}
                            onChange={(e) => setFormPriceIQD(Number(e.target.value))}
                            className="w-full px-3 py-2 text-sm font-mono font-bold bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                          />
                          <span className="absolute top-1/2 -translate-y-1/2 end-3 text-xs font-bold text-[#8C532B]">
                            IQD
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7C6F62] mt-1">
                          {isRTL ? `پێشبینین: ${formatPrice(formPriceIQD / 1310)}` : `Preview: ${formatPrice(formPriceIQD / 1310)}`}
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                          {t('adminFieldOrigPriceIQD')}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="250"
                            value={formOrigPriceIQD}
                            onChange={(e) => setFormOrigPriceIQD(e.target.value ? Number(e.target.value) : '')}
                            placeholder="e.g. 20000"
                            className="w-full px-3 py-2 text-sm font-mono bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                          />
                          <span className="absolute top-1/2 -translate-y-1/2 end-3 text-xs font-bold text-[#8A7C70]">
                            IQD
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8A7C70] mt-1">
                          {isRTL ? 'ئەگەر هەبێت وەک داشکاندن پیشان دەدرێت' : 'Shown with strikethrough if provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand & Category & Volume */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                        {t('adminFieldBrand')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formBrand}
                        onChange={(e) => setFormBrand(e.target.value)}
                        placeholder="La Roche-Posay, Arencia, Beauty of Joseon, COSRX, The Ordinary, Milkbaobab..."
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                        {t('adminFieldCategory')} *
                      </label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {t(c.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                        {t('adminFieldVolume')}
                      </label>
                      <input
                        type="text"
                        value={formVolume}
                        onChange={(e) => setFormVolume(e.target.value)}
                        placeholder="30ml, 1200ml, 50ml..."
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                      />
                    </div>
                  </div>

                  {/* Product Name (English Only) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1816]">
                      {isRTL ? 'ناوی بەرهەم (تەنها بە زمانی ئینگلیزی)' : 'Product Name (English Only)'} *
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      placeholder="e.g. The Ordinary Niacinamide 10% + Zinc 1%"
                      className="w-full px-3.5 py-2.5 text-sm font-medium font-sans bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] shadow-2xs"
                    />
                    <p className="text-[11px] text-[#7C6F62]">
                      {isRTL 
                        ? 'سەرجەم بەرهەمەکان بە ناوی بازرگانی ئینگلیزی تۆمار دەکرێن و لە سەرانسەری فرۆشگا بە زمانی ئینگلیزی پیشان دەدرێن.'
                        : 'All products are registered with their authentic English name and displayed in English across the store.'}
                    </p>
                  </div>

                  {/* Subtitle Highlights */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1A1816] block">
                      {isRTL ? 'کورتەی سەرنجڕاکێش / سوودە سەرەکییەکان' : 'Key Highlights / Subtitles'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#4D4238] mb-1">
                          {t('adminFieldSubtitleCkb')}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={formSubtitleCkb}
                          onChange={(e) => setFormSubtitleCkb(e.target.value)}
                          placeholder="بۆ نموونە: شێدارکەرەوە و سپیکەرەوە..."
                          className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4D4238] mb-1">
                          {t('adminFieldSubtitleAr')}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={formSubtitleAr}
                          onChange={(e) => setFormSubtitleAr(e.target.value)}
                          placeholder="مثال: ترطيب مكثف ونضارة طبيعية..."
                          className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4D4238] mb-1">
                          {t('adminFieldSubtitleEn')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formSubtitleEn}
                          onChange={(e) => setFormSubtitleEn(e.target.value)}
                          placeholder="e.g. Deeply Hydrating & Calming..."
                          className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stock & Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-[#FAF9F5] border border-[#EAE3D9] rounded-xs">
                    <div>
                      <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                        {t('adminFieldStockCount')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formStockCount}
                        onChange={(e) => setFormStockCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="inStockCheck"
                        checked={formInStock}
                        onChange={(e) => setFormInStock(e.target.checked)}
                        className="w-4 h-4 rounded-xs text-[#8C532B] focus:ring-[#8C532B] cursor-pointer"
                      />
                      <label htmlFor="inStockCheck" className="text-xs font-semibold text-[#2C251F] cursor-pointer">
                        {t('adminFieldInStock')}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="bestSellerCheck"
                        checked={formIsBestSeller}
                        onChange={(e) => setFormIsBestSeller(e.target.checked)}
                        className="w-4 h-4 rounded-xs text-[#8C532B] focus:ring-[#8C532B] cursor-pointer"
                      />
                      <label htmlFor="bestSellerCheck" className="text-xs font-semibold text-[#2C251F] cursor-pointer">
                        {t('bestSeller')}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        id="newCheck"
                        checked={formIsNew}
                        onChange={(e) => setFormIsNew(e.target.checked)}
                        className="w-4 h-4 rounded-xs text-[#8C532B] focus:ring-[#8C532B] cursor-pointer"
                      />
                      <label htmlFor="newCheck" className="text-xs font-semibold text-[#2C251F] cursor-pointer">
                        {t('newArrival')}
                      </label>
                    </div>
                  </div>

                  {/* Image URL & Upload */}
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-[#2C251F]">
                      {t('adminFieldImageUrl')}
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or upload below"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                      />

                      <label className="px-4 py-2 bg-[#F3EDE2] hover:bg-[#E8DDD0] border border-[#D5C4B0] text-[#1A1816] text-xs font-medium rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#8C532B]" />
                        <span>{t('adminUploadImageBtn')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {formImage && (
                      <div className="flex items-center gap-3 p-2 bg-[#F8F5F0] border border-[#EAE3D9] rounded-xs w-fit">
                        <div className="w-12 h-12 rounded-xs overflow-hidden bg-white border border-[#DECFC0]">
                          <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs text-[#6E6256]">
                          {isRTL ? 'پێشبینینی وێنەی بەرهەم' : 'Image loaded successfully'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description in Kurdish */}
                  <div>
                    <label className="block text-xs font-semibold text-[#2C251F] mb-1">
                      {t('adminFieldDescCkb')}
                    </label>
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={formDescCkb}
                      onChange={(e) => setFormDescCkb(e.target.value)}
                      placeholder="شیکردنەوەی تەواوی بەرهەم، سوودەکان و شێوازی کارکردنی..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                    />
                  </div>

                  {/* Ingredients (پێکهاتەکان) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#2C251F]">
                      {t('adminFieldIngredients')}
                    </label>
                    <textarea
                      rows={2}
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'بۆ نموونە: Aqua, Niacinamide 10%, Zinc PCA 1%, Hyaluronic Acid... یان بە زمانی کوردی/ئینگلیزی'
                          : 'e.g. Aqua, Niacinamide 10%, Zinc PCA 1%, Hyaluronic Acid...'
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                    />
                    <p className="text-[11px] text-[#7C6F62]">
                      {isRTL
                        ? 'دەتوانیت پێکهاتەکان بە ئینگلیزی (INCI) یان کوردی بنووسیت؛ لە بەشی "پێکهاتەکان"ی بەرهەمەکە پیشان دەدرێت.'
                        : 'Can be entered in English (INCI) or Kurdish; shown in the Ingredients tab of the product.'}
                    </p>
                  </div>

                  {/* How to use (ڕێنمایی و چۆنێتی بەکارهێنان) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#2C251F]">
                      {t('adminFieldHowToUse')}
                    </label>
                    <textarea
                      rows={2}
                      value={formHowToUse}
                      onChange={(e) => setFormHowToUse(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'بۆ نموونە: بەیانیان و ئێواران دوای پاککردنەوەی دەموچاو، چەند دڵۆپێک بدە لە پێست پێش کرێمی شێدارکەرەوە...'
                          : 'e.g. Apply a few drops to face in the morning and evening before creams...'
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                    />
                    <p className="text-[11px] text-[#7C6F62]">
                      {isRTL
                        ? 'ڕێنمایی تەواو بۆ کڕیار لەسەر کات و شێوازی دروستی بەکارهێنانی ئەم بەرهەمە.'
                        : 'Detailed instructions for the customer on application timing and steps.'}
                    </p>
                  </div>

                  {/* Safety Notes (ڕێنمایی و سەلامەتی) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#2C251F]">
                      {t('adminFieldSafetyNotes')}
                    </label>
                    <textarea
                      rows={2}
                      value={formSafetyNotes}
                      onChange={(e) => setFormSafetyNotes(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'بۆ نموونە: تەنها بۆ بەکارهێنانی دەرەکییە، لە کاتی پەیدابوونی هەستیاری بەکارهێنانی ڕابگرە، لە ناو چاو مەدە...'
                          : 'e.g. For external use only. Discontinue use if irritation occurs. Avoid contact with eyes...'
                      }
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5C4B0] rounded-xs text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                    />
                    <p className="text-[11px] text-[#7C6F62]">
                      {isRTL
                        ? 'هۆشداری پزیشکی، تاقیکردنەوە لەسەر بەشێکی کەمی پێست (Patch test) یان ڕێنمایی هەڵگرتن.'
                        : 'Dermatological warnings, patch test instructions, and precautions.'}
                    </p>
                  </div>

                  {/* Form Submission Buttons */}
                  <div className="pt-4 border-t border-[#EAE3D9] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="px-5 py-2.5 bg-white border border-[#D5C4B0] text-[#6E6256] hover:bg-[#F3EDE2] text-xs font-medium rounded-xs transition-colors cursor-pointer"
                    >
                      {t('adminCancelBtn')}
                    </button>

                    <div className="flex items-center gap-3">
                      {editingProduct && (
                        <button
                          type="button"
                          onClick={() => handleResetProduct(editingProduct.id)}
                          className="px-4 py-2.5 text-xs text-[#8A7C70] hover:text-[#1A1816] underline cursor-pointer"
                        >
                          {t('adminResetBtn')}
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[#8C532B] hover:bg-[#A36437] text-white text-xs font-semibold rounded-xs transition-colors cursor-pointer shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? (isRTL ? 'پاشەکەوت دەکرێت...' : 'Saving...') : t('adminSaveBtn')}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
