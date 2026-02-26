import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';


type MenuItemCardProps = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  onAddToCart: () => void;
};

export function MenuItemCard({
  name,
  description,
  price,
  imageUrl,
  category,
  onAddToCart,
}: MenuItemCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onAddToCart}
    >
      {/* Imagem compacta com Badge da Categoria */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{category}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description || 'Sem descrição disponível.'}
          </Text>
        </View>

        <Text style={styles.price}>R$ {price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
    height: 110,
    alignItems: 'center',
  },
  imageContainer: {
    width: 90,
    height: '100%',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 255, 136, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    padding: 12,
    height: '100%',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 2,
    lineHeight: 18,
  },
  description: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
  price: {
    color: '#00ff88',
    fontSize: 17,
    fontWeight: 'bold',
  },
});





