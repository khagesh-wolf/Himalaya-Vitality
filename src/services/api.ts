
import { Product, Review, Order, CartItem, User, Subscriber, RegionConfig } from '../types';
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS } from '../constants';
import { DEFAULT_REGIONS } from '../utils';

// Base URL for API
// In dev: Vite proxies '/api' to localhost:3000
// In prod: Vercel routes '/api' to serverless functions
const API_BASE = '/api';

// --- SHARED UTILS ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('hv_token');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const handleResponse = async (res: Response) => {
    let data;
    try {
        data = await res.json();
    } catch (e) {
        // Handle empty responses or non-JSON errors
        if (!res.ok) throw new Error(res.statusText);
        return { success: true };
    }

    if (!res.ok) {
        const error = new Error(data.message || data.error || 'API Error');
        // Pass specific flags for auth flow handling
        (error as any).requiresVerification = data.requiresVerification;
        (error as any).email = data.email;
        throw error;
    }
    return data;
};

// --- 1. PRODUCTS ---
export const fetchProduct = async (id: string): Promise<Product> => {
    try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) {
            // Fallback for static pages if DB is cold, but prefers API
            return MAIN_PRODUCT; 
        }
        return await res.json();
    } catch (e) {
        console.warn("API Error fetching product, using fallback constant.", e);
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

// --- 2. REVIEWS ---
export const fetchReviews = async (): Promise<Review[]> => {
    try {
        const res = await fetch(`${API_BASE}/reviews`);
        return await handleResponse(res);
    } catch (e) {
        // Fallback to constants if API fails (e.g., during build)
        return REVIEWS;
    }
};

export const createReview = async (data: Partial<Review>) => {
    const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// --- 3. ORDERS ---
export const createOrder = async (data: any) => {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${API_BASE}/orders/my-orders`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const trackOrder = async (orderId: string) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/track`);
    return handleResponse(res);
};

// --- 4. AUTH ---
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

export const fetchCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
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

export const verifyEmail = async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
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
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const resetPassword = async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// --- 5. ADMIN ---
export const fetchAdminOrders = async () => {
    const res = await fetch(`${API_BASE}/admin/orders`, { headers: getAuthHeaders() });
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

export const fetchAdminStats = async (startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const res = await fetch(`${API_BASE}/admin/stats?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchInventoryLogs = async () => {
    const res = await fetch(`${API_BASE}/admin/inventory-logs`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchSubscribers = async () => {
    const res = await fetch(`${API_BASE}/admin/subscribers`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const subscribeToNewsletter = async (email: string, source: string) => {
    const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
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

// --- 6. SHIPPING & DISCOUNTS ---
export const fetchShippingRegions = async () => {
    try {
        const res = await fetch(`${API_BASE}/shipping-regions`);
        if (!res.ok) throw new Error();
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
    const res = await fetch(`${API_BASE}/discounts`, { headers: getAuthHeaders() });
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

// --- 7. BLOG & STRIPE ---
export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    const res = await fetch(`${API_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
    });
    return handleResponse(res);
};
