import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
} from '@expo-google-fonts/poppins';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { CartProvider } from '@/contexts/CartContext';
import { TouchableOpacity } from 'react-native';
import { User } from 'lucide-react-native';

SplashScreen.preventAutoHideAsync();

function HeaderRight() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
      <User color="#fff" style={{ marginRight: 15 }} />
    </TouchableOpacity>
  );
}

export default function AppLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-Black': Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <CartProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            headerShown: true,
            headerTitle: 'Meu Perfil',
            headerStyle: {
              backgroundColor: '#101010',
            },
            headerTintColor: '#fff',
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </CartProvider>
  );
}
