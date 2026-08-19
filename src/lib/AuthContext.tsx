import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleAuthProvider, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export type UserRoleType = 'SUPER_ADMIN' | 'USER';

export interface UserRole {
  uid: string;
  email: string | null;
  role: UserRoleType;
  displayName: string | null;
  photoURL?: string | null;
  preferredDistrict?: string | null;
  preferredCategory?: string | null;
  isSuspended?: boolean;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  lastLoginAt?: number;
  bookmarks?: string[];
  createdAt?: number;
}

export interface AuditLog {
  id?: string;
  userId?: string;
  email: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'REGISTER_SUCCESS' | 'LOGOUT' | 'PASSWORD_RESET_REQUEST' | 'PASSWORD_CHANGED';
  method: 'PASSWORD' | 'GOOGLE';
  success: boolean;
  role?: string;
  userAgent?: string;
  timestamp: number;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isSuperAdmin: boolean;
  loading: boolean;
  
  // Modals state
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'forgot';
  setAuthModalTab: (tab: 'login' | 'register' | 'forgot') => void;
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  bookmarksModalOpen: boolean;
  setBookmarksModalOpen: (open: boolean) => void;

  // Actions
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  updateProfileData: (data: { displayName?: string; photoURL?: string; preferredDistrict?: string; preferredCategory?: string; twoFactorEnabled?: boolean }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Bookmarks
  bookmarks: string[];
  toggleBookmark: (articleId: string) => Promise<boolean>;
  isBookmarked: (articleId: string) => boolean;

  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const SUPER_ADMIN_EMAILS = [
  'chavhanakash675@gmail.com',
  'admin@rajyavani.com'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bookmarksModalOpen, setBookmarksModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to record audit trail in Firestore
  const logAuthActivity = async (payload: Omit<AuditLog, 'timestamp'>) => {
    try {
      await addDoc(collection(db, 'auth_audit_logs'), {
        ...payload,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 300) : '',
        timestamp: Date.now()
      });
    } catch (e) {
      console.warn("Audit logging non-fatal error:", e);
    }
  };

  // Determine if user is super admin
  const isSuperAdmin = Boolean(
    user && (
      (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) ||
      userRole?.role === 'SUPER_ADMIN' ||
      (userRole?.role as any) === 'ADMIN'
    )
  );

  // Inactivity auto-logout handler (30 minutes)
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Only auto-logout if user is signed in
    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        console.warn("Session expired due to 30 minutes of inactivity.");
        signOut();
      }, 30 * 60 * 1000); // 30 mins
    }
  }, [user]);

  useEffect(() => {
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('click', handleActivity);

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const isOwner = result.user.email && SUPER_ADMIN_EMAILS.includes(result.user.email.toLowerCase());
          await logAuthActivity({
            userId: result.user.uid,
            email: result.user.email || '',
            action: 'LOGIN_SUCCESS',
            method: 'GOOGLE',
            success: true,
            role: isOwner ? 'SUPER_ADMIN' : 'USER'
          });
          setAuthModalOpen(false);
        }
      })
      .catch((err) => {
        console.warn("Redirect sign in result check:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const isOwner = currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
        const defaultRole: UserRoleType = isOwner ? 'SUPER_ADMIN' : 'USER';
        
        // Immediate local state fallback
        setUserRole({
          uid: currentUser.uid,
          email: currentUser.email || null,
          role: defaultRole,
          displayName: currentUser.displayName || null,
          photoURL: currentUser.photoURL || null,
          emailVerified: currentUser.emailVerified,
          bookmarks: []
        });

        // Sync with Firestore profile
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserRole;
            // Respect suspended status
            if (data.isSuspended) {
              await firebaseSignOut(auth);
              setUser(null);
              setUserRole(null);
              alert("तुमचे खाते सुरक्षिततेच्या कारणास्तव तात्पुरते निलंबित केले आहे. कृपया मुख्य व्यवस्थापकाशी संपर्क साधा.");
              setLoading(false);
              return;
            }

            const currentRole: UserRoleType = isOwner ? 'SUPER_ADMIN' : (data.role === 'SUPER_ADMIN' || (data.role as any) === 'ADMIN' ? 'SUPER_ADMIN' : 'USER');
            setUserRole({
              ...data,
              role: currentRole,
              emailVerified: currentUser.emailVerified
            });
            if (Array.isArray(data.bookmarks)) {
              setBookmarks(data.bookmarks);
            }
            
            // Update lastLoginAt
            await updateDoc(userRef, { 
              lastLoginAt: Date.now(),
              emailVerified: currentUser.emailVerified 
            }).catch(() => {});
          } else {
            const newUser: UserRole = {
              uid: currentUser.uid,
              email: (currentUser.email || '').substring(0, 256),
              role: defaultRole,
              displayName: currentUser.displayName ? currentUser.displayName.substring(0, 200) : '',
              photoURL: currentUser.photoURL || '',
              bookmarks: [],
              isSuspended: false,
              twoFactorEnabled: false,
              emailVerified: currentUser.emailVerified,
              lastLoginAt: Date.now(),
              createdAt: Date.now()
            };
            await setDoc(userRef, newUser);
            setUserRole(newUser);
          }
        } catch (error) {
          console.warn("User profile sync info:", error);
        }
      } else {
        setUserRole(null);
        setBookmarks([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Email & Password Login
  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check suspension
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists() && userDoc.data().isSuspended) {
        await firebaseSignOut(auth);
        await logAuthActivity({
          userId: userCredential.user.uid,
          email,
          action: 'LOGIN_FAILED',
          method: 'PASSWORD',
          success: false,
          role: 'USER'
        });
        return { success: false, error: "तुमचे खाते निलंबित केले आहे. कृपया व्यवस्थापकाशी संपर्क साधा." };
      }

      await logAuthActivity({
        userId: userCredential.user.uid,
        email,
        action: 'LOGIN_SUCCESS',
        method: 'PASSWORD',
        success: true,
        role: SUPER_ADMIN_EMAILS.includes(email.toLowerCase()) ? 'SUPER_ADMIN' : 'USER'
      });

      setAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = "लॉगिन अयशस्वी. कृपया ईमेल आणि पासवर्ड तपासा.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = "चुकीचा ईमेल किंवा पासवर्ड.";
      } else if (err.code === 'auth/too-many-requests') {
        message = "अनेक अयशस्वी प्रयत्नांमुळे हे खाते तात्पुरते ब्लॉक केले आहे. कृपया थोड्या वेळाने प्रयत्न करा.";
      } else if (err.code === 'auth/invalid-email') {
        message = "अवैध ईमेल पत्ता.";
      }

      await logAuthActivity({
        email,
        action: 'LOGIN_FAILED',
        method: 'PASSWORD',
        success: false
      });

      return { success: false, error: message };
    }
  };

  // 2. Email & Password Registration
  const registerWithEmail = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // Send email verification link
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verErr) {
        console.warn("Verification email sending notice:", verErr);
      }

      const isOwner = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
      const role: UserRoleType = isOwner ? 'SUPER_ADMIN' : 'USER';

      const newUser: UserRole = {
        uid: userCredential.user.uid,
        email: email.substring(0, 256),
        role,
        displayName: name.substring(0, 200),
        photoURL: '',
        bookmarks: [],
        isSuspended: false,
        twoFactorEnabled: false,
        emailVerified: false,
        lastLoginAt: Date.now(),
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      setUserRole(newUser);

      await logAuthActivity({
        userId: userCredential.user.uid,
        email,
        action: 'REGISTER_SUCCESS',
        method: 'PASSWORD',
        success: true,
        role
      });

      setAuthModalOpen(false);
      return { success: true };
    } catch (err: any) {
      let message = "नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.";
      if (err.code === 'auth/email-already-in-use') {
        message = "हा ईमेल पत्ता आधीपासूनच नोंदणीकृत आहे. कृपया लॉगिन करा.";
      } else if (err.code === 'auth/weak-password') {
        message = "पासवर्ड किमान ६ अक्षरांचा असावा.";
      } else if (err.code === 'auth/invalid-email') {
        message = "अवैध ईमेल पत्ता.";
      }
      return { success: false, error: message };
    }
  };

  // 3. Google One-Click Login
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const isOwner = result.user.email && SUPER_ADMIN_EMAILS.includes(result.user.email.toLowerCase());
      await logAuthActivity({
        userId: result.user.uid,
        email: result.user.email || '',
        action: 'LOGIN_SUCCESS',
        method: 'GOOGLE',
        success: true,
        role: isOwner ? 'SUPER_ADMIN' : 'USER'
      });
      setAuthModalOpen(false);
      return { success: true };
    } catch (error: any) {
      console.warn("Google popup sign in notice:", error);
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;

      if (
        error.code === 'auth/popup-blocked' ||
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        if (!isIframe) {
          try {
            await signInWithRedirect(auth, googleAuthProvider);
            return { success: true };
          } catch (redirectErr: any) {
            console.error("Google redirect sign in error:", redirectErr);
          }
        }
        return { 
          success: false, 
          error: "ब्राउझरने Google लॉगिन पॉपअप ब्लॉक केले आहे. कृपया ब्राउझरमध्ये 'Allow Popups' निवडा किंवा वरील ईमेल/पासवर्ड पर्यायाने लॉगिन करा अथवा अ‍ॅप स्वतंत्र टॅबमध्ये उघडा." 
        };
      }

      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: "Google लॉगिन विंडो बंद करण्यात आली. कृपया पुन्हा प्रयत्न करा किंवा ईमेलने लॉगिन करा." };
      }
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'हा डोमेन';
        return { success: false, error: `${currentDomain} हा डोमेन Firebase मध्ये अधिकृत (Authorized) नाही. कृपया तुमच्या Firebase Console मध्ये जाऊन Authorized Domains मध्ये हा डोमेन ॲड करा किंवा ईमेल आणि पासवर्डने लॉगिन करा.` };
      }

      if (error.code === 'auth/account-exists-with-different-credential') {
        return { success: false, error: "हा ईमेल आधीच नोंदणीकृत आहे. कृपया ईमेल व पासवर्डने लॉगिन करा." };
      }

      if (error.code === 'auth/network-request-failed') {
        return { success: false, error: "नेटवर्क समस्या. कृपया तुमचे इंटरनेट कनेक्शन तपासा." };
      }

      return { 
        success: false, 
        error: error.message || "Google लॉगिन अयशस्वी झाले. कृपया अ‍ॅप एका नवीन टॅबमध्ये (New Tab) उघडून पुन्हा प्रयत्न करा किंवा ईमेल/पासवर्डने लॉगिन करा." 
      };
    }
  };

  // 4. Password Reset Flow
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email);
      await logAuthActivity({
        email,
        action: 'PASSWORD_RESET_REQUEST',
        method: 'PASSWORD',
        success: true
      });
      return { success: true };
    } catch (err: any) {
      let message = "पासवर्ड रिसेट लिंक पाठवण्यात अयशस्वी.";
      if (err.code === 'auth/user-not-found') {
        message = "या ईमेलसाठी कोणतेही खाते सापडले नाही.";
      } else if (err.code === 'auth/invalid-email') {
        message = "अवैध ईमेल पत्ता.";
      }
      return { success: false, error: message };
    }
  };

  // 5. Send Verification Email
  const sendVerificationEmail = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) return { success: false, error: "कृपया प्रथम लॉगिन करा." };
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "पडताळणी ईमेल पाठवण्यात अयशस्वी." };
    }
  };

  // 6. Update User Profile
  const updateProfileData = async (data: { 
    displayName?: string; 
    photoURL?: string; 
    preferredDistrict?: string; 
    preferredCategory?: string; 
    twoFactorEnabled?: boolean 
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: "वापरकर्ता लॉगिन नाही." };
    try {
      if (data.displayName || data.photoURL) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL
        });
      }

      const userRef = doc(db, 'users', user.uid);
      const updatePayload: any = {};
      if (data.displayName !== undefined) updatePayload.displayName = data.displayName;
      if (data.photoURL !== undefined) updatePayload.photoURL = data.photoURL;
      if (data.preferredDistrict !== undefined) updatePayload.preferredDistrict = data.preferredDistrict;
      if (data.preferredCategory !== undefined) updatePayload.preferredCategory = data.preferredCategory;
      if (data.twoFactorEnabled !== undefined) updatePayload.twoFactorEnabled = data.twoFactorEnabled;

      await updateDoc(userRef, updatePayload);

      setUserRole(prev => prev ? { ...prev, ...updatePayload } : null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "प्रोफाइल अपडेट अयशस्वी." };
    }
  };

  // 7. Change Password
  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) return { success: false, error: "कृपया प्रथम लॉगिन करा." };
    try {
      await updatePassword(auth.currentUser, newPassword);
      await logAuthActivity({
        userId: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        action: 'PASSWORD_CHANGED',
        method: 'PASSWORD',
        success: true
      });
      return { success: true };
    } catch (err: any) {
      let message = "पासवर्ड बदलण्यात अयशस्वी. कृपया पुन्हा लॉगिन करून प्रयत्न करा.";
      if (err.code === 'auth/requires-recent-login') {
        message = "सुरक्षिततेच्या कारणास्तव, कृपया पासवर्ड बदलण्यापूर्वी पुन्हा लॉगिन करा.";
      } else if (err.code === 'auth/weak-password') {
        message = "नवीन पासवर्ड किमान ६ अक्षरांचा असावा.";
      }
      return { success: false, error: message };
    }
  };

  // 8. Sign Out
  const signOut = async () => {
    try {
      if (user) {
        await logAuthActivity({
          userId: user.uid,
          email: user.email || '',
          action: 'LOGOUT',
          method: 'PASSWORD',
          success: true
        });
      }
      await firebaseSignOut(auth);
      setProfileModalOpen(false);
      setBookmarksModalOpen(false);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // 9. Bookmark & Favorites for Readers
  const toggleBookmark = async (articleId: string): Promise<boolean> => {
    if (!user) {
      setAuthModalTab('login');
      setAuthModalOpen(true);
      return false;
    }

    const alreadyBookmarked = bookmarks.includes(articleId);
    const userRef = doc(db, 'users', user.uid);

    try {
      if (alreadyBookmarked) {
        setBookmarks(prev => prev.filter(id => id !== articleId));
        await updateDoc(userRef, { bookmarks: arrayRemove(articleId) });
        return false;
      } else {
        setBookmarks(prev => [...prev, articleId]);
        await updateDoc(userRef, { bookmarks: arrayUnion(articleId) });
        return true;
      }
    } catch (e) {
      console.warn("Bookmark toggle error:", e);
      return alreadyBookmarked;
    }
  };

  const isBookmarked = (articleId: string) => bookmarks.includes(articleId);

  const openAuthModal = useCallback((tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const getToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isSuperAdmin,
        loading,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        profileModalOpen,
        setProfileModalOpen,
        bookmarksModalOpen,
        setBookmarksModalOpen,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        sendVerificationEmail,
        updateProfileData,
        changePassword,
        signOut,
        bookmarks,
        toggleBookmark,
        isBookmarked,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
