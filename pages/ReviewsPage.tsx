
import React, { useState } from 'react';
import { Star, Check, ArrowLeft, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container, Button, Card, Reveal } from '../components/UI';
import { REVIEWS, MAIN_PRODUCT } from '../constants';
import { SEO } from '../components/SEO';

export const ReviewsPage = () => {
  const product = MAIN_PRODUCT;
  const [filter, setFilter] = useState<'All' | 'Athlete'>('All');
  
  // Calculate stats
  const totalReviews = 1248;
  const rating = 4.9;
  const stars = [5, 4, 3, 2, 1];
  const distribution = [85, 10, 3, 1, 1]; // percentages

  const displayedReviews = filter === 'All' 
    ? REVIEWS 
    : REVIEWS.filter(r => r.tags?.includes('Athlete') || r.tags?.includes('Endurance'));

  return (
    <div className="bg-gray-50 py-20 min-h-screen">
      <SEO title="Customer Reviews | Athlete Stories" description={`See what high-performance athletes are saying about ${product.title}`} />
      <Container>
        <Reveal>
            <div className="mb-10">
                <Link to={`/product/${product.id}`} className="text-sm font-bold text-gray-500 hover:text-brand-red flex items-center mb-6 w-fit">
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
            <div className="lg:col-span-4 space-y-8">
                <Reveal delay={200}>
                    <Card className="p-8 border-none shadow-lg">
                        <div className="text-center mb-6">
                            <div className="text-6xl font-heading font-extrabold text-brand-dark mb-2">{rating}</div>
                            <div className="flex justify-center text-brand-red mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={24} fill="currentColor" strokeWidth={0} />
                                ))}
                            </div>
                            <p className="text-gray-500 font-medium">{totalReviews} Verified Reviews</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            {stars.map((star, i) => (
                                <div key={star} className="flex items-center text-xs font-bold">
                                    <span className="w-8 text-gray-500">{star} Star</span>
                                    <div className="flex-1 mx-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-brand-red" 
                                            style={{ width: `${distribution[i]}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-right text-gray-400">{distribution[i]}%</span>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl text-center">
                            <h4 className="font-bold text-brand-dark mb-1">We Value Transparency</h4>
                            <p className="text-xs text-gray-500">We post all reviews, good or bad, from verified purchases.</p>
                        </div>
                    </Card>
                </Reveal>
            </div>

            {/* Right Content: Reviews List */}
            <div className="lg:col-span-8">
                {/* Filters */}
                <Reveal delay={300}>
                    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button 
                        onClick={() => setFilter('All')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap ${filter === 'All' ? 'bg-brand-dark text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        All Reviews
                    </button>
                    <button 
                        onClick={() => setFilter('Athlete')}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors whitespace-nowrap flex items-center ${filter === 'Athlete' ? 'bg-brand-red text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Filter size={14} className="mr-2" /> Athlete Stories
                    </button>
                    </div>
                </Reveal>

                <div className="space-y-6">
                    {displayedReviews.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl">
                            <p className="text-gray-500">No specific reviews found for this filter.</p>
                            <button onClick={() => setFilter('All')} className="text-brand-red font-bold text-sm mt-2">View All</button>
                        </div>
                    ) : (
                        displayedReviews.map((review, idx) => (
                            <Reveal key={`${review.id}-${idx}`} delay={idx * 100}>
                                <Card className="p-8 border-none shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex text-brand-red mb-2">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} strokeWidth={0} />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-heading font-bold text-lg text-brand-dark">{review.title}</h3>
                                                {review.tags?.includes('Athlete') && (
                                                    <span className="bg-brand-dark text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Athlete</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 font-medium">{review.date}</span>
                                    </div>
                                    
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">"{review.content}"</p>
                                    
                                    <div className="flex items-center border-t border-gray-50 pt-4">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-xs text-gray-500 mr-3">
                                            {review.author.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-brand-dark">{review.author}</span>
                                                {review.verified && (
                                                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider bg-green-50 px-2 py-0.5 rounded-full flex items-center">
                                                        <Check size={10} className="mr-1" strokeWidth={3} /> Verified Buyer
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Reveal>
                        ))
                    )}
                </div>
            </div>
        </div>
      </Container>
    </div>
  );
};
