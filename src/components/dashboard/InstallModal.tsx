'use client';

import { useState, useEffect } from 'react';

interface InstallModalProps {
  chatbotId: string;
}

export default function InstallModal({ chatbotId }: InstallModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Generate installation code
  const installCode = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['BeAIChatWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    w[o].l=1*new Date();js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.async=1;js.src=f;fjs.parentNode.insertBefore(js,fjs);
  })(window,document,'script','beai','https://cdn.beai.com/widget.js');
  beai('init', '${chatbotId}');
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
          <h3 className="text-xl font-medium text-primary">Install Your Chatbot</h3>
          <p className="mt-1 text-sm text-secondary">
            Copy the code below and paste it into your website to install the chatbot.
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
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary">
            Add this code to the &lt;head&gt; or &lt;body&gt; section of your website.
          </p>
        </div>
        
        <div className="mb-4 rounded-md border border-border p-4">
          <h4 className="mb-2 font-medium text-primary">Integration Options</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>Works with any website or platform that allows custom HTML</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>Automatically inherits your site theme and styling</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-green-400">✓</span>
              <span>Customizable position, colors, and size</span>
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 