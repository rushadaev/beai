# Firestore to Custom Backend API Migration

This document lists all Firebase Firestore operations found in the codebase and suggests how to implement them with a custom backend API.

## API Client Implementation

A centralized API client has been created at `src/lib/api/index.js` to replace all Firestore operations. This client:

- Uses the environment variable `NEXT_PUBLIC_API_URL` for the base URL
- Handles authentication via JWT tokens
- Provides consistent error handling
- Implements all the Firestore operations as REST API calls

## Collections Overview

| Firestore Collection | API Endpoint Base |
|---------------------|-------------------|
| `users` | `/api/users` |
| `chatbots` | `/api/chatbots` |
| `chat_history` | `/api/chat-history` |

## API Endpoints Implemented

### Users Collection

#### 1. Get User Data
```javascript
// Current: getUserData(uid)
// Collection: users
// Operation: getDoc

// API Endpoint
GET /api/users/:userId

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
const userSnap = await getDoc(userRef);

// New API code:
import { getUserData } from '@/lib/api';
const userData = await getUserData(uid);
```

#### 2. Update User Profile
```javascript
// Current: updateUserProfile(uid, profileData)
// Collection: users
// Operation: updateDoc

// API Endpoint
PATCH /api/users/:userId
// Body: profileData

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
await updateDoc(userRef, { ...profileData, updatedAt: serverTimestamp() });

// New API code:
import { updateUserProfile } from '@/lib/api';
await updateUserProfile(uid, profileData);
```

#### 3. Update User Preferences
```javascript
// Current: updateUserPreferences(uid, preferences)
// Collection: users
// Operation: updateDoc

// API Endpoint
PATCH /api/users/:userId/preferences
// Body: preferences

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
await updateDoc(userRef, { preferences, updatedAt: serverTimestamp() });

// New API code:
import { updateUserPreferences } from '@/lib/api';
await updateUserPreferences(uid, preferences);
```

#### 4. Create User Settings
```javascript
// Current: createUserSettings(uid, userData)
// Collection: users
// Operation: setDoc

// API Endpoint
POST /api/users/:userId/settings
// Body: userData

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
await setDoc(userRef, defaultData);

// New API code:
import { createUserSettings } from '@/lib/api';
await createUserSettings(uid, userData);
```

#### 5. Update User Settings
```javascript
// Current: updateUserSettings(uid, settingsData)
// Collection: users
// Operation: updateDoc

// API Endpoint
PUT /api/users/:userId/settings
// Body: settingsData

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
await updateDoc(userRef, { ...settingsData, updatedAt: serverTimestamp() });

// New API code:
import { updateUserSettings } from '@/lib/api';
await updateUserSettings(uid, settingsData);
```

#### 6. Update Single Setting
```javascript
// Current: updateSingleSetting(uid, settingPath, value)
// Collection: users
// Operation: updateDoc

// API Endpoint
PATCH /api/users/:userId/settings
// Body: { path: settingPath, value: value }

// Previous Firestore code:
const userRef = doc(db, usersCollection, uid);
await updateDoc(userRef, { [settingPath]: value, updatedAt: serverTimestamp() });

// New API code:
import { updateSingleSetting } from '@/lib/api';
await updateSingleSetting(uid, settingPath, value);
```

### Chatbots Collection

#### 1. Get Chatbot
```javascript
// Current: getChatbot(chatbotId)
// Collection: chatbots
// Operation: getDoc

// API Endpoint
GET /api/chatbots/:chatbotId

// Previous Firestore code:
const chatbotRef = doc(db, chatbotsCollection, chatbotId);
const chatbotSnap = await getDoc(chatbotRef);

// New API code:
import { getChatbot } from '@/lib/api';
const chatbot = await getChatbot(chatbotId);
```

#### 2. Get User Chatbots
```javascript
// Current: getUserChatbots(userId)
// Collection: chatbots
// Operation: query with where('userId', '==', userId) and orderBy('updatedAt', 'desc')

// API Endpoint
GET /api/users/:userId/chatbots
// Query params: ?sort=updatedAt&order=desc

// Previous Firestore code:
const q = query(
  collection(db, chatbotsCollection),
  where('userId', '==', userId),
  orderBy('updatedAt', 'desc')
);
const querySnapshot = await getDocs(q);

// New API code:
import { getUserChatbots } from '@/lib/api';
const chatbots = await getUserChatbots(userId);
```

