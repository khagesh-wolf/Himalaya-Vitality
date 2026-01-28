
import React, { useState } from 'react';
import { Star, Check, ArrowLeft, Filter, Loader2, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Container, Button, Card, Reveal } from '../components/UI';
import { fetchReviews, fetchProduct } from '../services/api';
import { SEO } from '../components/SEO';
import { MAIN_PRODUCT as FALLBACK_PRODUCT } from '../constants';

export const ReviewsPage = () => {
  const [filter, setFilter] = useState<'All' | 'Athlete'>('All');
  const [visibleCount, setVisibleCount] = useState(5);
  
  // 1. Fetch Product for Title/ID (Dynamic)
  const { data: product } = useQuery({
    queryKey: ['product', 'himalaya-shilajit-resin'],
    queryFn: () => fetchProduct('himalaya-shilajit-resin'),
    initialData: FALLBACK_PRODUCT
  });

  // 2. Fetch Real Reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: fetchReviews,
    initialData: []
  });
  
  const totalReviews = reviews.length;
  // Calculate average rating dynamically
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : 5.0;

  const stars = [5, 4, 3, 2, 1];
  
  // Calculate distribution dynamically
  const distribution = stars.map(star => {
      const count = reviews.filter(r => Math.round(r.rating) === star).length;
      return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  });

  const displayedReviews = filter === 'All' 
    ? reviews 
    : reviews.filter(r => r.tags?.includes('Athlete') || r.tags?.includes('Endurance'));

  const visibleReviews = displayedReviews.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <SEO title="Customer Reviews | Athlete Stories" description={`See what high-performance athletes are saying about ${product.title}`} />
      <Container>
        <Reveal>
            <div className="mb-10">
                <Link to={`/product/${product.id}`} className="text-sm font-bold text-gray-500 hover:text-brand-red flex items-center mb-6 w-fit transition-colors">
                    <ArrowLeft size={16} className="mr-2" /> Back to Product
                </Link>
                <h1 className="font-heading text-4xl font-extrabold text-brand-dark mb-4">Customer Reviews</h1>
                <p className="text-gray-600 max-w-2xl">
                    Real feedback from verified customers and athletes using Himalaya Vitality.
                </p>
            </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Sidebar: Summary */}
            <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-24">
                <Reveal delay={200}>
                    <Card className="p-8 border-none shadow-lg">
                        <div className="text-center mb-6">
                            <div className="text-6xl font-heading font-extrabold text-brand-dark mb-2">{averageRating}</div>
                            <div className="flex justify-center text-brand-gold-500 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} strokeWidth={0} className={i < Math.round(Number(averageRating)) ? "" : "text-gray-300"} />
                                ))}
                            </div>
                            <p className="text-gray-500 font-medium">{totalReviews} Verified Reviews</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {stars.map((star, i) => (
                                <div key={star} className="flex items-center text-xs font-bold">
                                    <span className="w-8 text-gray-500 flex items-center gap-1">{star} <Star size={10} fill="currentColor" className="text-gray-400"/></span>
                                    <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-brand-gold-500 rounded-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${distribution[i]}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-400">{distribution[i]}%</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                            <h4 className="font-bold text-brand-dark mb-1 text-sm">100% Verified</h4>
                            <p className="text-xs text-gray-500">Reviews are from verified purchases only.</p>
                        </div>
                    </Card>
                </Reveal>
            </div>

            {/* Right Content: Reviews List */}
            <div className="lg:col-span-8">
                {/* Filters */}
                <Reveal delay={300}>
                    <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        <button 
                            onClick={() => { setFilter('All'); setVisibleCount(5); }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${filter === 'All' ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                            All Reviews
                        </button>
                        <button 
                            onClick={() => { setFilter('Athlete'); setVisibleCount(5); }}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center border ${filter === 'Athlete' ? 'bg-brand-red text-white border-brand-red shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                        >
                            <Filter size={14} className="mr-2" /> Athlete Stories
                        </button>
                    </div>
                </Reveal>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-red" size={40} /></div>
                ) : (
                    <div className="space-y-6">
                        {displayedReviews.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No reviews found for this filter.</p>
                                <button onClick={() => setFilter('All')} className="text-brand-red font-bold text-sm mt-3 hover:underline">View All Reviews</button>
                            </div>
                        ) : (
                            <>
                                {visibleReviews.map((review, idx) => (
                                    <Reveal key={`${review.id}-${idx}`} delay={idx * 50}>
                                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center font-bold text-sm text-gray-600 shadow-inner">
                                                        {review.author?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-brand-dark text-sm flex items-center gap-2">
                                                            {review.author}
                                                            {review.verified && (
                                                                <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full flex items-center border border-green-100">
                                                                    <Check size={10} className="mr-1" strokeWidth={3} /> Verified
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{review.date}</div>
                                                    </div>
                                                </div>
                                                <div className="flex text-brand-gold-500">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} strokeWidth={0} />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <h3 className="font-heading font-bold text-lg text-brand-dark mb-2 flex items-center gap-2">
                                                    {review.title}
                                                    {review.tags?.includes('Athlete') && (
                                                        <span className="bg-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Athlete</span>
                                                    )}
                                                </h3>
                                                <p className="text-gray-600 text-sm leading-relaxed relative pl-4 border-l-2 border-brand-red/20 italic">
                                                    "{review.content}"
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 mt-6">
                                                <button className="text-xs font-bold text-gray-400 hover:text-brand-dark flex items-center gap-1 transition-colors">
                                                    <ThumbsUp size={14} /> Helpful
                                                </button>
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}

                                {visibleCount < displayedReviews.length && (
                                    <div className="text-center pt-8">
                                        <Button 
                                            variant="outline-dark" 
                                            onClick={handleLoadMore}
                                            className="min-w-[200px]"
                                        >
                                            Load More Reviews
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
      </Container>
    </div>
  );
};
