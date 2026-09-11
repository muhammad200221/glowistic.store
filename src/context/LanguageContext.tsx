import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Direction, Currency } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRTL: boolean;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatPrice: (priceInUSD: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Iraqi Dinar conversion rate
const EXCHANGE_RATES: Record<Currency, number> = {
  IQD: 1310, // 1 USD = 1,310 Iraqi Dinar
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = (localStorage.getItem('glowistic_lang') || localStorage.getItem('lilas_lang')) as Language;
    return saved && ['ckb', 'ar', 'en'].includes(saved) ? saved : 'ckb';
  });

  const [currency, setCurrencyState] = useState<Currency>('IQD');

  const direction: Direction = language === 'en' ? 'ltr' : 'rtl';
  const isRTL = direction === 'rtl';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem('glowistic_lang', language);
  }, [language, direction]);

  useEffect(() => {
    localStorage.setItem('glowistic_currency', 'IQD');
  }, [currency]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const currentDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = currentDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      });
    }

    return text;
  };

  const formatPrice = (priceInUSD: number): string => {
    const rate = EXCHANGE_RATES.IQD || 1310;
    const converted = priceInUSD * rate;
    // Round to nearest 250 IQD for clean, realistic Iraqi pricing
    const rounded = Math.round(converted / 250) * 250;

    if (language === 'en') {
      return `${rounded.toLocaleString('en-US')} IQD`;
    }
    return `${rounded.toLocaleString('en-US')} د.ع`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRTL,
        currency,
        setLanguage,
        setCurrency,
        t,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
