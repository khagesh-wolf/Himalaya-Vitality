import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export const SUPPORTED_CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'USD', label: 'USD ($)', symbol: '$' },
  { code: 'EUR', label: 'EUR (€)', symbol: '€' },
  { code: 'GBP', label: 'GBP (£)', symbol: '£' },
  { code: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { code: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
];

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (priceInUSD: number) => string;
  rates: Record<string, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const DEFAULT_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.52
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<Record<string, number>>(DEFAULT_RATES);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeCurrency = async () => {
      // 1. Fetch Live Rates (Non-blocking for UI, but important for accuracy)
      try {
        const rateResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (rateResponse.ok) {
           const rateData = await rateResponse.json();
           if (rateData && rateData.rates) {
             setRates(prev => ({ ...prev, ...rateData.rates }));
           }
        }
      } catch (error) {
        console.warn('Failed to fetch live exchange rates, using defaults.', error);
      }

      // 2. Check Local Storage
      const saved = localStorage.getItem('himalaya_currency') as CurrencyCode;
      const isValidSaved = saved && SUPPORTED_CURRENCIES.some(c => c.code === saved);
      
      if (isValidSaved) {
        setCurrency(saved);
        setIsInitialized(true);
        return;
      }

      // 3. Detect Currency via IP (only if no preference saved)
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (!ipResponse.ok) throw new Error('IP API limit or error');
        
        const ipData = await ipResponse.json();
        const country = ipData.country_code;
        const apiCurrency = ipData.currency;

        let detected: CurrencyCode = 'USD';

        // Map common countries to supported currencies
        const countryMap: Record<string, CurrencyCode> = {
          US: 'USD',
          GB: 'GBP',
          CA: 'CAD',
          AU: 'AUD',
          DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', IE: 'EUR'
        };

        if (countryMap[country]) {
          detected = countryMap[country];
        } else if (apiCurrency && SUPPORTED_CURRENCIES.some(c => c.code === apiCurrency)) {
          detected = apiCurrency as CurrencyCode;
        } else if (ipData.timezone) {
           // Fallback to timezone heuristics
           if (ipData.timezone.includes('Europe')) detected = 'EUR';
           else if (ipData.timezone.includes('Australia')) detected = 'AUD';
        }

        setCurrency(detected);
      } catch (error) {
        console.warn('IP-based currency detection failed, checking browser settings.');
        
        // 4. Fallback to Browser Settings
        try {
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timezone.includes('Europe')) setCurrency('EUR');
            else if (timezone.includes('London')) setCurrency('GBP');
            else if (timezone.includes('Australia')) setCurrency('AUD');
            else if (timezone.includes('Canada')) setCurrency('CAD');
        } catch (e) {
            // Final fallback is USD default
        }
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
        initializeCurrency();
    }
  }, [isInitialized]);

  const handleSetCurrency = (c: CurrencyCode) => {
    setCurrency(c);
    localStorage.setItem('himalaya_currency', c);
  };

  const formatPrice = (priceInUSD: number) => {
    const rate = rates[currency] || DEFAULT_RATES[currency] || 1;
    const converted = priceInUSD * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};