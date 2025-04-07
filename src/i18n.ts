import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly
import translationEN from '../public/locales/en/translation.json';
import translationRU from '../public/locales/ru/translation.json';

// Define resources
const resources = {
  en: {
    translation: translationEN,
  },
  ru: {
    translation: translationRU,
  },
};

// Determine if we're on the server or client
const isServer = typeof window === 'undefined';

// Configure i18next
const instance = i18n.createInstance();

// Initialize i18next
instance
  // Only use language detector on client-side
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    
    // Force English during SSR for consistent hydration
    lng: isServer ? 'en' : undefined,
    
    // Disable auto detection during SSR
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    },
    
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default instance; 