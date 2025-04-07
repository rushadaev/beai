'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useSafeTranslation } from '@/components/I18nProvider';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  user_id: string;
  agent_id: string;
  message: string;
  response: string;
  timestamp: Timestamp;
}

interface Chatbot {
  id: string;
  name: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ConversationPreview {
  id: string;
  user_id: string;
  agentName: string;
  timestamp: Timestamp;
  messageCount: number;
  relativeTime: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useSafeTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    activeChatbots: 0,
    totalConversations: 0,
    userSatisfaction: '0%',
    messagesExchanged: 0
  });
  const [recentConversations, setRecentConversations] = useState<ConversationPreview[]>([]);
  const [setupProgress, setSetupProgress] = useState({
    setup: { completed: 0, total: 2 },
    share: { completed: 0, total: 3 },
    track: { completed: 0, total: 2 }
  });

  useEffect(() => {
    async function loadDashboardData() {
      if (!user?.uid) return;
      
      try {
        // Fetch user's chatbots
        const chatbotsQuery = query(
          collection(db, 'chatbots'),
          where('userId', '==', user.uid)
        );
        
        const chatbotsSnapshot = await getDocs(chatbotsQuery);
        const chatbotsList = chatbotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Chatbot));
        
        // Get agent IDs for querying chat history
        const agentIds = chatbotsList.map(chatbot => chatbot.id);
        
        // Calculate dashboard statistics
        if (agentIds.length > 0) {
          await calculateDashboardStats(agentIds, chatbotsList);
          await fetchRecentConversations(agentIds, chatbotsList);
          calculateSetupProgress(chatbotsList);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [user]);
  
  async function calculateDashboardStats(agentIds: string[], chatbots: Chatbot[]) {
    try {
      // Query to get all chat messages for the user's chatbots
      const chatHistoryQuery = query(
        collection(db, 'chat_history'),
        where('agent_id', 'in', agentIds)
      );
      
      const chatHistorySnapshot = await getDocs(chatHistoryQuery);
      const chatMessages = chatHistorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      // Group by user_id and agent_id to count unique conversations
      const conversationMap = new Map<string, ChatMessage[]>();
      chatMessages.forEach(message => {
        const key = `${message.user_id}_${message.agent_id}`;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, []);
        }
        conversationMap.get(key)?.push(message);
      });
      
      // Calculate stats
      const totalConversations = conversationMap.size;
      const messagesExchanged = chatMessages.length;
      
      // For user satisfaction, using a placeholder calculation for now
      // In a real application, you would have a proper satisfaction metric
      const userSatisfaction = totalConversations > 0 ? '94%' : '0%';
      
      setDashboardStats({
        activeChatbots: chatbots.length,
        totalConversations,
        userSatisfaction,
        messagesExchanged
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
    }
  }
  
  async function fetchRecentConversations(agentIds: string[], chatbots: Chatbot[]) {
    try {
      // Create a query to get recent messages
      const recentMessagesQuery = query(
        collection(db, 'chat_history'),
        where('agent_id', 'in', agentIds),
        orderBy('timestamp', 'desc'),
        limit(30) // Get more than we need to ensure we have enough unique conversations
      );
      
      const messagesSnapshot = await getDocs(recentMessagesQuery);
      const recentMessages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      // Group by user_id and agent_id to identify unique conversations
      const conversationMap = new Map<string, ChatMessage[]>();
      recentMessages.forEach(message => {
        const key = `${message.user_id}_${message.agent_id}`;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, []);
        }
        conversationMap.get(key)?.push(message);
      });
      
      // Create preview objects for recent conversations
      const conversationPreviews: ConversationPreview[] = [];
      
      conversationMap.forEach((messages, key) => {
        // Sort messages by timestamp
        const sortedMessages = messages.sort((a, b) => 
          a.timestamp.toMillis() - b.timestamp.toMillis()
        );
        
        const [user_id, agent_id] = key.split('_');
        const chatbot = chatbots.find(bot => bot.id === agent_id);
        
        if (sortedMessages.length > 0 && chatbot) {
          // Get most recent message timestamp
          const latestTimestamp = sortedMessages[sortedMessages.length - 1].timestamp;
          
          // Generate relative time string (e.g., "2 hours ago")
          const relativeTime = getRelativeTimeString(latestTimestamp.toDate());
          
          conversationPreviews.push({
            id: key,
            user_id,
            agentName: chatbot.name,
            timestamp: latestTimestamp,
            messageCount: sortedMessages.length,
            relativeTime
          });
        }
      });
      
      // Get the 3 most recent unique conversations
      const sortedPreviews = conversationPreviews
        .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
        .slice(0, 3);
      
      setRecentConversations(sortedPreviews);
    } catch (error) {
      console.error('Error fetching recent conversations:', error);
    }
  }
  
  function calculateSetupProgress(chatbots: Chatbot[]) {
    // This is a placeholder implementation
    // In a real app, you would check various conditions to determine progress
    
    const hasCreatedChatbot = chatbots.length > 0;
    
    // Update setup progress
    setSetupProgress({
      setup: { 
        completed: hasCreatedChatbot ? 1 : 0,
        total: 2
      },
      share: { 
        completed: 0, // Would be based on installation/sharing status
        total: 3
      },
      track: { 
        completed: 0, // Would be based on analytics setup
        total: 2
      }
    });
  }
  
  function getRelativeTimeString(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    }
    if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    }
    return 'Just now';
  }

  // Convert stats object to array for rendering
  const stats = [
    { labelKey: 'dashboard.overview.stats.activeChatbots', value: dashboardStats.activeChatbots },
    { labelKey: 'dashboard.overview.stats.totalConversations', value: dashboardStats.totalConversations },
    { labelKey: 'dashboard.overview.stats.userSatisfaction', value: dashboardStats.userSatisfaction },
    { labelKey: 'dashboard.overview.stats.messagesExchanged', value: dashboardStats.messagesExchanged },
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">
            {t('dashboard.overview.welcome', { name: user?.email?.split('@')[0] || t('dashboard.overview.defaultUser') })}
          </h2>
          <p className="text-secondary">{t('dashboard.overview.subtitle')}</p>
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="h-4 w-24 animate-pulse rounded bg-dark/50"></div>
                <div className="mt-2 h-8 w-16 animate-pulse rounded bg-dark/70"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Stats */
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <p className="text-sm text-secondary">{t(stat.labelKey)}</p>
                <p className="mt-1 text-2xl font-semibold text-primary">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Quick actions */}
          <div className="col-span-1 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.overview.quickActions.title')}</h3>
            <div className="space-y-3">
              <Link 
                href="/dashboard/chatbots"
                className="flex items-center rounded-md border border-border bg-dark p-3 text-primary hover:bg-card/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                {t('dashboard.overview.quickActions.editChatbot')}
              </Link>
              <Link 
                href="/dashboard/insights"
                className="flex items-center rounded-md border border-border bg-dark p-3 text-primary hover:bg-card/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {t('dashboard.overview.quickActions.viewInsights')}
              </Link>
              <Link 
                href="/dashboard/chatbots"
                className="flex items-center rounded-md border border-border bg-dark p-3 text-primary hover:bg-card/80"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                {t('dashboard.overview.quickActions.addKnowledge')}
              </Link>
            </div>
          </div>
          
          {/* Progress tracker */}
          <div className="col-span-2 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.overview.progress.title')}</h3>
            <div className="mb-4 space-y-2">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary">{t('dashboard.overview.progress.setup.label')}</p>
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.setup.status', { 
                    completed: setupProgress.setup.completed, 
                    total: setupProgress.setup.total 
                  })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div 
                    className="h-2 rounded-full bg-accent" 
                    style={{ width: `${(setupProgress.setup.completed / setupProgress.setup.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary">{t('dashboard.overview.progress.share.label')}</p>
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.share.status', { 
                    completed: setupProgress.share.completed, 
                    total: setupProgress.share.total 
                  })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div 
                    className="h-2 rounded-full bg-accent" 
                    style={{ width: `${(setupProgress.share.completed / setupProgress.share.total) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary">{t('dashboard.overview.progress.track.label')}</p>
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.track.status', { 
                    completed: setupProgress.track.completed, 
                    total: setupProgress.track.total 
                  })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div 
                    className="h-2 rounded-full bg-accent" 
                    style={{ width: `${(setupProgress.track.completed / setupProgress.track.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <Link
              href="/dashboard/chatbots"
              className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
            >
              {t('dashboard.overview.progress.continueButton')}
            </Link>
          </div>
        </div>
        
        {/* Recent conversations */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-medium text-primary">{t('dashboard.overview.recentConversations.title')}</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
              <p className="text-secondary">Loading conversations...</p>
            </div>
          ) : recentConversations.length === 0 ? (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="mt-4 text-secondary">No conversations yet.</p>
              <p className="text-secondary">Once users start chatting with your chatbot, their conversations will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.overview.recentConversations.header.user')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.overview.recentConversations.header.date')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.overview.recentConversations.header.messages')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-secondary">{t('dashboard.overview.recentConversations.header.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentConversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-dark/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">
                        <div className="flex items-center">
                          <span>{conv.user_id}</span>
                          <span className="ml-2 text-xs text-secondary">({conv.agentName})</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{conv.relativeTime}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">{conv.messageCount}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link href={`/dashboard/history?conversation=${conv.id}`} className="rounded-md px-2 py-1 text-sm text-accent hover:text-accent/80">
                          {t('dashboard.overview.recentConversations.viewButton')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="border-t border-border p-4 text-right">
            <Link
              href="/dashboard/history"
              className="text-sm text-accent hover:text-accent/80"
            >
              {t('dashboard.overview.recentConversations.viewAllLink')} →
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 