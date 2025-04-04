import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { app } from './config';
import { getUserData, updateUserProfile } from './firestore';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with email and password
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
    
    // Initialize user data in Firestore
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
      } catch (firestoreError) {
        console.error('Error initializing user profile:', firestoreError);
        // Continue even if Firestore fails - we'll create the profile on first settings access
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
      } catch (firestoreError) {
        console.error('Error checking/initializing user profile:', firestoreError);
        // Continue even if Firestore fails
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

// Sign out from all devices (not supported directly by Firebase, so we just sign out current session)
export const logoutAllDevices = async () => {
  try {
    // Currently just signs out current device as Firebase doesn't support multi-device signout
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
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