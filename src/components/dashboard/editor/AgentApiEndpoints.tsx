'use client';

import { useState } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

interface AgentApiEndpointsProps {
  chatbotId: string;
  apiBaseUrl: string;
}

export default function AgentApiEndpoints({ chatbotId, apiBaseUrl }: AgentApiEndpointsProps) {
  const { t } = useSafeTranslation();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(type);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const exampleBody = JSON.stringify({
    agent_id: chatbotId,
    message: "Hello, how can you help me?",
    stream: false
  }, null, 2);

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="font-medium text-primary">{t('dashboard.editor.agent.apiEndpoints.title')}</h3>
      <p className="text-sm text-secondary mb-4">
        {t('dashboard.editor.agent.apiEndpoints.description')}
      </p>
      
      <div className="space-y-4">              
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.apiEndpoints.sendMessageLabel')}
          </label>
          <div className="flex items-center">
            <div className="flex-1 rounded-l-md border border-border bg-dark p-2 text-xs text-primary font-mono overflow-x-auto">
              POST {apiBaseUrl}/api/message
            </div>
            <button
              onClick={() => copyToClipboard(`${apiBaseUrl}/api/message`, 'message')}
              className="rounded-r-md border border-l-0 border-border bg-dark p-2 text-xs text-secondary hover:text-primary focus:outline-none"
              title={t('dashboard.editor.agent.apiEndpoints.copyTooltip')}
            >
              {copySuccess === 'message' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="mt-2">
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.apiEndpoints.exampleBodyLabel')}
            </label>
            <div className="flex items-center">
              <div className="flex-1 rounded-l-md border border-border bg-dark p-2 text-xs text-primary font-mono overflow-x-auto whitespace-pre">
                {exampleBody}
              </div>
              <button
                onClick={() => copyToClipboard(exampleBody, 'messageBody')}
                className="rounded-r-md border border-l-0 border-border bg-dark p-2 text-xs text-secondary hover:text-primary focus:outline-none"
                title={t('dashboard.editor.agent.apiEndpoints.copyTooltip')}
              >
                {copySuccess === 'messageBody' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 