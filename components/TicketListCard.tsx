import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, Clock } from 'lucide-react-native';

type TicketListCardProps = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  duration: number;
  onAddToCart: () => void;
};

export function TicketListCard({
  name,
  description,
  price,
  imageUrl,
  duration,
  onAddToCart,
}: TicketListCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={onAddToCart}
    >
      {/* Imagem com Badge de Duração */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.image}
        />
        <View style={styles.durationBadge}>
          <Clock size={10} color="#000" strokeWidth={3} />
          <Text style={styles.durationText}>{duration} min</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {description || 'Diversão garantida!'}
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
  durationBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 255, 136, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  durationText: {
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
    fontFamily: 'Poppins-Bold',
  },
  description: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Poppins-Regular',
  },
  price: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

