'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function HistoryPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'abandoned'>('all');
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary">Conversation History</h2>
          <p className="text-secondary">View and analyze past user interactions with your chatbot</p>
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
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-2">
              <input
                type="text"
                placeholder="Search conversations..."
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
              <option value="recent">Recent First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Duration (Longest)</option>
              <option value="messages">Messages (Most)</option>
            </select>
          </div>
        </div>
        
        {/* Conversation list */}
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">User</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Started</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Duration</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Messages</th>
                  <th className="whitespace-nowrap px-4 py-3 text-left text-sm font-medium text-secondary">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <ConversationRow 
                  user="sarah.miller@example.com"
                  startTime="2023-05-10T14:32:00"
                  duration="4m 12s"
                  messages={8}
                  status="completed"
                />
                <ConversationRow 
                  user="john.doe@example.com"
                  startTime="2023-05-10T13:45:00"
                  duration="2m 38s"
                  messages={5}
                  status="completed"
                />
                <ConversationRow 
                  user="alex.wilson@example.com"
                  startTime="2023-05-10T12:18:00"
                  duration="1m 05s"
                  messages={3}
                  status="abandoned"
                />
                <ConversationRow 
                  user="taylor.jackson@example.com"
                  startTime="2023-05-10T11:22:00"
                  duration="6m 47s"
                  messages={12}
                  status="completed"
                />
                <ConversationRow 
                  user="jordan.smith@example.com"
                  startTime="2023-05-10T10:15:00"
                  duration="3m 24s"
                  messages={7}
                  status="completed"
                />
                <ConversationRow 
                  user="morgan.lee@example.com"
                  startTime="2023-05-10T09:41:00"
                  duration="0m 58s"
                  messages={2}
                  status="abandoned"
                />
                <ConversationRow 
                  user="casey.brown@example.com"
                  startTime="2023-05-10T08:30:00"
                  duration="5m 12s"
                  messages={9}
                  status="completed"
                />
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <div className="text-sm text-secondary">
              Showing <span className="font-medium text-primary">1</span> to <span className="font-medium text-primary">7</span> of <span className="font-medium text-primary">42</span> conversations
            </div>
            <div className="flex">
              <a href="#" className="mx-1 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-primary hover:bg-dark">
                Previous
              </a>
              <a href="#" className="mx-1 inline-flex items-center rounded-md border border-border bg-accent px-4 py-2 text-sm text-dark hover:bg-accent/90">
                1
              </a>
              <a href="#" className="mx-1 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-primary hover:bg-dark">
                2
              </a>
              <a href="#" className="mx-1 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-primary hover:bg-dark">
                3
              </a>
              <a href="#" className="mx-1 inline-flex items-center rounded-md border border-border px-4 py-2 text-sm text-primary hover:bg-dark">
                Next
              </a>
            </div>
          </div>
        </div>
        
        {/* Selected Conversation Preview */}
        <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-primary">Conversation with sarah.miller@example.com</h3>
            <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-dark hover:bg-accent/80">
              View Full Transcript
            </button>
          </div>
          
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full bg-dark px-3 py-1 text-secondary">
              <span className="font-medium text-primary">Started:</span> May 10, 2023, 2:32 PM
            </div>
            <div className="rounded-full bg-dark px-3 py-1 text-secondary">
              <span className="font-medium text-primary">Duration:</span> 4m 12s
            </div>
            <div className="rounded-full bg-dark px-3 py-1 text-secondary">
              <span className="font-medium text-primary">Messages:</span> 8
            </div>
            <div className="rounded-full bg-dark px-3 py-1 text-secondary">
              <span className="font-medium text-primary">Status:</span> 
              <span className="ml-1 text-green-400">Completed</span>
            </div>
          </div>
          
          <div className="h-64 overflow-y-auto rounded-md border border-border bg-dark p-4 text-sm">
            <div className="mb-3">
              <div className="mb-1 text-secondary">User - 2:32 PM</div>
              <div className="rounded-lg bg-card px-4 py-3 text-primary">
                Hi, I need help with my subscription. I was charged twice this month.
              </div>
            </div>
            <div className="mb-3">
              <div className="mb-1 text-secondary">Bot - 2:32 PM</div>
              <div className="rounded-lg bg-dark border border-border px-4 py-3 text-primary">
                I&apos;m sorry to hear that. I&apos;d be happy to help you with this issue. Could you please provide your account email address so I can look into this for you?
              </div>
            </div>
            <div className="mb-3">
              <div className="mb-1 text-secondary">User - 2:33 PM</div>
              <div className="rounded-lg bg-card px-4 py-3 text-primary">
                My email is sarah.miller@example.com
              </div>
            </div>
            <div className="mb-3">
              <div className="mb-1 text-secondary">Bot - 2:33 PM</div>
              <div className="rounded-lg bg-dark border border-border px-4 py-3 text-primary">
                Thank you, Sarah. I can see that there were indeed two charges on your account this month. This appears to be an error in our billing system. I&apos;ve initiated a refund for the duplicate charge, which should appear in your account within 3-5 business days. I&apos;ve also added a note to your account to prevent this from happening again.
              </div>
            </div>
            <div className="mb-3">
              <div className="mb-1 text-secondary">User - 2:35 PM</div>
              <div className="rounded-lg bg-card px-4 py-3 text-primary">
                Great, thank you! Will I receive a confirmation email about the refund?
              </div>
            </div>
            <div className="mb-3">
              <div className="mb-1 text-secondary">Bot - 2:35 PM</div>
              <div className="rounded-lg bg-dark border border-border px-4 py-3 text-primary">
                Yes, you will receive an automatic email confirmation when the refund is processed. It should arrive within the next hour. Is there anything else I can help you with today?
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface ConversationRowProps {
  user: string;
  startTime: string;
  duration: string;
  messages: number;
  status: 'completed' | 'abandoned';
}

function ConversationRow({ user, startTime, duration, messages, status }: ConversationRowProps) {
  const date = new Date(startTime);
  const formattedDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return (
    <tr className="hover:bg-dark/50">
      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-primary">{user}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{formattedDate}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{duration}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">{messages}</td>
      <td className="whitespace-nowrap px-4 py-3 text-sm">
        {status === 'completed' ? (
          <span className="rounded-full bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400">
            Completed
          </span>
        ) : (
          <span className="rounded-full bg-yellow-400/10 px-2 py-1 text-xs font-medium text-yellow-400">
            Abandoned
          </span>
        )}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <button className="rounded bg-dark px-3 py-1.5 text-xs text-primary hover:bg-dark/70">
          View
        </button>
        <button className="ml-2 rounded bg-dark px-3 py-1.5 text-xs text-primary hover:bg-dark/70">
          Export
        </button>
      </td>
    </tr>
  );
} 