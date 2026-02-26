import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, SelectedAddon } from '@/lib/supabase';

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, addons?: SelectedAddon[], notes?: string) => void;
  updateQuantity: (id: string, quantity: number, addons?: SelectedAddon[], notes?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) =>
        cartItem.id === item.id &&
        JSON.stringify(cartItem.addons) === JSON.stringify(item.addons) &&
        cartItem.notes === item.notes
      );
      if (existingItem) {
        return prevCart.map((cartItem) =>
          (cartItem.id === item.id &&
            JSON.stringify(cartItem.addons) === JSON.stringify(item.addons) &&
            cartItem.notes === item.notes)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string, addons?: SelectedAddon[], notes?: string) => {
    setCart((prevCart) => prevCart.filter((item) =>
      !(item.id === id &&
        JSON.stringify(item.addons) === JSON.stringify(addons) &&
        item.notes === notes)
    ));
  };

  const updateQuantity = (id: string, quantity: number, addons?: SelectedAddon[], notes?: string) => {
    if (quantity <= 0) {
      removeFromCart(id, addons, notes);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        (item.id === id &&
          JSON.stringify(item.addons) === JSON.stringify(addons) &&
          item.notes === notes)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const addonsTotal = item.addons?.reduce((sum, addon) => sum + addon.price, 0) || 0;
      return total + (item.price + addonsTotal) * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}>
      {children}
    </CartContext.Provider>
  );
}


export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
