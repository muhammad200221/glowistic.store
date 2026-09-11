import React, { useState } from 'react';
import { X, MapPin, Phone, Mail, Clock, Send, Check, MessageCircle, Camera, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { WHATSAPP_LINK, INSTAGRAM_LINK, INSTAGRAM_HANDLE } from '../constants/contact';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalBaseProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-[#FAF9F5] border border-[#DECFC0] w-full max-w-2xl rounded-sm shadow-2xl p-6 sm:p-8 text-start relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-full hover:bg-[#F2ECE3] text-[#1A1816] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-display font-medium text-[#1A1816] mb-4">
          {t('aboutTitle')}
        </h2>

        <div className="space-y-4 text-xs sm:text-sm text-[#5C5044] leading-relaxed mb-6">
          <p>{t('aboutP1')}</p>
          <p>{t('aboutP2')}</p>
        </div>

        <div className="border-t border-[#EAE3D9] pt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] mb-3">
            {t('boutiqueTitle')}
          </h4>
          <div className="space-y-2 text-xs text-[#52463A]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8C532B] shrink-0" />
              <span>{t('boutique1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8C532B] shrink-0" />
              <span>{t('boutique2')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ModalBaseProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-[#FAF9F5] border border-[#DECFC0] w-full max-w-xl rounded-sm shadow-2xl p-6 sm:p-8 text-start relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-1.5 rounded-full hover:bg-[#F2ECE3] text-[#1A1816] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-display font-medium text-[#1A1816] mb-1">
          {t('contactTitle')}
        </h2>
        <p className="text-xs text-[#6B5E52] mb-5">
          {t('contactSubtitle')}
        </p>

        {/* WhatsApp & Instagram Direct Cards */}
        <div className="space-y-3 mb-6">
          {/* WhatsApp Card */}
          <div className="p-4 rounded-sm bg-[#F3FAF4] border border-[#CFE8D2] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#194D22]">
                  {t('contactWhatsapp')}
                </div>
                <div className="text-[11px] text-[#476C4B]">
                  {language === 'ckb' ? 'وەڵامدانەوەی خێرا و ڕاوێژی پسپۆڕی بەرهەمەکان' : language === 'ar' ? 'رد فوري واستشارة تجميلية متخصصة' : 'Fast response & product consultation'}
                </div>
              </div>
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{t('contactWhatsapp')}</span>
            </a>
          </div>

          {/* Instagram Card */}
          <div className="p-4 rounded-sm bg-[#FAF5F2] border border-[#EEDAD0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E1306C] via-[#FD1D1D] to-[#F77737] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#3B2219] flex items-center gap-1.5">
                  <span>{t('contactInstagram')}</span>
                  <span className="text-[11px] font-mono text-[#8C532B] dir-ltr">{INSTAGRAM_HANDLE}</span>
                </div>
                <div className="text-[11px] text-[#78594D]">
                  {t('instagramDesc')}
                </div>
              </div>
            </div>
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#1A1816] hover:bg-[#332A22] text-[#FAF9F5] text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <span>{t('followInstagram')}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#E5B887]" />
            </a>
          </div>
        </div>

        {submitted ? (
          <div className="py-12 text-center bg-white p-6 rounded-sm border border-[#EAE3D9]">
            <Check className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#1A1816]">{t('messageSent')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#1A1816] mb-1">
                {t('fullName')} *
              </label>
              <input
                type="text"
                required
                placeholder="Full Name"
                className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1816] mb-1">
                {t('phoneNumber')} *
              </label>
              <input
                type="tel"
                required
                placeholder="0750 xxx xxxx"
                className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#1A1816] mb-1">
                {t('message')} *
              </label>
              <textarea
                required
                rows={4}
                placeholder={t('messagePlaceholder')}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DECFC0] rounded-sm text-[#1A1816] focus:outline-hidden focus:border-[#8C532B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1A1816] text-[#FAF9F5] text-xs font-medium tracking-wider uppercase rounded-sm hover:bg-[#342D26] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('sendMessage')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
