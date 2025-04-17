/**
 * API Client for backend services
 * This replaces all Firestore operations with REST API calls
 */

// Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL + '/api' || 'http://localhost:3000/api';

/**
 * Generic API request handler with error management
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization if user is logged in
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // Convert body to JSON for non-GET requests
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  try {
    const response = await fetch(url, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

// Simplified request methods
const apiClient = {
  get: (endpoint, queryParams = {}) => {
    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET' });
  },
  
  post: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: data,
    });
  },
  
  put: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: data,
    });
  },
  
  patch: (endpoint, data) => {
    return apiRequest(endpoint, {
      method: 'PATCH',
      body: data,
    });
  },
  
  delete: (endpoint) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};

// =======================================================
// User APIs (replaces users.js Firestore operations)
// =======================================================

/**
 * Get user data by user ID
 */
export async function getUserData(uid) {
  try {
    return await apiClient.get(`/users/${uid}`);
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
}

/**
 * Update user profile data
 */
export async function updateUserProfile(uid, profileData) {
  try {
    return await apiClient.patch(`/users/${uid}`, profileData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Create user profile
 */
export async function createUserProfile(profileData) {
  try {
    return await apiClient.post(`/users`, profileData);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(uid, preferences) {
  try {
    return await apiClient.patch(`/users/${uid}/preferences`, preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
}

/**
 * Create initial user settings
 */
export async function createUserSettings(uid, userData = {}) {
  try {
    return await apiClient.post(`/users/${uid}/settings`, userData);
  } catch (error) {
    console.error('Error creating user settings:', error);
    throw error;
  }
}

/**
 * Update user settings
 */
export async function updateUserSettings(uid, settingsData) {
  try {
    return await apiClient.put(`/users/${uid}/settings`, settingsData);
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
}

/**
 * Update a single user setting by path
 */
export async function updateSingleSetting(uid, settingPath, value) {
  try {
    return await apiClient.patch(`/users/${uid}/settings`, { path: settingPath, value });
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
}

// =======================================================
// Chatbot APIs (replaces chatbots.js Firestore operations)
// =======================================================

/**
 * Get a single chatbot by ID
 */
export async function getChatbot(chatbotId) {
  try {
    return await apiClient.get(`/chatbots/${chatbotId}`);
  } catch (error) {
    console.error('Error getting chatbot:', error);
    throw error;
  }
}

/**
 * Get all chatbots for a user
 */
export async function getUserChatbots(userId) {
  try {
    const response = await apiClient.get(`/users/${userId}/chatbots`, {
      sort: 'updatedAt',
      order: 'desc'
    });

    return response.chatbots;
  } catch (error) {
    console.error('Error getting user chatbots:', error);
    throw error;
  }
}

/**
 * Create a new chatbot
 */
export async function createChatbot(userId, name) {
  try {
    const defaultSettings = {
      appearance: {
        headerText: 'Chat with us',
        primaryColor: '#3b82f6',
        secondaryColor: '#1e3a8a',
        buttonColor: '#3b82f6',
        buttonTextColor: '#ffffff',
        placement: 'right',
        size: 'medium'
      },
      rules: [
        { id: '1', text: 'Be friendly and helpful', enabled: true },
        { id: '2', text: 'Do not share personal information', enabled: true },
        { id: '3', text: 'Keep responses concise', enabled: true }
      ],
      suggestions: [
        { id: '1', text: 'How can I get started?' },
        { id: '2', text: 'What are your business hours?' },
        { id: '3', text: 'Do you offer support?' }
      ],
      agent: {
        system_name: "AssistantSystem",
        context_class: {
          name: "UserContext",
          attributes: [
            { name: "user_id", type: "str" },
            { name: "conversation_history", type: "str", default: "" }
          ]
        },
        agents: [
          {
            id: "main_assistant",
            name: "Main Assistant",
            instructions: "You are a helpful assistant. Answer the user's questions clearly and concisely.",
            tools: [],
            handoffs: []
          }
        ],
        router_agent_id: "main_assistant",
        default_model: "gpt-4.1-mini",
        workflow_type: "simple_router"
      }
    };

    
    
    const chatbotData = {
      name: name || 'New Chatbot',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: defaultSettings
    };
    
    return await apiClient.post('/chatbots', chatbotData);
  } catch (error) {
    console.error('Error creating chatbot:', error);
    throw error;
  }
}

/**
 * Update chatbot (general properties)
 */
export async function updateChatbot(chatbotId, data) {
  try {
    return await apiClient.patch(`/chatbots/${chatbotId}`, data);
  } catch (error) {
    console.error('Error updating chatbot:', error);
    throw error;
  }
}

/**
 * Update a specific settings section
 */
export async function updateChatbotSettings(chatbotId, settingType, settings) {
  try {
    return await apiClient.patch(`/chatbots/${chatbotId}/settings/${settingType}`, settings);
  } catch (error) {
    console.error(`Error updating chatbot ${settingType} settings:`, error);
    throw error;
  }
}

/**
 * Delete a chatbot
 */
export async function deleteChatbot(chatbotId) {
  try {
    return await apiClient.delete(`/chatbots/${chatbotId}`);
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    throw error;
  }
}

// =======================================================
// Chat History APIs
// =======================================================

/**
 * Get chat history for specific chatbots
 */
export async function getChatHistory(agentIds, limit = 100) {
  try {
    const response = await apiClient.get('/chat-history', {
      agentIds: Array.isArray(agentIds) ? agentIds.join(',') : agentIds,
      sort: 'timestamp',
      order: 'desc',
      limit
    });
    return response.chat_history;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
}

export { apiClient }; 