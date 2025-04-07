'use client';

import { useState, useEffect, useRef } from 'react';
import { useSafeTranslation } from '@/components/I18nProvider';

export interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatAppearance {
  headerText: string;
  primaryColor: string;
  secondaryColor: string;
  buttonColor: string;
  buttonTextColor: string;
  placement: 'right' | 'left' | 'center';
  size: 'small' | 'medium' | 'large';
}

export interface SuggestionQuestion {
  id: string;
  text: string;
}

interface ChatWidgetProps {
  chatbotId: string;
  appearance: ChatAppearance;
  questions?: SuggestionQuestion[];
  apiUrl?: string;
  isPreview?: boolean;
  onPreviewMessage?: (message: string) => Promise<string>;
}

export default function ChatWidget({
  chatbotId,
  appearance,
  questions = [],
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  isPreview = false,
  onPreviewMessage
}: ChatWidgetProps) {
  const { t } = useSafeTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: t('chatWidget.initialMessage'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const resetChat = () => {
    setMessages([
      {
        text: t('chatWidget.initialMessage'),
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
  };
  
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
    
    try {
      let response: string;
      
      if (isPreview && onPreviewMessage) {
        // Use the preview message handler in preview mode
        response = await onPreviewMessage(inputText);
      } else {
        // Use the real API in embed mode
        const apiResponse = await fetch(`${apiUrl}/api/message`, {
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
        
        if (!apiResponse.ok) {
          throw new Error('Agent API request failed');
        }
        
        const data = await apiResponse.json();
        response = data.response;
      }
      
      const botMessage = {
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Fallback to a generic error message
      const botMessage = {
        text: t('chatWidget.errorMessage'),
        sender: 'bot' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // When not in preview mode, add a toggle button
  const toggleButton = !isPreview && (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="fixed bottom-4 right-4 rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-40"
      style={{ backgroundColor: appearance.buttonColor, color: appearance.buttonTextColor }}
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )}
    </button>
  );

  if (!isPreview && !isOpen) {
    return toggleButton;
  }

  const widgetContent = (
    <div
      className={`${isPreview ? '' : 'fixed bottom-20 right-4 z-50'} rounded-lg border border-border overflow-hidden shadow-lg ${
        appearance.size === 'small'
          ? 'w-72'
          : appearance.size === 'medium'
          ? 'w-80'
          : 'w-96'
      } ${
        appearance.placement === 'left'
          ? 'mr-auto'
          : appearance.placement === 'right'
          ? 'ml-auto'
          : 'mx-auto'
      }`}
      style={{ maxHeight: '600px' }}
    >
      {/* Chat header */}
      <div
        className="p-3 text-white flex justify-between items-center"
        style={{
          background: `linear-gradient(to right, ${appearance.primaryColor}, ${appearance.secondaryColor})`
        }}
      >
        <h3 className="font-medium">{appearance.headerText}</h3>
        {isPreview && (
          <button
            onClick={resetChat}
            className="text-xs text-white/80 hover:text-white"
          >
            {t('chatWidget.resetButton')}
          </button>
        )}
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
                      ? appearance.buttonColor
                      : undefined,
                  color:
                    message.sender === 'user'
                      ? appearance.buttonTextColor
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
          
          {/* Invisible element at the end to scroll to */}
          <div ref={messagesEndRef} />
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
            placeholder={t('chatWidget.inputPlaceholder')}
            className="flex-1 rounded-md border border-border bg-dark px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-md px-3 py-2 text-white"
            style={{
              backgroundColor: appearance.buttonColor,
              color: appearance.buttonTextColor
            }}
          >
            {t('chatWidget.sendButton')}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {widgetContent}
      {!isPreview && toggleButton}
    </>
  );
} 