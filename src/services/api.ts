
import { Product, Review, Order, CartItem, RegionConfig, User, Subscriber, InventoryLog } from '../types';
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS } from '../constants';
import { DEFAULT_REGIONS } from '../utils';

// Base URL for Vercel Serverless Functions
// In development, vite proxy handles '/api' -> 'http://localhost:3000/api'
// In production, it points to the relative path '/api'
const API_BASE = '/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('hv_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const handleResponse = async (res: Response) => {
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || data.error || 'API Error');
        (error as any).requiresVerification = data.requiresVerification;
        (error as any).email = data.email;
        throw error;
    }
    return data;
};

// --- PRODUCTS ---
export const fetchProduct = async (id: string): Promise<Product> => {
    try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        return await res.json();
    } catch (e) {
        console.warn("API unavailable, falling back to static product data");
        return MAIN_PRODUCT;
    }
};

export const updateProduct = async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// --- AUTHENTICATION ---
export const loginUser = async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const signupUser = async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const verifyEmail = async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return handleResponse(res);
};

export const fetchCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const updateUserProfile = async (data: Partial<User>) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const googleAuthenticate = async (token: string) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    return handleResponse(res);
};

export const sendForgotPassword = async (email: string) => {
    // Implement endpoint in backend if needed, mock for now or throw
    return { message: 'If account exists, email sent.' };
};

export const resetPassword = async (data: any) => {
    return { success: true };
};

// --- ORDERS ---
export const createOrder = async (data: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchAdminOrders = async () => {
    const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
};

export const updateOrderTracking = async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/admin/orders/${id}/tracking`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const trackOrder = async (orderId: string) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/track`);
    return handleResponse(res);
};

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
    });
    return handleResponse(res);
};

// --- REVIEWS ---
export const fetchReviews = async (): Promise<Review[]> => {
    // Fallback to static if backend endpoint not ready
    return REVIEWS; 
};

export const createReview = async (data: Partial<Review>) => {
    // Placeholder for backend implementation
    return { success: true };
};

// --- ADMIN STATS ---
export const fetchAdminStats = async (startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const res = await fetch(`${API_BASE}/admin/stats?${params.toString()}`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchInventoryLogs = async () => {
    // Mock for now, requires backend table
    return [] as InventoryLog[];
};

// --- NEWSLETTER ---
export const subscribeToNewsletter = async (email: string, source: string) => {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
    });
    return handleResponse(res);
};

export const fetchSubscribers = async () => {
    const res = await fetch(`${API_BASE}/admin/subscribers`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const sendAdminNewsletter = async (subject: string, message: string) => {
    const res = await fetch(`${API_BASE}/admin/newsletter/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subject, message })
    });
    return handleResponse(res);
};

// --- SHIPPING & DISCOUNTS ---
export const fetchShippingRegions = async () => {
    try {
        const res = await fetch(`${API_BASE}/shipping-regions`);
        if(!res.ok) throw new Error();
        return await res.json();
    } catch {
        return DEFAULT_REGIONS;
    }
};

export const createShippingRegion = async (data: any) => {
    const res = await fetch(`${API_BASE}/shipping-regions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateShippingRegion = async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/shipping-regions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteShippingRegion = async (id: string) => {
    const res = await fetch(`${API_BASE}/shipping-regions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchDiscounts = async () => {
    const res = await fetch(`${API_BASE}/discounts`, {
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const createDiscount = async (data: any) => {
    const res = await fetch(`${API_BASE}/discounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteDiscount = async (id: string) => {
    const res = await fetch(`${API_BASE}/discounts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const validateDiscount = async (code: string) => {
    const res = await fetch(`${API_BASE}/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return handleResponse(res);
};

export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);
