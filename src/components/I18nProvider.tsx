'use client';

import { ReactNode, useState, useEffect } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  // SSR hydration fix - ensure we use a consistent language for initial render
  const [isMounted, setIsMounted] = useState(false);
  const [detectedLang, setDetectedLang] = useState('');

  // Save the detected language and force English for hydration
  useEffect(() => {
    // Save the detected language before switching to English
    if (typeof window !== 'undefined' && !isMounted) {
      setDetectedLang(i18n.language);
      i18n.changeLanguage('en');
    }
  }, [isMounted]);

  useEffect(() => {
    // Mark as mounted after hydration is complete
    setIsMounted(true);

    // Restore the detected language after hydration
    if (detectedLang && detectedLang !== 'en') {
      setTimeout(() => {
        i18n.changeLanguage(detectedLang);
      }, 0);
    }
  }, [detectedLang]);

  return (
    <I18nextProvider i18n={i18n}>
      <div data-hydrated={isMounted ? "true" : "false"}>
        {children}
      </div>
    </I18nextProvider>
  );
}

// Return type of our safe translation function
interface SafeTranslationReturn {
  t: (key: string, options?: Record<string, unknown>) => string;
  i18n: typeof i18n;
  isMounted: boolean;
}

/**
 * Hook to get the translation function that works safely with SSR
 * Use this instead of the standard useTranslation hook in components
 */
export function useSafeTranslation(): SafeTranslationReturn {
  const { t, i18n } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Wrapper function that returns English during SSR and actual translation after mount
  const safeT = (key: string, options?: Record<string, unknown>): string => {
    if (!isMounted) {
      // Return fallback values during SSR
      return getFallbackText(key);
    }
    
    // Ensure we return a string, not an object
    const translation = t(key, options);
    return typeof translation === 'string' ? translation : key;
  };

  return { 
    t: safeT,
    i18n,
    isMounted
  };
}

// Simple fallback function to return English text for common keys during SSR
function getFallbackText(key: string): string {
  const fallbacks: Record<string, string> = {
    'hero.title.line1': 'Multi-Agent',
    'hero.title.accent': 'Constructor',
    'hero.title.line2': 'Powerful API Integrations',
    'hero.subtitle': 'Build advanced AI agent systems with powerful API integrations, multi-agent collaboration, and custom tools - all through an intuitive no-code interface.',
    'hero.cta.create': 'Create Your Agent System',
    'hero.cta.tryFree': 'Try for Free',
    
    'header.nav.features': 'Features',
    'header.nav.howItWorks': 'How It Works',
    'header.nav.faq': 'FAQ',
    'header.auth.dashboard': 'Dashboard',
    'header.auth.login': 'Login',
    'header.auth.signUp': 'Sign Up',
    
    // Visual Builder
    'visualBuilder.header.eyebrow': 'Agent Constructor',
    'visualBuilder.header.title': 'Build Your Agent Systems Visually',
    'visualBuilder.windowTitle': 'Agent Builder Interface',
    'visualBuilder.placeholder.title': 'Visual Workflow Builder',
    'visualBuilder.placeholder.description': 'Drag and drop components to create your agent system',
    
    // Features
    'features.header.eyebrow': 'Features',
    'features.header.title': 'Everything You Need',
    'features.header.description': 'Powerful tools to build complex agent systems without code',
    
    // How It Works
    'howItWorks.header.eyebrow': 'How It Works',
    'howItWorks.header.title': 'Simple Three-Step Process',
    'howItWorks.header.description': 'Get started in minutes with our intuitive builder',
    
    // FAQ
    'faq.header.eyebrow': 'FAQ',
    'faq.header.title': 'Common Questions',
    'faq.header.description': 'See how our platform can help you build powerful AI agents',
    
    // CTA
    'cta.title.part1': 'Ready to build your',
    'cta.title.accent': 'AI Agent System',
    'cta.subtitle': 'Get started today with our powerful no-code builder',
    'cta.button': 'Start Building Now',
    
    // Footer
    'footer.copyright': '© 2023 VibeCraft. All rights reserved.',
    
    // Add more fallbacks for common keys as needed
  };

  // Try to find the exact key, or return a placeholder
  return fallbacks[key] || key.split('.').pop() || key;
} 