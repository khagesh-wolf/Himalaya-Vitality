
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS, MOCK_ORDERS } from '../constants';
import { User, Order, Product, Review, BlogPost, CartItem, Discount, Subscriber, InventoryLog } from '../types';

// Env Config
const envMock = (import.meta as any).env?.VITE_USE_MOCK;
const USE_MOCK = envMock !== 'false'; 
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

export const fetchProduct = (id: string) => Promise.resolve(MAIN_PRODUCT);
export const createReview = (data: Partial<Review>) => Promise.resolve({ success: true });
export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);
export const fetchUserOrders = () => Promise.resolve(MOCK_ORDERS);

export const createPaymentIntent = (items: CartItem[], currency: string) => 
    apiFetch<{ clientSecret: string; mockSecret?: string }>('/create-payment-intent', { 
        method: 'POST', 
        body: JSON.stringify({ items, currency }) 
    });

export const createOrder = (data: any) => 
    apiFetch<{ success: boolean, orderId: string }>('/orders', { 
        method: 'POST', 
        body: JSON.stringify(data) 
    });

// --- ADMIN SERVICES ---
export const fetchAdminStats = () => Promise.resolve({ totalRevenue: 45231.00, totalOrders: 342, avgOrderValue: 132.25 });
export const fetchAdminOrders = () => Promise.resolve(MOCK_ORDERS);
export const updateOrderStatus = (id: string, status: string) => Promise.resolve({ success: true });
export const updateProduct = (id: string, data: any) => Promise.resolve({ success: true });
export const fetchDiscounts = () => Promise.resolve([]);
export const createDiscount = (data: any) => Promise.resolve({ success: true });
export const deleteDiscount = (id: string) => Promise.resolve({ success: true });
export const fetchAdminReviews = () => Promise.resolve(REVIEWS);
export const updateReviewStatus = (id: string, status: string) => Promise.resolve({ success: true });
export const deleteReview = (id: string) => Promise.resolve({ success: true });
export const fetchSubscribers = () => Promise.resolve([]);
export const fetchInventoryLogs = () => Promise.resolve([]);
