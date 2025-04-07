'use client';

import { useAuth } from '@/lib/context/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { useSafeTranslation } from '@/components/I18nProvider';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useSafeTranslation();

  // Mock data for dashboard stats
  const stats = [
    { labelKey: 'dashboard.overview.stats.activeChatbots', value: 1 },
    { labelKey: 'dashboard.overview.stats.totalConversations', value: 124 },
    { labelKey: 'dashboard.overview.stats.userSatisfaction', value: '94%' },
    { labelKey: 'dashboard.overview.stats.messagesExchanged', value: 567 },
  ];

  // Mock data for recent conversations
  const recentConversations = [
    { id: '1', user: 'visitor@example.com', date: '2 hours ago', messages: 8 },
    { id: '2', user: 'anonymous', date: 'Yesterday', messages: 12 },
    { id: '3', user: 'customer@gmail.com', date: '3 days ago', messages: 5 },
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
        
        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <p className="text-sm text-secondary">{t(stat.labelKey)}</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{stat.value}</p>
            </div>
          ))}
        </div>
        
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
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.setup.status', { completed: 1, total: 2 })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div className="h-2 rounded-full bg-accent" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary">{t('dashboard.overview.progress.share.label')}</p>
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.share.status', { completed: 0, total: 3 })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div className="h-2 rounded-full bg-accent" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-secondary">{t('dashboard.overview.progress.track.label')}</p>
                  <p className="text-sm text-accent">{t('dashboard.overview.progress.track.status', { completed: 0, total: 2 })}</p>
                </div>
                <div className="mt-1 h-2 w-full rounded-full bg-dark">
                  <div className="h-2 rounded-full bg-accent" style={{ width: '0%' }}></div>
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
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">{conv.user}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{conv.date}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-primary">{conv.messages}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button className="rounded-md px-2 py-1 text-sm text-accent hover:text-accent/80">
                        {t('dashboard.overview.recentConversations.viewButton')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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