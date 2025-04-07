'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useSafeTranslation } from '@/components/I18nProvider';

export default function Header() {
  const { t, i18n, isMounted } = useSafeTranslation();
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showAuthButtons, setShowAuthButtons] = useState(false);
  const [currentLang, setCurrentLang] = useState('');

  useEffect(() => {
    if (isMounted) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, isMounted]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setShowAuthButtons(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setCurrentLang(lng);
  };

  return (
    <div className="fixed w-full z-50 px-4 pt-4">
      <header className={`mx-auto max-w-7xl backdrop-blur-sm transition-all duration-300 rounded-xl border border-opacity-20 ${
        scrolled 
          ? 'bg-dark/90 shadow-lg border-border py-3' 
          : 'bg-dark/80 border-border py-5'
      }`}>
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">
              <span className="text-accent">Vibe</span>Craft
            </span>
            <div className="ml-6 flex space-x-2">
              <button
                onClick={() => changeLanguage('en')}
                className={`text-xs px-2 py-1 rounded ${(!isMounted || currentLang === 'en') ? 'bg-accent text-dark' : 'text-primary hover:bg-secondary/20'}`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('ru')}
                className={`text-xs px-2 py-1 rounded ${(isMounted && currentLang === 'ru') ? 'bg-accent text-dark' : 'text-primary hover:bg-secondary/20'}`}
              >
                RU
              </button>
            </div>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-primary hover:text-secondary">
              {t('header.nav.features')}
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-primary hover:text-secondary">
              {t('header.nav.howItWorks')}
            </Link>
            <Link href="#faq" className="text-sm font-medium text-primary hover:text-secondary">
              {t('header.nav.faq')}
            </Link>
            
            <div className="w-48 h-9 flex justify-center items-center">
              {loading ? (
                <div className="h-2 w-16 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <div className={`transition-opacity duration-300 ${showAuthButtons ? 'opacity-100' : 'opacity-0'}`}>
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
                    >
                      {t('header.auth.dashboard')}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-medium text-primary hover:text-secondary mr-4"
                      >
                        {t('header.auth.login')}
                      </Link>
                      <Link
                        href="/register"
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
                      >
                        {t('header.auth.signUp')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
} 