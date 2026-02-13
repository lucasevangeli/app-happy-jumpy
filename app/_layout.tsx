import { Slot, useRouter, useSegments, SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

// Impede que a splash screen se esconda automaticamente
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    // Esconde a splash screen quando a lógica de autenticação e roteamento estiver concluída
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [user, loading, segments, router]);

  // Renderiza o Slot (a rota atual) ou nada enquanto carrega.
  // A splash screen nativa ficará visível durante o carregamento.
  if (loading) {
    return null;
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
