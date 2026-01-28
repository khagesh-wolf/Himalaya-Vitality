
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Button, Card, LazyImage, Reveal } from '../components/UI';
import { useCurrency } from '../context/CurrencyContext';
import { Check, ArrowRight, TrendingUp, Zap, Activity, Brain } from 'lucide-react';
import { SEO } from '../components/SEO';
import { BundleType, Product } from '../types';
import { fetchProduct } from '../services/api';
import { MAIN_PRODUCT as FALLBACK_PRODUCT } from '../constants';

export const ShopPage = () => {
  const { formatPrice } = useCurrency();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Energy' | 'Recovery' | 'Focus'>('All');

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', 'himalaya-shilajit-resin'],
    queryFn: () => fetchProduct('himalaya-shilajit-resin'),
    initialData: FALLBACK_PRODUCT
  });

  const filters = [
    { id: 'All', label: 'All Products', icon: null },
    { id: 'Energy', label: 'Energy', icon: Zap },
    { id: 'Recovery', label: 'Recovery', icon: Activity },
    { id: 'Focus', label: 'Focus', icon: Brain },
  ];

  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <SEO title="Shop Packages" description="Choose your supply of pure Himalayan Shilajit." />
      <Container>
        <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-10">
                <span className="text-brand-red font-bold text-sm uppercase tracking-widest mb-2 block">The Collection</span>
                <h1 className="font-heading text-4xl font-extrabold text-brand-dark mb-6">Choose Your Supply</h1>
                <p className="text-gray-500 text-lg">Select the package that fits your goals. Most customers start with the 3-month supply for full hormonal optimization.</p>
            </div>
        </Reveal>

        {/* Filtering Options */}
        <Reveal delay={200}>
            <div className="flex justify-center gap-3 mb-16 flex-wrap">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id as any)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center ${activeFilter === filter.id ? 'bg-brand-dark text-white shadow-lg transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                    >
                        {filter.icon && <filter.icon size={16} className="mr-2" />}
                        {filter.label}
                    </button>
                ))}
            </div>
        </Reveal>

        {activeFilter !== 'All' && (
            <div className="text-center mb-8 animate-in fade-in slide-in-from-top-2">
                <span className="inline-flex items-center bg-brand-red/10 text-brand-red px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                    Showing products optimized for {activeFilter}
                </span>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {product.variants.map((variant, index) => {
                const isPopular = variant.isPopular;
                const savings = variant.compareAtPrice - variant.price;
                
                return (
                    <Reveal key={variant.id} delay={index * 150} className="h-full">
                        <div className={`relative flex flex-col h-full bg-white rounded-3xl border transition-all duration-300 overflow-hidden ${isPopular ? 'border-brand-red shadow-xl shadow-brand-red/10 scale-105 z-10' : 'border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1'}`}>
                            {isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-red text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-md flex items-center z-20 border-2 border-white">
                                    <TrendingUp size={14} className="mr-1.5" /> Most Popular
                                </div>
                            )}
                            
                            {/* Card Image */}
                            <div className="aspect-[5/4] bg-white relative overflow-hidden border-b border-gray-100 group">
                                <LazyImage 
                                    src={product.images[0]} 
                                    alt={variant.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                {variant.type !== BundleType.SINGLE && (
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-brand-dark text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-gray-100 shadow-sm">
                                        {variant.label}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="font-heading font-bold text-xl text-brand-dark mb-2 text-center">{variant.name}</h3>
                                
                                <div className="flex items-center justify-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
                                    <span className="text-3xl font-heading font-bold text-brand-dark">{formatPrice(variant.price)}</span>
                                    {variant.compareAtPrice > variant.price && (
                                        <div className="flex flex-col items-start text-xs">
                                            <span className="text-gray-400 line-through font-medium">{formatPrice(variant.compareAtPrice)}</span>
                                            <span className="text-brand-red font-bold">Save {formatPrice(savings)}</span>
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8 flex-1 px-2">
                                    <li className="flex items-start text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 mr-2 shrink-0 mt-0.5" strokeWidth={3} />
                                        <span><strong>{variant.type === BundleType.SINGLE ? '1 Jar' : variant.type === BundleType.DOUBLE ? '2 Jars' : '3 Jars'}</strong> of Gold Grade Resin</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 mr-2 shrink-0 mt-0.5" strokeWidth={3} />
                                        <span>{variant.type === BundleType.SINGLE ? 'Standard Shipping' : 'Free Priority Shipping'}</span>
                                    </li>
                                    <li className="flex items-start text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 mr-2 shrink-0 mt-0.5" strokeWidth={3} />
                                        <span>30-Day Money Back Guarantee</span>
                                    </li>
                                    {variant.type === BundleType.TRIPLE && (
                                        <li className="flex items-start text-sm text-gray-600">
                                            <Check size={16} className="text-green-500 mr-2 shrink-0 mt-0.5" strokeWidth={3} />
                                            <span><strong>Best Value</strong> for Long Term Results</span>
                                        </li>
                                    )}
                                </ul>

                                <Link to={`/product/${product.id}?bundle=${variant.type}`}>
                                    <Button fullWidth variant={isPopular ? 'primary' : 'secondary'} className={isPopular ? 'h-14 text-lg shadow-brand-red/20' : ''}>
                                        Select This Bundle
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                );
            })}
        </div>

        <Reveal delay={400}>
            <div className="mt-20 p-10 bg-white rounded-3xl border border-gray-200 shadow-sm text-center">
                <h2 className="font-heading text-2xl font-bold text-brand-dark mb-4">Why Subscribe?</h2>
                <p className="text-gray-500 max-w-2xl mx-auto mb-8">
                    Consistency is the key to Shilajit. Subscribe to our monthly plan on the product page to save an additional 15% and never run out of your vitality fuel.
                </p>
                <Link to={`/product/${product.id}`} className="text-brand-red font-bold flex items-center justify-center hover:underline">
                    View Subscription Options <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        </Reveal>

      </Container>
    </div>
  );
};
