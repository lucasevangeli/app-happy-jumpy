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
import { ref, get } from 'firebase/database';

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
      const foodCatsRef = ref(database, 'foodCategories');
      const physCatsRef = ref(database, 'physicalCategories');
      const productsRef = ref(database, 'products');

      const [foodSnap, physSnap, productsSnap] = await Promise.all([
        get(foodCatsRef),
        get(physCatsRef),
        get(productsRef),
      ]);

      const foodCats = foodSnap.exists() ? foodSnap.val() : {};
      const physCats = physSnap.exists() ? physSnap.val() : {};
      const rawProducts = productsSnap.exists() ? productsSnap.val() : {};

      // Mapeia todas as categorias: { categoryId: { name, isFood } }
      const categoriesInfo: { [key: string]: { name: string; isFood: boolean } } = {};

      Object.entries(foodCats).forEach(([id, data]: [string, any]) => {
        categoriesInfo[id] = { name: data.name, isFood: true };
      });
      Object.entries(physCats).forEach(([id, data]: [string, any]) => {
        categoriesInfo[id] = { name: data.name, isFood: false };
      });

      // Lista de nomes para o filtro (todas as categorias que têm nome)
      const categoryNames = ['Todos', ...Object.values(categoriesInfo).map((c: any) => c.name)];
      setCategories(Array.from(new Set(categoryNames))); // Remover duplicatas se houver


      // Mapeia produtos
      const allProducts: Product[] = Object.entries(rawProducts || {}).map(
        ([id, data]: [string, any]) => {
          const catInfo = categoriesInfo[data.category_id];
          return {
            ...data,
            id,
            categoryName: catInfo?.name || 'Outros',
            // Forçamos is_food_item baseado na categoria se o campo estiver ausente
            is_food_item: data.is_food_item ?? catInfo?.isFood ?? false,
          };
        }
      );


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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
    padding: 20,
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
