import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUser, getUser, updateUser } from './database';
import { User } from '../types/database';
import { localAuthService, LocalUser } from './localAuth';

// Predefined admin accounts
const PREDEFINED_ACCOUNTS = [
  {
    email: "admin@smartproctor.com",
    password: "admin123",
    displayName: "System Administrator",
    role: "admin" as const
  },
  {
    email: "proctor@smartproctor.com",
    password: "proctor123", 
    displayName: "Senior Proctor",
    role: "proctor" as const
  },
  {
    email: "demo@smartproctor.com",
    password: "demo123",
    displayName: "Demo User", 
    role: "student" as const
  }
];

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, role: 'student' | 'proctor' | 'admin') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

// Check if Firebase is available and working
let isFirebaseAvailable = true;

const checkFirebaseAvailability = async (): Promise<boolean> => {
  try {
    // Try a simple Firebase operation to check if it's working
    await signOut(auth);
    // Clear any previous error markers
    sessionStorage.removeItem('firebase_auth_error');
    return true;
  } catch (error: any) {
    if (error?.code === 'auth/operation-not-allowed' || 
        error?.code === 'auth/unauthorized-domain' ||
        error?.code === 'auth/invalid-api-key') {
      console.warn('Firebase Authentication not available, falling back to local auth:', error.message);
      // Mark that Firebase auth is not working
      sessionStorage.setItem('firebase_auth_error', error.code);
      return false;
    }
    return true;
  }
};

// Convert LocalUser to User format
const convertLocalUserToUser = (localUser: LocalUser): User => ({
  id: localUser.id,
  email: localUser.email,
  displayName: localUser.displayName,
  role: localUser.role,
  createdAt: localUser.createdAt,
  updatedAt: localUser.createdAt
});

export const authService = {
  // Initialize predefined accounts (call this once on app startup)
  initializePredefinedAccounts: async (): Promise<void> => {
    // Check Firebase availability first
    isFirebaseAvailable = await checkFirebaseAvailability();
    
    if (isFirebaseAvailable) {
      for (const account of PREDEFINED_ACCOUNTS) {
        try {
          // Try to sign in to check if account exists
          await signInWithEmailAndPassword(auth, account.email, account.password);
          // If successful, account already exists
          await signOut(auth);
        } catch (error) {
          // Account doesn't exist, create it
          try {
            await authService.signUp(account.email, account.password, account.displayName, account.role);
            await signOut(auth); // Sign out after creating
            console.log(`Created predefined account: ${account.email}`);
          } catch (createError) {
            console.error(`Failed to create predefined account ${account.email}:`, createError);
          }
        }
      }
    } else {
      // Initialize local auth predefined accounts
      console.log('Initializing local authentication predefined accounts');
    }
  },

  // Sign up new user
  signUp: async (email: string, password: string, displayName: string, role: 'student' | 'proctor' | 'admin'): Promise<void> => {
    if (isFirebaseAvailable) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(firebaseUser, { displayName });

        // Create user document in Firestore using Firebase UID so getUser(uid) can locate it
        const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
          email,
          displayName,
          role,
        };

        await createUser(userData, firebaseUser.uid);
      } catch (error: any) {
        if (error?.code === 'auth/operation-not-allowed') {
          // Fall back to local auth
          isFirebaseAvailable = false;
          const localUser = await localAuthService.signUp(email, password, displayName, role);
          console.log('Created user with local auth:', localUser);
        } else {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(message || 'Failed to create account');
        }
      }
    } else {
      // Use local auth
      const localUser = await localAuthService.signUp(email, password, displayName, role);
      console.log('Created user with local auth:', localUser);
    }
  },

  // Sign in existing user
  signIn: async (email: string, password: string): Promise<void> => {
    if (isFirebaseAvailable) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        if (error?.code === 'auth/operation-not-allowed') {
          // Fall back to local auth
          isFirebaseAvailable = false;
          const localUser = await localAuthService.signIn(email, password);
          console.log('Signed in with local auth:', localUser);
        } else {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(message || 'Failed to sign in');
        }
      }
    } else {
      // Use local auth
      const localUser = await localAuthService.signIn(email, password);
      console.log('Signed in with local auth:', localUser);
    }
  },

  // Sign out
  logout: async (): Promise<void> => {
    if (isFirebaseAvailable) {
      try {
        await signOut(auth);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(message || 'Failed to sign out');
      }
    } else {
      // Use local auth
      await localAuthService.logout();
    }
  },

  // Get current user data from Firestore
  getCurrentUserData: async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      return await getUser(firebaseUser.uid);
    } catch (error) {
      console.error('Error fetching user data:', error instanceof Error ? error.message : error);
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      await updateUser(userId, updates);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(message || 'Failed to update profile');
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (isFirebaseAvailable) {
      return onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userData = await authService.getCurrentUserData(firebaseUser);
          callback(userData);
        } else {
          callback(null);
        }
      });
    } else {
      // Use local auth state changes
      return localAuthService.onAuthStateChange((localUser) => {
        if (localUser) {
          const user = convertLocalUserToUser(localUser);
          callback(user);
        } else {
          callback(null);
        }
      });
    }
  },

  // Get current user (for immediate access)
  getCurrentUser: (): User | null => {
    if (isFirebaseAvailable) {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        // This is a simplified version - in practice you'd want to get the full user data
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          role: 'student', // Default role
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      return null;
    } else {
      const localUser = localAuthService.getCurrentUser();
      return localUser ? convertLocalUserToUser(localUser) : null;
    }
  }
};
