
import { Product, Review, Order, CartItem, User, RegionConfig } from '../types';

// --- CONFIGURATION ---
// STRICTLY use the environment variable. Default to /api for local proxy if not set.
// This forces the app to look for a running server.
const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

console.log(`%c[API] Initialized. Connecting to: ${API_URL}`, 'color: #00ff00; font-weight: bold; background: #111; padding: 4px;');

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
    
    // Try to parse JSON, fallback to text if necessary
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
    } else {
        data = { message: res.statusText };
    }

    if (!res.ok) {
        const error = new Error(data.message || data.error || 'API Error');
        (error as any).status = res.status;
        (error as any).requiresVerification = data.requiresVerification;
        (error as any).email = data.email;
        throw error;
    }
    
    return data;
};

// --- API IMPLEMENTATION ---

// 1. PRODUCTS
export const fetchProduct = async (id: string): Promise<Product> => {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        return await handleResponse(res);
    } catch (e) {
        console.error(`[API] Failed to fetch product ${id}. Is the backend running?`, e);
        throw e;
    }
};

export const updateProduct = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 2. REVIEWS
export const fetchReviews = async (): Promise<Review[]> => {
    const res = await fetch(`${API_URL}/reviews`);
    return await handleResponse(res);
};

export const createReview = async (data: Partial<Review>) => {
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 3. ORDERS
export const createOrder = async (data: any) => {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${API_URL}/orders/my-orders`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const trackOrder = async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/track`);
    return handleResponse(res);
};

// 4. AUTH
export const loginUser = async (data: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const signupUser = async (data: any) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const updateUserProfile = async (data: Partial<User>) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const verifyEmail = async (email: string, otp: string) => {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return handleResponse(res);
};

export const googleAuthenticate = async (token: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    return handleResponse(res);
};

export const sendForgotPassword = async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });
    return handleResponse(res);
};

export const resetPassword = async (data: any) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

// 5. ADMIN
export const fetchAdminOrders = async () => {
    const res = await fetch(`${API_URL}/admin/orders`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
};

export const updateOrderTracking = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/tracking`, {
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
    
    const res = await fetch(`${API_URL}/admin/stats?${params.toString()}`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchInventoryLogs = async () => {
    const res = await fetch(`${API_URL}/admin/inventory-logs`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const fetchSubscribers = async () => {
    const res = await fetch(`${API_URL}/admin/subscribers`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const subscribeToNewsletter = async (email: string, source: string) => {
    const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source })
    });
    return handleResponse(res);
};

export const sendAdminNewsletter = async (subject: string, message: string) => {
    const res = await fetch(`${API_URL}/admin/newsletter/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ subject, message })
    });
    return handleResponse(res);
};

// 6. SHIPPING & DISCOUNTS
export const fetchShippingRegions = async () => {
    const res = await fetch(`${API_URL}/shipping-regions`);
    return await handleResponse(res);
};

export const createShippingRegion = async (data: any) => {
    const res = await fetch(`${API_URL}/shipping-regions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateShippingRegion = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteShippingRegion = async (id: string) => {
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const fetchDiscounts = async () => {
    const res = await fetch(`${API_URL}/discounts`, { headers: getAuthHeaders() });
    return handleResponse(res);
};

export const createDiscount = async (data: any) => {
    const res = await fetch(`${API_URL}/discounts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteDiscount = async (id: string) => {
    const res = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    return handleResponse(res);
};

export const validateDiscount = async (code: string) => {
    const res = await fetch(`${API_URL}/discounts/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
    });
    return handleResponse(res);
};

// 7. BLOG & STRIPE
export const fetchBlogPosts = async () => {
    // We can update this to fetch from DB if you create a blog table, 
    // but typically blogs are static or headless CMS.
    // For now, we keep the constant or you can add an endpoint.
    return import('../constants').then(m => m.BLOG_POSTS);
};

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    const res = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
    });
    return handleResponse(res);
};
