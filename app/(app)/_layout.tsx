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
import { TouchableOpacity, View } from 'react-native';
import { User, ChevronLeft } from 'lucide-react-native';

const NEON_GREEN = '#00ff6a';

SplashScreen.preventAutoHideAsync();

// This component is for the icon on the TABS screen, not the profile screen
function HeaderRight() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push('/(app)/profile')}>
      <User color="#fff" style={{ marginRight: 15 }} />
    </TouchableOpacity>
  );
}

// This component is the custom BACK button for the PROFILE screen
function CustomBackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()}>
      <View
        style={{
          backgroundColor: NEON_GREEN,
          padding: 4,
          borderRadius: 20,
          marginLeft: 15,
        }}
      >
        <ChevronLeft color="#000" size={24} />
      </View>
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
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </CartProvider>
  );
}
