import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Clock, Users, Ticket as TicketIcon } from 'lucide-react-native';
import { supabase, Ticket } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function TicketsScreen() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getItemCount } = useCart();

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const { data } = await supabase
        .from('tickets')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (data) setTickets(data);
    } catch (error) {
      console.error('Error loading tickets:', error);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Ingressos</Text>
            <Text style={styles.headerSubtitle}>
              Escolha o melhor para você
            </Text>
          </View>
          {getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
            </View>
          )}
        </View>

        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Clock size={20} color="#ff00ff" strokeWidth={2.5} />
            <Text style={styles.infoCardText}>Diversos horários</Text>
          </View>
          <View style={styles.infoCard}>
            <Users size={20} color="#00ffff" strokeWidth={2.5} />
            <Text style={styles.infoCardText}>Todas as idades</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tickets.map((ticket) => (
          <ProductCard
            key={ticket.id}
            name={ticket.name}
            description={ticket.description}
            price={ticket.price}
            imageUrl={ticket.image_url}
            badge={`${ticket.duration_minutes} min`}
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

        <View style={styles.footer}>
          <TicketIcon size={24} color="#00ff88" strokeWidth={2} />
          <Text style={styles.footerText}>
            Todos os ingressos incluem acesso ilimitado aos brinquedos durante o
            período contratado
          </Text>
        </View>
      </ScrollView>
    </View>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  cartBadge: {
    backgroundColor: '#00ff88',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  infoCards: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  infoCardText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#222',
  },
  footerText: {
    flex: 1,
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
  },
});
