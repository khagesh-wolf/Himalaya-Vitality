
import { Product, Review, Order, CartItem, User, RegionConfig, Discount, BlogPost, Subscriber, InventoryLog } from '../types';

// --- CONFIGURATION ---
// Safety check: ensure import.meta.env exists before accessing properties
const env = (import.meta as any).env || {};
const API_URL = env.VITE_API_URL || '/api';

console.log(`[API] Service initialized. Endpoint: ${API_URL}`);

// --- SHARED UTILS ---
const getHeaders = () => {
    const token = localStorage.getItem('hv_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const handleResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    let data;
    
    try {
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            // For 204 No Content or non-JSON responses
            data = { message: res.statusText };
        }
    } catch (e) {
        data = { message: 'Invalid JSON response from server' };
    }

    if (!res.ok) {
        const error = new Error(data.message || data.error || `API Error: ${res.status}`);
        (error as any).status = res.status;
        (error as any).data = data;
        (error as any).requiresVerification = data.requiresVerification;
        (error as any).email = data.email;
        throw error;
    }
    
    return data;
};

// --- PUBLIC DATA ---

export const fetchProduct = async (id: string): Promise<Product> => {
    const res = await fetch(`${API_URL}/products/${id}`);
    return handleResponse(res);
};

export const fetchReviews = async (): Promise<Review[]> => {
    const res = await fetch(`${API_URL}/reviews`);
    return handleResponse(res);
};

export const createReview = async (data: Partial<Review>) => {
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: getHeaders(), // Headers needed if backend requires auth for reviews
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
    try {
        const res = await fetch(`${API_URL}/blog`);
        return await handleResponse(res);
    } catch (e) {
        // Fallback for Blog only if endpoint missing
        return import('../constants').then(m => m.BLOG_POSTS);
    }
};

export const fetchShippingRegions = async (): Promise<RegionConfig[]> => {
    const res = await fetch(`${API_URL}/shipping-regions`);
    return handleResponse(res);
};

export const validateDiscount = async (code: string) => {
    const res = await fetch(`${API_URL}/discounts/validate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code })
    });
    return handleResponse(res);
};

// --- AUTHENTICATION ---

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

export const verifyEmail = async (email: string, otp: string) => {
    const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    return handleResponse(res);
};

export const fetchCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateUserProfile = async (data: Partial<User>) => {
    const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
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

// --- CHECKOUT & ORDERS ---

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    const res = await fetch(`${API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, currency, total })
    });
    return handleResponse(res);
};

export const createOrder = async (data: any) => {
    const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    const res = await fetch(`${API_URL}/orders/my-orders`, { headers: getHeaders() });
    return handleResponse(res);
};

export const trackOrder = async (orderId: string) => {
    const res = await fetch(`${API_URL}/orders/${encodeURIComponent(orderId)}/track`); 
    return handleResponse(res);
};

export const captureCheckoutLead = async (email: string) => {
    try {
        await fetch(`${API_URL}/checkout/lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
    } catch (e) {
        console.warn("Lead capture failed", e);
    }
};

// --- CONTACT & MESSAGES ---

export const sendContactMessage = async (data: { name: string, email: string, subject: string, message: string }) => {
    const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchContactMessages = async () => {
    const res = await fetch(`${API_URL}/admin/messages`, { headers: getHeaders() });
    return handleResponse(res);
};

// --- ADMIN DASHBOARD ---

export const fetchAdminStats = async (startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    
    const res = await fetch(`${API_URL}/admin/stats?${params.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
};

export const fetchAdminOrders = async () => {
    const res = await fetch(`${API_URL}/admin/orders`, { headers: getHeaders() });
    return handleResponse(res);
};

export const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
    return handleResponse(res);
};

export const updateOrderTracking = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/admin/orders/${id}/tracking`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateProduct = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const fetchDiscounts = async (): Promise<Discount[]> => {
    const res = await fetch(`${API_URL}/discounts`, { headers: getHeaders() });
    return handleResponse(res);
};

export const createDiscount = async (data: any) => {
    const res = await fetch(`${API_URL}/discounts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteDiscount = async (id: string) => {
    const res = await fetch(`${API_URL}/discounts/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const createShippingRegion = async (data: any) => {
    const res = await fetch(`${API_URL}/shipping-regions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const updateShippingRegion = async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return handleResponse(res);
};

export const deleteShippingRegion = async (id: string) => {
    const res = await fetch(`${API_URL}/shipping-regions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    return handleResponse(res);
};

export const fetchSubscribers = async (): Promise<Subscriber[]> => {
    const res = await fetch(`${API_URL}/admin/subscribers`, { headers: getHeaders() });
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
        headers: getHeaders(),
        body: JSON.stringify({ subject, message })
    });
    return handleResponse(res);
};

export const fetchInventoryLogs = async (): Promise<InventoryLog[]> => {
    const res = await fetch(`${API_URL}/admin/inventory-logs`, { headers: getHeaders() });
    return handleResponse(res);
};
