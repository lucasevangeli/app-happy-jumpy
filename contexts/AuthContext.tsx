import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { auth, database } from '../lib/firebase';
import { ref, onValue, off } from 'firebase/database';
import { Alert } from 'react-native';

// Define the shape of the user profile data from Realtime Database
interface UserProfile {
  email: string;
  createdAt: string;
  profileComplete: boolean;
  fullName?: string;
  // Add other profile fields as needed
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isProfileComplete: boolean;
  loading: boolean;
  signIn: (email, password) => Promise<void>;
  signUp: (email, password) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isProfileComplete: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // User is signed out
        setProfile(null);
        setIsProfileComplete(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoading(true);
    const dbRef = ref(database, 'users/' + user.uid);

    const unsubscribeDB = onValue(dbRef, (snapshot) => {
      const data = snapshot.val() as UserProfile;
      setProfile(data);
      if (data) {
        setIsProfileComplete(data.profileComplete === true);
      } else {
        // This case might happen if the DB record wasn't created
        setIsProfileComplete(false);
      }
      setLoading(false);
    });

    // Cleanup function to detach the listener
    return () => off(dbRef, 'value', unsubscribeDB);
  }, [user]);

  const signIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email, password) => {
    setLoading(true);
    try {
      // Step 1: Call your backend to register the user
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar.');
      }

      // Step 2: Use the custom token from your backend to sign in
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
      } else {
        throw new Error('Token de autenticação não recebido do servidor.');
      }
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
      // Re-throw to be caught by UI if needed
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    profile,
    isProfileComplete,
    loading,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
