(function() {
  // Store the original beai function
  window.beaiChatOriginal = window.BeAIChatWidget || function() {};
  
  // Keep track of chatbot configurations
  const configs = {
    chatbotId: null,
    appearance: {
      // Default appearance settings
      headerText: 'Chat with us',
      primaryColor: '#3b82f6',
      secondaryColor: '#1e3a8a',
      buttonColor: '#3b82f6',
      buttonTextColor: '#ffffff',
      placement: 'right',
      size: 'medium'
    },
    questions: [] // Suggestion questions
  };
  
  // Command queue
  const queue = [];
  
  // Function to process commands
  window.BeAIChatWidget = function() {
    const args = Array.prototype.slice.call(arguments);
    const command = args[0];
    
    if (command === 'init') {
      const chatbotId = args[1];
      const appearanceConfig = args[2] || {}; // Get appearance from 3rd arg
      const userId = args[3] || null; // Get user_id from 4th arg
      // Store the configuration
      configs.chatbotId = chatbotId;
      // Merge provided appearance with defaults
      configs.appearance = { ...configs.appearance, ...appearanceConfig }; 

      configs.userId = userId;
      
      // Fetch initial widget config (like API URL) and then suggestion questions
      fetchWidgetAndSuggestionConfig(chatbotId);
    } else {
      // Add to command queue to process later
      queue.push(args);
    }
  };
  
  // Process any queued commands
  if (window.beai && window.beai.q) {
    for (let i = 0; i < window.beai.q.length; i++) {
      window.BeAIChatWidget.apply(this, window.beai.q[i]);
    }
    // Clear the queue after processing
    window.beai.q = []; 
  }
  
  // Fetch widget configuration including API URL and Suggestion Questions
  async function fetchWidgetAndSuggestionConfig(chatbotId) {
    try {
      // Try to get the script URL
      let baseUrl = '';
      try {
        const scriptElement = document.currentScript || 
          document.querySelector('script[src*="widget.js"]');
        
        if (scriptElement && scriptElement.src) {
          const scriptUrl = new URL(scriptElement.src);
          baseUrl = `${scriptUrl.protocol}//${scriptUrl.host}`;
        }
      } catch (e) {
        console.warn('Could not determine script URL:', e);
      }
      
      if (baseUrl) {
        try {
          // Fetch API URL config
          const apiUrlResponse = await fetch(`${baseUrl}/api/widget-config?chatbotId=${chatbotId}`, {
            headers: { 'Accept': 'application/json' }
          });
          if (apiUrlResponse.ok) {
            const widgetConfig = await apiUrlResponse.json();
            window.BEAI_API_URL = widgetConfig.apiUrl;
          } else {
             throw new Error('Failed to fetch API URL config');
          }
        } catch (fetchError) {
          console.warn('Error fetching widget config, using default API URL:', fetchError);
          window.BEAI_API_URL = window.BEAI_API_URL || 'http://localhost:8234';
        }
      } else {
        // Fallback if base URL couldn't be determined
         window.BEAI_API_URL = window.BEAI_API_URL || 'http://localhost:8234';
      }

      console.log('Using API URL:', window.BEAI_API_URL);
      
      // Now fetch suggestion questions from the agent endpoint
      try {
          const agentResponse = await fetch(`${window.BEAI_API_URL}/api/agents/${chatbotId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
          });

          if (!agentResponse.ok) {
            console.warn('Failed to fetch agent details for suggestions.');
          } else {
             const agentData = await agentResponse.json();
             // Assuming suggestions are in agentData.config.suggestions
             configs.questions = agentData.config?.suggestions?.filter(s => s.enabled).map(s => ({ id: s.id, text: s.text })) || [];
             console.log('Fetched suggestions:', configs.questions);
          }
      } catch (agentFetchError) {
          console.warn('Error fetching agent details for suggestions:', agentFetchError);
      }
      
      // Load the UI now that we have the API URL and suggestions (if any)
      loadChatUI();

    } catch (error) {
      console.error('Error in widget config setup:', error);
       // Ensure API URL has a default even on errors
      window.BEAI_API_URL = window.BEAI_API_URL || 'http://localhost:8234'; 
      loadChatUI(); // Attempt to load UI even if config fails
    }
  }
  
  // Load the chat UI
  function loadChatUI() {
    // First, load the required CSS
    const styleTag = document.createElement('style');
    styleTag.textContent = `
      #beai-chat-container * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.4;
      }
      
      /* Basic reset */
      #beai-chat-container button {
        background: none;
        border: none;
        cursor: pointer;
        outline: none;
        padding: 0; /* Added */
        margin: 0; /* Added */
      }
      
      /* Widget container */
      .beai-widget-container {
        position: fixed;
        bottom: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      /* Placement specific styles */
      .beai-widget-container.placement-left { right: auto; left: 20px; align-items: flex-start; }
      .beai-widget-container.placement-right { left: auto; right: 20px; align-items: flex-end; }
      /* Center placement might need more complex handling depending on layout */
      
      /* Toggle button */
      .beai-toggle-button {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        margin-top: 10px;
      }
      
      /* Chat window */
      .beai-chat-window {
        /* Size handled by class */
        max-height: 600px; /* Increased max height */
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        background-color: #fff;
        margin-bottom: 10px;
      }

      /* Size specific styles */
      .beai-chat-window.size-small { width: 300px; }
      .beai-chat-window.size-medium { width: 360px; }
      .beai-chat-window.size-large { width: 400px; }
      
      /* Chat header */
      .beai-chat-header {
        padding: 15px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #ffffff; /* Ensure text is white */
      }

      .beai-chat-header button {
         color: #ffffff; /* Make close button white */
         background: transparent !important; /* Override any button bg */
      }
      
      /* Messages container */
      .beai-messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        height: 400px; /* Increased height */
        background-color: #f8f9fa;
      }
      
      /* Message styles */
      .beai-message {
        margin-bottom: 10px;
        max-width: 80%;
        padding: 10px 12px;
        border-radius: 15px;
        font-size: 14px;
      }
      
      .beai-user-message {
        margin-left: auto;
        background-color: #3b82f6; /* Will be overridden by appearance */
        color: white; /* Will be overridden by appearance */
      }
      
      .beai-bot-message {
        margin-right: auto;
        background-color: #e9ecef;
        color: #212529;
      }
      
      /* Input area */
      .beai-input-container {
        display: flex;
        padding: 10px;
        border-top: 1px solid #e9ecef;
      }
      
      .beai-input-field {
        flex: 1;
        padding: 10px;
        border: 1px solid #ced4da;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
      }
      
      .beai-send-button {
        padding: 0 15px;
        margin-left: 10px;
        background-color: #3b82f6; /* Will be overridden by appearance */
        color: white; /* Will be overridden by appearance */
        border-radius: 20px;
        font-weight: 600;
      }
      
      /* Typing indicator */
      .beai-typing-indicator {
        display: flex;
        margin-right: auto;
        background-color: #e9ecef;
        padding: 10px 12px;
        border-radius: 15px;
      }
      
      .beai-typing-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #adb5bd;
        margin: 0 2px;
        animation: beai-bounce 1.5s infinite;
      }
      
      .beai-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .beai-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes beai-bounce {
        0%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-5px);
        }
      }
      
      /* Suggestion chips */
      .beai-suggestions {
        display: flex;
        flex-wrap: wrap;
        margin-top: 10px;
      }
      
      .beai-suggestion-chip {
        background-color: #e9ecef;
        color: #495057;
        padding: 6px 12px;
        border-radius: 20px;
        margin: 0 5px 5px 0;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .beai-suggestion-chip:hover {
        background-color: #ced4da;
      }
    `;
    document.head.appendChild(styleTag);
    
    // Create container for the chat widget
    const container = document.createElement('div');
    container.id = 'beai-chat-container';
    document.body.appendChild(container);
    
    // Initialize chat UI
    // Pass the whole configs object which now includes appearance
    const chatWidget = new ChatWidget(container, configs);
    chatWidget.render();
  }
  
  // Chat widget class
  class ChatWidget {
    constructor(container, configs) { // Receives the whole configs object
      this.container = container;
      this.configs = configs; // Includes chatbotId, appearance, questions
      this.messages = [
        {
          text: 'Hello! How can I help you today?', // TODO: Add translation/customization
          sender: 'bot',
          timestamp: new Date()
        }
      ];
      this.isOpen = false;
      this.isTyping = false;
    }
    
    render() {
      // Create widget container & apply placement
      this.widgetContainer = document.createElement('div');
      this.widgetContainer.className = `beai-widget-container placement-${this.configs.appearance.placement}`;
      this.container.appendChild(this.widgetContainer);
      
      // Create toggle button & apply colors
      this.toggleButton = document.createElement('button');
      this.toggleButton.className = 'beai-toggle-button';
      this.toggleButton.style.backgroundColor = this.configs.appearance.buttonColor;
      this.toggleButton.style.color = this.configs.appearance.buttonTextColor;
      this.toggleButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
      this.toggleButton.addEventListener('click', () => this.toggleChat());
      this.widgetContainer.appendChild(this.toggleButton);
      
      // Create chat window (initially hidden) & apply size
      this.chatWindow = document.createElement('div');
      this.chatWindow.className = `beai-chat-window size-${this.configs.appearance.size}`;
      this.chatWindow.style.display = 'none';
      this.widgetContainer.appendChild(this.chatWindow);
      
      // Create chat header & apply colors
      const chatHeader = document.createElement('div');
      chatHeader.className = 'beai-chat-header';
      chatHeader.style.background = `linear-gradient(to right, ${this.configs.appearance.primaryColor}, ${this.configs.appearance.secondaryColor})`;
      // Text color set via CSS
      chatHeader.innerHTML = `
        <span>${this.configs.appearance.headerText}</span>
        <button class="beai-close-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      this.chatWindow.appendChild(chatHeader);
      
      // Add event listener to close button
      const closeButton = chatHeader.querySelector('.beai-close-button');
      closeButton.addEventListener('click', () => this.toggleChat());
      
      // Create messages container
      this.messagesContainer = document.createElement('div');
      this.messagesContainer.className = 'beai-messages-container';
      this.chatWindow.appendChild(this.messagesContainer);
      
      // Create input container
      const inputContainer = document.createElement('div');
      inputContainer.className = 'beai-input-container';
      inputContainer.innerHTML = `
        <input type="text" class="beai-input-field" placeholder="Type your message...">
        <button class="beai-send-button" style="background-color: ${this.configs.appearance.buttonColor}; color: ${this.configs.appearance.buttonTextColor}; padding: 10px 15px; margin-left: 5px;">Send</button>
      `;
      this.chatWindow.appendChild(inputContainer);
      
      // Add event listeners
      const inputField = inputContainer.querySelector('.beai-input-field');
      const sendButton = inputContainer.querySelector('.beai-send-button');
      
      sendButton.addEventListener('click', () => this.sendMessage(inputField.value));
      inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage(inputField.value);
        }
      });
      
      // Render initial messages
      this.renderMessages();
    }
    
    toggleChat() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.chatWindow.style.display = 'flex';
        this.toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else {
        this.chatWindow.style.display = 'none';
        this.toggleButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        `;
      }
    }
    
    renderMessages() {
      // Clear messages container
      this.messagesContainer.innerHTML = '';
      
      // Render each message
      this.messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `beai-message ${message.sender === 'user' ? 'beai-user-message' : 'beai-bot-message'}`;
        
        // Apply user message colors from appearance
        if (message.sender === 'user') {
          messageElement.style.backgroundColor = this.configs.appearance.buttonColor;
          messageElement.style.color = this.configs.appearance.buttonTextColor;
        }
        
        messageElement.innerHTML = `
          <div>${message.text}</div>
          <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
            ${this.formatTime(message.timestamp)}
          </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
      });
      
      // Add typing indicator if needed
      if (this.isTyping) {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'beai-typing-indicator';
        typingIndicator.innerHTML = `
          <div class="beai-typing-dot"></div>
          <div class="beai-typing-dot"></div>
          <div class="beai-typing-dot"></div>
        `;
        this.messagesContainer.appendChild(typingIndicator);
      }
      
      // Add suggestions if available
      if (this.configs.questions && this.configs.questions.length > 0) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'beai-suggestions';
        
        this.configs.questions.forEach(question => {
          const suggestionChip = document.createElement('button');
          suggestionChip.className = 'beai-suggestion-chip';
          suggestionChip.textContent = question.text;
          suggestionChip.addEventListener('click', () => {
            const inputField = this.chatWindow.querySelector('.beai-input-field');
            inputField.value = question.text;
            inputField.focus();
          });
          
          suggestionsContainer.appendChild(suggestionChip);
        });
        
        this.messagesContainer.appendChild(suggestionsContainer);
      }
      
      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    async sendMessage(text) {
      if (!text.trim()) return;
      
      // Clear input field
      const inputField = this.chatWindow.querySelector('.beai-input-field');
      inputField.value = '';
      
      // Add user message
      const userMessage = {
        text,
        sender: 'user',
        timestamp: new Date()
      };
      
      this.messages.push(userMessage);
      this.isTyping = true;
      this.renderMessages();
      
      try {
        // Send message to API
        const apiUrl = window.BEAI_API_URL;
        const response = await fetch(`${apiUrl}/api/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agent_id: this.configs.chatbotId,
            user_id: this.configs.userId,
            message: text,
            stream: false // Assuming no streaming for widget for now
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        
        // Add bot response
        const botMessage = {
          text: data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        this.messages.push(botMessage);
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Add error message
        const errorMessage = {
          text: 'Sorry, I encountered an error processing your request.', // TODO: Translate
          sender: 'bot',
          timestamp: new Date()
        };
        
        this.messages.push(errorMessage);
      } finally {
        this.isTyping = false;
        this.renderMessages();
      }
    }
  }
})(); 