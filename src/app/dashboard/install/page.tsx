'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getUserChatbots } from '@/lib/firebase/firestore';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Link from 'next/link';

interface Chatbot {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function InstallPage() {
  const { user, loading: authLoading } = useAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Load chatbots when user is available
  useEffect(() => {
    const loadChatbots = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        setError('');
        const userChatbots = await getUserChatbots(user.uid);
        setChatbots(userChatbots as Chatbot[]);
        
        // Select the first chatbot by default if available
        if (userChatbots.length > 0) {
          setSelectedChatbot(userChatbots[0].id);
        }
      } catch (err) {
        console.error('Error loading chatbots:', err);
        setError('Failed to load chatbots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      loadChatbots();
    }
  }, [user, authLoading]);

  const handleCopyCode = () => {
    if (!selectedChatbot) return;
    
    const code = getInstallationCode(selectedChatbot);
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
      }
    );
  };

  const getInstallationCode = (chatbotId: string) => {
    return `<!-- BeAI Chatbot Widget -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['BeAI-Widget'] = o;
    w[o] = w[o] || function() {
      (w[o].q = w[o].q || []).push(arguments)
    };
    js = d.createElement(s);
    fjs = d.getElementsByTagName(s)[0];
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'beai', 'https://widget.beai.app/loader.js'));
  beai('init', '${chatbotId}');
</script>
<!-- End BeAI Chatbot Widget -->`;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">Install Chatbot</h1>
          <p className="text-secondary">
            Add your AI chatbot to any website by copying and pasting the code snippet
          </p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-red-400">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accent"></div>
            </div>
          </div>
        ) : chatbots.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-primary">No Chatbots Found</h2>
            <p className="mb-4 text-secondary">
              Create a chatbot first before getting installation code
            </p>
            <Link
              href="/dashboard/chatbots"
              className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
            >
              Create a Chatbot
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium text-primary">
                Select a Chatbot
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="chatbot-select" className="block text-sm font-medium text-primary">
                    Choose which chatbot to install
                  </label>
                  <select
                    id="chatbot-select"
                    value={selectedChatbot || ''}
                    onChange={(e) => setSelectedChatbot(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {chatbots.map((chatbot) => (
                      <option key={chatbot.id} value={chatbot.id}>
                        {chatbot.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {selectedChatbot && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-primary">
                    Installation Code
                  </h2>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-dark hover:bg-accent/80"
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                
                <div className="rounded-lg border border-border bg-dark p-1">
                  <SyntaxHighlighter
                    language="html"
                    style={vscDarkPlus}
                    customStyle={{
                      background: 'transparent',
                      margin: 0,
                      padding: '1rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {getInstallationCode(selectedChatbot)}
                  </SyntaxHighlighter>
                </div>
                
                <div className="mt-4 rounded-md bg-dark/50 p-4">
                  <h3 className="mb-2 text-md font-medium text-primary">
                    Installation Instructions
                  </h3>
                  <ol className="list-decimal space-y-2 pl-5 text-sm text-secondary">
                    <li>
                      Copy the code snippet above by clicking the &quot;Copy Code&quot; button
                    </li>
                    <li>
                      Paste the code into the <code className="rounded bg-dark px-1 py-0.5 text-xs text-accent">&lt;head&gt;</code> or 
                      before the closing <code className="rounded bg-dark px-1 py-0.5 text-xs text-accent">&lt;/body&gt;</code> tag of your website
                    </li>
                    <li>
                      Save and publish your website
                    </li>
                    <li>
                      The chatbot will appear on your website according to your appearance settings
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 