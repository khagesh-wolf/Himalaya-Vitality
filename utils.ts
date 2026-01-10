
import { RegionConfig } from './types';

export const DEFAULT_REGIONS: RegionConfig[] = [
  { id: 'us', code: 'US', name: 'United States', shippingCost: 9.95, taxRate: 7.25, eta: '2-4 Business Days' },
  { id: 'gb', code: 'GB', name: 'United Kingdom', shippingCost: 12.95, taxRate: 20, eta: '4-8 Business Days' },
  { id: 'ca', code: 'CA', name: 'Canada', shippingCost: 14.95, taxRate: 13, eta: '6-12 Business Days' },
  { id: 'au', code: 'AU', name: 'Australia', shippingCost: 16.95, taxRate: 10, eta: '7-14 Business Days' },
  { id: 'de', code: 'DE', name: 'Germany', shippingCost: 12.95, taxRate: 19, eta: '4-8 Business Days' },
  { id: 'other', code: 'OTHER', name: 'Rest of World', shippingCost: 19.95, taxRate: 0, eta: '10-21 Business Days' }
];

export const getDeliverableCountries = (): RegionConfig[] => {
  const stored = localStorage.getItem('himalaya_regions');
  return stored ? JSON.parse(stored) : DEFAULT_REGIONS;
};

export const saveDeliverableCountries = (regions: RegionConfig[]) => {
  localStorage.setItem('himalaya_regions', JSON.stringify(regions));
};

export const simulateShipping = (countryCode: string, subtotal: number, itemCount: number): Promise<{ cost: number, tax: number, eta: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const regions = getDeliverableCountries();
      const region = regions.find(r => r.code === countryCode) || regions.find(r => r.code === 'OTHER') || DEFAULT_REGIONS[0];
      
      let cost = region.shippingCost;
      let eta = region.eta;
      
      // Calculate Tax Amount
      const tax = subtotal * (region.taxRate / 100);

      // Business Logic: Free shipping ONLY if purchasing 3+ items
      if (itemCount >= 3) {
        cost = 0;
      }

      resolve({ cost, tax, eta });
    }, 600); // Simulate network delay
  });
};
