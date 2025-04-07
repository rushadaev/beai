'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getUserChatbots, createChatbot, deleteChatbot } from '@/lib/firebase/firestore';
import { useSafeTranslation } from '@/components/I18nProvider';

interface Chatbot {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    appearance: {
      headerText: string;
      primaryColor: string;
      secondaryColor: string;
      buttonColor: string;
      buttonTextColor: string;
      placement: string;
      size: string;
      [key: string]: unknown;
    };
    rules: Array<{
      id: string;
      text: string;
      enabled: boolean;
    }>;
    suggestions: Array<{
      id: string;
      text: string;
      enabled: boolean;
    }>;
  };
}

export default function ChatbotsPage() {
  const { user, loading: authLoading } = useAuth();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newChatbotName, setNewChatbotName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const router = useRouter();
  const { t } = useSafeTranslation();

  // Load chatbots when user is available
  useEffect(() => {
    const loadChatbots = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        setError('');
        const userChatbots = await getUserChatbots(user.uid);
        setChatbots(userChatbots as Chatbot[]);
      } catch (err) {
        console.error('Error loading chatbots:', err);
        setError('Error loading chatbots');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && user) {
      loadChatbots();
    }
  }, [user, authLoading]);

  // Create a new chatbot
  const handleCreateChatbot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) return;
    
    try {
      setIsCreating(true);
      setError('');
      
      const chatbot = await createChatbot(user.uid, newChatbotName);
      
      if (chatbot) {
        setChatbots([chatbot as Chatbot, ...chatbots]);
        setNewChatbotName('');
        setShowCreateForm(false);
        
        // Redirect to edit the new chatbot
        router.push(`/dashboard/chatbots/${chatbot.id}`);
      } else {
        setError(t('dashboard.chatbots.errors.create'));
      }
    } catch (err) {
      console.error('Error creating chatbot:', err);
      setError(t('dashboard.chatbots.errors.generic'));
    } finally {
      setIsCreating(false);
    }
  };

  // Delete a chatbot
  const handleDeleteChatbot = async (chatbotId: string) => {
    if (!confirm(t('dashboard.chatbots.deleteConfirm'))) return;
    
    try {
      setError('');
      const success = await deleteChatbot(chatbotId);
      
      if (success) {
        setChatbots(chatbots.filter(bot => bot.id !== chatbotId));
      } else {
        setError(t('dashboard.chatbots.errors.delete'));
      }
    } catch (err) {
      console.error('Error deleting chatbot:', err);
      setError(t('dashboard.chatbots.errors.generic'));
    }
  };

  // Format a date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">{t('dashboard.chatbots.title')}</h1>
            <p className="text-secondary">{t('dashboard.chatbots.subtitle')}</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
          >
            {t('dashboard.chatbots.createButton')}
          </button>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-500/10 p-3 text-red-400">
            <p>{error}</p>
          </div>
        )}
        
        {/* Create chatbot form */}
        {showCreateForm && (
          <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-medium text-primary">{t('dashboard.chatbots.createForm.title')}</h2>
            
            <form onSubmit={handleCreateChatbot} className="space-y-4">
              <div>
                <label htmlFor="chatbotName" className="block text-sm font-medium text-primary">
                  {t('dashboard.chatbots.createForm.nameLabel')}
                </label>
                <input
                  type="text"
                  id="chatbotName"
                  value={newChatbotName}
                  onChange={(e) => setNewChatbotName(e.target.value)}
                  placeholder={t('dashboard.chatbots.createForm.namePlaceholder')}
                  className="mt-1 block w-full rounded-md border border-border bg-dark px-3 py-2 text-primary shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
                >
                  {isCreating ? t('dashboard.chatbots.createForm.creatingButton') : t('dashboard.chatbots.createForm.createButton')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-md border border-border bg-dark px-4 py-2 text-sm font-medium text-primary hover:bg-card"
                >
                  {t('dashboard.chatbots.createForm.cancelButton')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Chatbots list */}
        {isLoading ? (
          <div className="py-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-6 shadow-sm animate-pulse">
                  <div className="flex justify-between">
                    <div className="space-y-3">
                      <div className="h-5 w-40 bg-dark rounded"></div>
                      <div className="h-4 w-24 bg-dark rounded"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-9 w-9 rounded-md bg-dark"></div>
                      <div className="h-9 w-9 rounded-md bg-dark"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : chatbots.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-12 shadow-sm">
            <div className="text-6xl mb-4">🤖</div>
            <h3 className="text-xl font-medium text-primary">{t('dashboard.chatbots.noChatbots.title')}</h3>
            <p className="mb-6 text-center text-secondary">
              {t('dashboard.chatbots.noChatbots.description')}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
            >
              {t('dashboard.chatbots.noChatbots.createButton')}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {chatbots.map((chatbot) => (
              <div key={chatbot.id} className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between">
                  <div 
                    className="flex-grow cursor-pointer" 
                    onClick={(e) => {
                      const url = `/dashboard/chatbots/${chatbot.id}`;
                      if (e.metaKey || e.ctrlKey) {
                        window.open(url, '_blank');
                      } else {
                        router.push(url);
                      }
                    }}
                  >
                    <h3 className="text-lg font-medium text-primary">{chatbot.name}</h3>
                    <p className="text-sm text-secondary">
                      {t('dashboard.chatbots.lastUpdated', { date: formatDate(chatbot.updatedAt) })}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const url = `/dashboard/chatbots/${chatbot.id}`;
                        if (e.metaKey || e.ctrlKey) {
                          window.open(url, '_blank');
                        } else {
                          router.push(url);
                        }
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-dark text-primary hover:bg-dark/80"
                      title={t('dashboard.chatbots.editButtonTitle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChatbot(chatbot.id);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-md bg-dark text-red-400 hover:bg-dark/80"
                      title={t('dashboard.chatbots.deleteButtonTitle')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 