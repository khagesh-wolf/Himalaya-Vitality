
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, Loader2, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Container } from '../components/UI';
import { MAIN_PRODUCT } from '../constants';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';
import { useLoading } from '../context/LoadingContext';
import { getDeliverableCountries, simulateShipping } from '../utils';
import { createPaymentIntent, createOrder } from '../services/api';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Form & Validation
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- CONFIGURATION ---
// In production, use your real publishable key from environment variables
const STRIPE_PUBLIC_KEY = 'pk_test_51MockKeyForDemoPurposesOnly12345'; 
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// --- ZOD SCHEMAS ---
const addressSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  zip: z.string().min(3, 'ZIP code is required'),
  phone: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof addressSchema>;

// --- COMPONENT: CHECKOUT FORM (Steps 1 & 2) ---
const CheckoutForm = ({ 
    items, 
    total, 
    clientSecret,
    onSuccess 
}: { 
    items: CartItem[], 
    total: number, 
    clientSecret: string,
    onSuccess: (orderId: string) => void
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { setIsLoading } = useLoading();
    const [message, setMessage] = useState<string | null>(null);
    const [step, setStep] = useState<1 | 2>(1);
    
    // React Hook Form
    const methods = useForm<CheckoutFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: { country: 'US' }
    });

    const { register, handleSubmit, formState: { errors }, watch } = methods;
    const selectedCountry = watch('country');

    const onSubmitStep1 = (data: CheckoutFormData) => {
        // Just validate and move to next step
        setStep(2);
    };

    const handleBack = () => setStep(1);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true, 'Processing Payment...');
        setMessage(null);

        // 1. Confirm Payment with Stripe
        // Note: In a real redirect flow, return_url handles the completion.
        // For this demo with 'mock' secret, we simulate success if key is test.
        
        let paymentResult;
        
        try {
             // Simulate real API call to stripe (will fail with mock key in real network, so we catch)
            if(STRIPE_PUBLIC_KEY.includes('Mock')) {
                // MOCK SUCCESS FOR DEMO
                await new Promise(r => setTimeout(r, 2000));
                paymentResult = { paymentIntent: { status: 'succeeded', id: 'pi_mock_123' } };
            } else {
                // REAL STRIPE CALL
                paymentResult = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/order-confirmation`,
                    },
                    redirect: 'if_required' 
                });
            }
        } catch(err) {
             setMessage("Payment failed. Please try again.");
             setIsLoading(false);
             return;
        }

        if (paymentResult.error) {
            setMessage(paymentResult.error.message || "An unexpected error occurred.");
            setIsLoading(false);
        } else if (paymentResult.paymentIntent && paymentResult.paymentIntent.status === 'succeeded') {
            // 2. Create Order in Backend
            const formData = methods.getValues();
            try {
                const order = await createOrder({
                    customer: formData,
                    items,
                    total,
                    paymentId: paymentResult.paymentIntent.id
                });
                onSuccess(order.orderId);
            } catch (err) {
                setMessage("Payment succeeded but order creation failed. Contact support.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center space-x-4 text-sm font-bold mb-8">
                <div className={`flex items-center ${step >= 1 ? 'text-brand-dark' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step >= 1 ? 'bg-brand-dark text-white' : 'bg-gray-200'}`}>1</div>
                    Shipping
                </div>
                <div className="h-px w-8 bg-gray-200"></div>
                <div className={`flex items-center ${step >= 2 ? 'text-brand-dark' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${step >= 2 ? 'bg-brand-dark text-white' : 'bg-gray-200'}`}>2</div>
                    Payment
                </div>
            </div>

            {/* Error Message */}
            {message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-2 text-sm">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            {/* Step 1: Shipping Details */}
            <div className={step === 1 ? 'block' : 'hidden'}>
                <form onSubmit={handleSubmit(onSubmitStep1)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                            <input {...register('email')} type="email" placeholder="you@example.com" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Phone (Optional)</label>
                            <input {...register('phone')} type="tel" className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-red" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                            <input {...register('firstName')} type="text" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                            <input {...register('lastName')} type="text" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                        <input {...register('address')} type="text" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                            <select {...register('country')} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-red">
                                {getDeliverableCountries().map(c => <option key={c.id} value={c.code}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                            <input {...register('city')} type="text" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">ZIP</label>
                            <input {...register('zip')} type="text" className={`w-full p-3.5 bg-gray-50 border rounded-lg outline-none ${errors.zip ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                        </div>
                    </div>

                    <Button type="submit" fullWidth size="lg" className="mt-4">Continue to Payment</Button>
                </form>
            </div>

            {/* Step 2: Payment */}
            <div className={step === 2 ? 'block' : 'hidden'}>
                <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-200">
                    <div className="text-sm">
                        <span className="text-gray-500 block text-xs uppercase font-bold">Ship To</span>
                        <span className="font-bold text-brand-dark">{methods.getValues('address')}, {methods.getValues('city')}</span>
                    </div>
                    <button onClick={handleBack} className="text-brand-red text-xs font-bold hover:underline">Edit</button>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                        <PaymentElement />
                    </div>
                    
                    <Button type="submit" fullWidth size="lg" className="h-14 shadow-xl shadow-brand-red/20" disabled={!stripe || !elements}>
                        Pay Securely
                    </Button>
                    
                    <div className="flex justify-center items-center space-x-2 text-gray-400 text-xs font-medium">
                        <ShieldCheck size={14} />
                        <span>256-bit SSL Encrypted Payment</span>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export const CheckoutPage = () => {
    const { formatPrice } = useCurrency();
    const { cartItems, cartTotal } = useCart();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Direct Buy Logic
    const variantId = searchParams.get('variantId');
    const directVariant = variantId ? MAIN_PRODUCT.variants.find(v => v.id === variantId) : null;
    
    // Derived Items & Totals
    const checkoutItems: CartItem[] = directVariant ? [{
        variantId: directVariant.id,
        productTitle: MAIN_PRODUCT.title,
        variantName: directVariant.name,
        price: directVariant.price,
        quantity: 1,
        image: MAIN_PRODUCT.images[0],
        bundleType: directVariant.type
    }] : cartItems;

    const baseSubtotal = directVariant ? directVariant.price : cartTotal;
    const itemCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);

    // Shipping & Tax State
    // In a real app, this should be recalculated on the server or via API when address changes
    // Here we use the local simulation for the initial load
    const [shippingData, setShippingData] = useState({ cost: 0, tax: 0 });
    const [clientSecret, setClientSecret] = useState<string>('');
    const [isInitializing, setIsInitializing] = useState(true);

    // 1. Redirect if empty
    useEffect(() => {
        if (!directVariant && cartItems.length === 0) navigate('/');
    }, [cartItems, directVariant, navigate]);

    // 2. Initial Setup: Calculate Cost & Create Intent
    useEffect(() => {
        const initCheckout = async () => {
            setIsInitializing(true);
            
            // A. Calculate estimated costs (Default US)
            const shipping = await simulateShipping('US', baseSubtotal, itemCount);
            setShippingData({ cost: shipping.cost, tax: shipping.tax });
            
            // B. Create Payment Intent
            try {
                const { clientSecret } = await createPaymentIntent(checkoutItems, 'USD');
                setClientSecret(clientSecret);
            } catch (error) {
                console.error("Failed to init payment", error);
            } finally {
                setIsInitializing(false);
            }
        };
        
        if (checkoutItems.length > 0) {
            initCheckout();
        }
    }, [baseSubtotal, itemCount]);

    const finalTotal = baseSubtotal + shippingData.cost + shippingData.tax;

    // Success Handler
    const handleSuccess = (orderId: string) => {
        alert(`Order ${orderId} placed successfully! Check console for mock details.`);
        navigate('/');
    };

    if (isInitializing) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-red"/></div>;
    }

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#D0202F',
            colorBackground: '#ffffff',
            colorText: '#111111',
            borderRadius: '12px',
        },
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-5 sticky top-0 z-50">
                <Container>
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-red text-white flex items-center justify-center font-heading font-extrabold text-sm rounded-lg">HV</div>
                            <span className="font-heading font-bold text-lg text-brand-dark uppercase">Himalaya</span>
                        </Link>
                        <div className="flex items-center text-xs font-bold text-gray-500">
                            <Lock size={14} className="mr-1 text-green-600" /> SECURE CHECKOUT
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="pt-10">
                <div className="mb-6">
                    <Link to="/cart" className="text-sm text-gray-500 flex items-center hover:text-brand-dark w-fit">
                        <ArrowLeft size={14} className="mr-1" /> Return to Cart
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    {/* LEFT: Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            {clientSecret && (
                                <Elements options={{ clientSecret, appearance: appearance as any }} stripe={stripePromise}>
                                    <CheckoutForm 
                                        items={checkoutItems} 
                                        total={finalTotal} 
                                        clientSecret={clientSecret}
                                        onSuccess={handleSuccess}
                                    />
                                </Elements>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-28">
                            <Card className="p-6 bg-white border-gray-200 shadow-xl shadow-gray-200/50">
                                <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg">Order Summary</h3>
                                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 max-h-80 overflow-y-auto">
                                    {checkoutItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative shrink-0">
                                                <img src={item.image} alt={item.productTitle} className="w-full h-full object-cover" />
                                                <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold">{item.quantity}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xs text-brand-dark leading-tight mb-1">{item.productTitle}</h4>
                                                <p className="text-[10px] text-gray-500 font-medium mb-1">{item.variantName}</p>
                                                <div className="font-heading font-bold text-sm text-brand-red">{formatPrice(item.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 mb-6 text-sm text-gray-600 font-medium">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-brand-dark">{formatPrice(baseSubtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Shipping</span>
                                        <span className={`font-bold ${shippingData.cost === 0 ? 'text-green-600' : 'text-brand-dark'}`}>
                                            {shippingData.cost === 0 ? 'FREE' : formatPrice(shippingData.cost)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Tax / VAT</span>
                                        <span className="text-brand-dark">{formatPrice(shippingData.tax)}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-6 font-heading font-extrabold text-xl text-brand-dark">
                                    <span>Total</span>
                                    <span>{formatPrice(finalTotal)}</span>
                                </div>
                                <div className="mt-6 bg-gray-50 p-3 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                    <CheckCircle size={14} className="text-green-500 mr-2" />
                                    <span>30-Day Money Back Guarantee</span>
                                </div>
                            </Card>
                        </div>
                    </div>

                </div>
            </Container>
        </div>
    );
};
