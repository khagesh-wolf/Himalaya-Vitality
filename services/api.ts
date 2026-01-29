
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS, MOCK_ORDERS } from '../constants';
import { User, Order, Product, Review, BlogPost, CartItem, Discount, Subscriber, InventoryLog, RegionConfig } from '../types';

// Env Config
const envMock = (import.meta as any).env?.VITE_USE_MOCK;
const USE_MOCK = envMock === 'true'; 
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// --- API FETCH WRAPPER ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('hv_token');
    
    // Construct query parameters if provided
    let url = `${API_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {}),
    };

    if (USE_MOCK) return mockAdapter(endpoint, options) as Promise<T>;

    try {
        const res = await fetch(url, { ...options, headers });
        const contentType = res.headers.get("content-type");
        
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            if (!res.ok) throw new Error(`Server Error: ${res.statusText || 'Unknown Error'}`);
            data = text;
        }

        if (!res.ok) {
            if (res.status === 403 && data.requiresVerification) {
                throw { message: data.message, requiresVerification: true, email: data.email };
            }
            throw new Error(data.message || data.error || 'API Error');
        }
        return data as T;
    } catch (error: any) {
        if (error.requiresVerification) throw error;
        console.error("Fetch error:", error);
        throw new Error(error.message || "Network request failed");
    }
}

// --- MOCK ADAPTER ---
async function mockAdapter(endpoint: string, options: any) {
    console.log(`[Mock API] ${options?.method || 'GET'} ${endpoint}`);
    await new Promise(r => setTimeout(r, 300)); 

    if (endpoint === '/auth/login') return { token: 'mock_jwt', user: { id: 'u1', name: 'Admin', email: 'admin@himalaya.com', role: 'ADMIN' } };
    if (endpoint === '/auth/me') return { id: 'u1', name: 'Admin', email: 'admin@himalaya.com', role: 'ADMIN' };
    if (endpoint === '/shipping-regions') return [
        { id: 'au', code: 'AU', name: 'Australia', shippingCost: 0, taxRate: 10, eta: '2-5 Business Days (AusPost)', active: true },
        { id: 'nz', code: 'NZ', name: 'New Zealand', shippingCost: 14.95, taxRate: 15, eta: '5-10 Business Days', active: true },
        { id: 'us', code: 'US', name: 'United States', shippingCost: 19.95, taxRate: 0, eta: '6-12 Business Days', active: true },
        { id: 'gb', code: 'GB', name: 'United Kingdom', shippingCost: 24.95, taxRate: 20, eta: '7-14 Business Days', active: true },
    ];
    
    // Default Fallback
    return {};
}

// --- AUTH SERVICES ---
export const loginUser = (data: any) => apiFetch<{ token: string, user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const signupUser = (data: any) => apiFetch<{ token?: string, user?: User, requiresVerification?: boolean, email?: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const verifyEmail = (email: string, otp: string) => apiFetch<{ token: string, user: User }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) });
export const sendForgotPassword = (email: string) => apiFetch<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const resetPassword = (data: any) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });
export const googleAuthenticate = (token: string) => apiFetch<{ token: string, user: User }>('/auth/google', { method: 'POST', body: JSON.stringify({ token }) });
export const fetchCurrentUser = () => apiFetch<User>('/auth/me');
export const updateUserProfile = (data: Partial<User>) => apiFetch<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

// --- DATA SERVICES ---
// FORCE RETURN REVIEWS CONSTANT
export const fetchReviews = () => Promise.resolve(REVIEWS);

// Fetch product from DB now
export const fetchProduct = (id: string) => apiFetch<Product>(`/products/${id}`);

export const createReview = (data: Partial<Review>) => Promise.resolve({ success: true });
export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);
export const fetchUserOrders = () => apiFetch<Order[]>('/orders/my-orders');

export const createPaymentIntent = (items: CartItem[], currency: string, total?: number) => 
    apiFetch<{ clientSecret: string; mockSecret?: string }>('/create-payment-intent', { 
        method: 'POST', 
        body: JSON.stringify({ items, currency, total }) 
    });

export const createOrder = (data: any) => 
    apiFetch<{ success: boolean, orderId: string }>('/orders', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });

// --- SHIPPING REGIONS ---
export const fetchShippingRegions = () => apiFetch<RegionConfig[]>('/shipping-regions');
export const createShippingRegion = (data: Partial<RegionConfig>) => apiFetch<RegionConfig>('/shipping-regions', { method: 'POST', body: JSON.stringify(data) });
export const updateShippingRegion = (id: string, data: Partial<RegionConfig>) => apiFetch<RegionConfig>(`/shipping-regions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteShippingRegion = (id: string) => apiFetch<{ success: boolean }>(`/shipping-regions/${id}`, { method: 'DELETE' });

// --- SUBSCRIBERS ---
export const subscribeToNewsletter = (email: string, source: string = 'Website') => apiFetch<{ success: boolean, subscriber: Subscriber }>('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email, source }) });
export const fetchSubscribers = () => apiFetch<Subscriber[]>('/admin/subscribers');
export const sendAdminNewsletter = (subject: string, message: string) => apiFetch<{ success: boolean, sent: number }>('/admin/newsletter/send', { method: 'POST', body: JSON.stringify({ subject, message }) });

// --- ADMIN SERVICES ---
// Updated to accept date filters
export const fetchAdminStats = (startDate?: Date, endDate?: Date) => {
    let query = '';
    if (startDate && endDate) {
        query = `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    }
    return apiFetch<any>(`/admin/stats${query}`);
};

export const fetchAdminOrders = () => apiFetch<Order[]>('/admin/orders');

export const updateOrderStatus = (id: string, status: string) => 
    apiFetch<{ success: boolean }>(`/admin/orders/${id}/status`, { 
        method: 'PUT', 
        body: JSON.stringify({ status }) 
    });

export const updateOrderTracking = (id: string, data: { trackingNumber: string, carrier: string, notify: boolean }) => 
    apiFetch<{ success: boolean }>(`/admin/orders/${id}/tracking`, { 
        method: 'PUT', 
        body: JSON.stringify(data) 
    });

export const updateProduct = (id: string, data: any) => apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const fetchDiscounts = () => apiFetch<Discount[]>('/discounts');
export const createDiscount = (data: any) => apiFetch<Discount>('/discounts', { method: 'POST', body: JSON.stringify(data) });
export const deleteDiscount = (id: string) => apiFetch<{ success: boolean }>(`/discounts/${id}`, { method: 'DELETE' });
export const validateDiscount = (code: string) => apiFetch<{ code: string, amount: number, type: 'PERCENTAGE'|'FIXED' }>('/discounts/validate', { method: 'POST', body: JSON.stringify({ code }) });

export const fetchAdminReviews = () => Promise.resolve(REVIEWS);
export const updateReviewStatus = (id: string, status: string) => Promise.resolve({ success: true });
export const deleteReview = (id: string) => Promise.resolve({ success: true });
export const fetchInventoryLogs = () => Promise.resolve([]);