import { 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

// Collection reference
const chatbotsCollection = 'chatbots';

/**
 * Get a single chatbot by ID
 */
export async function getChatbot(chatbotId) {
  try {
    const chatbotRef = doc(db, chatbotsCollection, chatbotId);
    const chatbotSnap = await getDoc(chatbotRef);
    
    if (chatbotSnap.exists()) {
      const data = chatbotSnap.data();
      return {
        id: chatbotSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting chatbot:', error);
    throw error;
  }
}

/**
 * Get all chatbots for a user
 * 
 * Note: This query requires a composite index on the chatbots collection 
 * with fields: userId (ascending) and updatedAt (descending)
 */
export async function getUserChatbots(userId) {
  try {
    // TEMPORARY WORKAROUND: While waiting for the index to build,
    // we'll use a simpler query without sorting
    const q = query(
      collection(db, chatbotsCollection),
      where('userId', '==', userId)
      // Temporarily removing orderBy to avoid index error
      // orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
    
    // Manually sort the results by updatedAt (descending)
    return results.sort((a, b) => {
      if (!a.updatedAt || !b.updatedAt) return 0;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
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
    const timestamp = serverTimestamp();
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
      ]
    };
    
    const chatbotData = {
      name: name || 'New Chatbot',
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      settings: defaultSettings
    };
    
    const chatbotRef = await addDoc(collection(db, chatbotsCollection), chatbotData);
    
    return {
      id: chatbotRef.id,
      ...chatbotData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    const chatbotRef = doc(db, chatbotsCollection, chatbotId);
    
    await updateDoc(chatbotRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    return true;
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
    const chatbotRef = doc(db, chatbotsCollection, chatbotId);
    
    await updateDoc(chatbotRef, {
      [`settings.${settingType}`]: settings,
      updatedAt: serverTimestamp()
    });
    
    return true;
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
    const chatbotRef = doc(db, chatbotsCollection, chatbotId);
    await deleteDoc(chatbotRef);
    return true;
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    throw error;
  }
} 