'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function Hero() {
  const { user } = useAuth();
  
  return (
    <section className="pt-32 pb-20 px-4 bg-dark">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-primary sm:text-6xl">
            <span className="block">AI Agents <span className="text-accent">Builder</span></span>
            <span className="block mt-2 text-secondary">No Code Required</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-secondary">
            Create intelligent AI agents using our visual node constructor. Build, deploy, and manage custom assistants for your website or Telegram bot without writing a single line of code.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 justify-center">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-md bg-accent px-8 py-3 text-base font-medium text-dark hover:bg-accent/80 transition-colors"
            >
              Build Your Agent
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-md border border-border bg-transparent px-8 py-3 text-base font-medium text-primary hover:bg-card transition-colors"
            >
              Try for Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 