'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  content: string;
  isUser: boolean;
  delay: number;
}

interface ChatDemo {
  title: string;
  exchanges: Array<{user: string, agent: string}>;
}

interface TabChatProps {
  demos: ChatDemo[];
}

export default function TabChat({ demos }: TabChatProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Convert exchanges to flat message array with delays
  const getMessagesWithDelay = (exchanges: Array<{user: string, agent: string}>) => {
    return exchanges.flatMap((exchange, i) => [
      { content: exchange.user, isUser: true, delay: i * 2800 },
      { content: exchange.agent, isUser: false, delay: i * 2800 + 1500 }
    ]);
  };

  // Reset and start revealing messages when tab changes
  useEffect(() => {
    setVisibleMessages([]);
    setIsRevealing(true);
    
    const allMessages = getMessagesWithDelay(demos[activeTab].exchanges);
    const timeouts: NodeJS.Timeout[] = [];
    
    allMessages.forEach((message, index) => {
      const timeout = setTimeout(() => {
        setVisibleMessages(prev => {
          const newMessages = [...prev, message];
          // Scroll after state update using a timeout to ensure the DOM has updated
          setTimeout(scrollToBottom, 50);
          return newMessages;
        });
        
        // Check if we've revealed all messages
        if (index === allMessages.length - 1) {
          setIsRevealing(false);
        }
      }, message.delay);
      
      timeouts.push(timeout);
    });
    
    // Cleanup timeouts when component unmounts or tab changes
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [activeTab, demos]);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages]);

  const resetChat = () => {
    setVisibleMessages([]);
    setIsRevealing(true);
    
    const allMessages = getMessagesWithDelay(demos[activeTab].exchanges);
    const timeouts: NodeJS.Timeout[] = [];
    
    allMessages.forEach((message, index) => {
      const timeout = setTimeout(() => {
        setVisibleMessages(prev => [...prev, message]);
        
        if (index === allMessages.length - 1) {
          setIsRevealing(false);
        }
      }, message.delay);
      
      timeouts.push(timeout);
    });
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-dark">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {demos.map((demo, i) => (
          <button
            key={i}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === i 
                ? 'bg-card text-accent border-b-2 border-accent' 
                : 'text-secondary hover:text-primary'
            }`}
            onClick={() => setActiveTab(i)}
          >
            {demo.title}
          </button>
        ))}
      </div>
      
      {/* Chat window with custom scrollbar */}
      <div 
        ref={chatContainerRef}
        className="p-4 h-[400px] overflow-y-auto custom-scrollbar"
      >
        <div className="space-y-2">
          {visibleMessages.map((message, i) => (
            <div 
              key={i} 
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.isUser 
                  ? 'bg-accent text-dark rounded-tr-none' 
                  : 'bg-card text-primary rounded-tl-none'
              }`}>
                <p className="text-sm sm:text-base">{message.content}</p>
              </div>
            </div>
          ))}
          
          {isRevealing && (
            <div className="flex justify-start mb-4">
              <div className="bg-card text-primary rounded-2xl rounded-tl-none px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-200"></div>
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse delay-500"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-end p-3 border-t border-border">
        <button
          onClick={resetChat}
          className="text-sm px-3 py-1 bg-accent text-dark rounded-md hover:bg-accent/80 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Replay
        </button>
      </div>
    </div>
  );
} 