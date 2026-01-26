
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Check, Info, ShieldCheck, Truck, Clock, Lock, Award, XCircle, Filter, Mail, ArrowRight } from 'lucide-react';
import { Button, Container, LazyImage, Reveal } from '../components/UI';
import { BundleType } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useLoading } from '../context/LoadingContext';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { fetchProduct, fetchReviews } from '../services/api';
import { ProductPageSkeleton } from '../components/Skeletons';
import { MAIN_PRODUCT } from '../constants'; 
import { trackViewItem, trackAddToCart } from '../services/analytics'; // Import Analytics

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email) {
        setSubscribed(true);
        setTimeout(() => {
            setEmail('');
            setSubscribed(false);
        }, 3000);
    }
  };

  return (
    <div className="bg-brand-dark relative overflow-hidden py-16 rounded-3xl my-20">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <Container className="relative z-10 text-center max-w-2xl px-4">
            <Reveal>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white backdrop-blur-sm">
                    <Mail size={32} />
                </div>
                <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-white mb-4">Join the Inner Circle</h2>
                <p className="text-gray-400 text-lg mb-8">
                    Get exclusive access to new harvests, recovery protocols, and <strong>10% off your first order</strong>.
                </p>

                {subscribed ? (
                    <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-6 py-4 rounded-xl flex items-center justify-center gap-2 animate-in fade-in">
                        <Check size={20} />
                        <span className="font-bold">Welcome to the tribe! Check your email.</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            className="flex-1 p-4 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:bg-white/20 transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button className="h-auto py-4 px-8 text-lg bg-brand-red hover:bg-red-600 shadow-lg shadow-brand-red/25">
                            Subscribe
                        </Button>
                    </form>
                )}
                <p className="text-xs text-gray-600 mt-4">We respect your privacy. Unsubscribe at any time.</p>
            </Reveal>
        </Container>
    </div>
  );
};

