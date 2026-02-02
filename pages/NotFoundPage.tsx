
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Button, LazyImage, Reveal } from '../components/UI';
import { Home, Search, ShoppingBag } from 'lucide-react';
import { SEO } from '../components/SEO';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white relative overflow-hidden pt-32 pb-20">
      <SEO title="Page Not Found" description="The page you are looking for has been moved or does not exist." />
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <Container className="relative z-10 text-center">
        <Reveal>
            <div className="mb-8 relative inline-block">
                <h1 className="text-[150px] md:text-[200px] font-heading font-extrabold text-brand-gray leading-none select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <LazyImage 
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" 
                        alt="Lost in mountains" 
                        className="w-48 h-32 object-cover rounded-2xl shadow-xl rotate-3 opacity-90 hover:rotate-0 transition-transform duration-500"
                    />
                </div>
            </div>

            <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-brand-dark mb-4">You seem a little lost.</h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto mb-10">
                Even the most experienced sherpas take a wrong turn sometimes. The page you are looking for might have been moved to higher altitude.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                    <Button size="lg" className="min-w-[180px]">
                        <Home size={18} className="mr-2" /> Back Home
                    </Button>
                </Link>
                <Link to="/product/himalaya-shilajit-resin">
                    <Button size="lg" variant="outline-dark" className="min-w-[180px]">
                        <ShoppingBag size={18} className="mr-2" /> View Products
                    </Button>
                </Link>
            </div>

            <div className="mt-12 max-w-md mx-auto relative">
                <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className="w-full p-4 pl-12 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-red"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
        </Reveal>
      </Container>
    </div>
  );
};
