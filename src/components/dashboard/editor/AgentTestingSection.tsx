'use client';

import { useState } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

interface AgentTestingSectionProps {
  chatbotId?: string;
  configSaved: boolean;
  hasUnsavedChanges: boolean;
  testAgent: (message: string) => Promise<void>; // Pass the function reference
}

export default function AgentTestingSection({
  chatbotId,
  configSaved,
  hasUnsavedChanges,
  testAgent
}: AgentTestingSectionProps) {
  const { t } = useSafeTranslation();
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  const handleTestSubmit = async () => {
    if (!testMessage.trim() || !chatbotId || !configSaved) return;
    
    setIsTesting(true);
    setTestResponse(""); // Clear previous response
    try {
      await testAgent(testMessage); // Call the passed function
      // The actual response setting will be handled in the parent
      // via a callback or state update mechanism if needed here,
      // but for now, we assume parent manages response display.
      // We could add an `onTestResponse` prop if needed:
      // onTestResponse(data.response);
    } catch (error) {
      console.error('Error testing agent:', error);
      setTestResponse(t('dashboard.editor.agent.testingSection.testError'));
    } finally {
      setIsTesting(false);
    }
  };

  // This component now only triggers the test.
  // The display of the response is assumed to be managed by the parent
  // or could be passed back via a prop like onTestResponse.
  // For simplicity, I'm keeping the local `testResponse` state for the error message.

  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <h3 className="font-medium text-primary">{t('dashboard.editor.agent.testingSection.title')}</h3>
      
      {!configSaved && (
        <div className="mb-3 rounded-md bg-accent/10 p-2 text-sm text-primary border border-accent/30">
          <span className="font-medium">{t('dashboard.editor.agent.testingSection.noteLabel')}:</span> {t('dashboard.editor.agent.testingSection.saveNote')}
        </div>
      )}
      
      {hasUnsavedChanges && configSaved && (
        <div className="mb-3 rounded-md bg-yellow-500/10 p-2 text-sm text-yellow-400 border border-yellow-500/30">
          <span className="font-medium">{t('dashboard.editor.agent.testingSection.warningLabel')}:</span> {t('dashboard.editor.agent.testingSection.unsavedWarning')}
        </div>
      )}
      
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            {t('dashboard.editor.agent.testingSection.testMessageLabel')}
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder={t('dashboard.editor.agent.testingSection.testMessagePlaceholder')}
              className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
            />
            <button
              onClick={handleTestSubmit}
              disabled={isTesting || !testMessage.trim() || !chatbotId || !configSaved}
              className="rounded bg-accent px-3 py-2 text-sm font-medium text-dark hover:bg-accent/80 disabled:opacity-50"
              title={!configSaved ? t('dashboard.editor.agent.testingSection.saveFirstTooltip') : ""}
            >
              {isTesting ? t('dashboard.editor.agent.testingSection.testingButton') : t('dashboard.editor.agent.testingSection.testButton')}
            </button>
          </div>
        </div>
        
        {/* Response display is handled by parent now */}
        {testResponse && ( // Still show local error response
          <div className="mt-2">
            <label className="block text-sm font-medium text-secondary mb-1">
              {t('dashboard.editor.agent.testingSection.responseLabel')}
            </label>
            <div className="rounded-md border border-border bg-dark p-3 text-sm text-primary">
              {testResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 