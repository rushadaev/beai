'use client';

import { useState, useEffect } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

// Assuming ChatAppearance is defined/imported
// Example definition if not imported:
interface ChatAppearance {
  headerText: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  placement: string;
  size: string;
}

interface InstallModalProps {
  chatbotId: string;
  appearance: ChatAppearance; // Added appearance prop
}

export default function InstallModal({ chatbotId, appearance }: InstallModalProps) {
  const { t } = useSafeTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate installation code with proper URL and appearance config
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const appearanceJson = JSON.stringify(appearance);
  
  // Note: Escaping JSON for inclusion in a script tag within a string literal can be tricky.
  // Using JSON.stringify and embedding directly is usually safe for simple objects.
  const installCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['BeAIChatWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','beai','${baseUrl}/widget.js');
  beai('init', '${chatbotId}', ${appearanceJson}); // Pass appearance as 3rd arg
</script>`;

  useEffect(() => {
    // Listen for the custom event to open the modal
    const handleOpenModal = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('open-install-modal', handleOpenModal);
    
    return () => {
      window.removeEventListener('open-install-modal', handleOpenModal);
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(installCode);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-secondary hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium text-primary">{t('dashboard.installModal.title')}</h3>
          <p className="mt-1 text-sm text-secondary">
            {t('dashboard.installModal.description')}
          </p>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <div className="mb-2 rounded-md border border-border bg-dark p-4">
              <pre className="text-sm text-primary overflow-x-auto whitespace-pre-wrap">
                {installCode}
              </pre>
            </div>
            <button
              onClick={handleCopyCode}
              className="absolute right-2 top-2 rounded-md bg-dark/80 px-2 py-1 text-xs text-secondary hover:text-primary"
            >
              {copied ? t('dashboard.installModal.copiedButton') : t('dashboard.installModal.copyButton')}
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary">
            {t('dashboard.installModal.codePlacementHelp')}
          </p>
        </div>
        
        <div className="mb-4 rounded-md border border-border p-4">
          <h4 className="mb-2 font-medium text-primary">{t('dashboard.installModal.integrations.title')}</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>{t('dashboard.installModal.integrations.point1')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>{t('dashboard.installModal.integrations.point2')}</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>{t('dashboard.installModal.integrations.point3')}</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
          >
            {t('dashboard.installModal.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
} 