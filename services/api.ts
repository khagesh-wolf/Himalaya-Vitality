
import { MAIN_PRODUCT, REVIEWS, MOCK_ORDERS, BLOG_POSTS } from '../constants';
import { Product, Review, Order, BlogPost, CartItem, Discount, Subscriber } from '../types';

// --- CONFIGURATION ---

// Helper to safely access environment variables
const getEnv = (key: string): string | undefined => {
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
            return (import.meta as any).env[key];
        }
    } catch { /* ignore */ }
    return undefined;
};

// Determine Mock Mode
const USE_MOCK = getEnv('VITE_USE_MOCK') === 'true';
const API_URL = getEnv('VITE_API_URL') || ''; 

console.log(`[System] Running in ${USE_MOCK ? 'MOCK' : 'LIVE'} mode. Endpoint: ${API_URL || 'Same Origin'}`);

// --- Generic Fetch Wrapper ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (USE_MOCK) {
        return mockAdapter(endpoint, options) as Promise<T>;
    }

    try {
        let fullPath = `${API_URL}${endpoint}`;
        if (!API_URL && !endpoint.startsWith('/api') && !endpoint.startsWith('http')) {
             fullPath = `/api${endpoint}`;
        }

        const response = await fetch(fullPath, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Network response was not ok' }));
            throw new Error(error.message || `API Error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

// --- Mock Adapter (Simulates Backend Logic) ---
async function mockAdapter(endpoint: string, options: RequestInit): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate Network delay

    if (endpoint.startsWith('/products/')) return MAIN_PRODUCT;
    if (endpoint === '/reviews') return REVIEWS;
    if (endpoint === '/orders') return { success: true, orderId: `HV-${Math.floor(Math.random() * 10000)}` };
    if (endpoint === '/create-payment-intent') return { clientSecret: 'pi_mock_secret' };
    if (endpoint === '/blog') return BLOG_POSTS;
    
    // Mock Admin Routes
    if (endpoint === '/admin/orders') return MOCK_ORDERS;
    if (endpoint === '/admin/stats') return { totalRevenue: 15200, totalOrders: 142, avgOrderValue: 107 };
    if (endpoint === '/admin/discounts') return [];
    if (endpoint === '/admin/subscribers') return [];
    if (endpoint === '/admin/reviews') return REVIEWS;

    return null;
}

// --- Public API Services ---

export const fetchProduct = (id: string) => apiFetch<Product>(`/products/${id}`);
export const fetchReviews = () => apiFetch<Review[]>('/reviews');
export const fetchBlogPosts = () => apiFetch<BlogPost[]>('/blog');

// --- Checkout Services ---

export const createPaymentIntent = (items: CartItem[], currency: string) => {
    return apiFetch<{ clientSecret: string }>('/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ items, currency })
    });
};

export const createOrder = (orderData: any) => {
    return apiFetch<{ success: boolean, orderId: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
};

export const subscribeNewsletter = (email: string, source: string) => {
    return apiFetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source })
    });
};

// --- Admin Services ---

export const fetchAdminStats = () => apiFetch<{ totalRevenue: number, totalOrders: number, avgOrderValue: number }>('/admin/stats');

export const fetchAdminOrders = () => apiFetch<Order[]>('/admin/orders');

export const updateOrderStatus = (id: string, status: string) => 
    apiFetch<Order>(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });

export const updateProduct = (id: string, data: any) => 
    apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchDiscounts = () => apiFetch<Discount[]>('/admin/discounts');

export const createDiscount = (data: Partial<Discount>) => 
    apiFetch<Discount>('/admin/discounts', { method: 'POST', body: JSON.stringify(data) });

export const deleteDiscount = (id: string) => 
    apiFetch(`/admin/discounts/${id}`, { method: 'DELETE' });

export const fetchAdminReviews = () => apiFetch<Review[]>('/admin/reviews');

export const updateReviewStatus = (id: string, status: string) => 
    apiFetch<Review>(`/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });

export const deleteReview = (id: string) => 
    apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });

export const fetchSubscribers = () => apiFetch<Subscriber[]>('/admin/subscribers');

export interface InventoryLog {
  id: string;
  sku: string;
  action: 'RESTOCK' | 'SALE' | 'ADJUSTMENT';
  quantity: number;
  date: string;
  user: string;
}

export const fetchInventoryLogs = () => apiFetch<InventoryLog[]>('/admin/inventory-logs');
