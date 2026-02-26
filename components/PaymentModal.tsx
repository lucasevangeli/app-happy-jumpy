import React from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Share,
    Alert,
} from 'react-native';
import { X, Copy, CheckCircle2 } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    pixData: {
        qrCode: string;
        payload: string;
        expirationDate: string;
        internalPaymentId: string;
    } | null;
    loading: boolean;
}

export const PaymentModal = ({ visible, onClose, pixData, loading }: PaymentModalProps) => {
    const copyToClipboard = async () => {
        if (pixData?.payload) {
            await Clipboard.setStringAsync(pixData.payload);
            Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
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
                        <Text style={styles.title}>Pagamento via PIX</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.body}>
                        {loading ? (
                            <Text style={styles.statusText}>Gerando QR Code...</Text>
                        ) : pixData ? (
                            <>
                                <View style={styles.qrContainer}>
                                    <Image
                                        source={{ uri: `data:image/png;base64,${pixData.qrCode}` }}
                                        style={styles.qrCode}
                                    />
                                </View>

                                <Text style={styles.instruction}>
                                    Escaneie o QR Code acima ou copie o código abaixo para pagar no seu banco.
                                </Text>

                                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                                    <Copy size={20} color="#00ff88" />
                                    <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
                                </TouchableOpacity>

                                <View style={styles.infoBox}>
                                    <CheckCircle2 size={20} color="#00ff88" />
                                    <Text style={styles.infoText}>
                                        Seu ingresso será liberado automaticamente após a confirmação do pagamento.
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.doneButton}
                                    onPress={onClose}>
                                    <Text style={styles.doneButtonText}>Já paguei, fechar</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <Text style={styles.errorText}>Erro ao gerar pagamento.</Text>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
    },
    closeButton: {
        padding: 4,
    },
    body: {
        padding: 24,
        alignItems: 'center',
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 24,
    },
    qrCode: {
        width: 250,
        height: 250,
    },
    instruction: {
        color: '#aaa',
        textAlign: 'center',
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
        marginBottom: 24,
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00ff88',
        marginBottom: 24,
        width: '100%',
        justifyContent: 'center',
        gap: 12,
    },
    copyButtonText: {
        color: '#00ff88',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        gap: 12,
        marginBottom: 32,
    },
    infoText: {
        color: '#00ff88',
        fontSize: 13,
        flex: 1,
        fontFamily: 'Poppins-Medium',
    },
    doneButton: {
        backgroundColor: '#00ff88',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    doneButtonText: {
        color: '#000',
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        marginVertical: 40,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 16,
        marginVertical: 40,
    },
});
