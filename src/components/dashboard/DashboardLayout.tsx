'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuth } from '@/lib/context/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accent"></div>
          <p className="mt-4 text-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    router.push('/login');
    return null;
  }
  
  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="border-b border-border bg-card shadow-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-primary">Dashboard</h1>
            <div className="flex items-center">
              <span className="mr-4 text-sm text-secondary">
                {user.email || 'User'}
              </span>
              <button
                onClick={handleLogout}
                className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-dark hover:bg-accent/80"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
} 