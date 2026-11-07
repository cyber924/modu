import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, testConnection } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isPartner: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdminEmail: (email: string | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const BOOTSTRAPPED_ADMIN_EMAIL = 'sungbae0613@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdminEmail = (email: string | null) => {
    return email === 'sungbae0613@gmail.com' || email === 'cyber924@naver.com';
  };

  const isAdmin = user ? (isAdminEmail(user.email) || userProfile?.role === 'admin') : false;
  const isPartner = user ? (isAdmin || userProfile?.role === 'partner') : false;

  // Sync user profile in Firestore
  const syncUserProfile = async (currentUser: User) => {
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      const resolvedRole = isAdminEmail(currentUser.email) ? 'admin' : 'customer';

      if (!userDoc.exists()) {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || '사용자',
          role: resolvedRole,
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      } else {
        const existingData = userDoc.data() as UserProfile;
        // Auto-elevate to admin if bootstrapped email matches but role isn't admin
        if (isAdminEmail(currentUser.email) && existingData.role !== 'admin') {
          const updatedProfile = { ...existingData, role: 'admin' as const };
          await setDoc(userDocRef, { role: 'admin' }, { merge: true });
          setUserProfile(updatedProfile);
        } else {
          setUserProfile(existingData);
        }
      }
    } catch (err) {
      console.error('Error syncing user profile:', err);
    }
  };

  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const res = await signInWithPopup(auth, provider);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await syncUserProfile(res.user);
      }
    } catch (error) {
      console.error('Email Sign In Error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        // Set profile immediately
        const userDocRef = doc(db, 'users', res.user.uid);
        const resolvedRole = isAdminEmail(email) ? 'admin' : 'customer';
        const newProfile: UserProfile = {
          uid: res.user.uid,
          email: email,
          displayName: name,
          role: resolvedRole,
          createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (error) {
      console.error('Email Sign Up Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      isAdmin, 
      isPartner,
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      logout, 
      isAdminEmail 
    }}>
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
