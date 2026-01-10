
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ProductVariant, Product, BundleType } from '../types';

interface DiscountDetails {
  code: string;
  amount: number; // Percentage off (e.g., 10 for 10%)
  type: 'PERCENTAGE' | 'FIXED';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => boolean;
  removeDiscount: () => void;
  cartSubtotal: number;
  cartTotal: number;
  cartCount: number;
  discount: DiscountDetails | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<DiscountDetails | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('himalaya_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('himalaya_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
    const fallbackImage = 'https://placehold.co/400x400/f3f4f6/111111?text=No+Image';
    const productImage = (product.images && product.images.length > 0) ? product.images[0] : fallbackImage;

    setCartItems(prev => {
      const existing = prev.find(item => item.variantId === variant.id);
      if (existing) {
        return prev.map(item => 
          item.variantId === variant.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        variantId: variant.id,
        productTitle: product.title,
        variantName: variant.name,
        price: variant.price,
        quantity,
        image: productImage,
        bundleType: variant.type
      }];
    });
  };

  const removeFromCart = (variantId: string) => {
    setCartItems(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems(prev => prev.map(item => 
      item.variantId === variantId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscount(null);
  };

  const applyDiscount = (code: string): boolean => {
    // Mock Discount Logic - In production this would validate against backend
    const normalizedCode = code.toUpperCase().trim();
    if (normalizedCode === 'WELCOME10') {
      setDiscount({ code: 'WELCOME10', amount: 10, type: 'PERCENTAGE' });
      return true;
    }
    if (normalizedCode === 'SAVE20') {
      setDiscount({ code: 'SAVE20', amount: 20, type: 'PERCENTAGE' });
      return true;
    }
    return false;
  };

  const removeDiscount = () => {
    setDiscount(null);
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const calculateTotal = () => {
    if (!discount) return cartSubtotal;
    if (discount.type === 'PERCENTAGE') {
      return cartSubtotal * ((100 - discount.amount) / 100);
    }
    return Math.max(0, cartSubtotal - discount.amount);
  };

  const cartTotal = calculateTotal();
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      applyDiscount, 
      removeDiscount,
      cartSubtotal, 
      cartTotal, 
      cartCount,
      discount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
