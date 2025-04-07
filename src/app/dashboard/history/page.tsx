'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSafeTranslation } from '@/components/I18nProvider';
import { useAuth } from '@/lib/context/AuthContext';
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

interface ConversationGroup {
  id: string;
  user_id: string;
  agent_id: string;
  agentName: string;
  messages: ChatMessage[];
  startTime: Timestamp;
  duration: string;
  status: 'completed' | 'abandoned';
}

export default function HistoryPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned'>('all');
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationGroup[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationGroup | null>(null);
  
  // Fetch user's chatbots and history
  useEffect(() => {
    async function fetchChatbots() {
      if (!user?.uid) return;
      
      try {
        const chatbotsQuery = query(
          collection(db, 'chatbots'),
          where('userId', '==', user.uid)
        );
        
        const chatbotsSnapshot = await getDocs(chatbotsQuery);
        const chatbotsList = chatbotsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Chatbot));
        
        // After fetching chatbots, fetch chat history
        if (chatbotsList.length > 0) {
          await fetchChatHistory(chatbotsList);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching chatbots:', error);
        setLoading(false);
      }
    }
    
    fetchChatbots();
  }, [user]);
  
  // Fetch chat history for the user's chatbots
  async function fetchChatHistory(userChatbots: Chatbot[]) {
    try {
      const agentIds = userChatbots.map(chatbot => chatbot.id);
      
      // Create a query to get all chat messages for the user's chatbots
      const chatHistoryQuery = query(
        collection(db, 'chat_history'),
        where('agent_id', 'in', agentIds),
        orderBy('timestamp', 'desc'),
        limit(100) // Limit to recent conversations
      );
      
      const chatHistorySnapshot = await getDocs(chatHistoryQuery);
      const chatMessages = chatHistorySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
      
      // Group messages by user_id and agent_id to form conversations
      const conversationMap = new Map<string, ChatMessage[]>();
      
      chatMessages.forEach(message => {
        const key = `${message.user_id}_${message.agent_id}`;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, []);
        }
        conversationMap.get(key)?.push(message);
      });
      
      // Convert map to array of conversation groups
      const conversationGroups: ConversationGroup[] = [];
      
      conversationMap.forEach((messages, key) => {
        // Sort messages by timestamp
        const sortedMessages = messages.sort((a, b) => 
          a.timestamp.toMillis() - b.timestamp.toMillis()
        );
        
        const [user_id, agent_id] = key.split('_');
        const chatbot = userChatbots.find(bot => bot.id === agent_id);
        
        if (sortedMessages.length > 0 && chatbot) {
          // Calculate conversation duration
          const startTime = sortedMessages[0].timestamp;
          const endTime = sortedMessages[sortedMessages.length - 1].timestamp;
          const durationMs = endTime.toMillis() - startTime.toMillis();
          const durationMinutes = Math.floor(durationMs / 60000);
          const durationSeconds = Math.floor((durationMs % 60000) / 1000);
          const duration = `${durationMinutes}m ${durationSeconds}s`;
          
          // Determine if conversation is completed or abandoned
          // If last message is from user with no response, it's abandoned
          const lastMessage = sortedMessages[sortedMessages.length - 1];
          const status = lastMessage.response ? 'completed' : 'abandoned';
          
          conversationGroups.push({
            id: key,
            user_id,
            agent_id,
            agentName: chatbot.name,
            messages: sortedMessages,
            startTime,
            duration,
            status
          });
        }
      });
      
      // Sort conversations by start time (newest first)
      const sortedConversations = conversationGroups.sort((a, b) => 
        b.startTime.toMillis() - a.startTime.toMillis()
      );
      
      setConversations(sortedConversations);
      
      // Set first conversation as selected by default if any exist
      if (sortedConversations.length > 0) {
        setSelectedConversation(sortedConversations[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setLoading(false);
    }
  }
  
  // Filter conversations based on selected filter
  const filteredConversations = filter === 'all'
    ? conversations
    : conversations.filter(conv => conv.status === filter);
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">{t('dashboard.history.title')}</h2>
          <p className="text-secondary">{t('dashboard.history.subtitle')}</p>
        </div>
        
        {/* Filters and search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-md border border-border">
            {(['all', 'completed', 'abandoned'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm transition-colors ${ 
                  filter === status 
                    ? 'bg-accent text-dark' 
                    : 'bg-card text-secondary hover:text-primary'
                }`}
              >
                {t(`dashboard.history.filters.status.${status}`)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder={t('dashboard.history.filters.searchPlaceholder')}
                className="w-full rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary placeholder:text-secondary focus:border-accent focus:outline-none"
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select className="rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary focus:border-accent focus:outline-none">
              <option value="recent">{t('dashboard.history.filters.sort.recent')}</option>
              <option value="oldest">{t('dashboard.history.filters.sort.oldest')}</option>
              <option value="duration">{t('dashboard.history.filters.sort.duration')}</option>
              <option value="messages">{t('dashboard.history.filters.sort.messages')}</option>
            </select>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card shadow-sm">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
              <p className="mt-4 text-secondary">Loading conversation history...</p>
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {!loading && conversations.length === 0 && (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-border bg-card shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="mt-4 text-secondary">No conversation history found.</p>
            <p className="text-secondary">Start chatting with your chatbot to see conversations here.</p>
          </div>
        )}
        
        {/* Conversation list */}
        {!loading && conversations.length > 0 && (
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.history.table.header.user')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.history.table.header.started')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.history.table.header.duration')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.history.table.header.messages')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.history.table.header.status')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-secondary">{t('dashboard.history.table.header.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredConversations.map((conversation) => (
                    <tr 
                      key={conversation.id} 
                      className={`hover:bg-dark/50 ${selectedConversation?.id === conversation.id ? 'bg-dark/30' : ''}`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-primary">{conversation.user_id}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">
                        {conversation.startTime.toDate().toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{conversation.duration}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{conversation.messages.length}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        {conversation.status === 'completed' ? (
                          <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400">
                            {t('dashboard.history.table.status.completed')}
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400">
                            {t('dashboard.history.table.status.abandoned')}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedConversation(conversation);
                          }} 
                          className="rounded bg-dark px-3 py-1.5 text-xs text-primary hover:bg-dark/70"
                        >
                          {t('dashboard.history.table.actions.view')}
                        </button>
                        <button 
                          onClick={(e) => e.stopPropagation()} 
                          className="ml-2 rounded bg-dark px-3 py-1.5 text-xs text-primary hover:bg-dark/70"
                        >
                          {t('dashboard.history.table.actions.export')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Simple pagination - can be enhanced later */}
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <div className="text-sm text-secondary">
                {t('dashboard.history.pagination.showing', { start: 1, end: filteredConversations.length, total: filteredConversations.length })}
              </div>
              {/* Placeholder for pagination controls */}
              <div className="flex">
                <button disabled className="mx-1 inline-flex cursor-not-allowed items-center rounded-md border border-border bg-dark px-4 py-2 text-sm text-secondary opacity-50">
                  {t('dashboard.history.pagination.previous')}
                </button>
                <button className="mx-1 inline-flex items-center rounded-md border border-border bg-accent px-4 py-2 text-sm text-dark">
                  1
                </button>
                <button disabled className="mx-1 inline-flex cursor-not-allowed items-center rounded-md border border-border bg-dark px-4 py-2 text-sm text-secondary opacity-50">
                  {t('dashboard.history.pagination.next')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Selected Conversation Preview */}
        {selectedConversation && (
          <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-primary">
                {t('dashboard.history.preview.title', { user: selectedConversation.user_id })}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary">{selectedConversation.agentName}</span>
                <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-dark hover:bg-accent/80">
                  {t('dashboard.history.preview.viewTranscriptButton')}
                </button>
              </div>
            </div>
            
            <div className="mb-4 flex flex-wrap gap-3 text-sm">
              <div className="rounded-full bg-dark px-3 py-1 text-secondary">
                <span className="font-medium text-primary">{t('dashboard.history.preview.startedLabel')}:</span> {selectedConversation.startTime.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
              <div className="rounded-full bg-dark px-3 py-1 text-secondary">
                <span className="font-medium text-primary">{t('dashboard.history.preview.durationLabel')}:</span> {selectedConversation.duration}
              </div>
              <div className="rounded-full bg-dark px-3 py-1 text-secondary">
                <span className="font-medium text-primary">{t('dashboard.history.preview.messagesLabel')}:</span> {selectedConversation.messages.length}
              </div>
              <div className="rounded-full bg-dark px-3 py-1 text-secondary">
                <span className="font-medium text-primary">{t('dashboard.history.preview.statusLabel')}:</span> 
                <span className={`ml-1 ${selectedConversation.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {t(`dashboard.history.preview.status.${selectedConversation.status}`)}
                </span>
              </div>
            </div>
            
            <div className="h-64 overflow-y-auto rounded-md border border-border bg-dark p-4 text-sm">
              {selectedConversation.messages.map((msg, index) => (
                <div key={index} className="mb-3">
                  {/* User message */}
                  <div className="mb-3">
                    <div className="mb-1 text-secondary">
                      {t('dashboard.history.preview.message.user')} - {msg.timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                    <div className="rounded-lg bg-card px-4 py-3 text-primary">
                      {msg.message}
                    </div>
                  </div>
                  
                  {/* Bot response (if exists) */}
                  {msg.response && (
                    <div className="mb-3">
                      <div className="mb-1 text-secondary">
                        {t('dashboard.history.preview.message.bot')} - {msg.timestamp.toDate().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                      <div className="rounded-lg border border-border bg-dark px-4 py-3 text-primary">
                        {msg.response}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 