'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

interface AgentResponse {
  response?: string;
  content?: string;
  iterations?: Array<{
    content?: string;
    generated_content?: string;
    evaluation?: {
      score: string;
      feedback: string;
    };
  }>;
  [key: string]: unknown;
}

interface AgentTestingSectionProps {
  chatbotId?: string;
  configSaved: boolean;
  hasUnsavedChanges: boolean;
  testAgent: (message: string) => Promise<string | AgentResponse>;
}

export default function AgentTestingSection({
  chatbotId,
  configSaved,
  hasUnsavedChanges,
  testAgent
}: AgentTestingSectionProps) {
  const { t } = useSafeTranslation();
  const [userMessage, setUserMessage] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [traceVisible, setTraceVisible] = useState(false);
  const [iterations, setIterations] = useState<Array<{
    content?: string;
    generated_content?: string;
    evaluation?: {
      score: string;
      feedback: string;
    };
  }>>([]);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMessageChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value);
  };

  const handleTestSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!userMessage.trim()) return;
    
    setTesting(true);
    setTestResponse(null);
    setError(null);
    setIterations([]);
    setTraceVisible(false);
    
    try {
      const response = await testAgent(userMessage);
      
      if (typeof response === 'string') {
        setTestResponse(response);
      } else if (response && typeof response === 'object') {
        // Handle response that might contain iterations from judge loop
        setTestResponse(response.response || response.content || JSON.stringify(response));
        
        // If there are iterations, store them for display
        if (response.iterations && Array.isArray(response.iterations)) {
          setIterations(response.iterations);
        }
      }
    } catch (err) {
      console.error("Testing error:", err);
      setError(t('dashboard.editor.agent.testingSection.testError'));
    } finally {
      setTesting(false);
    }
  };

  const toggleTrace = () => {
    setTraceVisible(!traceVisible);
  };

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="font-medium text-primary">{t('dashboard.editor.agent.testingSection.title')}</h3>
      
      {!configSaved && hasUnsavedChanges && (
        <div className="bg-amber-900/20 text-amber-300 p-2 rounded text-sm mb-2">
          {t('dashboard.editor.agent.testingSection.unsavedChangesWarning')}
        </div>
      )}
      
      <form onSubmit={handleTestSubmit} className="flex items-center">
        <input
          type="text"
          value={userMessage}
          onChange={handleMessageChange}
          placeholder={t('dashboard.editor.agent.testingSection.inputPlaceholder')}
          className="flex-1 rounded-l-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={testing || !configSaved || !chatbotId}
          className="rounded-r-md bg-accent px-3 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:bg-secondary disabled:cursor-not-allowed"
        >
          {testing 
            ? '...' 
            : t('dashboard.editor.agent.testingSection.sendButton')}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-900/20 text-red-300 p-2 rounded text-sm">
          {error}
        </div>
      )}
      
      {testResponse && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-secondary">
            {t('dashboard.editor.agent.testingSection.responseLabel')}
          </div>
          
          <div className="rounded bg-dark/50 p-3 text-sm text-primary whitespace-pre-wrap">
            {testResponse}
          </div>
          
          {iterations.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary">
                  Generated in {iterations.length} iteration{iterations.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={toggleTrace}
                  className="text-xs px-2 py-1 bg-dark hover:bg-dark/80 rounded text-primary"
                >
                  {traceVisible ? 'Hide Trace' : 'View Trace'}
                </button>
              </div>
              
              {traceVisible && (
                <div className="space-y-3 mt-2">
                  {iterations.map((iteration, index) => (
                    <div key={index} className="rounded border border-border/50 p-2 space-y-2">
                      <div className="text-xs font-medium text-secondary flex justify-between">
                        <span>Iteration {index + 1}</span>
                        {iteration.evaluation && (
                          <span className={iteration.evaluation.score === 'pass' ? 'text-green-400' : 'text-amber-400'}>
                            {iteration.evaluation.score}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-secondary">Generator:</div>
                          <div className="bg-dark/30 p-2 rounded text-xs text-primary whitespace-pre-wrap">
                            {iteration.content || iteration.generated_content || '(No content)'}
                          </div>
                        </div>
                        
                        {iteration.evaluation && (
                          <div>
                            <div className="text-xs text-secondary">Evaluator Feedback:</div>
                            <div className="bg-dark/30 p-2 rounded text-xs text-primary whitespace-pre-wrap">
                              {iteration.evaluation.feedback || '(No feedback)'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 