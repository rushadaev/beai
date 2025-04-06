'use client';

import { useState, useEffect, memo } from 'react';
import SuggestionQuestions from './editor/SuggestionQuestions';
import Appearance from './editor/Appearance';
import Rules from './editor/Rules';
import Agent, { AgentConfig } from './editor/Agent';

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

// Create a memoized preview component
const ChatbotPreview = memo(function ChatbotPreview({
  appearanceSettings,
  messages,
  questions,
  isTyping,
  inputText,
  setInputText,
  handleSendMessage,
  formatTime,
  resetChat
}: {
  appearanceSettings: AppearanceSettings;
  messages: Message[];
  questions: Question[];
  isTyping: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  formatTime: (date: Date) => string;
  resetChat: () => void;
}) {
  return (
    <div className="w-full md:w-1/2">
      <div className="sticky top-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-primary">Live Preview</h2>
          <button
            onClick={resetChat}
            className="text-sm text-secondary hover:text-primary"
          >
            Reset Chat
          </button>
        </div>
        
        <div
          className={`rounded-lg border border-border overflow-hidden shadow-sm ${
            appearanceSettings.size === 'small'
              ? 'max-w-xs'
              : appearanceSettings.size === 'medium'
              ? 'max-w-sm'
              : 'max-w-md'
          } ${
            appearanceSettings.placement === 'left'
              ? 'mr-auto'
              : appearanceSettings.placement === 'right'
              ? 'ml-auto'
              : 'mx-auto'
          }`}
          style={{ maxHeight: '600px' }}
        >
          {/* Chat header */}
          <div
            className="p-3 text-white"
            style={{
              background: `linear-gradient(to right, ${appearanceSettings.primaryColor}, ${appearanceSettings.secondaryColor})`
            }}
          >
            <h3 className="font-medium">{appearanceSettings.headerText}</h3>
          </div>
          
          {/* Chat messages */}
          <div className="flex h-96 flex-col bg-card overflow-y-auto p-3">
            <div className="flex-1 space-y-3">
              {messages.map((message, i) => (
                <div
                  key={i}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender === 'user'
                        ? 'bg-accent text-dark'
                        : 'bg-dark text-primary'
                    }`}
                    style={{
                      backgroundColor:
                        message.sender === 'user'
                          ? appearanceSettings.buttonColor
                          : undefined,
                      color:
                        message.sender === 'user'
                          ? appearanceSettings.buttonTextColor
                          : undefined
                    }}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="mt-1 text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg bg-dark px-3 py-2 text-primary">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Suggestion questions */}
            {questions.length > 0 && (
              <div className="mt-4 space-x-2 space-y-2">
                {questions.map((question) => (
                  <button
                    key={question.id}
                    onClick={() => {
                      setInputText(question.text);
                      const input = document.getElementById('chatInput') as HTMLInputElement;
                      if (input) input.focus();
                    }}
                    className="inline-block rounded-full border border-border px-3 py-1 text-xs text-secondary hover:bg-dark"
                  >
                    {question.text}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="border-t border-border bg-card p-3">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                id="chatInput"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-md px-3 py-2 text-white"
                style={{
                  backgroundColor: appearanceSettings.buttonColor,
                  color: appearanceSettings.buttonTextColor
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default function ChatbotEditor({
  chatbotId,
  initialSettings = {},
  onUpdateAppearance,
  onUpdateRules,
  onUpdateSuggestions,
  onUpdateAgent,
  isSaving = false
}: ChatbotEditorProps) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
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
    { id: 'appearance', label: 'Appearance' },
    { id: 'rules', label: 'Rules' },
    { id: 'suggestions', label: 'Suggestions' },
    { id: 'agent', label: 'Agent' }
  ];
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const userMessage = {
      text: inputText,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputText('');
    
    // Set typing state immediately
    setIsTyping(true);
    
    // Use agent API if on agent tab and agent is configured and saved
    if (activeTab === 'agent' && agentConfig && agentConfigSaved && chatbotId) {
      try {
        const response = await fetch('http://localhost:8000/api/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: chatbotId,
            message: userMessage.text,
            stream: false
          }),
        });
        
        if (!response.ok) {
          throw new Error('Agent API request failed');
        }
        
        const data = await response.json();
        
        const botMessage = {
          text: data.response,
          sender: 'bot' as const,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error('Error calling agent API:', error);
        
        // Fallback to a generic error message
        const botMessage = {
          text: 'Sorry, I encountered an error processing your request.',
          sender: 'bot' as const,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Use simulated response for other tabs
      setTimeout(() => {
        const botMessage = {
          text: `I received your message: "${inputText}". This is a simulated response.`,
          sender: 'bot' as const,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const resetChat = () => {
    setMessages([
      {
        text: 'Hello! How can I help you today?',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
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
      
      {/* Use the memoized preview component */}
      <ChatbotPreview
        appearanceSettings={appearanceSettings}
        messages={messages}
        questions={questions}
        isTyping={isTyping}
        inputText={inputText}
        setInputText={setInputText}
        handleSendMessage={handleSendMessage}
        formatTime={formatTime}
        resetChat={resetChat}
      />
    </div>
  );
} 