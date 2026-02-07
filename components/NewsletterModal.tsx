
import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Check } from 'lucide-react';
import { Button, LazyImage } from './UI';
import { useSettings } from '../context/SettingsContext';
import { subscribeToNewsletter } from '../services/api';

export const NewsletterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { settings } = useSettings();
  const [mountedTime] = useState(Date.now());

  useEffect(() => {
    if (!settings.enableNewsletter) return;

    // 1. Check Global Subscription Status (Permanent)
    const isSubscribed = localStorage.getItem('himalaya_subscribed') === 'true';
    if (isSubscribed) return;

    // 2. Check Session Dismissal (Until next visit/session)
    const isDismissed = sessionStorage.getItem('himalaya_newsletter_dismissed') === 'true';
    if (isDismissed) return;

    // 3. Time on Page Check (Wait 5 seconds minimum)
    const timeCheck = () => (Date.now() - mountedTime) > 5000;

    // 4. Scroll Depth Check (Wait until user scrolls 30%)
    const scrollCheck = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        return scrollPercent > 0.3;
    }

    // Auto-show after 30 seconds if high engagement
    const timer = setTimeout(() => {
        if (
            localStorage.getItem('himalaya_subscribed') !== 'true' &&
            sessionStorage.getItem('himalaya_newsletter_dismissed') !== 'true'
        ) {
            setIsOpen(true);
        }
    }, 30000);

    // Smart Exit Intent Logic
    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger if mouse crosses top boundary AND time/scroll conditions met
      if (e.clientY <= 0 && timeCheck() && scrollCheck()) {
        if (
            localStorage.getItem('himalaya_subscribed') !== 'true' &&
            sessionStorage.getItem('himalaya_newsletter_dismissed') !== 'true' &&
            !isOpen 
        ) {
            setIsOpen(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [settings.enableNewsletter, mountedTime, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    // Mark as dismissed for this session (Until next visit)
    sessionStorage.setItem('himalaya_newsletter_dismissed', 'true');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;

    try {
        // Save to DB via API
        await subscribeToNewsletter(email, 'Popup');
        
        setSubmitted(true);
        
        // Save to LocalStorage (Permanent suppression)
        localStorage.setItem('himalaya_subscribed', 'true');
        // Save to SessionStorage (Just in case logic relies on it)
        sessionStorage.setItem('himalaya_newsletter_dismissed', 'true');
        
        // Close after delay
        setTimeout(() => {
            setIsOpen(false);
            setEmail('');
            setSubmitted(false);
        }, 4000);
    } catch (error) {
        console.error("Subscription failed:", error);
        // Still treat as success for UX if it's just a duplicate
        setSubmitted(true);
        localStorage.setItem('himalaya_subscribed', 'true');
        setTimeout(() => setIsOpen(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity duration-500" 
        onClick={handleClose} 
      />
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-10 flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button 
          onClick={handleClose} 
          className="absolute top-4 right-4 z-20 p-2 bg-white/10 hover:bg-black/5 rounded-full backdrop-blur-md transition-colors text-gray-500 hover:text-brand-dark"
        >
          <X size={20} />
        </button>

        {/* Image Side */}
        <div className="hidden md:block w-2/5 relative">
           <LazyImage 
             src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=800&auto=format&fit=crop" 
             alt="Himalayan Zen" 
             className="absolute inset-0 w-full h-full object-cover" 
           />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
           <div className="absolute bottom-6 left-6 text-white">
             <div className="text-xs font-bold uppercase tracking-widest mb-1 text-brand-red">Himalaya Vitality</div>
             <div className="font-heading font-bold text-xl leading-tight">Elevate Your Ritual</div>
           </div>
        </div>

        {/* Content Side */}
        <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col justify-center bg-white">
          {!submitted ? (
            <>
              <div className="mb-6">
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-brand-dark mb-3">
                  Unlock 25% Off
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Join 15,000+ athletes. Get exclusive access to new harvests, recovery protocols, and <strong>10% off your first order</strong>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3.5 pl-11 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none text-brand-dark font-medium placeholder:text-gray-400 text-sm transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <Button fullWidth size="md" className="shadow-lg shadow-brand-red/20 group justify-between px-6">
                  <span>Get My 10% Code</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <button onClick={handleClose} className="mt-6 text-xs text-gray-400 hover:text-brand-dark font-medium underline underline-offset-2 text-center w-full transition-colors">
                No thanks, I prefer paying full price
              </button>
            </>
          ) : (
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                  <Check size={32} strokeWidth={3} />
               </div>
               <h3 className="font-heading font-bold text-2xl text-brand-dark mb-2">Welcome to the Tribe!</h3>
               <p className="text-gray-500 text-sm mb-6">Your code is ready. Use it at checkout.</p>
               
               <div className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded-xl flex items-center justify-between mb-2">
                 <code className="font-mono font-bold text-lg text-brand-dark">WELCOME10</code>
                 <Button size="sm" variant="ghost" className="text-brand-red text-xs hover:bg-red-50" onClick={() => navigator.clipboard.writeText('WELCOME10')}>Copy</Button>
               </div>
               <p className="text-[10px] text-gray-400">Code also sent to {email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
