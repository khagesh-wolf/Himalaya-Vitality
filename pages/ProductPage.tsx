
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Star, Check, ShieldCheck, Truck, Clock, Lock, Award, Filter, ArrowRight } from 'lucide-react';
import { Button, Container, LazyImage, Reveal } from '../components/UI';
import { BundleType, Product, Review } from '../types';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { useLoading } from '../context/LoadingContext';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { fetchProduct, fetchReviews } from '../services/api';
import { ProductPageSkeleton } from '../components/Skeletons';
import { trackViewItem, trackAddToCart } from '../services/analytics'; 

export const ProductPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const bundleParam = searchParams.get('bundle');
  
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();
  const { setIsLoading } = useLoading();

  // Fetch product from API - Strict
  const { data: product, isLoading: isProductLoading } = useQuery<Product>({
      queryKey: ['product', productId || 'himalaya-shilajit-resin'],
      queryFn: () => fetchProduct(productId || 'himalaya-shilajit-resin')
  });

  // Fetch Reviews from API - Strict
  const { data: reviews = [] } = useQuery<Review[]>({
      queryKey: ['reviews'],
      queryFn: fetchReviews
  });

  const initialBundle = (bundleParam && Object.values(BundleType).includes(bundleParam as BundleType))
    ? (bundleParam as BundleType)
    : BundleType.TRIPLE;

  const [selectedBundle, setSelectedBundle] = useState<BundleType>(initialBundle);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [reviewFilter, setReviewFilter] = useState<'All' | 'Athlete'>('All');
  const [visibleReviews, setVisibleReviews] = useState(3);
  
  // Safe access to variants if product exists
  const currentVariant = product?.variants.find(v => v.type === selectedBundle) || product?.variants[0];

  useEffect(() => {
    if (product) trackViewItem(product);
  }, [product]);

  useEffect(() => {
     const newParams = new URLSearchParams(searchParams);
     newParams.set('bundle', selectedBundle);
     navigate(`?${newParams.toString()}`, { replace: true });
  }, [selectedBundle, navigate, searchParams]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowStickyBar(scrollPosition > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
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

    setIsLoading(true, 'Adding to Cart...');
    setTimeout(() => {
      addToCart(product, currentVariant, qty);
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const handleBuyNow = () => {
    if (!product || !currentVariant) return;
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

  // Filter Reviews Logic
  const filteredReviews = reviewFilter === 'All' 
    ? reviews 
    : reviews.filter(r => r.tags?.includes('Athlete') || r.tags?.includes('Endurance') || r.tags?.includes('Recovery'));
  
  const displayedReviews = filteredReviews.slice(0, visibleReviews);
  const hasMoreReviews = visibleReviews < filteredReviews.length;

  // --- RICH SNIPPET GENERATION ---
  const productSchema = product && currentVariant ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.images,
    "description": product.description,
    "sku": currentVariant.id,
    "brand": {
      "@type": "Brand",
      "name": "Himalaya Vitality"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || reviews.length
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "USD",
      "price": currentVariant.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Himalaya Vitality"
      }
    }
  } : undefined;

  if (isProductLoading || !product || !currentVariant) return <ProductPageSkeleton />;

  return (
    <div className="bg-[#FAFAFA] pt-28 md:pt-32 pb-16">
      <SEO 
        title="Buy Athlete Grade Shilajit | High Performance Resin" 
        description="Official store for Himalaya Vitality Athlete Grade Shilajit. Optimized for peak physical output, endurance, and recovery. Gold grade purity."
        image={product.images[0]}
        type="product"
        schema={productSchema}
        productData={{
            price: currentVariant.price,
            currency: 'USD',
            availability: 'instock'
        }}
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
                    loading="eager"
                    fetchPriority="high"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2 items-start">
                    <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-brand-dark shadow-sm border border-gray-100">
                    High Altitude • Gold Grade
                    <Award size={14} className="mr-1 text-brand-red bg-brand-dark px-4 py-2 rounded-full text-xs font-bold text-white shadow-sm flex items-center" /> Athlete Grade
                    </div>
                </div>
                </div>
            </Reveal>

            <Reveal delay={300}>
                <div className="grid grid-cols-3 gap-4">
                {product.images.slice(0,3).map((img, idx) => (
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
            
            <div className="hidden lg:grid grid-cols-3 gap-6 pt-8">
               {[
                   { Icon: ShieldCheck, title: "Lab Tested", text: "Certified pure and free from heavy metals." },
                   { Icon: Truck, title: "Fast Shipping", text: "Dispatched from Australia via AusPost." },
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

          {/* Right: Details & Purchase */}
          <div className="lg:col-span-5 relative">
            <Reveal delay={200}>
                <div className="relative lg:sticky lg:top-24 bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100">
                    <div className="flex items-center space-x-2 mb-4">
                    <div className="flex text-brand-red">
                        {[...Array(5)].map((_,i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                    </div>
                    <span className="text-xs font-bold text-brand-dark border-b border-gray-300 pb-0.5">{reviews.length} Verified Reviews</span>
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
                    </div>
                    
                    {product.variants.map((variant) => {
                        const savingsAmount = variant.compareAtPrice - variant.price;
                        const isSelected = selectedBundle === variant.type;
                        
                        return (
                            <div 
                            key={variant.id}
                            onClick={() => setSelectedBundle(variant.type as BundleType)}
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
                            <div className="flex items-center flex-1 min-w-0 pr-4">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 shrink-0 transition-colors ${isSelected ? 'border-brand-red' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-red" />}
                                </div>
                                <div className="min-w-0">
                                <span className={`block font-bold text-sm truncate ${isSelected ? 'text-brand-dark' : 'text-gray-700'}`}>{variant.name}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block">{variant.label}</span>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
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

                    {/* Main Action Buttons */}
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

        {/* Customer Reviews Section */}
        <div id="reviews" className="border-t border-gray-200 pt-20">
            <Reveal>
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <span className="text-brand-red font-bold text-xs uppercase tracking-widest mb-2 block">Community Feedback</span>
                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark">Customer Reviews</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex text-brand-red">
                            {[...Array(5)].map((_,i) => <Star key={i} size={20} fill="currentColor" strokeWidth={0} />)}
                        </div>
                        <span className="font-bold text-lg text-brand-dark">{product.rating}/5</span>
                        <span className="text-gray-400 text-sm">({reviews.length} reviews)</span>
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
                                            <Check size={12} className="mr-1" strokeWidth={3} /> Verified Buyer
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
                  <Button variant="outline-dark" onClick={() => setVisibleReviews(prev => prev + 3)}>Load More Reviews</Button>
              </div>
            )}
        </div>

      </Container>

      {/* Sticky Mobile CTA Bar */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[60] transition-transform duration-300 lg:hidden ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-gray-500 truncate max-w-[120px]">{currentVariant.name}</span>
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
