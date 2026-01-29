import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, Package, UserCircle, ShoppingCart, ChevronDown, ChevronUp, CreditCard, Tag, X } from 'lucide-react';
import { Button, Card, Container } from '../components/UI';
import { MAIN_PRODUCT } from '../constants';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartItem, RegionConfig } from '../types';
import { useLoading } from '../context/LoadingContext';
import { createPaymentIntent, createOrder, fetchShippingRegions, validateDiscount } from '../services/api';
import { trackPurchase } from '../services/analytics';
import { useQuery } from '@tanstack/react-query';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Form & Validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// --- CONFIGURATION ---
const STRIPE_PUBLIC_KEY = (import.meta as any).env?.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx'; 
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

// --- COMPONENT: MOBILE ORDER SUMMARY ---
const MobileOrderSummary = ({ 
    items, 
    subtotal, 
    shipping, 
    tax, 
    discount,
    total, 
    formatPrice,
    onApplyDiscount,
    discountCode,
    setDiscountCode,
    isApplyingDiscount,
    discountError,
    appliedDiscount,
    onRemoveDiscount
}: any) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Safely parse discount value
    const discountVal = appliedDiscount 
        ? (Number(appliedDiscount.value) || Number(appliedDiscount.amount) || 0) 
        : 0;

    return (
        <div className="lg:hidden border-b border-gray-200 bg-gray-50">
            <Container>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full py-4 flex items-center justify-between text-brand-dark"
                >
                    <div className="flex items-center text-sm font-bold text-brand-dark">
                        <ShoppingCart size={16} className="mr-2 text-gray-500" />
                        <span>{isOpen ? 'Hide' : 'Show'} Order Summary</span>
                        {isOpen ? <ChevronUp size={16} className="ml-2 text-gray-400" /> : <ChevronDown size={16} className="ml-2 text-gray-400" />}
                    </div>
                    <span className="font-heading font-extrabold text-lg text-brand-dark">{formatPrice(total)}</span>
                </button>

                {isOpen && (
                    <div className="pb-6 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                            {items.map((item: CartItem, idx: number) => (
                                <div key={idx} className="flex items-start space-x-4">
                                    <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 overflow-hidden relative shrink-0">
                                        <img src={item.image} alt={item.productTitle} className="w-full h-full object-cover" />
                                        <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">{item.quantity}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xs text-brand-dark leading-tight mb-1">{item.productTitle}</h4>
                                        <p className="text-[10px] text-gray-500 font-medium mb-1">{item.variantName}</p>
                                    </div>
                                    <div className="font-bold text-sm text-gray-600">{formatPrice(item.price)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Discount Input */}
                        <div className="mb-6">
                            {!appliedDiscount ? (
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <input 
                                            type="text" 
                                            placeholder="Discount code" 
                                            className={`w-full p-3 pl-10 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-red ${discountError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                                            value={discountCode}
                                            onChange={(e) => setDiscountCode(e.target.value)}
                                        />
                                        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                    <Button size="sm" onClick={onApplyDiscount} disabled={isApplyingDiscount} className="px-4 bg-gray-900 text-white">
                                        {isApplyingDiscount ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                                    <div className="flex items-center text-green-700 font-bold text-xs">
                                        <Tag size={14} className="mr-2" />
                                        <span>Code: {appliedDiscount.code} applied</span>
                                    </div>
                                    <button onClick={onRemoveDiscount} className="text-gray-400 hover:text-red-500">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {discountError && <p className="text-xs text-red-500 mt-2 font-medium">{discountError}</p>}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount {appliedDiscount?.type === 'PERCENTAGE' ? `(${discountVal}%)` : ''}</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{formatPrice(tax)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    );
};

// --- COMPONENT: PAYMENT STEP ---
const PaymentStep = ({ 
    items, 
    total, 
    customerData,
    onSuccess,
    onBack
}: { 
    items: CartItem[], 
    total: number, 
    customerData: CheckoutFormData,
    onSuccess: (orderId: string) => void,
    onBack: () => void
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const { setIsLoading } = useLoading();
    const { user } = useAuth();
    const [message, setMessage] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true, 'Processing Payment...');
        setMessage(null);

        // 1. Submit the form elements (Validation & Collection)
        const { error: submitError } = await elements.submit();
        if (submitError) {
            setMessage(submitError.message || "Please check your payment details.");
            setIsLoading(false);
            return;
        }

        try {
            // 2. Confirm the Payment
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/order-confirmation`, 
                    payment_method_data: {
                        billing_details: {
                            name: `${customerData.firstName} ${customerData.lastName}`,
                            email: customerData.email,
                            address: {
                                country: customerData.country,
                                postal_code: customerData.zip,
                                city: customerData.city,
                                line1: customerData.address,
                            }
                        }
                    }
                },
                redirect: 'if_required' 
            });

            if (error) {
                setMessage(error.message || "An unexpected error occurred.");
                setIsLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Payment succeeded, create order in DB
                const order = await createOrder({
                    customer: customerData,
                    items,
                    total,
                    paymentId: paymentIntent.id,
                    userId: user?.id 
                });
                
                // Track Purchase
                trackPurchase(order.orderId, total, items);

                onSuccess(order.orderId);
                setIsLoading(false);
            }
        } catch(err: any) {
             setMessage(err.message || "Payment failed. Please try again.");
             setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-gray-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-200">
                <div className="text-sm">
                    <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Shipping To</span>
                    <div className="font-bold text-brand-dark">{customerData.firstName} {customerData.lastName}</div>
                    <div className="text-gray-600">{customerData.address}, {customerData.city}, {customerData.country}</div>
                </div>
                <button onClick={onBack} className="text-brand-red text-xs font-bold hover:underline">Edit</button>
            </div>

            {message && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-2 text-sm border border-red-100 mb-6">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                    <PaymentElement onReady={() => setIsReady(true)} />
                </div>
                
                <Button type="submit" fullWidth size="lg" className="h-14 shadow-xl shadow-brand-red/20 text-lg" disabled={!stripe || !elements || !isReady}>
                    Pay Securely
                </Button>
                
                <div className="flex flex-col items-center gap-3 text-gray-400 text-xs font-medium">
                    <div className="flex gap-2 opacity-60 grayscale">
                        {/* Simple CSS representation of cards or SVGs would go here */}
                        <div className="h-6 w-9 bg-gray-200 rounded flex items-center justify-center font-bold text-[8px]">VISA</div>
                        <div className="h-6 w-9 bg-gray-200 rounded flex items-center justify-center font-bold text-[8px]">MC</div>
                        <div className="h-6 w-9 bg-gray-200 rounded flex items-center justify-center font-bold text-[8px]">AMEX</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} />
                        <span>256-bit SSL Encrypted Payment</span>
                    </div>
                </div>
            </form>
        </div>
    );
};

// --- COMPONENT: ADDRESS FORM ---
const AddressStep = ({ 
    initialData, 
    regions,
    onSubmit 
}: { 
    initialData: Partial<CheckoutFormData>, 
    regions: RegionConfig[],
    onSubmit: (data: CheckoutFormData) => void 
}) => {
    // Determine default country based on availability
    const defaultCountry = regions.length > 0 
        ? (regions.find(r => r.code === 'AU') ? 'AU' : regions[0].code) 
        : '';

    const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(addressSchema),
        defaultValues: { country: defaultCountry || 'US', ...initialData }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-in fade-in">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 mb-2 text-brand-dark font-bold text-sm uppercase tracking-wide">
                    <UserCircle size={18}/> Contact Info
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                        <input {...register('email')} autoComplete="email" type="email" className={`w-full p-3 bg-white border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} placeholder="email@example.com" />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                        <input {...register('phone')} autoComplete="tel" type="tel" className="w-full p-3 bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-red" placeholder="(555) 555-5555" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                    <input {...register('firstName')} autoComplete="given-name" type="text" className={`w-full p-3 bg-gray-50 border rounded-lg outline-none ${errors.firstName ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                    {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                    <input {...register('lastName')} autoComplete="family-name" type="text" className={`w-full p-3 bg-gray-50 border rounded-lg outline-none ${errors.lastName ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                    {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                <input {...register('address')} autoComplete="street-address" type="text" className={`w-full p-3 bg-gray-50 border rounded-lg outline-none ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Country</label>
                    <select {...register('country')} autoComplete="country" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-red">
                        {regions.length > 0 ? (
                            regions.map(c => <option key={c.id} value={c.code}>{c.name}</option>)
                        ) : (
                            <option value="">Loading...</option>
                        )}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                    <input {...register('city')} autoComplete="address-level2" type="text" className={`w-full p-3 bg-gray-50 border rounded-lg outline-none ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                    {errors.city && <p className="text-red-500 text-xs">{errors.city.message}</p>}
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">ZIP</label>
                    <input {...register('zip')} autoComplete="postal-code" type="text" className={`w-full p-3 bg-gray-50 border rounded-lg outline-none ${errors.zip ? 'border-red-500' : 'border-gray-200 focus:border-brand-red'}`} />
                    {errors.zip && <p className="text-red-500 text-xs">{errors.zip.message}</p>}
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <Button type="submit" fullWidth size="lg" className="shadow-xl shadow-brand-red/20 h-14 text-lg">
                    Continue to Payment
                </Button>
            </div>
        </form>
    );
};

// --- MAIN PAGE COMPONENT ---
export const CheckoutPage = () => {
    const { formatPrice } = useCurrency();
    const { cartItems, cartTotal, clearCart, discount: contextDiscount } = useCart();
    const { user, isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setIsLoading } = useLoading();
    
    // FETCH DYNAMIC SHIPPING REGIONS
    const { data: regions = [] } = useQuery({ 
        queryKey: ['shipping-regions'], 
        queryFn: fetchShippingRegions 
    });

    // Logic for Direct Buy vs Cart
    const variantId = searchParams.get('variantId');
    const directVariant = variantId ? MAIN_PRODUCT.variants.find(v => v.id === variantId) : null;
    
    const checkoutItems: CartItem[] = directVariant ? [{
        variantId: directVariant.id,
        productTitle: MAIN_PRODUCT.title,
        variantName: directVariant.name,
        price: directVariant.price,
        quantity: 1,
        image: MAIN_PRODUCT.images[0],
        bundleType: directVariant.type
    }] : cartItems;

    // Calculate Raw Items Subtotal (Before any discount)
    const itemsSubtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const itemCount = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);

    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [shippingData, setShippingData] = useState({ cost: 0, tax: 0 });
    const [clientSecret, setClientSecret] = useState<string>('');
    const [customerData, setCustomerData] = useState<CheckoutFormData | null>(null);

    // Discount Logic
    const [activeDiscount, setActiveDiscount] = useState<any>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    // Initialize discount from Context (Cart mode) 
    useEffect(() => {
        if (!directVariant && contextDiscount) {
            setActiveDiscount(contextDiscount);
        }
    }, [directVariant, contextDiscount]);

    // Apply Discount
    const handleApplyDiscount = async () => {
        if (!discountCode) return;
        setDiscountError('');
        setIsApplyingDiscount(true);
        try {
            const valid = await validateDiscount(discountCode);
            if (valid) {
                setActiveDiscount(valid);
                setDiscountCode('');
            } else {
                setDiscountError('Invalid or expired code.');
            }
        } catch (error) {
            setDiscountError('Unable to apply code.');
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setActiveDiscount(null);
    };

    // Calculate Dynamic Values
    // Safe casting to Number to prevent NaN
    const discountVal = activeDiscount 
        ? (Number(activeDiscount.value) || Number(activeDiscount.amount) || 0) 
        : 0;

    const discountAmount = activeDiscount 
        ? (activeDiscount.type === 'PERCENTAGE' 
            ? itemsSubtotal * (discountVal / 100) 
            : Math.min(discountVal, itemsSubtotal))
        : 0;

    const subtotalAfterDiscount = Math.max(0, itemsSubtotal - discountAmount);
    
    // Prepare User Data for Form
    const userData = user ? {
        email: user.email,
        firstName: user.firstName || user.name?.split(' ')[0],
        lastName: user.lastName || user.name?.split(' ')[1],
        address: user.address,
        city: user.city,
        country: user.country || 'AU', // Default to AU if available later
        zip: user.zip,
        phone: user.phone
    } : {};

    useEffect(() => {
        if (!directVariant && cartItems.length === 0) navigate('/');
    }, [cartItems, directVariant, navigate]);

    // Handle Address Submission (Step 1 -> 2)
    const handleAddressSubmit = async (data: CheckoutFormData) => {
        setCustomerData(data);
        setIsLoading(true, 'Calculating Shipping & Taxes...');
        
        try {
            // 1. Calculate Shipping using Fetched Data
            const region = regions.find((r: RegionConfig) => r.code === data.country) || regions.find((r: RegionConfig) => r.code === 'OTHER');
            
            // Fallback costs if region logic fails (though DB should handle this)
            let cost = region ? region.shippingCost : 29.95;
            let taxRate = region ? (Number(region.taxRate) || 0) : 0;
            
            // Logic: Free shipping if 2+ items or if logic dictates (e.g. Australia)
            if (itemCount >= 2 || (region && region.shippingCost === 0)) {
                cost = 0;
            }

            // Tax is usually calculated on discounted price
            const tax = subtotalAfterDiscount * (taxRate / 100);
            
            setShippingData({ cost, tax });
            
            // 2. Create/Update Payment Intent with FINAL Total
            const finalTotal = subtotalAfterDiscount + cost + tax;
            const { clientSecret, mockSecret } = await createPaymentIntent(checkoutItems, 'USD', finalTotal); 
            
            setClientSecret(clientSecret || mockSecret || '');
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Checkout init failed", error);
            alert("Could not initialize payment. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const finalTotal = subtotalAfterDiscount + shippingData.cost + shippingData.tax;

    const handleSuccess = (orderId: string) => {
        clearCart();
        alert(`Order ${orderId} placed successfully! Check your email.`);
        navigate('/profile');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 py-5 sticky top-0 z-50 shadow-sm">
                <Container>
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img 
                                src="https://i.ibb.co/tMXQXvJn/logo-red.png" 
                                alt="Himalaya Vitality" 
                                className="h-10 w-auto object-contain" 
                            />
                        </Link>
                        <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                            <Lock size={12} className="mr-1.5 text-green-600" /> SECURE CHECKOUT
                        </div>
                    </div>
                </Container>
            </div>

            {/* Mobile Order Summary Toggle */}
            <MobileOrderSummary 
                items={checkoutItems}
                subtotal={itemsSubtotal}
                shipping={shippingData.cost}
                tax={shippingData.tax}
                discount={discountAmount}
                total={step === 1 ? subtotalAfterDiscount : finalTotal}
                formatPrice={formatPrice}
                onApplyDiscount={handleApplyDiscount}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                isApplyingDiscount={isApplyingDiscount}
                discountError={discountError}
                appliedDiscount={activeDiscount}
                onRemoveDiscount={handleRemoveDiscount}
            />

            <Container className="pt-8">
                <div className="mb-6 hidden lg:block">
                    <Link to="/cart" className="text-sm text-gray-500 flex items-center hover:text-brand-dark w-fit font-bold">
                        <ArrowLeft size={16} className="mr-1" /> Return to Cart
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    
                    {/* LEFT: Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Auth Banner for Guests */}
                        {!isAuthenticated && step === 1 && (
                            <div className="bg-brand-dark text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Have an account?</h3>
                                    <p className="text-gray-400 text-sm">Sign in for a faster checkout experience.</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Link to="/login" state={{ from: '/checkout' }} className="w-full sm:w-auto">
                                        <Button size="sm" fullWidth className="bg-brand-red border-none">Sign In</Button>
                                    </Link>
                                    <Link to="/signup" state={{ from: '/checkout' }} className="w-full sm:w-auto">
                                        <Button size="sm" variant="outline" fullWidth className="border-gray-600 text-gray-300 hover:text-white">Create Account</Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                            {/* Progress Indicator */}
                            <div className="flex items-center space-x-4 text-sm font-bold mb-8">
                                <div className={`flex items-center ${step >= 1 ? 'text-brand-dark' : 'text-gray-400'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs transition-colors ${step >= 1 ? 'bg-brand-dark text-white' : 'bg-gray-200'}`}>1</div>
                                    Shipping
                                </div>
                                <div className="h-px w-8 bg-gray-200"></div>
                                <div className={`flex items-center ${step >= 2 ? 'text-brand-dark' : 'text-gray-400'}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs transition-colors ${step >= 2 ? 'bg-brand-dark text-white' : 'bg-gray-200'}`}>2</div>
                                    Payment
                                </div>
                            </div>

                            {step === 1 ? (
                                <AddressStep initialData={userData} regions={regions} onSubmit={handleAddressSubmit} />
                            ) : (
                                clientSecret && customerData && (
                                    <Elements options={{ 
                                        clientSecret, 
                                        appearance: { 
                                            theme: 'stripe', 
                                            variables: { colorPrimary: '#D0202F', borderRadius: '12px' } 
                                        } 
                                    }} stripe={stripePromise}>
                                        <PaymentStep 
                                            items={checkoutItems}
                                            total={finalTotal}
                                            customerData={customerData}
                                            onSuccess={handleSuccess}
                                            onBack={() => setStep(1)}
                                        />
                                    </Elements>
                                )
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Order Summary (Desktop Only) */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-28">
                            <Card className="p-6 bg-white border-gray-200 shadow-xl shadow-gray-200/50">
                                <h3 className="font-heading font-bold text-brand-dark mb-6 text-lg border-b border-gray-100 pb-4">Order Summary</h3>
                                <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 max-h-80 overflow-y-auto custom-scrollbar">
                                    {checkoutItems.map((item, idx) => (
                                        <div key={idx} className="flex items-start space-x-4">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative shrink-0">
                                                <img src={item.image} alt={item.productTitle} className="w-full h-full object-cover" />
                                                <span className="absolute -top-1 -right-1 bg-brand-dark text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-bl-lg font-bold shadow-sm">{item.quantity}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-xs text-brand-dark leading-tight mb-1">{item.productTitle}</h4>
                                                <p className="text-[10px] text-gray-500 font-medium mb-1">{item.variantName}</p>
                                                <div className="font-heading font-bold text-sm text-brand-red">{formatPrice(item.price)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Discount Input */}
                                <div className="mb-6">
                                    {!activeDiscount ? (
                                        <div className="flex gap-2">
                                            <div className="relative flex-grow">
                                                <input 
                                                    type="text" 
                                                    placeholder="Discount code" 
                                                    className={`w-full p-3 pl-10 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-red ${discountError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                                                    value={discountCode}
                                                    onChange={(e) => setDiscountCode(e.target.value)}
                                                />
                                                <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                            <Button size="sm" onClick={handleApplyDiscount} disabled={isApplyingDiscount} className="px-4">
                                                {isApplyingDiscount ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded-lg">
                                            <div className="flex items-center text-green-700 font-bold text-xs">
                                                <Tag size={14} className="mr-2" />
                                                <span>Code: {activeDiscount.code} applied</span>
                                            </div>
                                            <button onClick={handleRemoveDiscount} className="text-gray-400 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                    {discountError && <p className="text-xs text-red-500 mt-2 font-medium">{discountError}</p>}
                                </div>

                                <div className="space-y-3 mb-6 text-sm text-gray-600 font-medium">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="text-brand-dark">{formatPrice(itemsSubtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                            <span>Discount {activeDiscount.type === 'PERCENTAGE' && `(${discountVal}%)`}</span>
                                            <span>-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <span>Shipping</span>
                                        <span className={`font-bold ${shippingData.cost === 0 && step === 2 ? 'text-green-600' : 'text-brand-dark'}`}>
                                            {step === 1 ? 'Calculated next step' : (shippingData.cost === 0 ? 'FREE' : formatPrice(shippingData.cost))}
                                        </span>
                                    </div>
                                    {step === 2 && (
                                        <div className="flex justify-between items-center">
                                            <span>Tax (Est.)</span>
                                            <span className="text-brand-dark">{formatPrice(shippingData.tax)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between border-t border-gray-100 pt-6 font-heading font-extrabold text-xl text-brand-dark">
                                    <span>Total</span>
                                    <span>{step === 1 ? formatPrice(subtotalAfterDiscount) : formatPrice(finalTotal)}</span>
                                </div>
                                <div className="mt-6 bg-green-50 p-3 rounded-lg flex items-center justify-center text-xs text-green-700 font-bold border border-green-100">
                                    <CheckCircle size={14} className="mr-2" />
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