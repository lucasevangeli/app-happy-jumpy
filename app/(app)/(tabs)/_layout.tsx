import { Tabs, useRouter } from 'expo-router';
import {
  Home,
  Ticket,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  LogOut,
  User,
} from 'lucide-react-native';
import { TouchableOpacity, Platform, View } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../../lib/firebase';

export default function TabLayout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTitleStyle: {
          color: '#fff',
        },
        headerTintColor: '#fff', // Cor dos ícones do header, como o de voltar
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopWidth: 1,
          borderTopColor: '#222',
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#00ff88',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/profile')}
              style={{ marginRight: 20 }}>
              <User size={26} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}>
              <LogOut size={24} color="#00ff88" />
            </TouchableOpacity>
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: 'Ingressos',
          tabBarIcon: ({ size, color }) => (
            <Ticket size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="combos"
        options={{
          title: 'Combos',
          tabBarIcon: ({ size, color }) => (
            <Package size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ size, color }) => (
            <UtensilsCrossed size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Carrinho',
          tabBarIcon: ({ size, color }) => (
            <ShoppingCart size={size} color={color} strokeWidth={2.5} />
          ),
        }}
      />
    </Tabs>
  );
}
