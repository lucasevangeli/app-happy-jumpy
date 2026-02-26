import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
    const updateField = (field: string, value: string) => {
        setCardData({ ...cardData, [field]: value });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dados do Cartão</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome no Cartão</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Como escrito no cartão"
                    placeholderTextColor="#666"
                    value={cardData.holderName}
                    onChangeText={(v) => updateField('holderName', v)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Número do Cartão</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor="#666"
                    value={cardData.number}
                    onChangeText={(v) => updateField('number', v.replace(/\D/g, ''))}
                    keyboardType="numeric"
                    maxLength={16}
                />
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Mês (MM)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="MM"
                        placeholderTextColor="#666"
                        value={cardData.expiryMonth}
                        onChangeText={(v) => updateField('expiryMonth', v.replace(/\D/g, ''))}
                        keyboardType="numeric"
                        maxLength={2}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>Ano (AAAA)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="AAAA"
                        placeholderTextColor="#666"
                        value={cardData.expiryYear}
                        onChangeText={(v) => updateField('expiryYear', v.replace(/\D/g, ''))}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="000"
                        placeholderTextColor="#666"
                        value={cardData.ccv}
                        onChangeText={(v) => updateField('ccv', v.replace(/\D/g, ''))}
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 8,
        fontFamily: 'Poppins-Medium',
    },
    input: {
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
    },
});
