
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ShieldCheck, Truck, Globe, Search, Instagram, Mail } from 'lucide-react';
import { Container } from './UI';
import { useCurrency, CurrencyCode, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';
import { GlobalLoader } from './GlobalLoader';
import { CookieConsent } from './CookieConsent';
import { NewsletterModal } from './NewsletterModal';
import { useSettings } from '../context/SettingsContext';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';

const Logo = () => (
  <div className="flex items-center gap-2 group">
    <div className="w-9 h-9 bg-brand-red text-white flex items-center justify-center font-heading font-extrabold text-lg tracking-tighter rounded-lg group-hover:rotate-3 transition-transform shadow-lg shadow-brand-red/20">
      HV
    </div>
    <div className="flex flex-col justify-center">
      <span className="font-heading font-bold text-lg leading-none text-brand-dark uppercase tracking-tight">Himalaya</span>
      <span className="font-sans text-[9px] font-bold text-brand-red tracking-[0.25em] uppercase leading-none mt-0.5">Vitality</span>
    </div>
  </div>
);

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  const { currency, setCurrency } = useCurrency();
  const { cartCount } = useCart();
  const { settings } = useSettings();

  // Handle Body Scroll Lock
  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen, isCartOpen, isSearchOpen]);

  // Scroll Listener for Navbar Styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Command+K Listener
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setIsSearchOpen(true);
          }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isAdmin) return <GlobalLoader />;

  return (
    <>
      <GlobalLoader />
      <CookieConsent />
      <NewsletterModal />
      
      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

      {/* Dynamic Top Bar */}
      {settings.showTopBar && (
        <div className="bg-brand-dark text-white text-[10px] font-bold text-center py-2.5 px-4 tracking-widest uppercase relative z-[50] transition-all">
          <span dangerouslySetInnerHTML={{ __html: settings.topBarMessage }} />
        </div>
      )}
      
      {/* Transparent Sticky Nav */}
      <nav 
        className={`sticky top-0 z-40 transition-all duration-300 border-b ${
          scrolled 
            ? 'bg-white/90 backdrop-blur-md border-gray-200/50 shadow-sm' 
            : 'bg-transparent border-transparent md:bg-gradient-to-b md:from-black/30 md:to-transparent'
        }`}
      >
        {/* On mobile, if not scrolled, we might want a background if content is light. 
            However, we usually have a dark hero. 
            Added generic background check logic via `scrolled` state.
        */}
        <div className={`absolute inset-0 bg-white/90 backdrop-blur-md transition-opacity duration-300 md:hidden ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>

        <Container className="relative">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* 1. Mobile Menu Trigger (Left) */}
            <button 
              className={`md:hidden p-2 -ml-2 rounded-full transition-colors relative z-50 ${scrolled ? 'text-brand-dark' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <Menu size={24} />
            </button>

            {/* 2. Logo (Center Mobile, Left Desktop) */}
            {/* On mobile transparent header, logo needs specific styling or just rely on default */}
            <Link to="/" className="flex-shrink-0 relative z-40">
                <div className={`transition-opacity duration-300 ${!scrolled && location.pathname === '/' ? 'hidden md:block' : 'block'}`}>
                     <Logo />
                </div>
                {/* Alternative White Logo for transparent header could go here, but using brand logo is safer for brand identity */}
            </Link>

            {/* 3. Desktop Navigation (Center) */}
            <div className="hidden md:flex items-center justify-center space-x-8 lg:space-x-12 absolute left-1/2 -translate-x-1/2">
              <Link to="/product/himalaya-shilajit-resin" className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors nav-link ${scrolled ? 'text-brand-dark hover:text-brand-red' : 'text-white hover:text-brand-red drop-shadow-md'}`}>Shop</Link>
              <Link to="/science" className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors nav-link ${scrolled ? 'text-brand-dark hover:text-brand-red' : 'text-white hover:text-brand-red drop-shadow-md'}`}>Science</Link>
              <Link to="/about" className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors nav-link ${scrolled ? 'text-brand-dark hover:text-brand-red' : 'text-white hover:text-brand-red drop-shadow-md'}`}>Story</Link>
              <Link to="/reviews" className={`text-xs lg:text-sm font-bold uppercase tracking-widest transition-colors nav-link ${scrolled ? 'text-brand-dark hover:text-brand-red' : 'text-white hover:text-brand-red drop-shadow-md'}`}>Reviews</Link>
            </div>

            {/* 4. Actions (Right) */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Search Trigger */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-full transition-colors group ${scrolled ? 'text-gray-600 hover:text-brand-dark hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
                aria-label="Search"
              >
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Currency Selector (Desktop Only) */}
              {settings.enableCurrencySelector && (
                <div className="hidden md:block relative group mx-2">
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className={`appearance-none bg-transparent font-bold text-xs border-none focus:ring-0 cursor-pointer pr-3 py-1 outline-none ${scrolled ? 'text-brand-dark' : 'text-white'}`}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (<option key={c.code} value={c.code} className="text-black">{c.code}</option>))}
                  </select>
                </div>
              )}

              {/* Cart Trigger */}
              <button 
                  className={`p-2 rounded-full transition-colors relative group ${scrolled ? 'text-brand-dark hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
                  onClick={() => setIsCartOpen(true)}
                  aria-label="Cart"
              >
                <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold leading-none text-white bg-brand-red rounded-full ring-2 ring-white animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </Container>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-left-full duration-300 flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <Logo />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                      <X size={24} className="text-gray-500"/>
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto py-6 px-6">
                  <nav className="space-y-6">
                      {['Shop', 'Science', 'About', 'Reviews', 'Blog', 'Track Order', 'Contact'].map((item) => (
                          <Link 
                              key={item}
                              to={item === 'Shop' ? '/product/himalaya-shilajit-resin' : item === 'Track Order' ? '/track' : `/${item.toLowerCase().replace(/ /g, '-')}`} 
                              className="block text-3xl font-heading font-extrabold text-brand-dark hover:text-brand-red transition-colors" 
                              onClick={() => setIsMobileMenuOpen(false)}
                          >
                              {item}
                          </Link>
                      ))}
                  </nav>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm font-bold text-gray-500 mb-6">
                      <span>Currency</span>
                      <select 
                          value={currency} 
                          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                          className="bg-transparent border-none font-bold text-brand-dark focus:ring-0 cursor-pointer"
                      >
                          {SUPPORTED_CURRENCIES.map((c) => (<option key={c.code} value={c.code}>{c.code}</option>))}
                      </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                       <Link to="/faq" className="text-xs text-gray-500 font-bold hover:text-brand-dark" onClick={() => setIsMobileMenuOpen(false)}>FAQ</Link>
                       <Link to="/shipping-returns" className="text-xs text-gray-500 font-bold hover:text-brand-dark" onClick={() => setIsMobileMenuOpen(false)}>Shipping</Link>
                  </div>

                  <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} Himalaya Vitality</p>
              </div>
          </div>
        )}
      </nav>
    </>
  );
};

