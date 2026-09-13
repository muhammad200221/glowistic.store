import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Truck,
  CreditCard,
  Check,
  Globe,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  BellRing,
  ChevronDown,
  Camera,
  Copy,
  Mail,
  Phone,
  Send,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { WHATSAPP_LINK, INSTAGRAM_LINK, INSTAGRAM_HANDLE } from '../constants/contact';
import { registerVipMember, registerVipMemberAsync, getDeviceClaimedVip, VipMember, VipRegistrationStatus } from '../utils/vip';
import brandLogoImg from '../assets/images/instagram_profile_logo_1789135947210.jpg';
import { AdminVipModal } from './AdminVipModal';

interface ComingSoonProps {
  onEnterStore?: () => void;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ onEnterStore: _onEnterStore }) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const [contactInput, setContactInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vipResult, setVipResult] = useState<{ member: VipMember; status: VipRegistrationStatus } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isAdminVipModalOpen, setIsAdminVipModalOpen] = useState(false);

  // Check if this mobile device already claimed a VIP code
  useEffect(() => {
    const claimedOnDevice = getDeviceClaimedVip();
    if (claimedOnDevice) {
      setVipResult({
        member: claimedOnDevice,
        status: 'already_claimed_device',
      });
      setIsSubmitted(true);
    }
  }, []);

  // Countdown timer targeting October 1, 2026 at 8:00 PM (20:00) local Iraq/Baghdad time (UTC+3)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: October 1, 2026 at 20:00:00 (8:00 PM) in Iraq Time (UTC+3)
    // 2026-10-01T20:00:00+03:00 = 1790874000000 ms
    const targetTimestamp = new Date('2026-10-01T20:00:00+03:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetTimestamp - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim()) return;

    // Save to Firestore Cloud & local storage
    const result = await registerVipMemberAsync(contactInput.trim());
    setVipResult(result);
    setIsSubmitted(true);
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ckb', label: 'کوردی', flag: '☀️' },
    { code: 'ar', label: 'العربية', flag: '✨' },
    { code: 'en', label: 'English', flag: '🌐' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1816] flex flex-col justify-between selection:bg-[#E5B887]/30 selection:text-[#1A1816] relative overflow-hidden">
      {/* Decorative ambient background accents */}
      <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-32 start-1/4 w-96 h-96 rounded-full bg-[#E5B887]/15 blur-3xl" />
        <div className="absolute top-20 end-1/4 w-80 h-80 rounded-full bg-[#D4A373]/10 blur-3xl" />
      </div>

      {/* Top Bar */}
      <header className="relative z-20 w-full border-b border-[#EAE3D9] bg-[#FAF9F5]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D5B085] shadow-xs bg-[#1A1816]">
              <img
                src={brandLogoImg}
                alt="GLOWISTIC"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                className="text-lg font-serif font-bold tracking-wider text-[#1A1816]"
              >
                GLOWISTIC
              </span>
              <span className="hidden sm:inline-block ms-2 text-[11px] text-[#8C7B6E] tracking-widest uppercase">
                Haute Beauty
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-3 py-1.5 rounded-sm border border-[#E0D5C7] bg-white text-xs font-medium text-[#2C2621] hover:border-[#1A1816] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-[#8C532B]" />
                <span>{languages.find((l) => l.code === language)?.label}</span>
                <ChevronDown className="w-3 h-3 text-[#7B6E62]" />
              </button>

              {langDropdownOpen && (
                <div className="absolute top-full end-0 mt-1.5 w-32 bg-white border border-[#DECFC0] rounded-sm shadow-md py-1 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-start px-3 py-1.5 text-xs text-[#1A1816] hover:bg-[#FAF6F0] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {language === l.code && <Check className="w-3 h-3 text-[#8C532B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-20 text-center flex-1 flex flex-col items-center justify-center">
        {/* Animated Royal Announcement Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3ECE2] border border-[#E3D4C4] text-[#8C532B] text-xs font-semibold mb-6 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#C16223] animate-ping" />
          <span>{t('comingSoonBadge')}</span>
          <span className="text-[#C1B0A0]">·</span>
          <span className="text-[11px] font-normal tracking-wide text-[#6D5D50]">Official Launch</span>
        </div>

        {/* Majestic Royal Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-royal-heading font-bold text-[#1A1816] leading-[1.3] sm:leading-[1.25] mb-6 max-w-3xl">
          {t('comingSoonHeading')}
        </h1>

        <p className="text-base sm:text-lg text-[#5D5146] max-w-2xl leading-relaxed mb-10">
          {t('comingSoonSubheading')}
        </p>

        {/* Live Countdown Timer Cards */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-5 w-full max-w-lg mb-12" dir="ltr">
          <div className="bg-white border border-[#DECFC0] rounded-sm p-3 sm:p-5 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#1A1816] tabular-nums">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-[#8A7B6E] mt-1">
              {t('daysCount')}
            </span>
          </div>

          <div className="bg-white border border-[#DECFC0] rounded-sm p-3 sm:p-5 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#1A1816] tabular-nums">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-[#8A7B6E] mt-1">
              {t('hoursCount')}
            </span>
          </div>

          <div className="bg-white border border-[#DECFC0] rounded-sm p-3 sm:p-5 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#1A1816] tabular-nums">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-[#8A7B6E] mt-1">
              {t('minutesCount')}
            </span>
          </div>

          <div className="bg-white border border-[#DECFC0] rounded-sm p-3 sm:p-5 shadow-xs flex flex-col items-center">
            <span className="text-2xl sm:text-4xl font-serif font-bold text-[#8C532B] tabular-nums">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs uppercase font-medium tracking-wider text-[#8A7B6E] mt-1">
              {t('secondsCount')}
            </span>
          </div>
        </div>

        {/* VIP Notification Form Card */}
        <div className="w-full max-w-xl bg-white border border-[#E2D5C7] rounded-sm p-6 sm:p-8 shadow-md mb-12 text-start relative overflow-hidden">
          <div className="absolute top-0 end-0 w-32 h-32 bg-[#FAF4ED] rounded-full -translate-y-16 translate-x-16 pointer-events-none" />

          <div className="flex items-center gap-2 text-xs font-semibold text-[#8C532B] uppercase tracking-wider mb-2">
            <BellRing className="w-4 h-4 text-[#C16223]" />
            <span>VIP Launch Access</span>
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1A1816] mb-2">
            {t('notifyTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-[#66594C] leading-relaxed mb-6">
            {t('notifyDesc')}
          </p>

          {isSubmitted && vipResult ? (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-sm border text-start flex items-start gap-3 ${
                  vipResult.status === 'new'
                    ? 'bg-[#F5F9F4] border-[#D0E5CE]'
                    : 'bg-[#FFF9F2] border-[#EBD2B8]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5 ${
                    vipResult.status === 'new' ? 'bg-emerald-700' : 'bg-[#8C532B]'
                  }`}
                >
                  {vipResult.status === 'new' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs sm:text-sm font-semibold ${
                      vipResult.status === 'new' ? 'text-emerald-900' : 'text-[#613312]'
                    }`}
                  >
                    {vipResult.status === 'already_claimed_device'
                      ? t('deviceAlreadyClaimedNotice')
                      : vipResult.status === 'already_registered_contact'
                      ? t('alreadyRegisteredNotice')
                      : t('newVipWelcome')}
                  </p>
                  <div
                    className={`mt-1.5 flex items-center gap-2 text-xs ${
                      vipResult.status === 'new' ? 'text-emerald-800' : 'text-[#7D461E]'
                    }`}
                  >
                    {vipResult.member.type === 'email' ? (
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="font-medium dir-ltr">{vipResult.member.contact}</span>
                  </div>
                </div>
              </div>

              {/* VIP Voucher Box */}
              <div className="p-4 sm:p-5 rounded-sm bg-[#FAF6F0] border-2 border-dashed border-[#D5B085] text-start relative overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-[#8C532B]">
                    {t('vipCodeExclusive')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#8C532B] text-white text-[10px] font-bold tracking-wider">
                    20% OFF VIP
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-sm border border-[#E2D5C7]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D5B085] shrink-0" />
                    <span className="font-mono text-base sm:text-lg font-bold tracking-wider text-[#1A1816] select-all">
                      {vipResult.member.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(vipResult.member.code)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                      copiedCode
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#1A1816] text-[#FAF9F5] hover:bg-[#332A22]'
                    }`}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-[#E5B887]" />}
                    <span>{copiedCode ? t('vipCodeCopied') : t('copyCode')}</span>
                  </button>
                </div>

                {/* Direct Return & Delivery Actions */}
                <div className="mt-3 pt-3 border-t border-[#E8DCCF]">
                  <div className="text-[11px] font-medium text-[#7A6B5D] mb-2">
                    {vipResult.member.type === 'phone'
                      ? 'کۆدەکە لە مۆبایلەکەت یان واتسئاپ پاشەکەوت بکە:'
                      : 'کۆدەکە بۆ ئیمەیڵەکەت یان واتسئاپ بنێرە:'}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {vipResult.member.type === 'phone' ? (
                      <>
                        <a
                          href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                            `سڵاو GLOWISTIC، من لە لیستی VIP خۆم تۆمارکردووە.\n🎟️ کۆدی داشکاندنی ٢٠٪ ی من: ${vipResult.member.code}\n📱 ژمارەی مۆبایل: ${vipResult.member.contact}\n\nتکایە لە لیستی داواکارییە پێشوەختەکان داینێن.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 rounded-sm bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('sendToWhatsApp')}</span>
                        </a>

                        <a
                          href={`sms:${vipResult.member.contact.replace(/[^\d+]/g, '')}?body=${encodeURIComponent(
                            `GLOWISTIC VIP 20% Discount Code: ${vipResult.member.code}`
                          )}`}
                          className="py-2 px-3 rounded-sm bg-white border border-[#D5C7B7] hover:bg-[#F3EDE4] text-[#1A1816] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#8C532B]" />
                          <span>{t('sendToSms')}</span>
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href={`mailto:${vipResult.member.contact}?subject=${encodeURIComponent(
                            `Glowistic VIP 20% Discount Voucher [${vipResult.member.code}]`
                          )}&body=${encodeURIComponent(
                            `سڵاو بەڕێز،\n\nئەمە کۆدی تایبەتی داشکاندنی ٢٠٪ ی VIP ی تۆیە بۆ فرۆشگای فەرمی GLOWISTIC:\n\n🎟️ کۆدی داشکاندن: ${vipResult.member.code}\n📧 ئیمەیڵی تۆمارکراو: ${vipResult.member.contact}\n\nلە کاتی کردنەوەی فەرمیدا ئەم کۆدە بنووسە بۆ داشکاندنی ٢٠٪ لەسەر تەواوی بەرهەمە ڕەسەنەکان.\n\nGLOWISTIC Beauty Boutique`
                          )}`}
                          className="flex-1 py-2 px-3 rounded-sm bg-[#1A1816] hover:bg-[#332A22] text-[#FAF9F5] text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#E5B887]" />
                          <span>{t('sendToEmail')}</span>
                        </a>

                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `✨ GLOWISTIC VIP Discount (20% OFF)\nکۆدی داشکاندنی تایبەت بە من: ${vipResult.member.code}\nئیمەیڵ: ${vipResult.member.contact}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-2 px-3 rounded-sm bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{t('sendToWhatsApp')}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                required
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                placeholder={t('notifyInputPlaceholder')}
                className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-sm border border-[#D5C7B7] bg-[#FAF9F5] focus:bg-white focus:outline-none focus:border-[#1A1816] transition-colors"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1A1816] text-[#FAF9F5] text-xs sm:text-sm font-medium rounded-sm hover:bg-[#332A22] transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
              >
                <span>{t('notifySubmit')}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

        {/* Store Pillars / Sneak Peek */}
        <div className="w-full max-w-3xl border-t border-[#EAE3D9] pt-10">
          <div className="text-xs font-semibold uppercase tracking-widest text-[#8C532B] mb-6">
            {t('sneakPeekTitle')}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-start">
            <div className="p-4 rounded-sm bg-white/60 border border-[#E9DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EBE0] text-[#8C532B] flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1816] mb-1">
                  {t('feature1Title')}
                </h4>
                <p className="text-[11px] text-[#6E6154] leading-relaxed">
                  {t('feature1Desc')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-white/60 border border-[#E9DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EBE0] text-[#8C532B] flex items-center justify-center shrink-0 mt-0.5">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1816] mb-1">
                  {t('feature2Title')}
                </h4>
                <p className="text-[11px] text-[#6E6154] leading-relaxed">
                  {t('feature2Desc')}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-sm bg-white/60 border border-[#E9DFD3] flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F4EBE0] text-[#8C532B] flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1A1816] mb-1">
                  {t('feature3Title')}
                </h4>
                <p className="text-[11px] text-[#6E6154] leading-relaxed">
                  {t('feature3Desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact and Social Shortcut */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-sm border border-[#D5C7B7] bg-white text-xs font-medium text-[#222] hover:bg-[#F7F3EE] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
            <span>{t('contactWhatsapp')}</span>
          </a>

          <a
            href={INSTAGRAM_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-sm border border-[#F1CCD9] bg-white text-xs font-medium text-[#8C234E] hover:bg-[#FFF5F8] transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Camera className="w-4 h-4 text-[#E1306C]" />
            <span>{t('contactInstagram')}</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-[#EAE3D9] py-6 px-4 text-center bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7D7063]">
          <div className="flex items-center gap-3">
            <p>© 2026 GLOWISTIC Beauty Boutique. {t('allRightsReserved')}</p>
            <button
              onClick={() => setIsAdminVipModalOpen(true)}
              className="text-[11px] text-[#A39486] hover:text-[#1A1816] underline underline-offset-4 transition-colors cursor-pointer"
              title="بینینی خشتە و داگرتنی فایلی ئێگزڵ"
            >
              📊 فایلی ئێگزڵی VIP
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={INSTAGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#8C234E] hover:text-[#E1306C] transition-colors font-medium"
            >
              <Camera className="w-3.5 h-3.5 text-[#E1306C]" />
              <span className="dir-ltr">{INSTAGRAM_HANDLE}</span>
            </a>
            <span className="inline-flex items-center gap-1.5 text-xs text-[#8C532B]">
              <Sparkles className="w-3 h-3 text-[#E5B887]" />
              <span>Erbil & Sulaymaniyah, Kurdistan Region</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Admin VIP Excel Viewer & Downloader Modal */}
      <AdminVipModal
        isOpen={isAdminVipModalOpen}
        onClose={() => setIsAdminVipModalOpen(false)}
      />
    </div>
  );
};
