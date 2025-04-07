'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';
import { useSafeTranslation } from '../I18nProvider';

export default function Cta() {
  const { user } = useAuth();
  const { t } = useSafeTranslation();
  
  return (
    <section className="py-20 bg-dark border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-primary sm:text-4xl">
          {t('cta.title.part1')} <span className="text-accent">{t('cta.title.accent')}</span>?
        </h2>
        <p className="mt-4 text-xl text-secondary">
          {t('cta.subtitle')}
        </p>
        <div className="mt-8">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="rounded-md bg-accent px-8 py-3 text-base font-medium text-dark hover:bg-accent/80 inline-block transition-colors"
          >
            {t('cta.button')}
          </Link>
        </div>
      </div>
    </section>
  );
} 