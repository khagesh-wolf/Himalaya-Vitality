
import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS, MOCK_ORDERS } from '../constants';
import { User, Order, Product, Review, BlogPost, CartItem, Discount, Subscriber, InventoryLog } from '../types';

// Env Config
// Default to TRUE so the app works out-of-the-box without a backend server
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
    console.log(`[Mock API] ${options?.method || 'GET'} ${endpoint}`);
    await new Promise(r => setTimeout(r, 600)); // Simulate network delay

    // Auth
    if (endpoint === '/auth/login') {
        const body = options.body ? JSON.parse(options.body) : {};
        // Simulate "requires verification" for specific test email if needed, or just success
        return { 
            token: 'mock_jwt_token_123', 
            user: { 
                id: 'u1', 
                name: 'Demo Admin', 
                email: body.email || 'admin@himalaya.com', 
                role: 'ADMIN',
                avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
                firstName: 'Demo',
                lastName: 'Admin'
            } 
        };
    }
    if (endpoint === '/auth/signup') {
        return { 
            token: 'mock_jwt_token_456', 
            user: { id: 'u2', name: 'New User', role: 'CUSTOMER', email: 'new@user.com' } 
        };
    }
    if (endpoint === '/auth/me') {
        return { 
            id: 'u1', 
            name: 'Demo Admin', 
            email: 'admin@himalaya.com', 
            role: 'ADMIN', 
            avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            firstName: 'Demo',
            lastName: 'Admin',
            address: '123 Mountain View',
            city: 'Denver',
            country: 'US',
            zip: '80202'
        };
    }
    if (endpoint === '/auth/google') {
        return { 
            token: 'mock_google_token', 
            user: { id: 'u3', name: 'Google User', role: 'CUSTOMER', email: 'google@user.com', avatar: 'https://lh3.googleusercontent.com/a/default-user' } 
        };
    }
    if (endpoint === '/auth/profile' && options?.method === 'PUT') {
        return { success: true };
    }
    if (endpoint === '/auth/verify-email') {
        return { 
            token: 'mock_verified_token', 
            user: { id: 'u2', name: 'Verified User', role: 'CUSTOMER', email: 'user@test.com' } 
        };
    }
    if (endpoint === '/auth/forgot-password') return { message: 'Reset code sent' };
    if (endpoint === '/auth/reset-password') return { success: true };
    
    // Products
    if (endpoint.startsWith('/products')) return MAIN_PRODUCT;
    
    // Payment & Orders
    if (endpoint === '/create-payment-intent') return { clientSecret: 'pi_mock_secret_123_test_key' };
    if (endpoint === '/orders' && options?.method === 'POST') {
        const body = JSON.parse(options.body);
        return { success: true, orderId: `HV-${Date.now()}` };
    }
    
    // User Order History (Enriched Mock Data)
    if (endpoint === '/orders/my-orders') {
        return MOCK_ORDERS.map(o => ({
            ...o,
            itemsDetails: [
                {
                    title: MAIN_PRODUCT.title,
                    quantity: o.items || 1,
                    price: o.total,
                    productId: MAIN_PRODUCT.id,
                    image: MAIN_PRODUCT.images[0]
                }
            ]
        }));
    }

    // Reviews
    if (endpoint === '/reviews' && options?.method === 'POST') return { success: true };
    if (endpoint === '/reviews') return REVIEWS;

    // Blog
    if (endpoint === '/blog') return BLOG_POSTS;

    // Admin Dashboard Data
    if (endpoint === '/admin/stats') return { totalRevenue: 45231.00, totalOrders: 342, avgOrderValue: 132.25 };
    if (endpoint === '/admin/orders') return MOCK_ORDERS;
    if (endpoint.startsWith('/admin/orders/')) return { success: true }; // Update status
    if (endpoint.startsWith('/admin/products/')) return { success: true }; // Update product
    if (endpoint === '/admin/discounts') return [
        { id: 'd1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, active: true },
        { id: 'd2', code: 'VIP25', type: 'PERCENTAGE', value: 25, active: true }
    ];
    if (endpoint.startsWith('/admin/discounts/')) return { success: true };
    if (endpoint === '/admin/reviews') return REVIEWS;
    if (endpoint.startsWith('/admin/reviews/')) return { success: true };
    if (endpoint === '/admin/subscribers') return [
        { id: 's1', email: 'john@example.com', date: '2023-10-01', source: 'Popup' },
        { id: 's2', email: 'jane@test.com', date: '2023-10-05', source: 'Footer' }
    ];
    if (endpoint === '/admin/inventory-logs') return [
        { id: 'l1', sku: 'Starter Pack', action: 'Restock', quantity: 50, user: 'System', date: '2023-10-01 10:00' },
        { id: 'l2', sku: 'Commitment Pack', action: 'Sale', quantity: -1, user: 'Checkout', date: '2023-10-02 14:23' }
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
