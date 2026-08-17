import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleAuthProvider, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserRole {
  uid: string;
  email: string | null;
  role: 'ADMIN' | 'EDITOR' | 'REPORTER' | 'USER';
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Immediate local fallback role so admin is instantly recognized
        const defaultRole: 'ADMIN' | 'USER' = currentUser.email === 'chavhanakash675@gmail.com' ? 'ADMIN' : 'USER';
        setUserRole({
          uid: currentUser.uid,
          email: currentUser.email || null,
          role: defaultRole,
          displayName: currentUser.displayName || null
        });

        // Sync user profile to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserRole(userSnap.data() as UserRole);
          } else {
            const newUser: any = {
              uid: currentUser.uid,
              email: (currentUser.email || '').substring(0, 256),
              role: defaultRole,
              createdAt: Date.now()
            };
            if (currentUser.displayName) {
              newUser.displayName = currentUser.displayName.substring(0, 200);
            }
            await setDoc(userRef, newUser);
            setUserRole(newUser);
          }
        } catch (error) {
          console.warn("User profile sync info:", error);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, userRole, loading, signIn, signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
