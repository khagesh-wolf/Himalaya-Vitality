
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

    try {
        const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        const contentType = res.headers.get("content-type");
        
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            if (!res.ok) throw new Error(`Server Error: ${res.statusText}`);
            data = text;
        }

        if (!res.ok) {
            // Special auth handling
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
    await new Promise(r => setTimeout(r, 500));
    if (endpoint === '/auth/login') return { token: 'mock', user: { id: '1', name: 'Demo User', role: 'CUSTOMER' } };
    if (endpoint.startsWith('/products')) return MAIN_PRODUCT;
    if (endpoint === '/create-payment-intent') return { clientSecret: 'pi_mock_secret_123' };
    if (endpoint === '/orders') return { success: true, orderId: 'HV-MOCK-123' };
    if (endpoint === '/reviews' && options.method === 'POST') return { success: true };
    if (endpoint === '/reviews') return REVIEWS;
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
export const fetchProduct = (id: string) => apiFetch<Product>(`/products/${id}`);
export const fetchReviews = () => apiFetch<Review[]>('/reviews');
export const createReview = (data: Partial<Review>) => apiFetch<{ success: true }>('/reviews', { method: 'POST', body: JSON.stringify(data) });
export const fetchBlogPosts = () => apiFetch<BlogPost[]>('/blog');
export const fetchUserOrders = () => apiFetch<Order[]>('/orders/my-orders');

export const createPaymentIntent = (items: CartItem[], currency: string) => 
    apiFetch<{ clientSecret: string; mockSecret?: string }>('/create-payment-intent', { 
        method: 'POST', 
        body: JSON.stringify({ items, currency }) 
    });

// Updated to include userId
export const createOrder = (data: { customer: any, items: CartItem[], total: number, paymentId: string, userId?: string }) => 
    apiFetch<{ success: boolean, orderId: string }>('/orders', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });

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
