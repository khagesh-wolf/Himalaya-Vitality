
import React from 'react';
import { Link } from 'react-router-dom';
import { X, Check, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from './UI';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export const CartDrawer = ({ onClose }: { onClose: () => void }) => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, cartSubtotal, cartCount } = useCart();
    const { formatPrice } = useCurrency();

    // Free Shipping Logic: Free if 3 or more items
    const FREE_SHIPPING_COUNT_TARGET = 3;
    const itemsNeeded = Math.max(0, FREE_SHIPPING_COUNT_TARGET - cartCount);
    const progress = Math.min(100, (cartCount / FREE_SHIPPING_COUNT_TARGET) * 100);
    const isFreeShipping = cartCount >= FREE_SHIPPING_COUNT_TARGET;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            {/* Drawer */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <h3 className="font-heading font-bold text-xl text-brand-dark flex items-center">
                        Your Bag <span className="bg-brand-red text-white text-xs px-2 py-0.5 rounded-full ml-2">{cartCount}</span>
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                    {/* Free Shipping Progress */}
                    {cartItems.length > 0 && (
                        <div className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center justify-between text-xs mb-3">
                                <span className="font-bold text-brand-dark">
                                    {isFreeShipping 
                                        ? <span className="text-green-600 flex items-center"><Check size={14} className="mr-1"/> Free Shipping Unlocked!</span> 
                                        : <span>Add <span className="text-brand-red">{itemsNeeded} more items</span> for Free Shipping</span>
                                    }
                                </span>
                                <span className="text-gray-400 font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 rounded-full ${isFreeShipping ? 'bg-green-500' : 'bg-brand-red'}`} 
                                    style={{ width: isFreeShipping ? '100%' : `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center pb-20">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <ShoppingBag size={32} />
                            </div>
                            <p className="text-gray-500 font-medium mb-6">Your bag is empty.</p>
                            <Link to="/shop" onClick={onClose}><Button>Start Shopping</Button></Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cartItems.map(item => (
                                <div key={item.variantId} className="flex gap-4 group">
                                     <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                         <img src={item.image} alt={item.productTitle} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="flex-1 min-w-0 flex flex-col justify-between">
                                         <div>
                                             <div className="flex justify-between items-start mb-1">
                                                 <h4 className="font-bold text-brand-dark leading-tight">{item.productTitle}</h4>
                                                 <button onClick={() => removeFromCart(item.variantId)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                                    <Trash2 size={16} />
                                                 </button>
                                             </div>
                                             <p className="text-xs text-gray-500 font-medium">{item.variantName}</p>
                                         </div>
                                         <div className="flex justify-between items-center">
                                             <span className="font-heading font-bold text-brand-dark">{formatPrice(item.price)}</span>
                                             <div className="flex items-center border border-gray-200 rounded-lg bg-white h-8">
                                                 <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500" disabled={item.quantity <= 1}><Minus size={12} /></button>
                                                 <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                                 <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-500"><Plus size={12} /></button>
                                             </div>
                                         </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                         <div className="space-y-3 mb-6">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-500">Subtotal</span>
                                 <span className="font-bold text-brand-dark">{formatPrice(cartTotal)}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-gray-500">Shipping</span>
                                 <span className="font-bold text-green-600">{isFreeShipping ? 'FREE' : 'Calculated at checkout'}</span>
                             </div>
                         </div>
                         <Link to="/cart" onClick={onClose}>
                             <Button fullWidth size="lg" className="group justify-between px-6">
                                 <span>Checkout</span>
                                 <span className="flex items-center bg-white/20 px-2 py-0.5 rounded text-sm group-hover:bg-white/30 transition-colors">
                                     {formatPrice(cartTotal)} <ArrowRight size={16} className="ml-2" />
                                 </span>
                             </Button>
                         </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
