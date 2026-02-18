import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Sparkles, TrendingUp, Gift, Ticket as TicketIcon } from 'lucide-react-native';
import { supabase, Ticket, Combo } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';
import { TicketListCard } from '@/components/TicketListCard';

export default function HomeScreen() {
  const [featuredCombos, setFeaturedCombos] = useState<Combo[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadFeaturedItems();
  }, []);

  async function loadFeaturedItems() {
    try {
      const { data: combos } = await supabase
        .from('combos')
        .select('*')
        .eq('is_active', true);

      const { data: ticketsData } = await supabase
        .from('tickets')
        .select('*')
        .eq('is_active', true);

      if (combos) setFeaturedCombos(combos);
      if (ticketsData) setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading featured items:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/HappyJump35.png')}
        style={styles.headerGradient}
        resizeMode="cover">
        {/* <View style={styles.headerContent}>
          <Text style={styles.logo}>HAPPY JUMP</Text>
          <Text style={styles.tagline}>Diversão Sem Limites!</Text>
        </View> */}
      </ImageBackground>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Sparkles size={32} color="#ffff00" strokeWidth={2} />
          <Text style={styles.welcomeTitle}>Bem-vindo ao Happy Jump!</Text>
          <Text style={styles.welcomeText}>
            O maior parque de infláveis da região. Diversão garantida para toda
            a família!
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Gift size={24} color="#00ffff" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Todos os Combos</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalScrollContent}>
            {featuredCombos.map((combo) => {
              const discount = Math.round(
                ((combo.original_price - combo.price) / combo.original_price) *
                  100
              );
              return (
                <View key={combo.id} style={styles.horizontalCard}>
                  <ProductCard
                    name={combo.name}
                    description={combo.description}
                    price={combo.price}
                    imageUrl={combo.image_url}
                    discount={discount}
                    onAddToCart={() =>
                      addToCart({
                        id: combo.id,
                        name: combo.name,
                        price: combo.price,
                        type: 'combo',
                        image_url: combo.image_url,
                      })
                    }
                  />
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TicketIcon size={24} color="#ff00ff" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Individuais</Text>
          </View>
          {tickets.map((ticket) => (
            <TicketListCard
              key={ticket.id}
              name={ticket.name}
              description={ticket.description}
              price={ticket.price}
              imageUrl={ticket.image_url}
              duration={ticket.duration_minutes}
              onAddToCart={() =>
                addToCart({
                  id: ticket.id,
                  name: ticket.name,
                  price: ticket.price,
                  type: 'ticket',
                  image_url: ticket.image_url,
                })
              }
            />
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Horário de Funcionamento</Text>
          <Text style={styles.infoText}>Seg - Sex: 14h - 22h</Text>
          <Text style={styles.infoText}>Sáb - Dom: 10h - 22h</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    paddingTop: 100,
    paddingBottom: 70,
    paddingHorizontal: 20,
  },
  // logo: {
  //   color: '#000',
  //   fontSize: 36,
  //   fontFamily: 'Poppins-Black',
  //   letterSpacing: 2,
  //   textShadowColor: 'rgba(255, 255, 255, 0.5)',
  //   textShadowOffset: { width: 0, height: 0 },
  //   textShadowRadius: 10,
  // },
  // tagline: {
  //   color: '#000',
  //   fontSize: 16,
  //   fontFamily: 'Poppins-SemiBold',
  //   marginTop: 8,
  // },
  content: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    marginTop: -100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
  },
  welcomeTitle: {
    textAlign: 'center',
    color: '#00ff6a',
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  horizontalScroll: {
    flexGrow: 0,
  },
  horizontalScrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  horizontalCard: {
    width: 280,
  },
  infoSection: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 12,
  },
  infoText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Poppins-Regular',
  },
});
