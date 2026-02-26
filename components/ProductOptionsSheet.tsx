import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    Dimensions,
    Platform,
} from 'react-native';
import { X, Plus, Minus, UtensilsCrossed } from 'lucide-react-native';
import { SelectedAddon } from '@/lib/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RecipeIngredient {
    ingredient_id: string;
    ingredient_name: string;
    unit: string;
    quantity_needed: number;
    is_default: boolean;
    is_available_as_addon: boolean;
    additional_price: number;
}

interface ProductWithRecipe {
    id: string;
    name?: string;
    title?: string;
    price: number;
    photo_url: string;

    recipe?: {
        [key: string]: Omit<RecipeIngredient, 'ingredient_id'>;
    };
}

interface ProductOptionsSheetProps {
    visible: boolean;
    product: ProductWithRecipe | null;
    onClose: () => void;
    onConfirm: (addons: SelectedAddon[], notes: string) => void;
}

export const ProductOptionsSheet = ({
    visible,
    product,
    onClose,
    onConfirm,
}: ProductOptionsSheetProps) => {
    const [availableAddons, setAvailableAddons] = useState<RecipeIngredient[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<Map<string, number>>(new Map());
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (visible && product && product.recipe) {
            const allIngredientsFromRecipe = Object.keys(product.recipe).map((id) => ({
                ingredient_id: id,
                ...product.recipe![id],
            }));

            const addons = allIngredientsFromRecipe.filter((ing) => ing.is_available_as_addon);
            setAvailableAddons(addons);

            const defaultSelected = new Map<string, number>();
            allIngredientsFromRecipe.forEach((ing) => {
                if (ing.is_default) {
                    defaultSelected.set(ing.ingredient_id, ing.quantity_needed);
                }
            });
            setSelectedAddons(defaultSelected);
            setNotes('');
        }
    }, [visible, product]);

    const handleAddonChange = (ingredientId: string, quantityNeeded: number, delta: number) => {
        const newSelected = new Map(selectedAddons);
        const current = newSelected.get(ingredientId) || 0;
        const newValue = current + delta * quantityNeeded;

        const addonInfo = availableAddons.find((a) => a.ingredient_id === ingredientId);
        const minQuantity = addonInfo?.is_default ? addonInfo.quantity_needed : 0;

        if (newValue < minQuantity) return;

        if (newValue === 0) {
            newSelected.delete(ingredientId);
        } else {
            newSelected.set(ingredientId, newValue);
        }
        setSelectedAddons(newSelected);
    };

    const calculateAddonsTotal = () => {
        let total = 0;
        selectedAddons.forEach((totalQuantity, ingredientId) => {
            const addon = availableAddons.find((a) => a.ingredient_id === ingredientId);
            if (addon) {
                const defaultQuantity = addon.is_default ? addon.quantity_needed : 0;
                const extraQuantity = totalQuantity - defaultQuantity;

                if (extraQuantity > 0) {
                    const extraUnits = Math.ceil(extraQuantity / addon.quantity_needed);
                    total += extraUnits * addon.additional_price;
                }
            }
        });
        return total;
    };

    const handleConfirm = () => {
        const finalAddons: SelectedAddon[] = [];
        selectedAddons.forEach((totalQuantity, ingredientId) => {
            const addon = availableAddons.find((a) => a.ingredient_id === ingredientId);
            if (addon) {
                const defaultQuantity = addon.is_default ? addon.quantity_needed : 0;
                const extraQuantity = totalQuantity - defaultQuantity;

                if (extraQuantity > 0) {
                    const extraUnits = Math.ceil(extraQuantity / addon.quantity_needed);
                    for (let i = 0; i < extraUnits; i++) {
                        finalAddons.push({
                            ingredient_id: addon.ingredient_id,
                            ingredient_name: addon.ingredient_name,
                            quantity: addon.quantity_needed,
                            price: addon.additional_price,
                        });
                    }
                }
            }
        });

        onConfirm(finalAddons, notes);
        onClose();
    };

    if (!product) return null;

    const addonsTotal = calculateAddonsTotal();
    const totalPrice = product.price + addonsTotal;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>{product.title || product.name || ''}</Text>
                            <Text style={styles.subtitle}>Personalize seu pedido</Text>
                        </View>

                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {product.photo_url ? (
                            <Image source={{ uri: product.photo_url }} style={styles.productImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <UtensilsCrossed size={48} color="#333" />
                            </View>
                        )}

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Adicionais</Text>
                            {availableAddons.length === 0 ? (
                                <Text style={styles.emptyText}>Nenhum adicional disponível.</Text>
                            ) : (
                                availableAddons.map((addon) => {
                                    const currentQuantity = selectedAddons.get(addon.ingredient_id) || 0;
                                    const defaultQuantity = addon.is_default ? addon.quantity_needed : 0;
                                    const units =
                                        currentQuantity > 0 ? Math.ceil(currentQuantity / addon.quantity_needed) : 0;

                                    return (
                                        <View key={addon.ingredient_id} style={styles.addonItem}>
                                            <View style={styles.addonInfo}>
                                                <Text style={styles.addonName}>{addon.ingredient_name}</Text>
                                                <Text style={styles.addonSubtext}>
                                                    {addon.quantity_needed} {addon.unit} por porção
                                                    {addon.is_default && (
                                                        <Text style={styles.inclusuText}> (INCLUSO)</Text>
                                                    )}
                                                </Text>
                                                <Text style={[
                                                    styles.addonPrice,
                                                    addon.additional_price > 0 ? styles.priceExtra : styles.priceFree
                                                ]}>
                                                    {addon.additional_price === 0 && addon.is_default
                                                        ? ''
                                                        : addon.additional_price === 0
                                                            ? 'Adicional GRÁTIS'
                                                            : `+ R$ ${addon.additional_price.toFixed(2)} por porção extra`}
                                                </Text>
                                            </View>
                                            <View style={styles.quantityControls}>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleAddonChange(addon.ingredient_id, addon.quantity_needed, -1)
                                                    }
                                                    style={[
                                                        styles.controlButton,
                                                        (currentQuantity === 0 ||
                                                            (addon.is_default && currentQuantity === defaultQuantity)) &&
                                                        styles.controlButtonDisabled,
                                                    ]}
                                                    disabled={
                                                        currentQuantity === 0 ||
                                                        (addon.is_default && currentQuantity === defaultQuantity)
                                                    }>
                                                    <Minus size={20} color="#fff" />
                                                </TouchableOpacity>
                                                <View style={styles.unitsContainer}>
                                                    <Text style={styles.quantityText}>{units}x</Text>
                                                    {currentQuantity > 0 && (
                                                        <Text style={styles.gramsText}>
                                                            {currentQuantity % 1 === 0 ? currentQuantity : currentQuantity.toFixed(2)} {addon.unit}
                                                        </Text>
                                                    )}
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() =>
                                                        handleAddonChange(addon.ingredient_id, addon.quantity_needed, 1)
                                                    }
                                                    style={styles.controlButtonActive}>
                                                    <Plus size={20} color="#000" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );

                                })
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Observações</Text>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Ex: Sem cebola, trocar picles..."
                                placeholderTextColor="#666"
                                multiline
                                numberOfLines={3}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>Adicionar ao Carrinho</Text>
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
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#111',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: SCREEN_HEIGHT * 0.85,
        borderWidth: 1,
        borderColor: '#222',
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
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#aaa',
        fontSize: 14,
    },
    closeButton: {
        padding: 4,
    },
    body: {
        flex: 1,
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    placeholderImage: {
        width: '100%',
        height: 200,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    section: {
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    emptyText: {
        color: '#666',
        fontSize: 14,
        textAlign: 'center',
    },
    addonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a1a',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    addonInfo: {
        flex: 1,
    },
    addonName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
    addonSubtext: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 2,
    },
    inclusuText: {
        color: '#00ff88',
        fontWeight: 'bold',
        fontSize: 10,
    },
    addonPrice: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
    },
    priceExtra: {
        color: '#00ffff',
    },
    priceFree: {
        color: '#888',
    },

    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    controlButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonActive: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#00ff88',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlButtonDisabled: {
        opacity: 0.3,
    },
    unitsContainer: {
        alignItems: 'center',
        minWidth: 50,
    },
    quantityText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    gramsText: {
        color: '#666',
        fontSize: 10,
        marginTop: 2,
    },

    notesInput: {
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 16,
        borderRadius: 12,
        fontSize: 14,
        borderWidth: 1,
        borderColor: '#222',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 24,
        backgroundColor: '#111',
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        color: '#aaa',
        fontSize: 16,
    },
    totalPrice: {
        color: '#00ff88',
        fontSize: 24,
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: '#00ff88',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
