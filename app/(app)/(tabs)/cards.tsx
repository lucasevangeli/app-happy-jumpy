import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CreditCard, Plus, ShieldCheck, Info, X, Trash2, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { CreditCardForm } from '@/components/CreditCardForm';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SavedCard {
  id: string;
  brand: string;
  lastFourDigits: string;
  createdAt: string;
  creditCardToken: string;
}

export default function CardsScreen() {
  const { user } = useAuth();
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  useEffect(() => {
    if (!user) return;

    const cardsRef = collection(database, `users/${user.uid}/cards`);
    const unsubscribe = onSnapshot(cardsRef, (snapshot) => {
      if (!snapshot.empty) {
        const cardsList = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as SavedCard[];
        setCards(cardsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else {
        setCards([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddCard = async () => {
    if (!cardData.holderName || !cardData.number || !cardData.expiryMonth || !cardData.expiryYear || !cardData.ccv) {
      Alert.alert('Campos incompletos', 'Por favor, preencha todos os dados do cartão.');
      return;
    }

    setIsSubmitting(true);
    try {
      const idToken = await user?.getIdToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/cards/tokenize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ creditCard: cardData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar cartão.');
      }

      Alert.alert('Sucesso', 'Cartão adicionado com segurança!');
      setIsModalVisible(false);
      setCardData({
        holderName: '',
        number: '',
        expiryMonth: '',
        expiryYear: '',
        ccv: '',
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      'Remover Cartão',
      'Tem certeza que deseja remover este cartão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(database, `users/${user?.uid}/cards`, cardId));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o cartão.');
            }
          }
        }
      ]
    );
  };

  const getBrandIcon = (brand: string) => {
    // Aqui poderíamos ter ícones específicos por bandeira
    return <CreditCard size={24} color="#fff" />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Cartões</Text>
          <Text style={styles.headerSubtitle}>Gerencie seus métodos de pagamento</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.securityBadge}>
          <ShieldCheck size={20} color="#00ff88" />
          <Text style={styles.securityText}>Seus dados são criptografados e protegidos</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#00ff88" style={{ marginTop: 40 }} />
        ) : cards.length > 0 ? (
          <View style={styles.cardsList}>
            {cards.map((card) => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardBrandContainer}>
                  {getBrandIcon(card.brand)}
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{card.brand || 'Cartão de Crédito'}</Text>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.lastFourDigits}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteCard(card.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={20} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <CreditCard size={48} color="#333" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum cartão salvo</Text>
            <Text style={styles.emptyDescription}>
              Adicione um cartão de crédito para fazer seus pedidos com mais agilidade e segurança.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Plus size={24} color="#000" strokeWidth={3} />
          <Text style={styles.addButtonText}>Adicionar Novo Cartão</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Info size={20} color="#00ffff" />
          <Text style={styles.infoText}>
            Usamos tecnologia de tokenização para garantir que seus dados reais de cartão nunca sejam armazenados em nossos servidores.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Cartão</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <CreditCardForm cardData={cardData} setCardData={setCardData} />

              <View style={styles.modalSecurityInfo}>
                <ShieldCheck size={16} color="#aaa" />
                <Text style={styles.modalSecurityText}>Tokenização segura via Asaas</Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                onPress={handleAddCard}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <CheckCircle2 size={20} color="#000" />
                    <Text style={styles.saveButtonText}>Salvar Cartão</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
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
  headerSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.2)',
  },
  securityText: {
    color: '#00ff88',
    fontSize: 12,
    fontWeight: '600',
  },
  cardsList: {
    gap: 12,
    marginBottom: 24,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardBrandContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardNumber: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#050505',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#00ff88',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 40,
  },
  infoText: {
    flex: 1,
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#222',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    backgroundColor: '#222',
    padding: 8,
    borderRadius: 20,
  },
  modalBody: {
    padding: 24,
  },
  modalSecurityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  modalSecurityText: {
    color: '#666',
    fontSize: 12,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#00ff88',
    paddingVertical: 18,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
});
