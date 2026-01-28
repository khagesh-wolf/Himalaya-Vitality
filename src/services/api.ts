
import { Product, Review, Order, CartItem, User, RegionConfig } from '../types';
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS } from '../constants';
import { DEFAULT_REGIONS } from '../utils';

// --- CONFIGURATION ---
// These keys come directly from your .env file
const USE_MOCK = (import.meta as any).env.VITE_USE_MOCK === 'true'; 
const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

console.log(`[API] Service Initialized. Mode: ${USE_MOCK ? 'MOCK' : 'LIVE'}. Endpoint: ${API_URL}`);

// --- SHARED UTILS ---
const getAuthHeaders = () => {
    const token = localStorage.getItem('hv_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    let data;
    
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
    } else {
        data = { message: res.statusText };
    }

    if (!res.ok) {
        // Construct detailed error for frontend handling (e.g. AuthContext)
        const error = new Error(data.message || data.error || 'API Error');
        (error as any).status = res.status;
        (error as any).requiresVerification = data.requiresVerification; // Important for OTP flow
        (error as any).email = data.email;
        throw error;
    }
    
    return data;
};

// --- API IMPLEMENTATION ---

// 1. PRODUCTS
export const fetchProduct = async (id: string): Promise<Product> => {
    if (USE_MOCK) return MAIN_PRODUCT;
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Product fetch failed');
        return await res.json();
    } catch (e) {
        console.warn("[API] Product fetch failed, falling back to static data for reliability.", e);
        return MAIN_PRODUCT;
    }
};

export const updateProduct = async (id: string, data: any) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 2. REVIEWS
export const fetchReviews = async (): Promise<Review[]> => {
    if (USE_MOCK) return REVIEWS;
    try {
        const res = await fetch(`${API_URL}/reviews`);
        return await handleResponse(res);
    } catch (e) {
        return REVIEWS;
    }
};

export const createReview = async (data: Partial<Review>) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 3. ORDERS
export const createOrder = async (data: any) => {
    if (USE_MOCK) return { success: true, orderId: `MOCK-${Date.now()}` };
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    if (USE_MOCK) return []; 
    const res = await fetch(`${API_URL}/orders/my-orders`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const trackOrder = async (orderId: string) => {
    if (USE_MOCK) return { status: 'Processing', carrier: 'MockPost', trackingNumber: '123456' };
    const res = await fetch(`${API_URL}/orders/${orderId}/track`);
    return handleResponse(res);
};

// 4. AUTH
export const loginUser = async (data: any) => {
    if (USE_MOCK) return { token: 'mock-token', user: { id: '1', email: data.email, role: 'CUSTOMER', isVerified: true } };
    
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const signupUser = async (data: any) => {
    if (USE_MOCK) return { token: 'mock-token', user: { id: '1', email: data.email, role: 'CUSTOMER', isVerified: true } };
    
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchCurrentUser = async (): Promise<User> => {
    if (USE_MOCK) return { id: '1', email: 'mock@user.com', name: 'Mock User', role: 'CUSTOMER', isVerified: true };
    
    const res = await fetch(`${API_URL}/auth/me`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const updateUserProfile = async (data: Partial<User>) => {
    if (USE_MOCK) return data;
    const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const verifyEmail = async (email: string, otp: string) => {
    if (USE_MOCK) return { token: 'mock-token', user: { email, isVerified: true } };
    const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return handleResponse(res);
};

export const googleAuthenticate = async (token: string) => {
    if (USE_MOCK) return { token: 'mock-google', user: { email: 'google@test.com', isVerified: true } };
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    return handleResponse(res);
};

export const sendForgotPassword = async (email: string) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const resetPassword = async (data: any) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 5. ADMIN
export const fetchAdminOrders = async () => {
    if (USE_MOCK) return [];
    const res = await fetch(`${API_URL}/admin/orders`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const updateOrderStatus = async (id: string, status: string) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
};

export const updateOrderTracking = async (id: string, data: any) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/admin/orders/${id}/tracking`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchAdminStats = async (startDate?: Date, endDate?: Date) => {
    if (USE_MOCK) return { totalRevenue: 1000, totalOrders: 10 };
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const res = await fetch(`${API_URL}/admin/stats?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchInventoryLogs = async () => {
    if (USE_MOCK) return [];
    const res = await fetch(`${API_URL}/admin/inventory-logs`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchSubscribers = async () => {
    if (USE_MOCK) return [];
    const res = await fetch(`${API_URL}/admin/subscribers`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const subscribeToNewsletter = async (email: string, source: string) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
    });
    return handleResponse(res);
};

export const sendAdminNewsletter = async (subject: string, message: string) => {
    if (USE_MOCK) return { sent: 0 };
    const res = await fetch(`${API_URL}/admin/newsletter/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subject, message })
    });
    return handleResponse(res);
};

// 6. SHIPPING & DISCOUNTS
export const fetchShippingRegions = async () => {
    if (USE_MOCK) return DEFAULT_REGIONS;
    try {
        const res = await fetch(`${API_URL}/shipping-regions`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch {
        return DEFAULT_REGIONS;
    }
};

export const createShippingRegion = async (data: any) => {
    if (USE_MOCK) return data;
    const res = await fetch(`${API_URL}/shipping-regions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateShippingRegion = async (id: string, data: any) => {
    if (USE_MOCK) return data;
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteShippingRegion = async (id: string) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchDiscounts = async () => {
    if (USE_MOCK) return [];
    const res = await fetch(`${API_URL}/discounts`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const createDiscount = async (data: any) => {
    if (USE_MOCK) return data;
    const res = await fetch(`${API_URL}/discounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteDiscount = async (id: string) => {
    if (USE_MOCK) return { success: true };
    const res = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const validateDiscount = async (code: string) => {
    if (USE_MOCK) return { code, value: 10, type: 'PERCENTAGE', active: true };
    const res = await fetch(`${API_URL}/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return handleResponse(res);
};

// 7. BLOG & STRIPE
export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    if (USE_MOCK) throw new Error("Payment not available in Mock Mode");
    
    const res = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
    });
    return handleResponse(res);
};
