
export enum BundleType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE'
}

export interface ProductVariant {
  id: string;
  type: BundleType;
  name: string;
  price: number;
  compareAtPrice: number;
  label: string;
  savings: string;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  features: string[];
  variants: ProductVariant[];
  images: string[];
}

export interface CartItem {
  variantId: string;
  productTitle: string;
  variantName: string;
  price: number;
  quantity: number;
  image: string;
  bundleType: BundleType;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  tags?: string[]; // Added tags support
  status?: 'Approved' | 'Hidden' | 'Pending' | 'Spam';
}

export interface Order {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  date: string;
  total: number;
  status: 'Pending' | 'Paid' | 'Fulfilled' | 'Delivered';
  items: number;
}

export interface Discount {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiresAt: string;
  active: boolean;
}

export interface Subscriber {
  id: string;
  email: string;
  date: string;
  source: string;
}

export interface SEOData {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

export interface RegionConfig {
  id: string;
  code: string;
  name: string;
  shippingCost: number;
  taxRate: number;
  eta: string;
}
