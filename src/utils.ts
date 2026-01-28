
import { RegionConfig } from './types';

// Updated for Australia operations
export const DEFAULT_REGIONS: RegionConfig[] = [
  { id: 'au', code: 'AU', name: 'Australia', shippingCost: 0, taxRate: 10, eta: '2-5 Business Days (AusPost)' },
  { id: 'nz', code: 'NZ', name: 'New Zealand', shippingCost: 14.95, taxRate: 15, eta: '5-10 Business Days' },
  { id: 'us', code: 'US', name: 'United States', shippingCost: 19.95, taxRate: 0, eta: '6-12 Business Days' },
  { id: 'gb', code: 'GB', name: 'United Kingdom', shippingCost: 24.95, taxRate: 20, eta: '7-14 Business Days' },
  { id: 'other', code: 'OTHER', name: 'Rest of World', shippingCost: 29.95, taxRate: 0, eta: '10-21 Business Days' }
];

export const getDeliverableCountries = (): RegionConfig[] => {
  return DEFAULT_REGIONS;
};

export const saveDeliverableCountries = (regions: RegionConfig[]) => {
  // No-op
};

export const calculateShipping = (
    regions: RegionConfig[], 
    countryCode: string, 
    subtotal: number, 
    itemCount: number
): { cost: number, tax: number, eta: string } => {
    const region = regions.find(r => r.code === countryCode) || regions.find(r => r.code === 'OTHER') || regions[0] || DEFAULT_REGIONS[0];
    
    let cost = region.shippingCost;
    let eta = region.eta;
    
    // Calculate Tax Amount
    const tax = subtotal * (region.taxRate / 100);

    // Business Logic: Free shipping ONLY if purchasing 2+ items OR if it's Australia
    if (itemCount >= 2 || region.code === 'AU') {
      cost = 0;
    }

    return { cost, tax, eta };
};

export const simulateShipping = (countryCode: string, subtotal: number, itemCount: number): Promise<{ cost: number, tax: number, eta: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const regions = getDeliverableCountries();
      resolve(calculateShipping(regions, countryCode, subtotal, itemCount));
    }, 300);
  });
};
