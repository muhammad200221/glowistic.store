import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  Tag,
  Check,
  Gift,
} from 'lucide-react';
import { CartItem } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
  onCheckout: (discountPercent: number, hasGiftWrap: boolean) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const { language, isRTL, formatPrice, t } = useLanguage();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [hasGiftWrap, setHasGiftWrap] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const giftWrapCost = hasGiftWrap ? 3 : 0;
  const freeShippingThreshold = 50;
  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const shippingCost = isFreeShipping ? 0 : 5;
  const grandTotal = Math.max(0, subtotal - discountAmount + giftWrapCost + shippingCost);

  const freeShippingRemainder = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === 'GLOW20' || code === 'GLOWISTIC20' || code === 'LILAS20') {
      setDiscountPercent(20);
      setCouponSuccess(true);
      setCouponError(false);
    } else {
      setDiscountPercent(0);
      setCouponError(true);
      setCouponSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className={`fixed inset-y-0 ${isRTL ? 'left-0' : 'right-0'} max-w-md w-full bg-[#FAF9F5] shadow-2xl flex flex-col justify-between z-50 text-start`}>
        <div className="p-5 border-b border-[#EAE3D9] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#8C532B]" />
            <h3 className="text-base font-semibold text-[#1A1816]">
              {t('cartTitle')}
            </h3>
            <span className="text-xs font-mono text-[#8C7D70]">
              ({items.reduce((acc, it) => acc + it.quantity, 0)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && onClearCart && (
              <button
                type="button"
                onClick={onClearCart}
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
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#F5EFE6] px-5 py-3 border-b border-[#EAE3D9]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-[#5C5044]">
              <Truck className="w-3.5 h-3.5 text-[#8C532B]" />
              <span>
                {isFreeShipping
                  ? t('freeShippingUnlocked')
                  : t('freeShippingGoal', { amount: formatPrice(freeShippingRemainder) })}
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#8C532B] font-bold">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-[#E5DCCE] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#8C532B] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3EDE2] text-[#8C532B] flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 opacity-60" />
              </div>
              <h4 className="text-base font-medium text-[#1A1816] mb-1">
                {t('emptyCart')}
              </h4>
              <p className="text-xs text-[#706456] max-w-xs mx-auto mb-6">
                {t('emptyCartSubtitle')}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1A1816] text-[#FAF9F5] text-xs font-medium rounded-sm hover:bg-[#322A23] transition-all cursor-pointer"
              >
                {t('startShopping')}
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.product.id}-${item.selectedShade?.id || 'base'}`}
                className="flex gap-4 p-3 rounded-sm bg-white border border-[#EAE3D9] transition-all"
              >
                <div className="w-20 h-20 rounded-sm overflow-hidden bg-[#F3EDE6] shrink-0 border border-[#EAE3D9]">
                  <ProductImage
                    src={item.product.image}
                    alt={item.product.name[language] || item.product.name.en}
                    category={item.product.category}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-medium text-[#1A1816] line-clamp-1">
                        {item.product.name[language] || item.product.name.en}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-[#998A7D] hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedShade && (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#786C60] mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.selectedShade.hex }}
                        />
                        <span className="truncate">
                          {item.selectedShade.name[language] || item.selectedShade.name.en}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5EFE6]">
                    <div className="flex items-center border border-[#DECFC0] rounded-sm bg-[#FAF9F5] h-7">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="px-2 h-full text-[#635547] hover:text-[#1A1816] cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-semibold tabular-nums text-[#1A1816]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockCount}
                        className="px-2 h-full text-[#635547] hover:text-[#1A1816] disabled:opacity-40 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-mono font-bold text-[#1A1816] tabular-nums">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}

          {items.length > 0 && (
            <label className="flex items-center gap-3 p-3 bg-[#F6F2EC] rounded-sm border border-[#E8DFC9] cursor-pointer text-xs text-[#42382F]">
              <input
                type="checkbox"
                checked={hasGiftWrap}
                onChange={(e) => setHasGiftWrap(e.target.checked)}
                className="rounded-xs accent-[#8C532B] cursor-pointer"
              />
              <Gift className="w-4 h-4 text-[#8C532B] shrink-0" />
              <span>{t('giftWrap')}</span>
            </label>
          )}

          {items.length > 0 && (
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#8A7B6E] absolute inset-y-0 start-2.5 my-auto" />
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="GLOW20"
                    className="w-full ps-8 pe-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm uppercase tracking-wider font-mono text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D2721] text-white text-xs font-medium rounded-sm hover:bg-[#453C33] transition-colors cursor-pointer"
                >
                  {t('applyCoupon')}
                </button>
              </div>

              {couponSuccess && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1.5">
                  <Check className="w-3 h-3" />
                  <span>{t('couponApplied')}</span>
                </div>
              )}
              {couponError && (
                <div className="text-[11px] text-rose-600 mt-1.5">
                  {t('invalidCoupon')}
                </div>
              )}
            </form>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-[#EAE3D9] space-y-3">
            <div className="space-y-1.5 text-xs text-[#5D5145]">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-mono tabular-nums">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('discountAmount')} (20%)</span>
                  <span className="font-mono tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              {hasGiftWrap && (
                <div className="flex justify-between">
                  <span>Gift Box</span>
                  <span className="font-mono tabular-nums">{formatPrice(giftWrapCost)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{t('shipping')}</span>
                <span className="font-mono tabular-nums">
                  {shippingCost === 0 ? t('free') : formatPrice(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-[#1A1816] pt-2 border-t border-[#F0EAE1]">
                <span>{t('grandTotal')}</span>
                <span className="font-mono tabular-nums text-base">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onCheckout(discountPercent, hasGiftWrap);
                onClose();
              }}
              className="w-full py-3.5 bg-[#1A1816] text-[#FAF9F5] hover:bg-[#342D26] text-xs font-medium tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>{t('checkout')}</span>
              {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
