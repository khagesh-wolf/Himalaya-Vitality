
import { MAIN_PRODUCT, REVIEWS, MOCK_ORDERS, BLOG_POSTS } from '../constants';
import { Product, Review, Order, BlogPost, CartItem, Discount, Subscriber, User, InventoryLog } from '../types';

// --- CONFIGURATION ---

// Helper to safely access environment variables
const getEnv = (key: string): string | undefined => {
    try {
        if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
            return (import.meta as any).env[key];
        }
    } catch { /* ignore */ }
    return undefined;
};

// Determine Mock Mode
const USE_MOCK = getEnv('VITE_USE_MOCK') === 'true';
const API_URL = getEnv('VITE_API_URL') || ''; 

console.log(`[System] Running in ${USE_MOCK ? 'MOCK' : 'LIVE'} mode. Endpoint: ${API_URL || 'Same Origin'}`);

// --- Generic Fetch Wrapper ---
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('hv_token');
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    if (USE_MOCK) {
        return mockAdapter(endpoint, options) as Promise<T>;
    }

    try {
        let fullPath = `${API_URL}${endpoint}`;
        if (!API_URL && !endpoint.startsWith('/api') && !endpoint.startsWith('http')) {
             fullPath = `/api${endpoint}`;
        }

        const response = await fetch(fullPath, {
            ...options,
            headers
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
                
                // Pass back special flags if needed (e.g. requiresVerification)
                if (errorData.requiresVerification) {
                    throw { message: errorMessage, requiresVerification: true, email: errorData.email };
                }

                console.error("Server Error Response:", errorData);
            } catch (e) {
                // If the error object we just created has the custom flags, rethrow it
                if (e.requiresVerification) throw e;

                const text = await response.text().catch(() => '');
                if (text) errorMessage = `API Error (${response.status}): ${text.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
        }

        return response.json();
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
}

// --- Mock Adapter (Simulates Backend Logic) ---

// 1. Load/Save Mock Users from LocalStorage to persist sessions across reloads
const loadMockUsers = (): User[] => {
    try {
        const saved = localStorage.getItem('hv_mock_users');
        if (saved) return JSON.parse(saved);
    } catch(e) { console.error("Failed to load mock users", e); }
    
    return [
        { id: 'u_admin', email: 'admin@himalaya.com', name: 'Admin User', role: 'ADMIN' },
        { 
            id: 'u_demo', 
            email: 'user@example.com', 
            name: 'Demo User', 
            role: 'CUSTOMER',
            firstName: 'Demo',
            lastName: 'User',
            address: '123 Highland Drive',
            city: 'Austin',
            country: 'US',
            zip: '78701',
            phone: '555-0123'
        }
    ];
};

let MOCK_USERS = loadMockUsers();

const saveMockUsers = () => {
    localStorage.setItem('hv_mock_users', JSON.stringify(MOCK_USERS));
};

async function mockAdapter(endpoint: string, options: RequestInit): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate Network delay

    // Auth Mocking
    if (endpoint === '/auth/login') {
        const body = JSON.parse(options.body as string);
        const user = MOCK_USERS.find(u => u.email === body.email);
        
        if (user && body.password !== 'wrong') {
            return { token: `mock_token_${user.id}`, user };
        }
        throw new Error('Invalid credentials');
    }

    if (endpoint === '/auth/signup') {
        const body = JSON.parse(options.body as string);
        if (MOCK_USERS.find(u => u.email === body.email)) throw new Error('User already exists');
        
        const newUser: User = { 
            id: `u_${Date.now()}`, 
            email: body.email, 
            name: body.name, 
            role: 'CUSTOMER' 
        };
        MOCK_USERS.push(newUser);
        saveMockUsers(); // Persist new user
        return { token: `mock_token_${newUser.id}`, user: newUser };
    }

    // NEW MOCK ENDPOINTS FOR PASSWORD/VERIFICATION
    if (endpoint === '/auth/forgot-password') {
        return { message: 'Reset code sent (Mock Mode: Check Console)' };
    }
    if (endpoint === '/auth/verify-email') {
        return { message: 'Verified (Mock Mode)', token: 'mock_token_verified', user: MOCK_USERS[0] };
    }
    if (endpoint === '/auth/reset-password') {
        return { message: 'Password reset successfully (Mock Mode)' };
    }

    // Mock Google Login
    if (endpoint === '/auth/google') {
        return { 
            token: `mock_google_token_${Date.now()}`,
            user: { 
                id: 'social_google_user', 
                name: 'Google User', 
                email: 'user@google.com', 
                role: 'CUSTOMER', 
                avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
            }
        };
    }

    if (endpoint === '/auth/me') {
        const authHeader = (options.headers as any)?.Authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;
        
        if (token) {
            // 1. Regular Mock Tokens
            if (token.startsWith('mock_token_')) {
                const userId = token.replace('mock_token_', '');
                const user = MOCK_USERS.find(u => u.id === userId);
                if (user) return user;
            }
            // 2. Social Login Tokens
            if (token.startsWith('mock_google_token')) {
                 return { 
                    id: 'social_google_user', 
                    name: 'Google User', 
                    email: 'user@google.com', 
                    role: 'CUSTOMER', 
                    avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c' 
                };
            }
        }
        throw new Error('Unauthorized');
    }

    if (endpoint === '/auth/profile' && options.method === 'PUT') {
        const body = JSON.parse(options.body as string);
        const token = (options.headers as any)?.Authorization?.split(' ')[1];
        
        let userId = '';
        if (token && token.startsWith('mock_token_')) {
            userId = token.replace('mock_token_', '');
        } else if (token && token.startsWith('mock_google_token')) {
            userId = 'social_google_user'; // Mock ID for google user
        }
        
        const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...body };
            saveMockUsers(); // Persist changes
            return MOCK_USERS[userIndex];
        }
        return body; 
    }

    if (endpoint === '/orders/my-orders') {
        // Return a subset of mock orders for the "Demo User"
        return MOCK_ORDERS.slice(0, 3).map(o => ({...o, itemsDetails: [
            { title: MAIN_PRODUCT.title, quantity: o.items, price: o.total / o.items, image: MAIN_PRODUCT.images[0] }
        ]}));
    }

    if (endpoint.startsWith('/products/')) return MAIN_PRODUCT;
    if (endpoint === '/reviews') return REVIEWS;
    if (endpoint === '/orders') return { success: true, orderId: `HV-${Math.floor(Math.random() * 10000)}` };
    if (endpoint === '/create-payment-intent') return { clientSecret: 'pi_mock_secret' };
    if (endpoint === '/blog') return BLOG_POSTS;
    
    // Mock Admin Routes
    if (endpoint === '/admin/orders') return MOCK_ORDERS;
    if (endpoint === '/admin/stats') return { totalRevenue: 15200, totalOrders: 142, avgOrderValue: 107 };
    if (endpoint === '/admin/discounts') return [];
    if (endpoint === '/admin/subscribers') return [];
    if (endpoint === '/admin/reviews') return REVIEWS;

    return null;
}

// --- Public API Services ---

export const fetchProduct = async (id: string): Promise<Product> => {
    try {
        const dbProduct = await apiFetch<Product>(`/products/${id}`);
        const staticConfig = MAIN_PRODUCT;
        const mergedVariants = staticConfig.variants.map(staticVar => {
            const dbVar = dbProduct.variants.find(v => v.id === staticVar.id);
            return {
                ...staticVar,
                price: dbVar ? dbVar.price : staticVar.price,
                compareAtPrice: dbVar ? dbVar.compareAtPrice : staticVar.compareAtPrice,
                stock: dbVar ? (dbVar as any).stock : (staticVar as any).stock
            };
        });
        return { ...staticConfig, id: dbProduct.id, variants: mergedVariants };
    } catch (error) {
        console.error("Error fetching product, falling back to static config", error);
        return MAIN_PRODUCT;
    }
};

export const fetchReviews = () => apiFetch<Review[]>('/reviews');
export const fetchBlogPosts = () => apiFetch<BlogPost[]>('/blog');

// --- Auth Services ---

export const loginUser = (data: any) => apiFetch<{ token: string, user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const signupUser = (data: any) => apiFetch<{ token?: string, user?: User, requiresVerification?: boolean, email?: string }>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });
export const googleAuthenticate = (token: string) => apiFetch<{ token: string, user: User }>('/auth/google', { method: 'POST', body: JSON.stringify({ token }) });
export const fetchCurrentUser = () => apiFetch<User>('/auth/me');
export const updateUserProfile = (data: Partial<User>) => apiFetch<User>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
export const fetchUserOrders = () => apiFetch<Order[]>('/orders/my-orders');

// NEW AUTH ENDPOINTS
export const sendForgotPassword = (email: string) => apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
export const verifyEmail = (data: { email: string, otp: string }) => apiFetch<{ token: string, user: User }>('/auth/verify-email', { method: 'POST', body: JSON.stringify(data) });
export const resetPassword = (data: any) => apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) });

// --- Checkout Services ---

export const createPaymentIntent = (items: CartItem[], currency: string) => {
    return apiFetch<{ clientSecret: string }>('/create-payment-intent', {
        method: 'POST',
        body: JSON.stringify({ items, currency })
    });
};

export const createOrder = (orderData: any) => {
    return apiFetch<{ success: boolean, orderId: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
    });
};

export const subscribeNewsletter = (email: string, source: string) => {
    return apiFetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source })
    });
};

// --- Admin Services ---

export const fetchAdminStats = () => apiFetch<{ totalRevenue: number, totalOrders: number, avgOrderValue: number }>('/admin/stats');
export const fetchAdminOrders = () => apiFetch<Order[]>('/admin/orders');
export const updateOrderStatus = (id: string, status: string) => apiFetch<Order>(`/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const updateProduct = (id: string, data: any) => apiFetch(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const fetchDiscounts = () => apiFetch<Discount[]>('/admin/discounts');
export const createDiscount = (data: Partial<Discount>) => apiFetch<Discount>('/admin/discounts', { method: 'POST', body: JSON.stringify(data) });
export const deleteDiscount = (id: string) => apiFetch(`/admin/discounts/${id}`, { method: 'DELETE' });
export const fetchAdminReviews = () => apiFetch<Review[]>('/admin/reviews');
export const updateReviewStatus = (id: string, status: string) => apiFetch<Review>(`/admin/reviews/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
export const deleteReview = (id: string) => apiFetch(`/admin/reviews/${id}`, { method: 'DELETE' });
export const fetchSubscribers = () => apiFetch<Subscriber[]>('/admin/subscribers');
export const fetchInventoryLogs = () => apiFetch<InventoryLog[]>('/admin/inventory-logs');
