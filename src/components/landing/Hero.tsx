'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useSafeTranslation } from '@/components/I18nProvider';

export default function Hero() {
  const { user } = useAuth();
  const { t } = useSafeTranslation();
  
  return (
    <section className="pt-32 pb-20 px-4 bg-dark">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-primary sm:text-6xl">
            <span className="block">{t('hero.title.line1')} <span className="text-accent">{t('hero.title.accent')}</span></span>
            <span className="block mt-2 text-secondary">{t('hero.title.line2')}</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-secondary">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 justify-center">
            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-md bg-accent px-8 py-3 text-base font-medium text-dark hover:bg-accent/80 transition-colors"
            >
              {t('hero.cta.create')}
            </Link>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="rounded-md border border-border bg-transparent px-8 py-3 text-base font-medium text-primary hover:bg-card transition-colors"
            >
              {t('hero.cta.tryFree')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 