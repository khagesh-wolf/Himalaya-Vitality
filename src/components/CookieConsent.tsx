
import React, { useState, useEffect } from 'react';
import { Button } from './UI';
import { Cookie } from 'lucide-react';

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = sessionStorage.getItem('himalaya_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem('himalaya_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    sessionStorage.setItem('himalaya_cookie_consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-4xl mx-auto bg-brand-dark/95 backdrop-blur-md text-white p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="bg-white/10 p-2 rounded-lg shrink-0 hidden md:block">
            <Cookie className="text-brand-red" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm mb-1">We value your privacy</h4>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. 
              By clicking "Accept", you agree to our use of cookies.
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1 md:flex-none border-gray-600 hover:bg-gray-800 text-xs text-white"
            onClick={handleDecline}
          >
            Decline
          </Button>
          <Button 
            size="sm" 
            className="flex-1 md:flex-none bg-white text-brand-dark hover:bg-gray-100 text-xs shadow-none border-0"
            onClick={handleAccept}
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};
