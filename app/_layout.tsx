import { useRouter, useSegments, SplashScreen, Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

// Impede que a splash screen se esconda automaticamente
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, loading, isProfileComplete } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is finished
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    // Logic to redirect based on auth state and profile completion
    if (user && !isProfileComplete) {
      router.replace('/(app)/profile');
    } else if (user && isProfileComplete && !inAppGroup) {
      router.replace('/(app)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    // Hide the splash screen once everything is ready
    SplashScreen.hideAsync();
    
  }, [user, loading, isProfileComplete, segments, router]);

  // Render a basic Stack navigator
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The (app) and (auth) groups are rendered here by default */}
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
