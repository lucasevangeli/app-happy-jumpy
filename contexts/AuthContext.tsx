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
      if (currentUser) {
        // If user exists, listen to their profile data
        const dbRef = ref(database, 'users/' + currentUser.uid);
        onValue(dbRef, (snapshot) => {
          const data = snapshot.val() as UserProfile;
          setProfile(data);
          if (data) {
            setIsProfileComplete(data.profileComplete === true);
          } else {
            setIsProfileComplete(false);
          }
          // Loading is false only after we get user and profile info
          setLoading(false);
        });
      } else {
        // No user, not loading
        setProfile(null);
        setIsProfileComplete(false);
        setLoading(false);
      }
    });

    // Cleanup the listener on unmount
    return () => unsubscribeAuth();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, password).catch((err) => {
      // Set loading to false only on error, otherwise onAuthStateChanged will handle it
      setLoading(false);
      Alert.alert('Erro no Login', err.message);
      throw err;
    });
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
      // onAuthStateChanged will handle the rest, including setting loading to false
      if (data.token) {
        await signInWithCustomToken(auth, data.token);
      } else {
        throw new Error('Token de autenticação não recebido do servidor.');
      }
    } catch (error: any) {
      Alert.alert('Erro no Cadastro', error.message);
      setLoading(false); // Set loading to false on error
      // Re-throw to be caught by UI if needed
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
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
