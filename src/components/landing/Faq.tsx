'use client';

import SectionHeader from '../ui/SectionHeader';
import TabChat from '../ui/TabChat';
import { useSafeTranslation } from '@/components/I18nProvider';

export default function Faq() {
  const { t } = useSafeTranslation();

  const demoExamples = [
    {
      title: t('faq.demos.knowledgeAgent.title'),
      exchanges: [
        {
          user: t('faq.demos.knowledgeAgent.exchanges.0.user'),
          agent: t('faq.demos.knowledgeAgent.exchanges.0.agent')
        },
        {
          user: t('faq.demos.knowledgeAgent.exchanges.1.user'),
          agent: t('faq.demos.knowledgeAgent.exchanges.1.agent')
        },
        {
          user: t('faq.demos.knowledgeAgent.exchanges.2.user'),
          agent: t('faq.demos.knowledgeAgent.exchanges.2.agent')
        }
      ]
    },
    {
      title: t('faq.demos.researchAgent.title'),
      exchanges: [
        {
          user: t('faq.demos.researchAgent.exchanges.0.user'),
          agent: t('faq.demos.researchAgent.exchanges.0.agent')
        },
        {
          user: t('faq.demos.researchAgent.exchanges.1.user'),
          agent: t('faq.demos.researchAgent.exchanges.1.agent')
        },
        {
          user: t('faq.demos.researchAgent.exchanges.2.user'),
          agent: t('faq.demos.researchAgent.exchanges.2.agent')
        }
      ]
    },
    {
      title: t('faq.demos.customApiAgent.title'),
      exchanges: [
        {
          user: t('faq.demos.customApiAgent.exchanges.0.user'),
          agent: t('faq.demos.customApiAgent.exchanges.0.agent')
        },
        {
          user: t('faq.demos.customApiAgent.exchanges.1.user'),
          agent: t('faq.demos.customApiAgent.exchanges.1.agent')
        },
        {
          user: t('faq.demos.customApiAgent.exchanges.2.user'),
          agent: t('faq.demos.customApiAgent.exchanges.2.agent')
        }
      ]
    }
  ];

  return (
    <section id="faq" className="py-20 bg-dark">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow={t('faq.header.eyebrow')}
          title={t('faq.header.title')}
          description={t('faq.header.description')}
        />

        <div className="mt-12">
          <TabChat demos={demoExamples} />
        </div>
      </div>
    </section>
  );
} 