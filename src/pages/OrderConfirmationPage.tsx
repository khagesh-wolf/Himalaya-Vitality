
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Container, Button, Card, Reveal } from '../components/UI';
import { SEO } from '../components/SEO';

export const OrderConfirmationPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;

    useEffect(() => {
        if (!orderId) {
            navigate('/');
        }
    }, [orderId, navigate]);

    if (!orderId) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-32 pb-20 px-4">
            <SEO title="Order Confirmed" />
            <Container className="max-w-xl">
                <Reveal>
                    <Card className="p-10 text-center shadow-2xl border-t-4 border-brand-red">
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                            <CheckCircle size={48} strokeWidth={2.5} />
                        </div>
                        
                        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-brand-dark mb-4">Order Confirmed!</h1>
                        <p className="text-gray-500 text-lg mb-8">
                            Thank you for choosing Himalaya Vitality. Your journey to peak performance starts now.
                        </p>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 inline-block w-full">
                            <span className="text-xs font-bold uppercase text-gray-400 tracking-widest block mb-2">Order Reference</span>
                            <span className="font-mono text-2xl font-bold text-brand-dark">{orderId}</span>
                        </div>

                        <p className="text-sm text-gray-400 mb-8">
                            A confirmation email has been sent to your inbox. We will notify you when your package ships.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/">
                                <Button variant="outline-dark" className="w-full sm:w-auto">
                                    <Home size={18} className="mr-2" /> Back Home
                                </Button>
                            </Link>
                            <Link to="/track">
                                <Button className="w-full sm:w-auto shadow-lg shadow-brand-red/20">
                                    Track Order <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </Reveal>
            </Container>
        </div>
    );
};
