'use client';

import { useState, useEffect } from 'react';
import SuggestionQuestions from './editor/SuggestionQuestions';
import Appearance from './editor/Appearance';
import Rules from './editor/Rules';
import Agent, { AgentConfig } from './editor/Agent';
import ChatWidget from '../widgets/ChatWidget';

export interface AppearanceSettings {
  headerText: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  placement: 'right' | 'left' | 'center';
  size: 'small' | 'medium' | 'large';
}

export interface Rule {
  id: string;
  text: string;
  enabled: boolean;
}

export interface Question {
  id: string;
  text: string;
}

export interface EditorTab {
  id: string;
  label: string;
}

export interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatbotEditorProps {
  chatbotId?: string;
  initialSettings?: {
    appearance?: AppearanceSettings;
    rules?: Rule[];
    suggestions?: Question[];
    agent?: AgentConfig;
  };
  onUpdateAppearance?: (settings: AppearanceSettings) => void;
  onUpdateRules?: (rules: Rule[]) => void;
  onUpdateSuggestions?: (questions: Question[]) => void;
  onUpdateAgent?: (config: AgentConfig) => void;
  isSaving?: boolean;
}

export default function ChatbotEditor({
  chatbotId,
  initialSettings = {},
  onUpdateAppearance,
  onUpdateRules,
  onUpdateSuggestions,
  onUpdateAgent,
  isSaving = false
}: ChatbotEditorProps) {
  const [activeTab, setActiveTab] = useState('agent');
  
  // Default settings if not provided
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(
    initialSettings.appearance || {
      headerText: 'Chat with us',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e3a8a',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      placement: 'right',
      size: 'medium'
    }
  );
  
  const [rules, setRules] = useState<Rule[]>(
    initialSettings.rules || [
      { id: '1', text: 'Be friendly and helpful', enabled: true },
      { id: '2', text: 'Do not share personal information', enabled: true },
      { id: '3', text: 'Keep responses concise', enabled: true }
    ]
  );
  
  const [questions, setQuestions] = useState<Question[]>(
    initialSettings.suggestions || [
      { id: '1', text: 'How can I get started?' },
      { id: '2', text: 'What are your business hours?' },
      { id: '3', text: 'Do you offer support?' }
    ]
  );
  
  const [agentConfig, setAgentConfig] = useState<AgentConfig | undefined>(
    initialSettings.agent
  );
  
  const [agentConfigSaved, setAgentConfigSaved] = useState(false);
  
  // Update settings when initialSettings change
  useEffect(() => {
    if (initialSettings.appearance) {
      setAppearanceSettings(initialSettings.appearance);
    }
    if (initialSettings.rules) {
      setRules(initialSettings.rules);
    }
    if (initialSettings.suggestions) {
      setQuestions(initialSettings.suggestions);
    }
    if (initialSettings.agent) {
      setAgentConfig(initialSettings.agent);
      setAgentConfigSaved(true);
    }
  }, [initialSettings]);
  
  const tabs: EditorTab[] = [
    { id: 'agent', label: 'Agent' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'rules', label: 'Rules' },
    { id: 'suggestions', label: 'Suggestions' }
  ];
  
  const handlePreviewMessage = async (message: string): Promise<string> => {
    // Simulate a delayed response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // If on agent tab and agent is configured and saved, we'd use the real endpoint
    // but for simplicity we're using the same simulated response
    if (activeTab === 'agent' && agentConfig && agentConfigSaved && chatbotId) {
      // In a real implementation, we would call the actual API endpoint here
      // For now we'll use the simulated response
      return `This is a simulated response from your saved agent. In a live setting, this would call the real API.`;
    } else {
      return `I received your message: "${message}". This is a simulated response. Make sure you saved your agent before sending a message to get a real response.`;
    }
  };
  
  const handleAppearanceUpdate = (settings: AppearanceSettings) => {
    setAppearanceSettings(settings);
    if (onUpdateAppearance) {
      onUpdateAppearance(settings);
    }
  };
  
  const handleAppearancePreview = (settings: AppearanceSettings) => {
    setAppearanceSettings(settings);
  };
  
  const handleRulesUpdate = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    if (onUpdateRules) {
      onUpdateRules(updatedRules);
    }
  };
  
  const handleRulesPreview = (updatedRules: Rule[]) => {
    setRules(updatedRules);
  };
  
  const handleQuestionsUpdate = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    if (onUpdateSuggestions) {
      onUpdateSuggestions(updatedQuestions);
    }
  };
  
  const handleQuestionsPreview = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
  };
  
  const handleAgentUpdate = (config: AgentConfig) => {
    setAgentConfig(config);
    if (onUpdateAgent) {
      onUpdateAgent(config);
    }
    // Mark the agent as not yet saved when updating
    setAgentConfigSaved(false);
  };
  
  const handleAgentPreview = (config: AgentConfig) => {
    // Only update the config, don't reset saved state or trigger any side effects
    setAgentConfig(config);
  };

  // This function is called when agent saves successfully
  const handleAgentSaved = () => {
    setAgentConfigSaved(true);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Editor section */}
      <div className="w-full md:w-1/2 rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="border-b border-border">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-accent text-primary'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          {activeTab === 'appearance' && (
            <Appearance 
              initialSettings={appearanceSettings} 
              onUpdate={handleAppearanceUpdate}
              onPreviewUpdate={handleAppearancePreview}
              isSaving={isSaving}
            />
          )}
          
          {activeTab === 'rules' && (
            <Rules 
              initialRules={rules} 
              onUpdate={handleRulesUpdate}
              onPreviewUpdate={handleRulesPreview}
              isSaving={isSaving}
            />
          )}
          
          {activeTab === 'suggestions' && (
            <SuggestionQuestions 
              initialQuestions={questions} 
              onUpdate={handleQuestionsUpdate}
              onPreviewUpdate={handleQuestionsPreview}
              isSaving={isSaving}
            />
          )}
          
          {activeTab === 'agent' && (
            <Agent
              chatbotId={chatbotId}
              initialConfig={agentConfig}
              onUpdate={handleAgentUpdate}
              onPreviewUpdate={handleAgentPreview}
              onSaved={handleAgentSaved}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
      
      {/* Preview section */}
      <div className="w-full md:w-1/2">
        <div className="sticky top-4">
          <h2 className="text-lg font-medium text-primary mb-2">Live Preview</h2>
          
          <ChatWidget 
            chatbotId={chatbotId || ''}
            appearance={appearanceSettings}
            questions={questions}
            isPreview={true}
            onPreviewMessage={handlePreviewMessage}
          />
        </div>
      </div>
    </div>
  );
} 