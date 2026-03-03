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
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { PaymentModal } from '@/components/PaymentModal';
import { PaymentMethodSheet } from '@/components/PaymentMethodSheet';

export default function CartScreen() {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } =
    useCart();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentSheetVisible, setPaymentSheetVisible] = useState(false);

  async function handleCheckout(method: 'PIX' | 'CREDIT_CARD', data?: any) {
    if (cart.length === 0) {
      Alert.alert('Carrinho vazio', 'Adicione itens ao carrinho primeiro');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        Alert.alert('Erro', 'Você precisa estar logado para realizar um pedido.');
        return;
      }

      const idToken = await user.getIdToken();

      // Preparamos o carrinho no formato que a API do site espera
      const apiCart = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        addons: item.addons,
        notes: item.notes,
      }));


      // Validação rápida de cartão se selecionado
      if (method === 'CREDIT_CARD') {
        if (!data?.creditCardToken && (!data?.creditCard?.number || !data?.creditCard?.ccv)) {
          Alert.alert('Dados incompletos', 'Por favor, selecione um cartão ou preencha os dados.');
          setIsSubmitting(false);
          return;
        }
      }

      setLoadingPayment(true);
      if (method === 'PIX') {
        setPaymentModalVisible(true);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          paymentMethod: method,
          totalValue: getTotal(),
          cart: apiCart,
          ...(method === 'CREDIT_CARD' ? data : {})
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao processar pagamento.');
      }

      if (method === 'PIX') {
        setPixData(responseData);
      } else {
        // Caso de cartão de crédito, o backend do site retorna o status da transação
        Alert.alert('Sucesso', 'Pagamento com cartão processado com sucesso!');
        setPaymentModalVisible(false);
        setPaymentSheetVisible(false);
        clearCart();
      }

      clearCart();

    } catch (error: any) {
      setPaymentModalVisible(false);
      Alert.alert('Erro no Checkout', error.message);
      console.error('Checkout error:', error);
    } finally {
      setIsSubmitting(false);
      setLoadingPayment(false);
    }
  }

  return (
    <View style={styles.container}>
      {cart.length === 0 && !paymentModalVisible ? (
        <>
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
        </>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Carrinho</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={clearCart} style={styles.clearButton}>
                <Trash2 size={20} color="#ff0066" strokeWidth={2.5} />
                <Text style={styles.clearButtonText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.itemsList}>
              {cart.map((item) => (
                <View
                  key={`${item.id}-${JSON.stringify(item.addons)}-${item.notes}`}
                  style={styles.cartItem}>
                  <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      R$ {item.price.toFixed(2)}
                    </Text>

                    {item.addons && item.addons.length > 0 && (
                      <View style={styles.addonsList}>
                        {item.addons.map((addon, idx) => (
                          <Text key={idx} style={styles.addonText}>
                            + {addon.ingredient_name} (R$ {addon.price.toFixed(2)})
                          </Text>
                        ))}
                      </View>
                    )}

                    {item.notes ? (
                      <Text style={styles.notesText}>Obs: "{item.notes}"</Text>
                    ) : null}

                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1, item.addons, item.notes)}>
                        <Minus size={16} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1, item.addons, item.notes)}>
                        <Plus size={16} color="#fff" strokeWidth={3} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemTotal}>
                      R$ {((item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id, item.addons, item.notes)}
                      style={styles.removeButton}>
                      <Trash2 size={18} color="#ff0066" strokeWidth={2.5} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>


          </ScrollView >

          <View style={styles.footer}>
            <View style={styles.footerHeader}>
              <Text style={styles.footerTotalLabel}>Total do seu pedido</Text>
              <Text style={styles.footerTotalValue}>R$ {getTotal().toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, isSubmitting && styles.checkoutButtonDisabled]}
              onPress={() => setPaymentSheetVisible(true)}
              disabled={isSubmitting}>
              <Check size={24} color="#000" strokeWidth={3} />
              <Text style={styles.checkoutButtonText}>
                {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => {
          setPaymentModalVisible(false);
          setPaymentSheetVisible(false);
        }}
        pixData={pixData}
        loading={loadingPayment}
      />

      <PaymentMethodSheet
        visible={paymentSheetVisible}
        onClose={() => setPaymentSheetVisible(false)}
        total={getTotal()}
        isSubmitting={isSubmitting}
        onConfirm={handleCheckout}
      />
    </View >
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
  addonsList: {
    marginTop: 4,
  },
  addonText: {
    color: '#00ff88',
    fontSize: 12,
  },
  notesText: {
    color: '#aaa',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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
  footer: {
    padding: 20,
    backgroundColor: '#111',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  footerTotalValue: {
    color: '#00ff88',
    fontSize: 22,
    fontWeight: '900',
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
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  methodButtonActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  methodText: {
    color: '#666',
    fontWeight: '600',
  },
  methodTextActive: {
    color: '#00ff88',
  },
});
