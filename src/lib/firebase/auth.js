import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { app } from './config';
// Import from our API client instead of Firestore
import { getUserData, updateUserProfile } from '../api';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Store the authentication token in localStorage for API requests
    const token = await userCredential.user.getIdToken();
    localStorage.setItem('authToken', token);
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign up with email and password
export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store the authentication token in localStorage for API requests
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    
    // Initialize user data in database
    if (user) {
      const userData = {
        email: user.email,
        firstName: '',
        lastName: '',
        companyName: '',
        displayName: user.displayName || ''
      };
      
      try {
        await updateUserProfile(user.uid, userData);
      } catch (apiError) {
        console.error('Error initializing user profile:', apiError);
        // Continue even if API fails - we'll create the profile on first settings access
      }
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Store the authentication token in localStorage for API requests
    const token = await user.getIdToken();
    localStorage.setItem('authToken', token);
    
    // Check if user profile exists, create if not
    if (user) {
      try {
        const userData = await getUserData(user.uid);
        
        // If no data, initialize profile
        if (!userData) {
          const newUserData = {
            email: user.email,
            firstName: '',
            lastName: '',
            companyName: '',
            displayName: user.displayName || ''
          };
          
          await updateUserProfile(user.uid, newUserData);
        }
      } catch (apiError) {
        console.error('Error checking/initializing user profile:', apiError);
        // Continue even if API fails
      }
    }
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Re-authenticate user with credentials
export const reauthenticateUser = async (currentPassword) => {
  try {
    const user = auth.currentUser;
    if (!user || !user.email) return { success: false, error: 'No user logged in' };
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user password
export const updateUserPassword = async (currentPassword, newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'No user logged in' };
    
    // Re-authenticate user first
    const reauth = await reauthenticateUser(currentPassword);
    if (!reauth.success) {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    // Update password
    await updatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Change user password
export const changePassword = async (newPassword) => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'No user logged in' };
    
    await updatePassword(user, newPassword);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out from all devices (not supported directly by Firebase, so we just sign out current session)
export const logoutAllDevices = async () => {
  try {
    // Currently just signs out current device as Firebase doesn't support multi-device signout
    await signOut(auth);
    
    // Clear the authentication token from localStorage
    localStorage.removeItem('authToken');
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    
    // Clear the authentication token from localStorage
    localStorage.removeItem('authToken');
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth }; 