// client/src/context/LanguageContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '@/locales/en.json';
import hiTranslations from '@/locales/hi.json';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation store
const translations: Record<Language, any> = {
  en: enTranslations,
  hi: hiTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get saved language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'hi' || saved === 'en') ? saved : 'en';
  });

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang; // Set HTML lang attribute
  };

  // Translation function - supports nested keys like 'nav.home'
  const t = (key: string): string => {
    const keys = key.split('.');
    let translation: any = translations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object') {
        translation = translation[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        return key; // Return key if translation not found
      }
    }
    
    return typeof translation === 'string' ? translation : key;
  };

  // Set initial language attribute on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
