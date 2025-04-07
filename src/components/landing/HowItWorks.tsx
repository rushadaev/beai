'use client';

import SectionHeader from '../ui/SectionHeader';
import StepCard from '../ui/StepCard';
import { useSafeTranslation } from '../I18nProvider';

export default function HowItWorks() {
  const { t } = useSafeTranslation();

  const steps = [
    { key: 'configure', number: 1 },
    { key: 'addTools', number: 2 },
    { key: 'testDeploy', number: 3 },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow={t('howItWorks.header.eyebrow')}
          title={t('howItWorks.header.title')}
          description={t('howItWorks.header.description')}
        />

        <div className="mt-16">
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <StepCard
                key={step.key}
                number={step.number}
                title={t(`howItWorks.steps.${step.key}.title`)}
                description={t(`howItWorks.steps.${step.key}.description`)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 