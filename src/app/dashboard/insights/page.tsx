'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function InsightsPage() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Insights</h2>
          <p className="text-secondary">Analytics and performance metrics for your chatbot</p>
        </div>
        
        {/* Time range selector */}
        <div className="mb-6 flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <h3 className="text-lg font-medium text-primary">Performance Overview</h3>
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
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Conversations" value="345" change="+12%" isPositive={true} timeRange={timeRange} />
          <StatCard label="Avg. Conversation Length" value="4.2 min" change="-8%" isPositive={false} timeRange={timeRange} />
          <StatCard label="User Satisfaction" value="92%" change="+4%" isPositive={true} timeRange={timeRange} />
          <StatCard label="Response Rate" value="98.6%" change="+1.2%" isPositive={true} timeRange={timeRange} />
        </div>
        
        {/* Main charts row */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-primary">Conversation Volume</h3>
            <div className="h-64 w-full">
              <div className="flex h-full items-end justify-between px-2">
                {[35, 40, 28, 45, 65, 72, 58].map((value, i) => (
                  <div key={i} className="group relative flex flex-1 items-end">
                    <div 
                      className="relative mx-1 w-full cursor-pointer rounded-t bg-accent hover:bg-accent/90" 
                      style={{ height: `${value}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rounded bg-dark px-2 py-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        {value} conversations
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-between px-2 text-xs text-secondary">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-primary">User Satisfaction</h3>
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
                    strokeDasharray={`${92 * 2.83} ${100 * 2.83}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-primary">92%</span>
                  <span className="text-sm text-secondary">Satisfied Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Popular questions */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-medium text-primary">Top Questions</h3>
          </div>
          <div className="overflow-x-auto p-4">
            <table className="w-full">
              <thead className="bg-dark">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Question</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Frequency</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Avg. Response Time</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-secondary">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <TopQuestionRow question="What are your pricing plans?" frequency={42} responseTime="1.2s" satisfaction={95} />
                <TopQuestionRow question="How do I cancel my subscription?" frequency={29} responseTime="1.5s" satisfaction={86} />
                <TopQuestionRow question="Do you offer a free trial?" frequency={24} responseTime="0.8s" satisfaction={92} />
                <TopQuestionRow question="How do I reset my password?" frequency={18} responseTime="1.0s" satisfaction={90} />
                <TopQuestionRow question="Is there a mobile app?" frequency={15} responseTime="1.1s" satisfaction={88} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  timeRange: 'day' | 'week' | 'month' | 'year';
}

function StatCard({ label, value, change, isPositive, timeRange }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm text-secondary">{label}</p>
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
        {change} from last {timeRange}
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

function TopQuestionRow({ question, frequency, responseTime, satisfaction }: TopQuestionRowProps) {
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