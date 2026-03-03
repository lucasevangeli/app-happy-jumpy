import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { X, CreditCard, Banknote, Check, Plus, ShieldCheck } from 'lucide-react-native';
import { CreditCardForm } from './CreditCardForm';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SavedCard {
    id: string;
    brand: string;
    lastFourDigits: string;
    creditCardToken: string;
}

interface PaymentMethodSheetProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (method: 'PIX' | 'CREDIT_CARD', cardData?: any) => void;
    total: number;
    isSubmitting: boolean;
}

export const PaymentMethodSheet = ({
    visible,
    onClose,
    onConfirm,
    total,
    isSubmitting,
}: PaymentMethodSheetProps) => {
    const { user } = useAuth();
    const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [useAnotherCard, setUseAnotherCard] = useState(false);
    const [loadingCards, setLoadingCards] = useState(false);

    const [cardData, setCardData] = useState({
        holderName: '',
        number: '',
        expiryMonth: '',
        expiryYear: '',
        ccv: '',
    });

    useEffect(() => {
        if (visible && user && selectedMethod === 'CREDIT_CARD') {
            setLoadingCards(true);
            const cardsRef = collection(database, `users/${user.uid}/cards`);
            const unsubscribe = onSnapshot(cardsRef, (snapshot) => {
                if (!snapshot.empty) {
                    const cardsList = snapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id,
                    })) as SavedCard[];
                    setSavedCards(cardsList);
                    if (cardsList.length > 0 && !selectedCardId) {
                        setSelectedCardId(cardsList[0].id);
                    }
                } else {
                    setSavedCards([]);
                    setUseAnotherCard(true);
                }
                setLoadingCards(false);
            });
            return () => unsubscribe();
        }
    }, [visible, user, selectedMethod]);

    const handleConfirm = () => {
        if (selectedMethod === 'CREDIT_CARD') {
            if (useAnotherCard) {
                onConfirm('CREDIT_CARD', { creditCard: cardData });
            } else {
                const selectedCard = savedCards.find(c => c.id === selectedCardId);
                onConfirm('CREDIT_CARD', { creditCardToken: selectedCard?.creditCardToken });
            }
        } else {
            onConfirm('PIX');
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Pagamento</Text>
                            <Text style={styles.subtitle}>Escolha como deseja pagar</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Método</Text>
                            <View style={styles.methodsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.methodButton,
                                        selectedMethod === 'PIX' && styles.methodButtonActive,
                                    ]}
                                    onPress={() => setSelectedMethod('PIX')}>
                                    <View style={[
                                        styles.methodIcon,
                                        selectedMethod === 'PIX' && styles.methodIconActive
                                    ]}>
                                        <Banknote size={24} color={selectedMethod === 'PIX' ? '#000' : '#888'} />
                                    </View>
                                    <View style={styles.methodInfo}>
                                        <Text style={[
                                            styles.methodName,
                                            selectedMethod === 'PIX' && styles.methodNameActive
                                        ]}>PIX</Text>
                                        <Text style={styles.methodDesc}>Aprovação em segundos</Text>
                                    </View>
                                    {selectedMethod === 'PIX' && (
                                        <View style={styles.selectedBadge}>
                                            <Check size={16} color="#000" strokeWidth={3} />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.methodButton,
                                        selectedMethod === 'CREDIT_CARD' && styles.methodButtonActive,
                                    ]}
                                    onPress={() => setSelectedMethod('CREDIT_CARD')}>
                                    <View style={[
                                        styles.methodIcon,
                                        selectedMethod === 'CREDIT_CARD' && styles.methodIconActive
                                    ]}>
                                        <CreditCard size={24} color={selectedMethod === 'CREDIT_CARD' ? '#000' : '#888'} />
                                    </View>
                                    <View style={styles.methodInfo}>
                                        <Text style={[
                                            styles.methodName,
                                            selectedMethod === 'CREDIT_CARD' && styles.methodNameActive
                                        ]}>Cartão de Crédito</Text>
                                        <Text style={styles.methodDesc}>Pague com cartão salvo ou novo</Text>
                                    </View>
                                    {selectedMethod === 'CREDIT_CARD' && (
                                        <View style={styles.selectedBadge}>
                                            <Check size={16} color="#000" strokeWidth={3} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {selectedMethod === 'CREDIT_CARD' && (
                            <View style={styles.cardSection}>
                                {loadingCards ? (
                                    <ActivityIndicator color="#00ff88" style={{ marginVertical: 20 }} />
                                ) : (
                                    <>
                                        {savedCards.length > 0 && !useAnotherCard ? (
                                            <View style={styles.savedCardsContainer}>
                                                <Text style={styles.sectionTitle}>Seus Cartões</Text>
                                                {savedCards.map((card) => (
                                                    <TouchableOpacity
                                                        key={card.id}
                                                        style={[
                                                            styles.savedCardItem,
                                                            selectedCardId === card.id && styles.savedCardItemActive
                                                        ]}
                                                        onPress={() => setSelectedCardId(card.id)}
                                                    >
                                                        <CreditCard size={20} color={selectedCardId === card.id ? '#00ff88' : '#666'} />
                                                        <Text style={[
                                                            styles.savedCardText,
                                                            selectedCardId === card.id && styles.savedCardTextActive
                                                        ]}>
                                                            •••• {card.lastFourDigits} ({card.brand})
                                                        </Text>
                                                        {selectedCardId === card.id && (
                                                            <Check size={16} color="#00ff88" />
                                                        )}
                                                    </TouchableOpacity>
                                                ))}

                                                <TouchableOpacity
                                                    style={styles.useAnotherButton}
                                                    onPress={() => setUseAnotherCard(true)}
                                                >
                                                    <Plus size={16} color="#aaa" />
                                                    <Text style={styles.useAnotherText}>Usar outro cartão</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <View style={styles.newCardContainer}>
                                                <View style={styles.newCardHeader}>
                                                    <Text style={styles.sectionTitle}>Novo Cartão</Text>
                                                    {savedCards.length > 0 && (
                                                        <TouchableOpacity onPress={() => setUseAnotherCard(false)}>
                                                            <Text style={styles.backToSavedText}>Ver salvos</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                <CreditCardForm cardData={cardData} setCardData={setCardData} />
                                                <View style={styles.tokenInfo}>
                                                    <ShieldCheck size={14} color="#666" />
                                                    <Text style={styles.tokenInfoText}>Seu cartão será salvo para compras futuras.</Text>
                                                </View>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        )}

                        <View style={styles.summarySection}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryLabel}>Total</Text>
                                <Text style={styles.summaryValue}>R$ {total.toFixed(2)}</Text>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                isSubmitting && styles.confirmButtonDisabled
                            ]}
                            onPress={handleConfirm}
                            disabled={isSubmitting}>
                            <Text style={styles.confirmButtonText}>
                                {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: SCREEN_HEIGHT * 0.9,
        borderWidth: 1,
        borderColor: '#222',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },
    subtitle: {
        color: '#aaa',
        fontSize: 14,
        marginTop: 2,
    },
    closeButton: {
        backgroundColor: '#222',
        padding: 8,
        borderRadius: 20,
    },
    body: {
        paddingHorizontal: 24,
    },
    section: {
        paddingVertical: 24,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    methodsContainer: {
        gap: 12,
    },
    methodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    methodButtonActive: {
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.05)',
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#151515',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    methodIconActive: {
        backgroundColor: '#00ff88',
    },
    methodInfo: {
        flex: 1,
    },
    methodName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    methodNameActive: {
        color: '#00ff88',
    },
    methodDesc: {
        color: '#666',
        fontSize: 12,
        marginTop: 2,
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#00ff88',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardSection: {
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: '#222',
        marginTop: 8,
    },
    savedCardsContainer: {
        gap: 12,
    },
    savedCardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#222',
        gap: 12,
    },
    savedCardItemActive: {
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.05)',
    },
    savedCardText: {
        flex: 1,
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    savedCardTextActive: {
        color: '#fff',
    },
    useAnotherButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 8,
    },
    useAnotherText: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '700',
    },
    newCardContainer: {
        gap: 16,
    },
    newCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backToSavedText: {
        color: '#00ff88',
        fontSize: 14,
        fontWeight: '700',
    },
    tokenInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        justifyContent: 'center',
        marginTop: 8,
    },
    tokenInfoText: {
        color: '#666',
        fontSize: 11,
    },
    summarySection: {
        backgroundColor: '#0a0a0a',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#222',
        marginTop: 16,
    },
    summaryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryValue: {
        color: '#00ff88',
        fontSize: 24,
        fontWeight: '900',
    },
    footer: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    confirmButton: {
        backgroundColor: '#00ff88',
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        opacity: 0.5,
        backgroundColor: '#222',
    },
    confirmButtonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: '800',
    },
});
