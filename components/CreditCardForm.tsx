import React, { useRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { CreditCard } from 'lucide-react-native';

interface CreditCardFormProps {
    cardData: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
    setCardData: (data: any) => void;
}

export const CreditCardForm = ({ cardData, setCardData }: CreditCardFormProps) => {
    const numberRef = useRef<TextInput>(null);
    const dateRef = useRef<TextInput>(null);
    const ccvRef = useRef<TextInput>(null);

    const updateField = (field: string, value: string) => {
        setCardData((prev: any) => ({ ...prev, [field]: value }));
    };

    const onCardNumberChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 16);
        updateField('number', cleaned);
        if (cleaned.length === 16) {
            dateRef.current?.focus();
        }
    };

    const onExpiryDateChange = (text: string) => {
        const cleaned = text.replace(/\D/g, '').slice(0, 8); // MM + YYYY (up to 6 digits total usually)
        const month = cleaned.slice(0, 2);
        const year = cleaned.slice(2, 6);

        setCardData((prev: any) => ({
            ...prev,
            expiryMonth: month,
            expiryYear: year
        }));

        if (cleaned.length === 6) {
            ccvRef.current?.focus();
        }
    };

    const getFormattedNumber = () => {
        return cardData.number.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const getFormattedDate = () => {
        if (!cardData.expiryMonth) return '';
        return cardData.expiryMonth + (cardData.expiryYear ? '/' + cardData.expiryYear : '');
    };

    return (
        <View style={styles.container}>
            <View style={styles.cardPreview}>
                <View style={styles.cardPreviewHeader}>
                    <CreditCard size={32} color="#00ff88" />
                    <Text style={styles.cardPreviewBrand}>PAYMENT CARD</Text>
                </View>

                <Text style={styles.cardPreviewNumber}>
                    {getFormattedNumber() || '•••• •••• •••• ••••'}
                </Text>

                <View style={styles.cardPreviewFooter}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.cardPreviewLabel}>TITULAR</Text>
                        <Text style={styles.cardPreviewText} numberOfLines={1}>
                            {cardData.holderName || 'SEU NOME AQUI'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.cardPreviewLabel}>VALIDADE</Text>
                        <Text style={styles.cardPreviewText}>
                            {getFormattedDate() || 'MM/AAAA'}
                        </Text>
                    </View>
                </View>
            </View>

            <Text style={styles.title}>Dados do Cartão</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome no Cartão</Text>
                <TextInput
                    style={styles.input}
                    placeholder="NOME COMPLETO"
                    placeholderTextColor="#555"
                    value={cardData.holderName}
                    onChangeText={(v) => updateField('holderName', v.toUpperCase())}
                    autoCapitalize="characters"
                    returnKeyType="next"
                    onSubmitEditing={() => numberRef.current?.focus()}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Número do Cartão</Text>
                <TextInput
                    ref={numberRef}
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#555"
                    value={getFormattedNumber()}
                    onChangeText={onCardNumberChange}
                    keyboardType="numeric"
                    maxLength={19}
                    returnKeyType="next"
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Validade (MM/AAAA)</Text>
                    <TextInput
                        ref={dateRef}
                        style={styles.input}
                        placeholder="MM/AAAA"
                        placeholderTextColor="#555"
                        value={getFormattedDate()}
                        onChangeText={onExpiryDateChange}
                        keyboardType="numeric"
                        maxLength={7}
                        returnKeyType="next"
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                        ref={ccvRef}
                        style={styles.input}
                        placeholder="000"
                        placeholderTextColor="#555"
                        value={cardData.ccv}
                        onChangeText={(v) => updateField('ccv', v.replace(/\D/g, '').slice(0, 4))}
                        keyboardType="numeric"
                        maxLength={4}
                        returnKeyType="done"
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    cardPreview: {
        backgroundColor: '#00ff88',
        borderRadius: 24,
        padding: 24,
        height: 200,
        justifyContent: 'space-between',
        marginBottom: 30,
        shadowColor: '#00ff88',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    cardPreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardPreviewBrand: {
        color: '#000',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
    },
    cardPreviewNumber: {
        color: '#000',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 3,
        textAlign: 'center',
        marginVertical: 20,
    },
    cardPreviewFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardPreviewLabel: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardPreviewText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '800',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        color: '#888',
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    input: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 16,
        padding: 18,
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
});
