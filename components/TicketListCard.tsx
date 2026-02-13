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
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.textSection}>
            <Text style={styles.name}>{name}</Text>
            <View style={styles.durationBadge}>
              <Clock size={12} color="#00ff88" strokeWidth={2.5} />
              <Text style={styles.duration}>{duration} minutos</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
            <Plus size={20} color="#000" strokeWidth={3} />
          </TouchableOpacity>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.price}>R$ {price.toFixed(2)}</Text>
      </View>
    </View>
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
    minHeight: 120,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    backgroundColor: '#222',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 4,
  },
  textSection: {
    flex: 1,
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  duration: {
    color: '#00ff88',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  description: {
    color: '#aaa',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
    lineHeight: 18,
  },
  addButton: {
    backgroundColor: '#00ff88',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  price: {
    color: '#00ff88',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
});
