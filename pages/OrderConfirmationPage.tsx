
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { Container, Button, Card, Reveal } from '../components/UI';
import { SEO } from '../components/SEO';
import { useCart } from '../context/CartContext';

export const OrderConfirmationPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const { clearCart } = useCart();

    // Ensure cart is cleared when landing here
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center py-12 px-4">
            <SEO title="Order Confirmed" />
            <Container className="max-w-lg w-full">
                <Reveal>
                    <Card className="text-center p-8 md:p-12 border-t-8 border-green-500 shadow-2xl relative overflow-hidden">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                        
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner animate-in zoom-in duration-500">
                            <CheckCircle size={48} strokeWidth={3} />
                        </div>
                        
                        <h1 className="font-heading font-extrabold text-3xl text-brand-dark mb-2">Order Confirmed!</h1>
                        <p className="text-gray-500 mb-8">Thank you for your purchase. Your vitality journey begins now.</p>
                        
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order Reference</p>
                            <p className="font-mono text-xl font-bold text-brand-dark select-all">{orderId || 'Processing...'}</p>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                We've sent a confirmation email with your tracking details. 
                                Orders are typically processed within 24 hours.
                            </p>
                            
                            <div className="flex flex-col gap-3 pt-4">
                                <Link to="/track">
                                    <Button variant="outline-dark" fullWidth className="group">
                                        <Package size={18} className="mr-2" /> Track Order
                                    </Button>
                                </Link>
                                <Link to="/">
                                    <Button fullWidth className="shadow-lg shadow-brand-red/20 group">
                                        Continue Shopping <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </Reveal>
            </Container>
        </div>
    );
};
