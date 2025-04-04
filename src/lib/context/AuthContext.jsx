'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, login, register, logout, signInWithGoogle } from '../firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const result = await login(email, password);
    return result;
  };

  const signUp = async (email, password) => {
    const result = await register(email, password);
    return result;
  };

  const signInWithGoogleProvider = async () => {
    const result = await signInWithGoogle();
    return result;
  };

  const signOut = async () => {
    const result = await logout();
    return result;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogleProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 