import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, ProductVariant, Product, BundleType } from '../types';
import { validateDiscount } from '../services/api';

interface DiscountDetails {
  code: string;
  amount?: number; // Legacy support
  value?: number;  // Correct API field
  type: 'PERCENTAGE' | 'FIXED';
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => Promise<boolean>;
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

  const applyDiscount = async (code: string): Promise<boolean> => {
    try {
        const validDiscount = await validateDiscount(code);
        if (validDiscount) {
            setDiscount(validDiscount);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Discount invalid", e);
        return false;
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  const calculateTotal = () => {
    if (!discount) return cartSubtotal;
    
    // Safety check for value properties - Handle both value (API) and amount (Legacy)
    // Coerce to number to prevent NaN from undefined
    const rawVal = discount.value !== undefined ? discount.value : discount.amount;
    const val = Number(rawVal) || 0;
    
    if (discount.type === 'PERCENTAGE') {
      return cartSubtotal * ((100 - val) / 100);
    }
    // Fixed amount
    return Math.max(0, cartSubtotal - val);
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