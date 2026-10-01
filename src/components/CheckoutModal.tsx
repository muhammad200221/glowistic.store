import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Banknote,
  ArrowRight,
  ArrowLeft,
  Truck,
  MessageCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CartItem, CheckoutFormData, Order } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { WHATSAPP_PHONE_RAW } from '../constants/contact';

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
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // When modal opens or new items exist in cart, ensure it always presents a fresh checkout form
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setStep('form');
      setCompletedOrder(null);
      setCopiedWhatsApp(false);
    }
  }, [isOpen, items.length]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const giftWrapCost = hasGiftWrap ? 3 : 0;
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const grandTotal = Math.max(0, subtotal - discountAmount + giftWrapCost + shippingCost);

  // Helper to build a comprehensive WhatsApp invoice message
  const buildWhatsAppOrderMessage = (order: Order) => {
    const rawPhone = WHATSAPP_PHONE_RAW.replace(/[^0-9]/g, '');

    const itemsText = order.items
      .map((item, idx) => {
        const pName = item.product.name.en || item.product.name.ckb || item.product.name.ar;
        const shadeText = item.selectedShade
          ? ` (${item.selectedShade.name.en || item.selectedShade.name.ckb})`
          : '';
        const priceText = formatPrice(item.product.price * item.quantity);
        return `${idx + 1}. ${item.quantity}x ${pName}${shadeText} — ${priceText}`;
      })
      .join('\n');

    const notesText = order.customer.notes?.trim()
      ? `\n📝 *تێبینی:* ${order.customer.notes.trim()}`
      : '';

    const msg =
`✨ *داواکاری نوێ لە فرۆشگای Glowistic* ✨
━━━━━━━━━━━━━━━━━━━━
🔢 *ژمارەی داواکاری:* #${order.id}
📅 *بەروار:* ${order.date}

👤 *زانیاریی کڕیار:*
• ناو: ${order.customer.fullName}
• مۆبایل: ${order.customer.phone}
• شار: ${order.customer.city}
• ناونیشانی ورد: ${order.customer.address}${notesText}

📦 *لیستی بەرهەمەکان:*
${itemsText}

━━━━━━━━━━━━━━━━━━━━
💰 *کۆی بەرهەمەکان:* ${formatPrice(order.subtotal)}
${order.discount > 0 ? `🎁 *داشکاندن:* -${formatPrice(order.discount)}\n` : ''}🚚 *تێچووی گەیاندن:* ${order.shipping === 0 ? 'بێبەرامبەر (Free)' : formatPrice(order.shipping)}
💵 *کۆی گشتی بۆ دان:* ${formatPrice(order.total)}
🚚 *شێوازی پارەدان:* کاش لە کاتی وەرگرتن (COD)
━━━━━━━━━━━━━━━━━━━━
تکایە ئەم داواکارییە وەربگرن و پەیوەندیم پێوە بکەن بۆ گەیاندن. سوپاس!`;

    return {
      rawMessage: msg,
      url: `https://wa.me/${rawPhone}?text=${encodeURIComponent(msg)}`,
    };
  };

  const handleCloseAndReset = () => {
    setStep('form');
    setCompletedOrder(null);
    setCopiedWhatsApp(false);
    onClose();
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    setTimeout(() => {
      const orderId = `GL-${Math.floor(100000 + Math.random() * 900000)}`;
      const newOrder: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        items: [...items],
        customer: { ...formData, paymentMethod: 'cod' },
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

      // Immediately open WhatsApp with the formatted order details
      const { url } = buildWhatsAppOrderMessage(newOrder);
      try {
        window.open(url, '_blank');
      } catch {
        // Handled through the on-screen WhatsApp button
      }
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyWhatsAppMessage = () => {
    if (!completedOrder) return;
    const { rawMessage } = buildWhatsAppOrderMessage(completedOrder);
    navigator.clipboard.writeText(rawMessage).then(() => {
      setCopiedWhatsApp(true);
      setTimeout(() => setCopiedWhatsApp(false), 3000);
    });
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
                : t('paymentCodOnlyDesc')}
            </p>
          </div>

          <button
            onClick={handleCloseAndReset}
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
              لە کاتی ئامادەکردنی داواکاری و ناردنی بۆ واتسئەپ...
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

            {/* Exclusive Cash on Delivery Payment Method */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-[#EAE3D9] text-xs font-semibold uppercase tracking-wider text-[#8C532B]">
                <span>3. {t('stepPayment')}</span>
              </div>

              <div className="p-4 rounded-sm border-2 border-[#8C532B] bg-[#FDFBF7] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#8C532B]/10 flex items-center justify-center shrink-0 text-[#8C532B] mt-0.5">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#1A1816]">
                        {t('paymentCodOnly')}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {t('paymentCod')}
                      </span>
                    </div>
                    <p className="text-xs text-[#695D51] mt-1.5 leading-relaxed">
                      {t('paymentCodOnlyDesc')}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EAE3D9] flex flex-wrap gap-2 text-[11px] text-[#695D51]">
                  <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xs border border-[#DECFC0]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>پشکنینی بەرهەم لە کاتی وەرگرتن</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xs border border-[#DECFC0]">
                    <Truck className="w-3.5 h-3.5 text-[#8C532B]" />
                    <span>گەیاندنی خێرا بۆ هەموو عێراق و کوردستان</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xs border border-[#DECFC0]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>پارەدان بە دەست بە کاش (بێ پێشەکی)</span>
                  </span>
                </div>
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
                onClick={handleCloseAndReset}
                className="px-5 py-3 border border-[#DECFC0] rounded-sm text-xs font-medium text-[#2A241F] hover:bg-white transition-colors cursor-pointer"
              >
                گەڕانەوە بۆ فرۆشگا
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
                {t('orderSuccessTitle')}
              </h3>
              <p className="text-xs text-[#6B5E52] max-w-md mx-auto mb-4">
                {t('orderSuccessSubtitle')}
              </p>

              <div className="inline-flex items-center gap-4 bg-white px-4 py-2 rounded-sm border border-[#DECFC0] text-xs font-mono">
                <span className="text-[#8C7D70]">{t('orderIdLabel')}:</span>
                <span className="font-bold text-[#8C532B]">{completedOrder.id}</span>
              </div>
            </div>

            {/* Prominent Direct WhatsApp Order Notification Box */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-[#f0fdf4] to-emerald-50 border-2 border-emerald-500 rounded-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <MessageCircle className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <span>ناردنی خێرای داواکاری بۆ واتسئەپ (WhatsApp)</span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                      خێراترین گەیاندن
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    {t('whatsappOrderSent')}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={buildWhatsAppOrderMessage(completedOrder).url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[200px] py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-sm text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>{t('whatsappOrderBtn')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={handleCopyWhatsAppMessage}
                  className="px-4 py-3 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-900 rounded-sm text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedWhatsApp ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>کۆپیکرا!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-700" />
                      <span>کۆپیکردنی دەقی وەسڵ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Receipt Summary */}
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
                  <span className="text-[#8C7D70] block">ناوی کڕیار</span>
                  <span className="font-medium text-[#1A1816]">{completedOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[#8C7D70] block">شار و ناونیشان</span>
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
                      {item.quantity}x {item.product.name.en || item.product.name.ckb}
                      {item.selectedShade ? ` (${item.selectedShade.name.en || item.selectedShade.name.ckb})` : ''}
                    </span>
                    <span className="font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#F0EAE1] flex justify-between text-sm font-bold text-[#1A1816]">
                <div className="flex items-center gap-1.5">
                  <span>{t('grandTotal')}</span>
                  <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    (کاش لە کاتی وەرگرتن)
                  </span>
                </div>
                <span className="font-mono text-base">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2.5 border border-[#DECFC0] bg-white rounded-sm text-xs font-medium text-[#1A1816] hover:bg-[#F4EDE4] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#8C532B]" />
                  <span>{t('printReceipt')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseAndReset}
                  className="px-4 py-2.5 border border-[#DECFC0] bg-white rounded-sm text-xs font-medium text-[#1A1816] hover:bg-[#F4EDE4] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#8C532B]" />
                  <span>{t('orderAgain')}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#342D26] text-white text-xs font-medium rounded-sm transition-all cursor-pointer shadow-sm"
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
