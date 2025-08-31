import React, { useEffect, useState } from 'react';
import { User } from '../types/database';
import { authService } from '../services/auth';
import { AuthContext, AuthContextType } from './AuthContextValue';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize predefined accounts
        await authService.initializePredefinedAccounts();
        
        // Set up auth state listener
        const unsubscribe = authService.onAuthStateChange((user) => {
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize authentication:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, role: 'student' | 'proctor' | 'admin') => {
    await authService.signUp(email, password, displayName, role);
  };

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password);
  };

  const logout = async () => {
    await authService.logout();
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (user) {
      await authService.updateUserProfile(user.id, updates);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
