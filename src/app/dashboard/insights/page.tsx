'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useSafeTranslation } from '@/components/I18nProvider';
import { useAuth } from '@/lib/context/AuthContext';
import { getUserChatbots, getChatHistory } from '@/lib/api';

interface ChatMessage {
  id: string;
  user_id: string;
  agent_id: string;
  message: string;
  response: string;
  timestamp: string | Date;
}

interface Chatbot {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TopQuestion {
  question: string;
  frequency: number;
  responseTime: string;
  satisfaction: number;
}

export default function InsightsPage() {
  const { t } = useSafeTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalConversations: '0',
    avgLength: '0 min',
    satisfaction: '0%',
    responseRate: '0%'
  });
  const [changes, setChanges] = useState({
    totalConversations: '+0%', 
    avgLength: '+0%', 
    satisfaction: '+0%', 
    responseRate: '+0%'
  });
  const [topQuestions, setTopQuestions] = useState<TopQuestion[]>([]);
  const [conversationData, setConversationData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  
  // Fetch data on component mount and when time range changes
  useEffect(() => {
    
    // Define fetchChatHistory inside useEffect to capture dependencies correctly
    async function fetchChatHistory(agentIds: string[]) {
      try {
        // Get the date range based on selected time range
        const { startDate, endDate } = getDateRange(timeRange);
        
        // Fetch messages using our API client
        // Note: The API client will need to handle filtering by date range
        const chatMessages = await getChatHistory(agentIds, 1000); // Use a large limit to get all messages
        
        // Filter messages by date locally
        const filteredMessages = chatMessages.filter((message: ChatMessage) => {
          const messageDate = typeof message.timestamp === 'string' 
            ? new Date(message.timestamp) 
            : message.timestamp;
          return messageDate >= startDate && messageDate <= endDate;
        });
        
        // Process the data to generate insights
        processInsightsData(filteredMessages, timeRange);
        
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    }
    
    // Define processInsightsData inside useEffect
    function processInsightsData(messages: ChatMessage[], range: 'day' | 'week' | 'month' | 'year') {
      if (messages.length === 0) {
        // No data to process
        setStats({
          totalConversations: '0',
          avgLength: '0 min',
          satisfaction: '0%',
          responseRate: '0%'
        });
        setChanges({
          totalConversations: '+0%',
          avgLength: '+0%',
          satisfaction: '+0%',
          responseRate: '+0%'
        });
        setConversationData([0, 0, 0, 0, 0, 0, 0]);
        setTopQuestions([]);
        return;
      }
      
      // Group messages by conversation (user_id + agent_id)
      const conversationMap = new Map<string, ChatMessage[]>();
      
      messages.forEach(message => {
        const key = `${message.user_id}_${message.agent_id}`;
        if (!conversationMap.has(key)) {
          conversationMap.set(key, []);
        }
        conversationMap.get(key)?.push(message);
      });
      
      // Calculate conversation metrics
      const totalConversations = conversationMap.size;
      
      // Calculate average conversation length (in minutes)
      let totalDuration = 0;
      conversationMap.forEach(convoMessages => {
        if (convoMessages.length < 2) return;
        
        const firstMsg = convoMessages[0];
        const lastMsg = convoMessages[convoMessages.length - 1];
        
        const firstTimestamp = typeof firstMsg.timestamp === 'string' 
          ? new Date(firstMsg.timestamp) 
          : firstMsg.timestamp;
          
        const lastTimestamp = typeof lastMsg.timestamp === 'string' 
          ? new Date(lastMsg.timestamp) 
          : lastMsg.timestamp;
          
        // Using Date.getTime() instead of toMillis()
        const durationMs = lastTimestamp.getTime() - firstTimestamp.getTime();
        totalDuration += durationMs;
      });
      
      const avgLengthMs = totalConversations > 0 ? totalDuration / totalConversations : 0;
      const avgLengthMin = Math.round(avgLengthMs / 60000 * 10) / 10; // Round to 1 decimal place
      
      // Calculate response rate (percentage of user messages that received a response)
      const responseRate = messages.filter(msg => msg.response && msg.response.trim() !== '').length / messages.length * 100;
      
      // For satisfaction, use a placeholder calculation (would be based on actual feedback in a real app)
      // In this example, let's assume a random satisfaction rate between 80% and 100%
      const placeholderSatisfaction = totalConversations > 0 ? 80 + Math.floor(Math.random() * 20) : 0;
      
      // Generate random changes for demonstration purposes
      // In a real app, these would be calculated by comparing with the previous period
      const randomChanges = {
        totalConversations: (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 15) + '%',
        avgLength: (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 10) + '%',
        satisfaction: (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 5) + '%',
        responseRate: (Math.random() > 0.5 ? '+' : '-') + Math.floor(Math.random() * 3) + '%'
      };
      
      // Update stats
      setStats({
        totalConversations: totalConversations.toString(),
        avgLength: `${avgLengthMin} min`,
        satisfaction: `${placeholderSatisfaction}%`,
        responseRate: `${Math.round(responseRate)}%`
      });
      
      // Update changes
      setChanges(randomChanges);
      
      // Generate conversation volume data for chart
      const volumeData = generateConversationVolumeData(messages, range);
      setConversationData(volumeData);
      
      // Generate top questions data
      const questions = generateTopQuestions(messages);
      setTopQuestions(questions);
    }
    
    async function fetchInsightsData() {
      if (!user?.uid) return;
      
      setLoading(true);
      
      try {
        // 1. Fetch user's chatbots using the API client
        const chatbotsList = await getUserChatbots(user.uid);
        
        if (chatbotsList.length === 0) {
          setLoading(false);
          return;
        }
        
        const agentIds = chatbotsList.map((chatbot: Chatbot) => chatbot.id);
        
        // 2. Fetch chat history for all agents
        await fetchChatHistory(agentIds);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching insights data:', error);
        setLoading(false);
      }
    }
    
    fetchInsightsData();
  }, [user, timeRange]);
  
  function getDateRange(range: 'day' | 'week' | 'month' | 'year') {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    return { startDate, endDate };
  }
  
  function generateConversationVolumeData(messages: ChatMessage[], range: 'day' | 'week' | 'month' | 'year'): number[] {
    // Default to 7 data points (e.g., for a week view, show 7 days)
    const dataPoints = 7;
    const result = Array(dataPoints).fill(0);
    
    if (messages.length === 0) return result;
    
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Group messages by day/period
    messages.forEach(message => {
      const messageDate = typeof message.timestamp === 'string' 
        ? new Date(message.timestamp) 
        : message.timestamp;
      
      let index = 0;
      
      switch (range) {
        case 'day':
          // Group by hour, divide 24 hours into 7 segments
          const hour = messageDate.getHours();
          index = Math.min(Math.floor(hour / (24 / dataPoints)), dataPoints - 1);
          break;
        
        case 'week':
          // Group by day of week
          const daysAgo = Math.floor((now.getTime() - messageDate.getTime()) / msPerDay);
          index = dataPoints - 1 - Math.min(daysAgo, dataPoints - 1);
          break;
        
        case 'month':
          // Group by week of month
          const weeksAgo = Math.floor((now.getTime() - messageDate.getTime()) / (msPerDay * 7));
          index = dataPoints - 1 - Math.min(weeksAgo, dataPoints - 1);
          break;
        
        case 'year':
          // Group by month
          const monthsAgo = (now.getMonth() - messageDate.getMonth() + 12) % 12;
          index = dataPoints - 1 - Math.min(monthsAgo, dataPoints - 1);
          break;
      }
      
      if (index >= 0 && index < dataPoints) {
        result[index]++;
      }
    });
    
    // Normalize the data (for visualization purposes)
    const maxValue = Math.max(...result);
    if (maxValue > 0) {
      return result.map(val => Math.round((val / maxValue) * 100));
    }
    
    return result;
  }
  
  function generateTopQuestions(messages: ChatMessage[]): TopQuestion[] {
    // In a real application, you would use NLP or some other method to identify and group similar questions
    // For this demo, we'll use a simple approach of treating each user message as a potential question
    
    // Get unique user messages
    const uniqueMessages = new Map<string, { count: number, responseTime: number }>();
    
    messages.forEach(message => {
      const text = message.message.trim();
      if (text && text.length > 10 && text.endsWith('?')) { // Simple heuristic to identify questions
        if (!uniqueMessages.has(text)) {
          uniqueMessages.set(text, { count: 0, responseTime: 0 });
        }
        
        const data = uniqueMessages.get(text)!;
        data.count += 1;
        
        // Assume the response is sent immediately after the question
        // In a real app, you would calculate actual response time
        data.responseTime += Math.random() * 2; // Random response time between 0-2 seconds
      }
    });
    
    // Convert to array and sort by frequency
    const questionArray: TopQuestion[] = Array.from(uniqueMessages.entries())
      .map(([question, data]) => ({
        question,
        frequency: data.count,
        responseTime: `${(data.responseTime / data.count).toFixed(1)}s`,
        satisfaction: 80 + Math.floor(Math.random() * 20) // Random satisfaction between 80-100%
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Get top 5 questions
    
    // If we don't have enough real questions, add some placeholders
    const sampleQuestions = [
      "What are your pricing plans?",
      "How do I cancel my subscription?",
      "Do you offer a free trial?",
      "How do I reset my password?",
      "Is there a mobile app?"
    ];
    
    if (questionArray.length < 5) {
      const needed = 5 - questionArray.length;
      for (let i = 0; i < needed; i++) {
        questionArray.push({
          question: sampleQuestions[i],
          frequency: Math.floor(Math.random() * 20) + 5,
          responseTime: `${(Math.random() * 1.5).toFixed(1)}s`,
          satisfaction: 80 + Math.floor(Math.random() * 20)
        });
      }
    }
    
    return questionArray;
  }
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">{t('dashboard.insights.title')}</h2>
          <p className="text-secondary">{t('dashboard.insights.subtitle')}</p>
        </div>
        
        {/* Time range selector */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-medium text-primary">{t('dashboard.insights.overview.title')}</h3>
          <div className="flex rounded-md border border-border">
            {(['day', 'week', 'month', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm transition-colors ${ 
                  timeRange === range 
                    ? 'bg-accent text-dark' 
                    : 'bg-card text-secondary hover:text-primary'
                }`}
              >
                {t(`dashboard.insights.overview.timeRanges.${range}`)}
              </button>
            ))}
          </div>
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
          /* Stats cards */
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              labelKey="dashboard.insights.stats.totalConversations" 
              value={stats.totalConversations} 
              change={changes.totalConversations} 
              isPositive={changes.totalConversations.startsWith('+')} 
              timeRange={timeRange} 
              t={t} 
            />
            <StatCard 
              labelKey="dashboard.insights.stats.avgLength" 
              value={stats.avgLength} 
              change={changes.avgLength} 
              isPositive={changes.avgLength.startsWith('+')} 
              timeRange={timeRange} 
              t={t} 
            />
            <StatCard 
              labelKey="dashboard.insights.stats.satisfaction" 
              value={stats.satisfaction} 
              change={changes.satisfaction} 
              isPositive={changes.satisfaction.startsWith('+')} 
              timeRange={timeRange} 
              t={t} 
            />
            <StatCard 
              labelKey="dashboard.insights.stats.responseRate" 
              value={stats.responseRate} 
              change={changes.responseRate} 
              isPositive={changes.responseRate.startsWith('+')} 
              timeRange={timeRange} 
              t={t} 
            />
          </div>
        )}
        
        {/* Loading state for charts */}
        {loading ? (
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="mb-4 h-6 w-40 animate-pulse rounded bg-dark/50"></div>
                <div className="h-64 w-full animate-pulse rounded bg-dark/30"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Main charts row */
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.insights.charts.volume.title')}</h3>
              <div className="h-64 w-full">
                <div className="flex h-full items-end justify-between px-2">
                  {conversationData.map((value, i) => (
                    <div key={i} className="group relative flex flex-1 items-end">
                      <div 
                        className="relative mx-1 w-full cursor-pointer rounded-t bg-accent hover:bg-accent/90" 
                        style={{ height: `${value}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-dark px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                          {t('dashboard.insights.charts.volume.tooltip', { count: value })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between px-2 text-xs text-secondary">
                  <span>{t('dashboard.insights.charts.volume.days.mon')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.tue')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.wed')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.thu')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.fri')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.sat')}</span>
                  <span>{t('dashboard.insights.charts.volume.days.sun')}</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <h3 className="mb-4 text-lg font-medium text-primary">{t('dashboard.insights.charts.satisfaction.title')}</h3>
              <div className="h-64 flex items-center justify-center">
                <div className="relative h-48 w-48">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="#2a2a2a" 
                      strokeWidth="8"
                    />
                    <circle 
                      cx="50" cy="50" r="45" 
                      fill="transparent" 
                      stroke="#ededed" 
                      strokeWidth="8"
                      strokeDasharray={`${parseInt(stats.satisfaction) * 2.83} ${100 * 2.83}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{stats.satisfaction}</span>
                    <span className="text-sm text-secondary">{t('dashboard.insights.charts.satisfaction.label')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Popular questions */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-medium text-primary">{t('dashboard.insights.topQuestions.title')}</h3>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto p-4">
              <table className="w-full">
                <thead className="bg-dark">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.insights.topQuestions.table.header.question')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.insights.topQuestions.table.header.frequency')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">{t('dashboard.insights.topQuestions.table.header.responseTime')}</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-secondary">{t('dashboard.insights.topQuestions.table.header.satisfaction')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topQuestions.map((question, index) => (
                    <TopQuestionRow 
                      key={index}
                      question={question.question}
                      frequency={question.frequency}
                      responseTime={question.responseTime}
                      satisfaction={question.satisfaction}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  labelKey: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeRange: 'day' | 'week' | 'month' | 'year';
  t: (key: string, options?: Record<string, unknown> | undefined) => string;
}

function StatCard({ labelKey, value, change, isPositive, timeRange, t }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-secondary">{t(labelKey)}</p>
      <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
      <p className={`mt-1 flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        <span className="mr-1">
          {isPositive ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        {t('dashboard.insights.stats.changeTimeRange', { change, timeRange: t(`dashboard.insights.overview.timeRanges.${timeRange}`) })}
      </p>
    </div>
  );
}

interface TopQuestionRowProps {
  question: string;
  frequency: number;
  responseTime: string;
  satisfaction: number;
}

function TopQuestionRow({ question, frequency, responseTime, satisfaction}: TopQuestionRowProps) {
  return (
    <tr className="hover:bg-dark/50">
      <td className="px-4 py-3 text-sm text-primary">{question}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">{frequency}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">{responseTime}</td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="flex items-center justify-end">
          <span className={`mr-2 text-sm ${satisfaction >= 90 ? 'text-green-400' : satisfaction >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
            {satisfaction}%
          </span>
          <div className="h-2 w-16 rounded-full bg-dark">
            <div 
              className={`h-2 rounded-full ${satisfaction >= 90 ? 'bg-green-400' : satisfaction >= 80 ? 'bg-yellow-400' : 'bg-red-400'}`} 
              style={{ width: `${satisfaction}%` }}
            ></div>
          </div>
        </div>
      </td>
    </tr>
  );
} 