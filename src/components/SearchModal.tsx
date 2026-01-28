
import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Search, X, ArrowRight, Package, FileText, HelpCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MAIN_PRODUCT, BLOG_POSTS, FAQ_DATA } from '../constants';

interface SearchResult {
  type: 'Product' | 'Blog' | 'FAQ';
  title: string;
  url: string;
  snippet: string;
}

export const SearchModal = ({ onClose }: { onClose: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Index Data
    const data = [
      { type: 'Product', title: MAIN_PRODUCT.title, url: `/product/${MAIN_PRODUCT.id}`, snippet: 'Premium Himalayan Shilajit Resin' },
      ...BLOG_POSTS.map(post => ({ type: 'Blog', title: post.title, url: `/blog/${post.slug}`, snippet: post.excerpt })),
      ...FAQ_DATA.map(faq => ({ type: 'FAQ', title: faq.question, url: '/faq', snippet: faq.answer }))
    ];

    const fuse = new Fuse(data, {
      keys: ['title', 'snippet'],
      threshold: 0.4
    });

    if (query) {
      const searchResults = fuse.search(query).map(r => r.item as SearchResult);
      setResults(searchResults.slice(0, 5));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleNavigate = (url: string) => {
    navigate(url);
    onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-100">
        
        {/* Search Input Header */}
        <div className="flex items-center p-5 border-b border-gray-100">
          <Search className="text-gray-400 mr-4 shrink-0" size={24} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search products, science, articles..." 
            className="flex-1 text-xl outline-none placeholder:text-gray-300 text-brand-dark font-medium bg-transparent"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search site content"
          />
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 text-xs border border-gray-200"
            aria-label="Close search"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-5 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Results</div>
              {results.map((result, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleNavigate(result.url)}
                  className="flex items-center px-5 py-3.5 hover:bg-gray-50 cursor-pointer group transition-colors border-l-4 border-transparent hover:border-brand-red"
                >
                  <div className={`w-10 h-10 rounded-lg mr-4 shrink-0 flex items-center justify-center ${result.type === 'Product' ? 'bg-red-50 text-brand-red' : result.type === 'Blog' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {result.type === 'Product' && <Package size={20} />}
                    {result.type === 'Blog' && <FileText size={20} />}
                    {result.type === 'FAQ' && <HelpCircle size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-brand-dark text-sm truncate">{result.title}</h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{result.snippet}</p>
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-dark transition-colors -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          ) : query ? (
            <div className="py-12 text-center text-gray-500">
                <p>No results found for "{query}"</p>
                <button onClick={() => setQuery('')} className="text-brand-red font-bold text-sm mt-2 hover:underline">Clear Search</button>
            </div>
          ) : (
            <div className="py-8 px-5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Trending Now</div>
                <div className="space-y-2">
                    <button onClick={() => handleNavigate(`/product/${MAIN_PRODUCT.id}`)} className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 font-medium transition-colors">
                        <TrendingUp size={16} className="mr-3 text-brand-red" /> Athlete Grade Shilajit
                    </button>
                    <button onClick={() => handleNavigate('/science')} className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 font-medium transition-colors">
                        <TrendingUp size={16} className="mr-3 text-brand-red" /> Fulvic Acid Benefits
                    </button>
                    <button onClick={() => handleNavigate('/reviews')} className="flex items-center w-full p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-600 font-medium transition-colors">
                        <TrendingUp size={16} className="mr-3 text-brand-red" /> Recovery Protocols
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