#### 3. Create Chatbot
```javascript
// Current: createChatbot(userId, name)
// Collection: chatbots
// Operation: addDoc

// API Endpoint
POST /api/chatbots
// Body: { userId, name, settings: defaultSettings }

// Previous Firestore code:
const chatbotRef = await addDoc(collection(db, chatbotsCollection), chatbotData);

// New API code:
import { createChatbot } from '@/lib/api';
const chatbot = await createChatbot(userId, name);
```

#### 4. Update Chatbot
```javascript
// Current: updateChatbot(chatbotId, data)
// Collection: chatbots
// Operation: updateDoc

// API Endpoint
PATCH /api/chatbots/:chatbotId
// Body: data

// Previous Firestore code:
const chatbotRef = doc(db, chatbotsCollection, chatbotId);
await updateDoc(chatbotRef, { ...data, updatedAt: serverTimestamp() });

// New API code:
import { updateChatbot } from '@/lib/api';
await updateChatbot(chatbotId, data);
```

#### 5. Update Chatbot Settings
```javascript
// Current: updateChatbotSettings(chatbotId, settingType, settings)
// Collection: chatbots
// Operation: updateDoc

// API Endpoint
PATCH /api/chatbots/:chatbotId/settings/:settingType
// Body: settings

// Previous Firestore code:
const chatbotRef = doc(db, chatbotsCollection, chatbotId);
await updateDoc(chatbotRef, { [`settings.${settingType}`]: settings, updatedAt: serverTimestamp() });

// New API code:
import { updateChatbotSettings } from '@/lib/api';
await updateChatbotSettings(chatbotId, settingType, settings);
```

#### 6. Delete Chatbot
```javascript
// Current: deleteChatbot(chatbotId)
// Collection: chatbots
// Operation: deleteDoc

// API Endpoint
DELETE /api/chatbots/:chatbotId

// Previous Firestore code:
const chatbotRef = doc(db, chatbotsCollection, chatbotId);
await deleteDoc(chatbotRef);

// New API code:
import { deleteChatbot } from '@/lib/api';
await deleteChatbot(chatbotId);
```

### Chat History Collection

#### 1. Get Chat History
```javascript
// Current: in dashboard/history/page.tsx and dashboard/insights/page.tsx
// Collection: chat_history
// Operation: query with where('agent_id', 'in', agentIds), orderBy('timestamp', 'desc'), limit(100)

// API Endpoint
GET /api/chat-history
// Query params: ?agentIds=id1,id2&sort=timestamp&order=desc&limit=100

// Previous Firestore code:
const chatHistoryQuery = query(
  collection(db, 'chat_history'),
  where('agent_id', 'in', agentIds),
  orderBy('timestamp', 'desc'),
  limit(100)
);
const chatHistorySnapshot = await getDocs(chatHistoryQuery);
const chatMessages = chatHistorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// New API code:
import { getChatHistory } from '@/lib/api';
const chatMessages = await getChatHistory(agentIds, 100);
```

## Examples of Usage in Components

### Example: Dashboard History Page
```javascript
// Before (using Firestore)
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

// Fetch chat history for the user's chatbots
async function fetchChatHistory(userChatbots) {
  try {
    const agentIds = userChatbots.map(chatbot => chatbot.id);
    
    // Create a query to get all chat messages for the user's chatbots
    const chatHistoryQuery = query(
      collection(db, 'chat_history'),
      where('agent_id', 'in', agentIds),
      orderBy('timestamp', 'desc'),
      limit(100) // Limit to recent conversations
    );
    
    const chatHistorySnapshot = await getDocs(chatHistoryQuery);
    const chatMessages = chatHistorySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Process the messages...
  } catch (error) {
    console.error('Error fetching chat history:', error);
  }
}

// After (using API client)
import { getUserChatbots, getChatHistory } from '@/lib/api';

// Fetch chat history for the user's chatbots
async function fetchChatHistory(userId) {
  try {
    // Get the user's chatbots
    const chatbots = await getUserChatbots(userId);
    const agentIds = chatbots.map(chatbot => chatbot.id);
    
    // Get chat history for these chatbots
    const chatMessages = await getChatHistory(agentIds, 100);
    
    // Process the messages...
  } catch (error) {
    console.error('Error fetching chat history:', error);
  }
}
```

## Backend Implementation Requirements

When implementing the backend API, ensure:

1. All endpoints return JSON with consistent structure
2. Error responses follow a standard format: `{ error: true, message: "Error message" }`
3. Success responses include requested data directly
4. Authentication is validated on each request
5. Timestamp fields (createdAt, updatedAt) are handled server-side
