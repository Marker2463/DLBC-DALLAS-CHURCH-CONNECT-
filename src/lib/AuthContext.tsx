import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, UserProfile, UserRole } from './firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type AuthContextType = {
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: UserRole | null;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          let currentRole = profile.role;
          if (firebaseUser.email === 'markeroladipo@gmail.com' && currentRole !== 'admin') {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(docRef, { role: 'admin' });
            currentRole = 'admin';
          }
          setUser({ ...profile, role: currentRole });
          setRole(currentRole);
          setIsAuthenticated(true);
        } else {
          // Self-heal: Create missing profile document if it somehow failed during registration
          const { setDoc } = await import('firebase/firestore');
          const isAdmin = firebaseUser.email === 'markeroladipo@gmail.com';
          const newProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'User',
            email: firebaseUser.email?.toLowerCase().trim() || '',
            role: isAdmin ? 'admin' : 'member',
            createdAt: new Date().toISOString()
          };
          
          try {
            await setDoc(docRef, newProfile);
          } catch (e) {
            console.error('Failed to auto-heal missing user profile', e);
          }

          setUser(newProfile as UserProfile);
          setRole(newProfile.role as UserRole);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