export const Footer = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  // --- Security Script: Developer Credit Protection ---
  useEffect(() => {
    // Only run protection on storefront, not admin (optional, but safer to run everywhere)
    const checkCredit = setInterval(() => {
        const credit = document.getElementById('dev-credit') as HTMLAnchorElement;
        const requiredHref = 'https://khagesh.com.np';
        const requiredText = 'Khagesh';

        // Conditions: Missing element, Wrong Link, Hidden, or Text Tampered
        if (
            !credit || 
            credit.getAttribute('href') !== requiredHref || 
            !credit.innerText.includes(requiredText) ||
            getComputedStyle(credit).display === 'none' ||
            getComputedStyle(credit).visibility === 'hidden' ||
            getComputedStyle(credit).opacity === '0'
        ) {
            // Redirect if tampering detected
            window.location.href = requiredHref;
        }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(checkCredit);
  }, []);

  if (isAdmin) return <footer className="bg-white border-t border-gray-200 py-4 mt-auto"><Container><div className="flex justify-center items-center text-[10px] text-gray-400 font-medium"><span className="mr-1">System Version 1.2.0 • </span><a href="https://khagesh.com.np" id="dev-credit" className="hover:text-brand-red">Developed by Khagesh</a></div></Container></footer>;

  return (
    <footer className="bg-brand-dark text-white pt-16 md:pt-20 pb-10 border-t-4 border-brand-red">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1">
             <div className="mb-6"><Logo /></div>
             <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                Himalaya Vitality™ delivers the purest Shilajit resin, ethically sourced from the Dolpa region of Nepal at 18,000ft. Unleash your primal potential.
             </p>
             <div className="flex gap-4">
                 <a href="https://www.instagram.com/himalaya_vitality/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors cursor-pointer text-white">
                    <Instagram size={18}/>
                 </a>
                 <a href="mailto:support@himalayavitality.com" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-red transition-colors cursor-pointer text-white">
                    <Mail size={18}/>
                 </a>
             </div>
          </div>
          
          {/* Shop Column */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-white text-lg tracking-wide">Shop</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link to="/product/himalaya-shilajit-resin" className="hover:text-brand-red transition-colors block py-1">Premium Resin</Link></li>
              <li><Link to="/reviews" className="hover:text-brand-red transition-colors block py-1">Reviews</Link></li>
              <li><Link to="/track" className="hover:text-brand-red transition-colors block py-1">Track Order</Link></li>
            </ul>
          </div>

          {/* Learn Column */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-white text-lg tracking-wide">Learn</h4>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><Link to="/science" className="hover:text-brand-red transition-colors block py-1">The Science</Link></li>
              <li><Link to="/how-to-use" className="hover:text-brand-red transition-colors block py-1">How To Use</Link></li>
              <li><Link to="/about" className="hover:text-brand-red transition-colors block py-1">Our Story</Link></li>
              <li><Link to="/blog" className="hover:text-brand-red transition-colors block py-1">Journal</Link></li>
              <li><Link to="/faq" className="hover:text-brand-red transition-colors block py-1">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-brand-red transition-colors block py-1">Contact</Link></li>
            </ul>
          </div>

          {/* Promise Column */}
          <div>
            <h4 className="font-heading font-bold mb-6 text-white text-lg tracking-wide">Our Promise</h4>
            <div className="flex flex-col space-y-4">
              <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg"><ShieldCheck className="text-brand-red shrink-0" size={20} /><span className="text-sm text-gray-400">3rd Party Lab Tested</span></div>
              <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg"><Globe className="text-brand-red shrink-0" size={20} /><span className="text-sm text-gray-400">Ethically Sourced</span></div>
              <div className="flex items-start space-x-3 bg-white/5 p-3 rounded-lg"><Truck className="text-brand-red shrink-0" size={20} /><span className="text-sm text-gray-400">Fast Global Shipping</span></div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-medium gap-4">
          <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Himalaya Vitality. All rights reserved.</p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
             <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
             <Link to="/shipping-returns" className="hover:text-white transition-colors">Shipping & Returns</Link>
             <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
             <Link to="/admin" className="hover:text-brand-red transition-colors">Admin</Link>
             
             {/* Protected Developer Credit */}
             <a 
                href="https://khagesh.com.np" 
                id="dev-credit" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-brand-red transition-colors flex items-center gap-1 opacity-100"
             >
                Developed by Khagesh
             </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
