'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

interface AuthRedirectProps {
  children: React.ReactNode;
  redirectAuthenticated: string;
}

/**
 * Component that prevents authenticated users from accessing pages they shouldn't see
 * Shows a loading state until auth is determined, then either redirects or shows content
 */
export default function AuthRedirect({ children, redirectAuthenticated }: AuthRedirectProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only make a decision after auth state is determined (not loading)
    if (!authLoading) {
      if (user) {
        // User is authenticated, redirect them
        router.replace(redirectAuthenticated);
      } else {
        // User is not authenticated, show the page content
        setIsCheckingAuth(false);
      }
    }
  }, [user, authLoading, router, redirectAuthenticated]);

  // While checking auth, show a loading indicator
  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-accent"></div>
          <p className="mt-4 text-secondary">Gathering your data...</p>
        </div>
      </div>
    );
  }

  // If we get here, user is not authenticated and should see the content
  return <>{children}</>;
} 