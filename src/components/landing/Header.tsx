'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function Header() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [showAuthButtons, setShowAuthButtons] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Only show auth buttons after we know the auth state
    if (!loading) {
      // Small delay for a smoother transition
      const timer = setTimeout(() => {
        setShowAuthButtons(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="fixed w-full z-50 px-4 pt-4">
      <header className={`mx-auto max-w-7xl backdrop-blur-sm transition-all duration-300 rounded-xl border border-opacity-20 ${
        scrolled 
          ? 'bg-dark/90 shadow-lg border-border py-3' 
          : 'bg-dark/80 border-border py-5'
      }`}>
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">
              <span className="text-accent">Be</span>AI
            </span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium text-primary hover:text-secondary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-primary hover:text-secondary">
              How It Works
            </Link>
            <Link href="#faq" className="text-sm font-medium text-primary hover:text-secondary">
              FAQ
            </Link>
            
            {/* Auth Button Area with consistent width */}
            <div className="w-24 h-9 flex justify-center items-center">
              {loading ? (
                <div className="h-2 w-16 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <div className={`transition-opacity duration-300 ${showAuthButtons ? 'opacity-100' : 'opacity-0'}`}>
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-medium text-primary hover:text-secondary mr-4"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-dark hover:bg-accent/80"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
} 