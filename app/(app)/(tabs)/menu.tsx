import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';




import { useFocusEffect } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { UtensilsCrossed } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { MenuItemCard } from '@/components/MenuItemCard';
import { ProductOptionsSheet } from '@/components/ProductOptionsSheet';
import { database } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

type FirebaseObject<T> = { [key: string]: T };
type ProductCategory = { name: string };
type Product = {
  id: string;
  category_id: string;
  description: string;
  name?: string;
  title?: string;
  photo_url: string;
  price: number;
  categoryName: string;
  is_food_item: boolean; // Adicionado
  recipe?: any; // Adicionado
};


export default function MenuScreen() {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todos']);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const { addToCart, getItemCount } = useCart();


  useEffect(() => {
    loadFirebaseData();
  }, []);

  async function loadFirebaseData() {
    setLoading(true);
    try {
      const foodCatsRef = collection(database, 'foodCategories');
      const physCatsRef = collection(database, 'physicalCategories');
      const productsRef = collection(database, 'products');

      const [foodSnap, physSnap, productsSnap] = await Promise.all([
        getDocs(foodCatsRef),
        getDocs(physCatsRef),
        getDocs(productsRef),
      ]);

      const categoriesInfo: { [key: string]: { name: string; isFood: boolean } } = {};

      foodSnap.forEach(doc => {
        categoriesInfo[doc.id] = { name: doc.data().name, isFood: true };
      });
      physSnap.forEach(doc => {
        categoriesInfo[doc.id] = { name: doc.data().name, isFood: false };
      });

      const categoryNames = ['Todos', ...Object.values(categoriesInfo).map((c: any) => c.name)];
      setCategories(Array.from(new Set(categoryNames)));

      const allProducts: Product[] = productsSnap.docs.map(doc => {
        const data = doc.data();
        const catInfo = categoriesInfo[data.category_id];
        return {
          ...data,
          id: doc.id,
          categoryName: catInfo?.name || 'Outros',
          is_food_item: data.is_food_item ?? catInfo?.isFood ?? false,
        } as Product;
      });


      setMenuItems(allProducts);
    } catch (error) {


      console.error('Error loading Firebase data:', error);
    } finally {
      setLoading(false);
    }
  }


  const filteredItems =
    selectedCategory === 'Todos'
      ? menuItems
      : menuItems.filter((item) => item.categoryName === selectedCategory);


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
            <Text style={styles.headerTitle}>Cardápio</Text>
            <Text style={styles.headerSubtitle}>Delícias para sua diversão</Text>
          </View>

          {getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Simulação de Cards de Promoções */}
        <View style={styles.promotionsSection}>
          <Text style={styles.sectionTitle}>Promoções Imperdíveis</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promotionsContent}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.promotionCard}>
                <View style={styles.promotionBadge}>
                  <Text style={styles.promotionBadgeText}>PROMO</Text>
                </View>
                <View style={styles.promotionInfo}>
                  <Text style={styles.promotionTitle}>Combo Alegria #{i}</Text>
                  <Text style={styles.promotionDescription}>Aproveite descontos exclusivos!</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Menu de Categorias movido para fora do header */}
        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(category)}>
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === category &&
                    styles.categoryButtonTextActive,
                  ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.productsContainer}>
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <UtensilsCrossed size={48} color="#333" strokeWidth={2} />
              <Text style={styles.emptyStateText}>
                Nenhum item disponível nesta categoria
              </Text>
            </View>
          ) : (
            filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                name={item.title || item.name || ''}
                description={item.description}
                price={item.price}
                imageUrl={item.photo_url}
                category={item.categoryName}
                onAddToCart={() => {
                  const isFood = item.is_food_item || !!item.recipe || item.categoryName !== 'Outros';

                  if (isFood) {
                    setSelectedProduct(item);
                    setOptionsVisible(true);
                  } else {

                    addToCart({
                      id: item.id,
                      name: item.title || item.name || '',
                      price: item.price,
                      type: 'menu',
                      image_url: item.photo_url,
                    });
                  }
                }}
              />

            ))
          )}

          <View style={styles.footer}>
            <UtensilsCrossed size={24} color="#00ffff" strokeWidth={2} />
            <Text style={styles.footerText}>
              Todos os itens são preparados fresquinhos para você. Faça seu pedido e
              retire no balcão!
            </Text>
          </View>
        </View>
      </ScrollView>

      <ProductOptionsSheet
        visible={optionsVisible}
        product={selectedProduct}
        onClose={() => {
          setOptionsVisible(false);
          setSelectedProduct(null);
        }}
        onConfirm={(addons, notes) => {
          if (selectedProduct) {
            addToCart({
              id: selectedProduct.id,
              name: selectedProduct.title || selectedProduct.name || '',
              price: selectedProduct.price,
              type: 'menu',
              image_url: selectedProduct.photo_url,
              addons,
              notes,
            });
          }
        }}
      />
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
    paddingBottom: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
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
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#222',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  categoryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 0, // Ajustado para que o ScrollView horizontal possa encostar nas bordas
  },
  promotionsSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  promotionsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  promotionCard: {
    width: 280,
    height: 140,
    backgroundColor: '#111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
    position: 'relative',
  },
  promotionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#00ff88',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  promotionBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  promotionInfo: {
    gap: 4,
  },
  promotionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  promotionDescription: {
    color: '#aaa',
    fontSize: 12,
  },
  categoriesWrapper: {
    marginBottom: 20,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
    marginTop: 16,
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
