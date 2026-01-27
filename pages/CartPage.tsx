
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Tag, X, Loader2 } from 'lucide-react';
import { Container, Button, Card, Reveal } from '../components/UI';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { trackBeginCheckout } from '../services/analytics'; // Analytics

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, cartTotal, applyDiscount, discount, removeDiscount } = useCart();
  const { formatPrice } = useCurrency();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyPromo = async () => {
    setPromoError('');
    setPromoSuccess('');
    if (!promoCode) return;
    
    setIsValidating(true);
    const success = await applyDiscount(promoCode);
    setIsValidating(false);

    if (success) {
      setPromoSuccess(`Code ${promoCode.toUpperCase()} applied!`);
      setPromoCode('');
    } else {
      setPromoError('Invalid or expired discount code.');
    }
  };

  const handleCheckout = () => {
    trackBeginCheckout(cartItems, cartTotal);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white py-20">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 animate-in zoom-in duration-500">
          <ShoppingBag size={40} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-brand-dark mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">It looks like you haven't added any vitality boosters yet.</p>
        <Link to="/product/himalaya-shilajit-resin" className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <Button>Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 min-h-screen">
      <Container>
        <Reveal>
            <h1 className="font-heading text-3xl font-extrabold text-brand-dark mb-8">Your Cart</h1>
        </Reveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
                {cartItems.map((item, index) => (
                <Reveal key={item.variantId} delay={index * 100}>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                        {/* Image */}
                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100 relative">
                        <img 
                            src={item.image} 
                            alt={item.productTitle} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/f3f4f6/111111?text=No+Image';
                            }}
                        />
                        </div>
                        
                        {/* Content Container */}
                        <div className="flex-1 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Title & Variant */}
                            <div className="text-center sm:text-left">
                                <h3 className="font-heading font-bold text-brand-dark text-lg leading-tight">{item.productTitle}</h3>
                                <p className="text-sm text-gray-500 font-medium hidden sm:block">{item.variantName}</p>
                                <div className="text-brand-red font-bold mt-1 sm:hidden">{formatPrice(item.price)}</div>
                            </div>
                            
                            {/* Price (Desktop) */}
                            <div className="hidden sm:block text-brand-dark font-bold text-lg w-24 text-center">{formatPrice(item.price)}</div>

                            {/* Quantity & Remove */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                                {/* Quantity */}
                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 h-10">
                                    <button 
                                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-dark transition-colors"
                                    disabled={item.quantity <= 1}
                                    >
                                    <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-sm text-brand-dark">{item.quantity}</span>
                                    <button 
                                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-brand-dark transition-colors"
                                    >
                                    <Plus size={14} />
                                    </button>
                                </div>

                                {/* Remove */}
                                <button 
                                    onClick={() => removeFromCart(item.variantId)}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    title="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </Reveal>
                ))}
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Reveal delay={200}>
                <Card className="p-6 border-none shadow-lg shadow-gray-200/50 sticky top-28">
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-6">Order Summary</h3>
                
                {/* Discount Section */}
                <div className="mb-6">
                    {!discount ? (
                    <div className="flex gap-2">
                        <div className="relative flex-grow">
                            <input 
                            type="text" 
                            placeholder="Discount code" 
                            className={`w-full p-3 pl-10 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-red ${promoError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                            />
                            <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <Button size="sm" onClick={handleApplyPromo} className="px-4" disabled={isValidating}>
                            {isValidating ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                        </Button>
                    </div>
                    ) : (
                    <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                        <div className="flex items-center text-green-700 font-bold text-sm">
                            <Tag size={14} className="mr-2" />
                            <span>Code: {discount.code}</span>
                        </div>
                        <button onClick={removeDiscount} className="text-gray-400 hover:text-red-500">
                            <X size={16} />
                        </button>
                    </div>
                    )}
                    {promoError && <p className="text-xs text-red-500 mt-2 font-medium">{promoError}</p>}
                    {promoSuccess && <p className="text-xs text-green-600 mt-2 font-bold">{promoSuccess}</p>}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm font-medium">
                    <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="text-brand-dark">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {discount && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({discount.type === 'PERCENTAGE' ? `${discount.amount}%` : `$${discount.amount}`} off)</span>
                        <span>-{formatPrice(cartSubtotal - cartTotal)}</span>
                    </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-brand-dark font-medium text-xs">Calculated at checkout</span>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <span className="font-heading font-bold text-xl text-brand-dark">Total</span>
                    <span className="font-heading font-bold text-xl text-brand-red">
                        {formatPrice(cartTotal)}
                    </span>
                </div>

                <Link to="/checkout" onClick={handleCheckout}>
                    <Button fullWidth size="lg" className="h-14 group">
                    Secure Checkout <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>

                <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
                    <ShieldCheck size={14} className="mr-1.5 text-green-600" />
                    <span className="font-medium">Guaranteed Safe & Secure Checkout</span>
                </div>
                </Card>
            </Reveal>
          </div>
        </div>
      </Container>
    </div>
  );
};
