import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { User } from '../types';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  deleteUserAccount: (password: string) => Promise<void>;
  setUserAsAdmin: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const firestoreData = userDoc.data() as User;

        const userData: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          role: firestoreData?.role || 'user',
          profileImage: firebaseUser.photoURL || firestoreData?.profileImage,
          phone: firestoreData?.phone,
          organization: firestoreData?.organization,
          createdAt: firestoreData?.createdAt,
          updatedAt: firestoreData?.updatedAt
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      const firestoreData = userDoc.data() as User;
      
      const userData: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        role: firestoreData?.role || 'user',
        profileImage: firebaseUser.photoURL || firestoreData?.profileImage,
        phone: firestoreData?.phone,
        organization: firestoreData?.organization,
        createdAt: firestoreData?.createdAt,
        updatedAt: firestoreData?.updatedAt
      };
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      const userData: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (userData: Partial<User>) => {
    if (!user?.id) return;
    
    try {
      const userRef = doc(db, 'users', user.id);
      const updatedData = {
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userRef, updatedData, { merge: true });
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const deleteUserAccount = useCallback(async (password: string) => {
    if (!user?.id || !user?.email) return;
    
    try {
      // Reauthenticate the user before deleting
      const credential = EmailAuthProvider.credential(user.email, password);
      if (auth.currentUser) {
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      
      // Delete user data from Firestore
      const userRef = doc(db, 'users', user.id);
      await deleteDoc(userRef);
      
      // Delete the user's authentication account
      if (auth.currentUser) {
        await deleteUser(auth.currentUser);
      }
      
      // Clear local user state
      setUser(null);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, [user]);

  const setUserAsAdmin = useCallback(async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date().toISOString()
      });
      
      // Update local user state
      setUser(prev => prev ? { ...prev, role: 'admin' } : null);
    } catch (error) {
      console.error('Error setting user as admin:', error);
      throw error;
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUserProfile,
    deleteUserAccount,
    setUserAsAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};