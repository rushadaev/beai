import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

// Collection reference
const usersCollection = 'users';

/**
 * Get user data by user ID
 */
export async function getUserData(uid) {
  try {
    const userRef = doc(db, usersCollection, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    
    return null;
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
    const userRef = doc(db, usersCollection, uid);
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(uid, preferences) {
  try {
    const userRef = doc(db, usersCollection, uid);
    
    await updateDoc(userRef, {
      preferences: preferences,
      updatedAt: serverTimestamp()
    });
    
    return true;
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
    const userRef = doc(db, usersCollection, uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return {
        id: userSnap.id,
        ...userSnap.data()
      };
    }
    
    // User document doesn't exist, create it with default settings
    const timestamp = serverTimestamp();
    const defaultData = {
      email: userData.email || '',
      displayName: userData.displayName || '',
      photoURL: userData.photoURL || '',
      preferences: {
        theme: 'dark',
        notifications: true
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await setDoc(userRef, defaultData);
    
    return {
      id: uid,
      ...defaultData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
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
    const userRef = doc(db, usersCollection, uid);
    
    await updateDoc(userRef, {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    
    return true;
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
    const userRef = doc(db, usersCollection, uid);
    
    await updateDoc(userRef, {
      [settingPath]: value,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error;
  }
} 