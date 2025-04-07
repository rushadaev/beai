'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ChatbotEditor from '@/components/dashboard/ChatbotEditor';
import InstallModal from '@/components/dashboard/InstallModal';
import { getChatbot, updateChatbot, updateChatbotSettings } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { AppearanceSettings, Rule, Question } from '@/components/dashboard/ChatbotEditor';
import { AgentConfig } from '@/components/dashboard/editor/Agent';
import { ChatAppearance } from '@/components/widgets/ChatWidget'; 

export default function ChatbotPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const chatbotId = params.id as string;
  
  interface ChatbotData {
    id?: string;
    name?: string;
    userId?: string;
    settings?: {
      appearance?: AppearanceSettings;
      rules?: Rule[];
      suggestions?: Question[];
      agent?: AgentConfig;
      [key: string]: unknown;
    };
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: unknown;
  }
  
  const [chatbot, setChatbot] = useState<ChatbotData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Load chatbot data when component mounts
  useEffect(() => {
    const loadChatbot = async () => {
      if (!user?.uid || !chatbotId) return;
      
      try {
        setIsLoading(true);
        setError('');
        const chatbotData = await getChatbot(chatbotId);
        
        // Check if chatbot exists and belongs to current user
        if (!chatbotData) {
          setError('Chatbot not found');
          return;
        }
        
        // Type check for userId before comparing
        if (!('userId' in chatbotData) || chatbotData.userId !== user.uid) {
          setError('You do not have permission to view this chatbot');
          return;
        }
        
        // Cast to the correct type
        setChatbot(chatbotData as unknown as ChatbotData);
      } catch (err) {
        console.error('Error loading chatbot:', err);
        setError('Failed to load chatbot. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && user) {
      loadChatbot();
    }
  }, [user, authLoading, chatbotId]);
  
  // Handle settings update from any editor tab
  const handleSettingsUpdate = async (
    settingType: 'appearance' | 'rules' | 'suggestions' | 'agent', 
    settings: AppearanceSettings | Rule[] | Question[] | AgentConfig
  ) => {
    if (!chatbotId || !user?.uid || !chatbot) return;
    
    try {
      setIsSaving(true);
      setSaveMessage('');
      
      // Update settings in Firestore - need to cast to unknown first
      await updateChatbotSettings(chatbotId, settingType, settings as unknown as Record<string, unknown>);
      
      // Update local state
      setChatbot({
        ...chatbot,
        settings: {
          ...(chatbot.settings || {}),
          [settingType]: settings
        }
      });
      
      setSaveMessage('Changes saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error(`Error updating ${settingType} settings:`, err);
      setError(`Failed to save ${settingType} settings. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update chatbot name
  const handleNameChange = async (newName: string) => {
    if (!chatbotId || !user?.uid) return;
    
    try {
      setIsSaving(true);
      
      await updateChatbot(chatbotId, { name: newName });
      
      setChatbot({
        ...chatbot,
        name: newName
      });
      
      setSaveMessage('Chatbot name updated');
      
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error updating chatbot name:', err);
      setError('Failed to update chatbot name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Link
            href="/dashboard/chatbots"
            className="mr-4 flex h-8 w-8 items-center justify-center rounded-md bg-dark text-primary hover:bg-dark/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          
          {isLoading ? (
            <div className="h-8 w-40 animate-pulse rounded bg-dark"></div>
          ) : error ? (
            <h1 className="text-2xl font-bold text-primary">Error</h1>
          ) : (
            <div className="flex items-center">
              <input
                type="text"
                value={String(chatbot?.name || '')}
                onChange={(e) => setChatbot({ ...chatbot, name: e.target.value })}
                onBlur={(e) => handleNameChange(e.target.value)}
                className="text-2xl font-bold bg-transparent text-primary border-b border-transparent focus:border-accent focus:outline-none"
              />
            </div>
          )}
        </div>
        
        {error ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-8 text-center">
            <h2 className="mb-2 text-xl font-medium text-red-400">{error}</h2>
            <p className="text-secondary">
              Please try again or return to the <Link href="/dashboard/chatbots" className="text-accent hover:underline">chatbots list</Link>.
            </p>
          </div>
        ) : isLoading ? (
          <div className="rounded-lg border border-border bg-card p-8">
            <div className="space-y-6">
              <div className="h-8 w-48 animate-pulse rounded bg-dark"></div>
              <div className="grid grid-cols-2 gap-6">
                <div className="h-64 animate-pulse rounded-lg bg-dark"></div>
                <div className="h-64 animate-pulse rounded-lg bg-dark"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ChatbotEditor 
              chatbotId={chatbotId}
              initialSettings={chatbot?.settings || {}}
              onUpdateAppearance={(settings) => handleSettingsUpdate('appearance', settings)}
              onUpdateRules={(settings) => handleSettingsUpdate('rules', settings)}
              onUpdateSuggestions={(settings) => handleSettingsUpdate('suggestions', settings)}
              onUpdateAgent={(config) => handleSettingsUpdate('agent', config)}
              isSaving={isSaving}
            />
            
            <InstallModal chatbotId={chatbotId} appearance={chatbot?.settings?.appearance as ChatAppearance} />
            
            {/* Toast notification that doesn't affect layout */}
            {saveMessage && (
              <div className="fixed bottom-5 right-5 z-50 max-w-xs p-3 rounded-md bg-green-500/10 text-green-400 shadow-md font-medium text-sm flex items-center transition-opacity duration-300">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                {saveMessage}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 