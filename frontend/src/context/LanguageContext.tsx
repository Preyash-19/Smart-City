import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language, type TranslationDictionary } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  formatDate: (dateStr: string) => string;
  formatNumber: (num: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('smartCityLang') as Language;
    return (saved === 'hi' || saved === 'mr' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    localStorage.setItem('smartCityLang', newLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      const localeMap: Record<Language, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };

      return new Intl.DateTimeFormat(localeMap[language], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number) => {
    try {
      const localeMap: Record<Language, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        mr: 'mr-IN',
      };
      return new Intl.NumberFormat(localeMap[language]).format(num);
    } catch {
      return num.toString();
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
