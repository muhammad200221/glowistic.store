import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Printer,
  ShieldCheck,
  CreditCard,
  Banknote,
  Building2,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Truck,
} from 'lucide-react';
import { CartItem, CheckoutFormData, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountPercent: number;
  hasGiftWrap: boolean;
  onOrderCompleted: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountPercent,
  hasGiftWrap,
  onOrderCompleted,
}) => {
  const { isRTL, formatPrice, currency, t } = useLanguage();

  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    country: 'Iraq (العراق / کوردستان)',
    city: 'Erbil (هەولێر)',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });

  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const giftWrapCost = hasGiftWrap ? 3 : 0;
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const grandTotal = Math.max(0, subtotal - discountAmount + giftWrapCost + shippingCost);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      const orderId = `LL-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        items: [...items],
        customer: { ...formData },
        subtotal,
        discount: discountAmount,
        shipping: shippingCost,
        total: grandTotal,
        currency,
        estimatedDelivery: t('estimatedDeliveryValue'),
      };

      setCompletedOrder(newOrder);
      setStep('success');
      onOrderCompleted();
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="bg-[#FAF9F5] border border-[#DECFC0] w-full max-w-3xl rounded-sm shadow-2xl overflow-hidden my-auto text-start animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#EAE3D9] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-display font-medium text-[#1A1816]">
              {step === 'success' ? t('orderSuccessTitle') : t('checkoutTitle')}
            </h2>
            <p className="text-xs text-[#706456]">
              {step === 'success'
                ? t('orderSuccessSubtitle')
                : '100% Secure Checkout & Cash on Delivery'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B5E52] hover:text-[#1A1816] hover:bg-[#F2ECE3] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'processing' && (
          <div className="py-24 px-6 text-center space-y-4">
            <div className="w-14 h-14 border-3 border-[#E5DCCE] border-t-[#8C532B] rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-semibold text-[#1A1816]">
              {t('processingOrder')}
            </h3>
            <p className="text-xs text-[#7A6D60]">
              Generating your authentic luxury invoice and dispatching to courier...
            </p>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-8">
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#EAE3D9] text-xs font-semibold uppercase tracking-wider text-[#8C532B]">
                <span>1. {t('stepContact')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t('fullNamePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('phoneNumber')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phonePlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('emailAddress')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('emailPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#EAE3D9] text-xs font-semibold uppercase tracking-wider text-[#8C532B]">
                <span>2. {t('stepShipping')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('city')} *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] cursor-pointer"
                  >
                    <option value="Erbil (هەولێر)">{t('cityErbil')}</option>
                    <option value="Sulaymaniyah (سلێمانی)">{t('citySuli')}</option>
                    <option value="Duhok (دهۆک)">{t('cityDuhok')}</option>
                    <option value="Halabja (هەڵەبجە)">{t('cityHalabja')}</option>
                    <option value="Kirkuk (کەرکووک)">{t('cityKirkuk')}</option>
                    <option value="Baghdad (بەغدا)">{t('cityBaghdad')}</option>
                    <option value="Basra (بەسرە)">{t('cityBasra')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('streetAddress')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('streetPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#2A241F] mb-1">
                    {t('orderNotes')}
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('orderNotesPlaceholder')}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#EAE3D9] text-xs font-semibold uppercase tracking-wider text-[#8C532B]">
                <span>3. {t('stepPayment')}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-sm border flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#8C532B] bg-white ring-1 ring-[#8C532B]'
                      : 'border-[#DECFC0] bg-white/70 hover:border-[#A8988A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                    className="mt-0.5 accent-[#8C532B]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
                      <Banknote className="w-4 h-4 text-[#8C532B]" />
                      <span>{t('paymentCod')}</span>
                    </div>
                    <p className="text-[11px] text-[#695D51] mt-1">
                      {t('paymentCodDesc')}
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-sm border flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'fib'
                      ? 'border-[#8C532B] bg-white ring-1 ring-[#8C532B]'
                      : 'border-[#DECFC0] bg-white/70 hover:border-[#A8988A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fib"
                    checked={formData.paymentMethod === 'fib'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'fib' })}
                    className="mt-0.5 accent-[#8C532B]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
                      <Building2 className="w-4 h-4 text-[#8C532B]" />
                      <span>{t('paymentFib')}</span>
                    </div>
                    <p className="text-[11px] text-[#695D51] mt-1">
                      {t('paymentFibDesc')}
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-sm border flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'fastpay'
                      ? 'border-[#8C532B] bg-white ring-1 ring-[#8C532B]'
                      : 'border-[#DECFC0] bg-white/70 hover:border-[#A8988A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="fastpay"
                    checked={formData.paymentMethod === 'fastpay'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'fastpay' })}
                    className="mt-0.5 accent-[#8C532B]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
                      <Smartphone className="w-4 h-4 text-[#8C532B]" />
                      <span>{t('paymentFastpay')}</span>
                    </div>
                    <p className="text-[11px] text-[#695D51] mt-1">
                      {t('paymentFastpayDesc')}
                    </p>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-sm border flex items-start gap-3 cursor-pointer transition-all ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#8C532B] bg-white ring-1 ring-[#8C532B]'
                      : 'border-[#DECFC0] bg-white/70 hover:border-[#A8988A]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                    className="mt-0.5 accent-[#8C532B]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
                      <CreditCard className="w-4 h-4 text-[#8C532B]" />
                      <span>{t('paymentCard')}</span>
                    </div>
                    <p className="text-[11px] text-[#695D51] mt-1">
                      {t('paymentCardDesc')}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 bg-white rounded-sm border border-[#EAE3D9] space-y-2">
              <div className="flex justify-between text-xs text-[#635547]">
                <span>{t('subtotal')}</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                  <span>{t('discountAmount')}</span>
                  <span className="font-mono">-{formatPrice(discountAmount)}</span>
                </div>
              )}
              {hasGiftWrap && (
                <div className="flex justify-between text-xs text-[#635547]">
                  <span>Gift Wrap</span>
                  <span className="font-mono">{formatPrice(giftWrapCost)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#635547]">
                <span>{t('shipping')}</span>
                <span className="font-mono">{shippingCost === 0 ? t('free') : formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#1A1816] pt-2 border-t border-[#F0EAE1]">
                <span>{t('grandTotal')}</span>
                <span className="font-mono text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-[#DECFC0] rounded-sm text-xs font-medium text-[#2A241F] hover:bg-white transition-colors cursor-pointer"
              >
                Back to Store
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 bg-[#1A1816] hover:bg-[#342D26] text-[#FAF9F5] text-xs font-medium tracking-wider uppercase rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <span>{t('confirmOrder')}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        )}

        {step === 'success' && completedOrder && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-6 bg-[#F4EDE4] border border-[#DECFC0] rounded-sm text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
              <h3 className="text-xl font-display font-medium text-[#1A1816] mb-1">
                Order Confirmed
              </h3>
              <p className="text-xs text-[#6B5E52] max-w-md mx-auto mb-4">
                {t('orderSuccessSubtitle')}
              </p>

              <div className="inline-flex items-center gap-4 bg-white px-4 py-2 rounded-sm border border-[#DECFC0] text-xs font-mono">
                <span className="text-[#8C7D70]">{t('orderIdLabel')}:</span>
                <span className="font-bold text-[#8C532B]">{completedOrder.id}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-[#EAE3D9] space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] pb-2 border-b border-[#F0EAE1]">
                {t('receiptSummary')}
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#8C7D70] block">{t('orderDateLabel')}</span>
                  <span className="font-medium text-[#1A1816]">{completedOrder.date}</span>
                </div>
                <div>
                  <span className="text-[#8C7D70] block">Customer</span>
                  <span className="font-medium text-[#1A1816]">{completedOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[#8C7D70] block">Destination</span>
                  <span className="font-medium text-[#1A1816]">{completedOrder.customer.city}</span>
                </div>
                <div>
                  <span className="text-[#8C7D70] block">{t('estimatedDeliveryLabel')}</span>
                  <span className="font-medium text-emerald-700">{completedOrder.estimatedDelivery}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EAE1] space-y-2">
                {completedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs text-[#52463B]">
                    <span>
                      {item.quantity}x {item.product.name.en}
                      {item.selectedShade ? ` (${item.selectedShade.name.en})` : ''}
                    </span>
                    <span className="font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#F0EAE1] flex justify-between text-sm font-bold text-[#1A1816]">
                <span>Total Paid (COD/Online)</span>
                <span className="font-mono text-base">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                onClick={handlePrint}
                className="px-5 py-2.5 border border-[#DECFC0] bg-white rounded-sm text-xs font-medium text-[#1A1816] hover:bg-[#F4EDE4] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#8C532B]" />
                <span>{t('printReceipt')}</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#342D26] text-white text-xs font-medium rounded-sm transition-all cursor-pointer"
              >
                {t('continueShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
