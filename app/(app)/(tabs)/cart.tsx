import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { ShoppingCart, Trash2, Plus, Minus, Check } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCheckout() {
    if (cart.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho primeiro');
      return;
    }

    if (!userName.trim() || !userPhone.trim()) {
      Alert.alert(
        'Dados incompletos',
        'Por favor, preencha seu nome e telefone'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const orderTypes = [...new Set(cart.map((item) => item.type))];
      const orderType =
        orderTypes.length > 1 ? 'mixed' : orderTypes[0] || 'ticket';

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_name: userName,
          user_phone: userPhone,
          total_amount: getTotal(),
          order_type: orderType,
          status: 'pending',
        })
        .select()
        .maybeSingle();

      if (orderError || !order) {
        throw new Error('Erro ao criar pedido');
      }

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        item_type: item.type,
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error('Erro ao salvar itens do pedido');
      }

      Alert.alert(
        'Pedido realizado!',
        'Seu pedido foi recebido com sucesso. Aguarde a confirmação!',
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setUserName('');
              setUserPhone('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível realizar o pedido. Tente novamente.');
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Carrinho</Text>
        </View>
        <View style={styles.emptyContainer}>
          <ShoppingCart size={64} color="#333" strokeWidth={2} />
          <Text style={styles.emptyTitle}>Carrinho vazio</Text>
          <Text style={styles.emptyText}>
            Adicione ingressos, combos ou itens do cardápio para continuar
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrinho</Text>
        <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
          <Trash2 size={20} color="#ff0066" strokeWidth={2.5} />
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsList}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>
                  R$ {item.price.toFixed(2)} x {item.quantity}
                </Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} color="#fff" strokeWidth={3} />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} color="#fff" strokeWidth={3} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.itemTotal}>
                  R$ {(item.price * item.quantity).toFixed(2)}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.id)}
                  style={styles.removeButton}>
                  <Trash2 size={18} color="#ff0066" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Informações de Contato</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome"
              placeholderTextColor="#666"
              value={userName}
              onChangeText={setUserName}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#666"
              value={userPhone}
              onChangeText={setUserPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>R$ {getTotal().toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>R$ {getTotal().toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, isSubmitting && styles.checkoutButtonDisabled]}
          onPress={handleCheckout}
          disabled={isSubmitting}>
          <Check size={24} color="#000" strokeWidth={3} />
          <Text style={styles.checkoutButtonText}>
            {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clearButtonText: {
    color: '#ff0066',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemsList: {
    padding: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  itemPrice: {
    color: '#aaa',
    fontSize: 13,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    backgroundColor: '#222',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: '700',
  },
  removeButton: {
    padding: 8,
  },
  formSection: {
    padding: 20,
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  formTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  summarySection: {
    padding: 20,
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#aaa',
    fontSize: 16,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginVertical: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  totalValue: {
    color: '#00ff88',
    fontSize: 24,
    fontWeight: '700',
  },
  footer: {
    padding: 20,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#00ff88',
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.5,
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
});
