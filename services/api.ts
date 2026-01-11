import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS, MOCK_ORDERS } from '../constants';
import { User, Order, Product, Review, BlogPost, CartItem, Discount, Subscriber, InventoryLog } from '../types';

// Env Config
const USE_MOCK = (import.meta as any).env?.VITE_USE_MOCK === 'true';
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

// --- API FETCH WRAPPER ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('hv_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (USE_MOCK) return mockAdapter(endpoint, options) as Promise<T>;

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    
    if (!res.ok) {
        // Pass special verification flags for UI handling
        if (res.status === 403 && data.requiresVerification) {
            throw { message: data.message, requiresVerification: true, email: data.email };
        }
        throw new Error(data.message || data.error || 'API Error');
    }
    return data;
}

// --- MOCK ADAPTER (Fallback) ---
// Simplified mock logic for development without backend
async function mockAdapter(endpoint: string, options: any) {
    await new Promise(r => setTimeout(r, 500));
    if (endpoint === '/auth/login') return { token: 'mock', user: { id: '1', name: 'Demo User', role: 'CUSTOMER' } };
    if (endpoint.startsWith('/products')) return MAIN_PRODUCT;
    if (endpoint === '/auth/me') return { id: '1', name: 'Demo User', email: 'demo@example.com', role: 'CUSTOMER' };
    return {};
}

// --- AUTH SERVICES ---
export const loginUser = (data: any) => apiFetch<{ token: string, user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const signupUser = (data: any) => apiFetch<{ token?: string, user?: User, requiresVerification?: boolean, email?: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });

export const verifyEmail = (email: string, otp: string) => apiFetch<{ token: string, user: User }>('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) });

export const sendForgotPassword = (email: string) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (data: any) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

export const googleAuthenticate = (token: string) => apiFetch<{ token: string, user: User }>('/auth/google', { method: 'POST', body: JSON.stringify({ token }) });

export const fetchCurrentUser = () => apiFetch<User>('/auth/me');

export const updateUserProfile = (data: Partial<User>) => apiFetch<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });

// --- DATA SERVICES ---
export const fetchProduct = (id: string) => apiFetch<Product>(`/products/${id}`);

export const fetchReviews = () => apiFetch<Review[]>('/reviews');

export const fetchBlogPosts = () => apiFetch<BlogPost[]>('/blog');

export const fetchUserOrders = () => apiFetch<Order[]>('/orders/my-orders');

export const createPaymentIntent = (items: CartItem[], currency: string) => apiFetch<{ clientSecret: string }>('/create-payment-intent', { method: 'POST', body: JSON.stringify({ items, currency }) });

export const createOrder = (data: any) => apiFetch<{ success: boolean, orderId: string }>('/orders', { method: 'POST', body: JSON.stringify(data) });

// --- ADMIN SERVICES ---
export const fetchAdminStats = () => apiFetch('/admin/stats');
export const fetchAdminOrders = () => apiFetch<Order[]>('/admin/orders');
export const updateOrderStatus = (id: string, status: string) => apiFetch(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const updateProduct = (id: string, data: any) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const fetchDiscounts = () => apiFetch<Discount[]>('/admin/discounts');
export const createDiscount = (data: any) => apiFetch('/admin/discounts', { method: 'POST', body: JSON.stringify(data) });
export const deleteDiscount = (id: string) => apiFetch(`/admin/discounts/${id}`, { method: 'DELETE' });
export const fetchAdminReviews = () => apiFetch<Review[]>('/admin/reviews');
export const updateReviewStatus = (id: string, status: string) => apiFetch(`/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteReview = (id: string) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
export const fetchSubscribers = () => apiFetch<Subscriber[]>('/admin/subscribers');
export const fetchInventoryLogs = () => apiFetch<InventoryLog[]>('/admin/inventory-logs');