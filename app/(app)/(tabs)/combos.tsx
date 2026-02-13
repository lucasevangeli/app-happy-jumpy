import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Gift, Star, Sparkles } from 'lucide-react-native';
import { supabase, Combo } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/ProductCard';

export default function CombosScreen() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getItemCount } = useCart();

  useEffect(() => {
    loadCombos();
  }, []);

  async function loadCombos() {
    try {
      const { data } = await supabase
        .from('combos')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (data) setCombos(data);
    } catch (error) {
      console.error('Error loading combos:', error);
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
            <Text style={styles.headerTitle}>Combos</Text>
            <Text style={styles.headerSubtitle}>Economize com nossos pacotes</Text>
          </View>
          {getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
            </View>
          )}
        </View>

        <View style={styles.promoCard}>
          <Sparkles size={28} color="#ffff00" strokeWidth={2} />
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Ofertas Especiais!</Text>
            <Text style={styles.promoText}>
              Economia de até 30% em nossos combos
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {combos.map((combo) => {
          const discount = Math.round(
            ((combo.original_price - combo.price) / combo.original_price) * 100
          );
          return (
            <View key={combo.id} style={styles.comboContainer}>
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
              <View style={styles.includesCard}>
                <View style={styles.includesHeader}>
                  <Star size={18} color="#00ff88" strokeWidth={2.5} />
                  <Text style={styles.includesTitle}>O que está incluso:</Text>
                </View>
                {combo.includes.map((item, index) => (
                  <Text key={index} style={styles.includesItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.footer}>
          <Gift size={24} color="#ff00ff" strokeWidth={2} />
          <Text style={styles.footerText}>
            Nossos combos são a melhor opção para quem quer aproveitar tudo que o
            Happy Jump tem a oferecer!
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
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoText: {
    color: '#aaa',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  comboContainer: {
    marginBottom: 24,
  },
  includesCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    marginTop: -8,
    borderWidth: 1,
    borderColor: '#222',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  includesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  includesTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  includesItem: {
    color: '#aaa',
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 20,
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