export const ProductPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const bundleParam = searchParams.get('bundle');
  
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();

  // React Query for Data Fetching
  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId || 'himalaya-shilajit-resin'),
    initialData: MAIN_PRODUCT
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: fetchReviews,
    initialData: []
  });

  const initialBundle = (bundleParam && Object.values(BundleType).includes(bundleParam as BundleType))
    ? (bundleParam as BundleType)
    : BundleType.TRIPLE;

  const [selectedBundle, setSelectedBundle] = useState<BundleType>(initialBundle);
  const [showStickyBar, setShowStickyBar] = useState(false);
  
  // Review Filtering State
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Athlete'>('All');
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  const currentVariant = product.variants.find(v => v.type === selectedBundle) || product.variants[0];

  // Track View Item on Load
  useEffect(() => {
    if (product) {
        trackViewItem(product);
    }
  }, [product]);

  useEffect(() => {
     const newParams = new URLSearchParams(searchParams);
     newParams.set('bundle', selectedBundle);
     navigate(`?${newParams.toString()}`, { replace: true });
  }, [selectedBundle, navigate, searchParams]);

  // Handle Sticky Bar Visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    // 1. Analytics
    const qty = 1;
    trackAddToCart({
        variantId: currentVariant.id,
        productTitle: product.title,
        variantName: currentVariant.name,
        price: currentVariant.price,
        quantity: qty,
        image: product.images[0],
        bundleType: currentVariant.type
    });

    // 2. Add to Cart
    setIsLoading(true, 'Adding to Cart...');
    setTimeout(() => {
      addToCart(product, currentVariant, qty);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const handleBuyNow = () => {
    trackAddToCart({
        variantId: currentVariant.id,
        productTitle: product.title,
        variantName: currentVariant.name,
        price: currentVariant.price,
        quantity: 1,
        image: product.images[0],
        bundleType: currentVariant.type
    });
    navigate(`/checkout?variantId=${currentVariant.id}`);
  };

  if (isProductLoading) return <ProductPageSkeleton />;

  // Filter Reviews Logic
  const filteredReviews = reviewFilter === 'All' 
    ? reviews 
    : reviews.filter(r => r.tags?.includes('Athlete') || r.tags?.includes('Endurance') || r.tags?.includes('Recovery'));
  
  const displayedReviews = filteredReviews.slice(0, visibleReviews);
  const hasMoreReviews = visibleReviews < filteredReviews.length;

  return (
    <div className="bg-[#FAFAFA] pt-32 pb-16">
      <SEO 
        title="Buy Athlete Grade Shilajit | High Performance Resin" 
        description="Official store for Himalaya Vitality Athlete Grade Shilajit. Optimized for peak physical output, endurance, and recovery. Gold grade purity."
        image={product.images[0]}
        type="product"
      />

      <Container>
        <Reveal>
            <Breadcrumbs productName={product.title} />
        </Reveal>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          {/* Left: Images */}
          <div className="lg:col-span-7 space-y-6">
            <Reveal delay={200}>
                <div className="aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-gray-200 relative group shadow-sm">
                <LazyImage 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    sizes="(max-width: 1024px) 100vw, 60vw"
                />
                <div className="absolute top-6 left-6 flex gap-2">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-brand-dark shadow-sm border border-gray-100">
                    High Altitude • Gold Grade
                    </div>
                    <div className="bg-brand-dark px-4 py-2 rounded-full text-xs font-bold text-white shadow-sm flex items-center">
                    <Award size={14} className="mr-1 text-brand-red" /> Athlete Grade
                    </div>
                </div>
                </div>
            </Reveal>

            <Reveal delay={300}>
                <div className="grid grid-cols-3 gap-4">
                {product.images.map((img, idx) => (
                    <div key={idx} className="aspect-square bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer hover:border-brand-red transition-all shadow-sm hover:shadow-md relative">
                    <LazyImage 
                        src={img} 
                        alt={`${product.title} view ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        sizes="(max-width: 768px) 33vw, 20vw"
                    />
                    </div>
                ))}
                </div>
            </Reveal>
            
            {/* Detailed Trust Info - Desktop */}
            <div className="hidden lg:grid grid-cols-3 gap-6 pt-8">
               {[
                   { Icon: ShieldCheck, title: "Lab Tested", text: "Certified pure and free from heavy metals." },
                   { Icon: Truck, title: "Fast Shipping", text: "Free worldwide shipping on bundles." },
                   { Icon: Clock, title: "30 Day Returns", text: "Risk-free trial. Money back guarantee." }
               ].map((item, i) => (
                   <Reveal key={i} delay={400 + (i * 100)}>
                       <div className="flex flex-col items-start p-6 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow h-full">
                           <item.Icon className="text-brand-red mb-3" size={28} />
                           <span className="text-sm font-bold text-brand-dark mb-1">{item.title}</span>
                           <span className="text-xs text-gray-500 font-medium leading-tight">{item.text}</span>
                       </div>
                   </Reveal>
               ))}
            </div>
          </div>

          {/* Right: Details & Purchase - Sticky Sidebar Container */}
          <div className="lg:col-span-5 relative">
            <Reveal delay={200}>
                {/* Mobile: relative / Desktop: sticky top-24 */}
                <div className="relative lg:sticky lg:top-24 bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-brand-red">
                        <Star size={16} fill="currentColor" strokeWidth={0} />
                        <Star size={16} fill="currentColor" strokeWidth={0} />
                        <Star size={16} fill="currentColor" strokeWidth={0} />
                        <Star size={16} fill="currentColor" strokeWidth={0} />
                        <Star size={16} fill="currentColor" strokeWidth={0} />
                    </div>
                    <span className="text-xs font-bold text-brand-dark border-b border-gray-300 pb-0.5">{product.reviewCount} Verified Reviews</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-extrabold text-brand-dark leading-tight tracking-tight">{product.title}</h1>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed mb-8 font-medium text-sm">{product.description}</p>

                    <ul className="space-y-3 mb-8">
                    {product.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-brand-dark font-semibold text-sm">
                        <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 border border-green-100 flex items-center justify-center mr-3 shrink-0">
                            <Check size={12} strokeWidth={3} />
                        </div>
                        {feature}
                        </li>
                    ))}
                    </ul>

                    {/* Bundle Selector */}
                    <div className="space-y-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="font-bold text-brand-dark text-sm uppercase tracking-wide">Select Package</h3>
                        <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">Free Shipping on 2+ Jars</span>
                    </div>
                    
                    {product.variants.map((variant) => {
                        const savingsAmount = variant.compareAtPrice - variant.price;
                        const isSelected = selectedBundle === variant.type;
                        
                        return (
                            <div 
                            key={variant.id}
                            onClick={() => setSelectedBundle(variant.type)}
                            className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                isSelected
                                ? 'border-brand-red bg-white shadow-md' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                            >
                            {variant.isPopular && (
                                <span className="absolute -top-3 left-6 bg-brand-dark text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md border border-gray-700">
                                Most Popular
                                </span>
                            )}
                            <div className="flex items-center">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors ${isSelected ? 'border-brand-red' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />}
                                </div>
                                <div>
                                <span className={`block font-bold text-sm ${isSelected ? 'text-brand-dark' : 'text-gray-700'}`}>{variant.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{variant.label}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-heading font-bold text-lg text-brand-dark">{formatPrice(variant.price)}</div>
                                {variant.type !== BundleType.SINGLE && (
                                <div className="text-xs flex flex-col items-end">
                                    <span className="line-through text-gray-400 font-medium">{formatPrice(variant.compareAtPrice)}</span>
                                    <span className="text-brand-red font-bold">Save {formatPrice(savingsAmount)}</span>
                                </div>
                                )}
                            </div>
                            </div>
                        );
                        })}
                    </div>

                    {/* Main Action Buttons (Desktop) */}
                    <div className="space-y-4 hidden lg:block">
                        <div className="flex gap-3">
                            <Button 
                                fullWidth 
                                size="lg" 
                                variant="outline-dark"
                                className="h-14 lg:h-16 text-lg group border-2 border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-white transition-all font-heading" 
                                onClick={handleAddToCart}
                            >
                                Add To Cart
                            </Button>
                            <Button fullWidth size="lg" className="h-14 lg:h-16 text-lg group shadow-xl shadow-brand-red/20 font-heading" onClick={handleBuyNow}>
                                Buy Now
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-4 pt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <div className="flex items-center gap-1.5"><ShieldCheck size={14}/> Secure Checkout</div>
                            <div className="flex items-center gap-1.5"><Lock size={14}/> SSL Encrypted</div>
                        </div>
                    </div>
                </div>
            </Reveal>
          </div>
        </div>

        {/* Newsletter Section (Replaces Subscription Plan) */}
        <NewsletterSection />

        {/* Customer Reviews Section */}
        <div id="reviews" className="border-t border-gray-200 pt-20">
            <Reveal>
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <span className="text-brand-red font-bold text-xs uppercase tracking-widest mb-2 block">Community Feedback</span>
                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark">Customer Reviews</h2>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex text-brand-red">
                            <Star size={20} fill="currentColor" strokeWidth={0} />
                            <Star size={20} fill="currentColor" strokeWidth={0} />
                            <Star size={20} fill="currentColor" strokeWidth={0} />
                            <Star size={20} fill="currentColor" strokeWidth={0} />
                            <Star size={20} fill="currentColor" strokeWidth={0} />
                        </div>
                        <span className="font-bold text-lg text-brand-dark">{product.rating}/5</span>
                        <span className="text-gray-400 text-sm">({product.reviewCount} reviews)</span>
                    </div>
                </div>
            </Reveal>

            {/* Review Filter */}
            <Reveal delay={100}>
                <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
                <button 
                    onClick={() => { setReviewFilter('All'); setVisibleReviews(3); }} 
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${reviewFilter === 'All' ? 'bg-brand-dark text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                    All Reviews
                </button>
                <button 
                    onClick={() => { setReviewFilter('Athlete'); setVisibleReviews(3); }} 
                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center whitespace-nowrap ${reviewFilter === 'Athlete' ? 'bg-brand-red text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                    <Filter size={14} className="mr-2" /> Athlete Stories
                </button>
                </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {displayedReviews.length > 0 ? (
                    displayedReviews.map((review, i) => (
                        <Reveal key={review.id} delay={i * 100}>
                            <div className="bg-white p-8 rounded-3xl hover:shadow-xl transition-all duration-300 border border-gray-100 group shadow-sm h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex text-brand-red">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} strokeWidth={0} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                                </div>
                                
                                <h3 className="font-heading font-bold text-lg text-brand-dark mb-3 leading-tight">{review.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4 flex-grow">"{review.content}"</p>
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                    <span className="font-bold text-sm text-brand-dark">{review.author}</span>
                                    {review.verified && (
                                        <div className="flex items-center text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full">
                                            <Check size={12} className="mr-1" strokeWidth={3} /> Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Reveal>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No reviews found for this filter.</p>
                    </div>
                )}
            </div>
            
            {hasMoreReviews && (
              <div className="text-center">
                  <Button variant="outline-dark">Load More Reviews</Button>
              </div>
            )}
        </div>

      </Container>

      {/* Sticky Mobile CTA Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[60] transition-transform duration-300 lg:hidden ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-500">{currentVariant.name}</span>
                <span className="text-lg font-heading font-bold text-brand-dark">{formatPrice(currentVariant.price)}</span>
            </div>
            <Button className="flex-1 shadow-lg shadow-brand-red/20" onClick={handleAddToCart}>
                Add to Cart
            </Button>
        </div>
      </div>
    </div>
  );
};