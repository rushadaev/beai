'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Preview() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot typing and response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  // Simple response logic
  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello there! How can I assist you today?';
    } else if (lowerInput.includes('pricing') || lowerInput.includes('cost')) {
      return 'Our pricing starts at $10/month for the basic plan. Would you like more details about our pricing plans?';
    } else if (lowerInput.includes('feature') || lowerInput.includes('can you')) {
      return 'Our platform offers many features including chatbot creation, customization, and analytics. Is there a specific feature you want to know more about?';
    } else if (lowerInput.includes('thank')) {
      return "You're welcome! Is there anything else I can help with?";
    } else {
      return "That's an interesting question. I'd be happy to look into that for you. Could you provide more details?";
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-lg font-medium text-primary">Chatbot Preview</h3>
        <p className="text-sm text-secondary">
          Test your chatbot and see how it will appear to your users.
        </p>
      </div>

      <div className="mx-auto max-w-md overflow-hidden rounded-lg border border-border">
        {/* Chat header */}
        <div className="bg-accent p-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-dark flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
            </div>
            <h3 className="ml-2 text-lg font-semibold text-dark">Chat with us</h3>
          </div>
        </div>
        
        {/* Chat messages */}
        <div 
          ref={chatContainerRef}
          className="h-[400px] bg-dark overflow-y-auto p-4 custom-scrollbar"
        >
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.isUser 
                      ? 'bg-accent text-dark rounded-br-none' 
                      : 'bg-card text-primary rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <div className={`text-xs mt-1 ${msg.isUser ? 'text-dark/70' : 'text-secondary'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-card px-4 py-2 text-primary rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-secondary animate-pulse"></div>
                    <div className="h-2 w-2 rounded-full bg-secondary animate-pulse delay-200"></div>
                    <div className="h-2 w-2 rounded-full bg-secondary animate-pulse delay-500"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Chat input */}
        <div className="border-t border-border bg-card p-3">
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-l-md border-y border-l border-border bg-dark px-3 py-2 text-primary focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              className="rounded-r-md bg-accent px-4 py-2 text-dark hover:bg-accent/80 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <div className="mx-auto max-w-md mt-4">
        <div className="flex justify-end">
          <button
            onClick={() => setMessages([{ id: '1', text: 'Hello! How can I help you today?', isUser: false, timestamp: new Date() }])}
            className="rounded-md border border-border bg-dark px-4 py-2 text-sm text-primary hover:bg-card"
          >
            Reset Chat
          </button>
        </div>
      </div>
    </div>
  );
} 