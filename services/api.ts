import { MAIN_PRODUCT, REVIEWS, BLOG_POSTS, MOCK_ORDERS } from '../constants';
import { User, Order, Product, Review, BlogPost, CartItem, Discount, Subscriber, InventoryLog, RegionConfig } from '../types';
import { DEFAULT_REGIONS } from '../utils';

// --- LOCAL STORAGE KEYS ---
const DB_KEYS = {
    PRODUCT: 'hv_db_product',
    REVIEWS: 'hv_db_reviews',
    ORDERS: 'hv_db_orders',
    USERS: 'hv_db_users',
    DISCOUNTS: 'hv_db_discounts',
    REGIONS: 'hv_db_regions',
    SUBS: 'hv_db_subscribers',
    LOGS: 'hv_db_logs'
};

// --- INITIALIZATION ---
// Seed LocalStorage if empty
const initDB = () => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(DB_KEYS.PRODUCT)) {
        localStorage.setItem(DB_KEYS.PRODUCT, JSON.stringify(MAIN_PRODUCT));
    }
    if (!localStorage.getItem(DB_KEYS.REVIEWS)) {
        localStorage.setItem(DB_KEYS.REVIEWS, JSON.stringify(REVIEWS));
    }
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
        // Seed with some mock orders for admin demo
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(MOCK_ORDERS.map(o => ({
            ...o,
            createdAt: o.date, // Ensure compatibility
            itemsDetails: [] // Mock orders might lack details, that's ok
        })))); 
    }
    if (!localStorage.getItem(DB_KEYS.REGIONS)) {
        localStorage.setItem(DB_KEYS.REGIONS, JSON.stringify(DEFAULT_REGIONS));
    }
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        // Create a default admin
        const adminUser: User = {
            id: 'admin-1',
            email: 'admin@himalaya.com',
            name: 'Admin User',
            role: 'ADMIN',
            isVerified: true
        };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem(DB_KEYS.DISCOUNTS)) {
        localStorage.setItem(DB_KEYS.DISCOUNTS, JSON.stringify([
            { id: 'd1', code: 'WELCOME10', type: 'PERCENTAGE', value: 10, active: true }
        ]));
    }
};

// Run initialization immediately
initDB();

// --- HELPERS ---
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getFromLS = <T>(key: string, defaultVal: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultVal;
    } catch {
        return defaultVal;
    }
};

const saveToLS = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// --- API IMPLEMENTATION (LOCAL STORAGE) ---

// 1. PRODUCTS
export const fetchProduct = async (id: string): Promise<Product> => {
    await delay(300);
    const product = getFromLS<Product>(DB_KEYS.PRODUCT, MAIN_PRODUCT);
    // Simple mock: we only support the main product ID effectively
    return product;
};

export const updateProduct = async (id: string, data: any) => {
    await delay(500);
    const current = getFromLS<Product>(DB_KEYS.PRODUCT, MAIN_PRODUCT);
    
    // Merge updates
    const updated = { ...current, ...data };
    
    // Handle nested variant updates if passed specifically
    if (data.variants) {
        updated.variants = data.variants;
    }
    
    saveToLS(DB_KEYS.PRODUCT, updated);
    return { success: true };
};

// 2. REVIEWS
export const fetchReviews = async (): Promise<Review[]> => {
    await delay(300);
    return getFromLS<Review[]>(DB_KEYS.REVIEWS, REVIEWS);
};

export const createReview = async (data: Partial<Review>) => {
    await delay(500);
    const reviews = getFromLS<Review[]>(DB_KEYS.REVIEWS, REVIEWS);
    const newReview: Review = {
        id: `r-${Date.now()}`,
        author: 'Guest User',
        rating: 5,
        date: 'Just now',
        title: '',
        content: '',
        verified: false,
        status: 'Pending',
        tags: [],
        ...data
    } as Review;
    
    reviews.unshift(newReview);
    saveToLS(DB_KEYS.REVIEWS, reviews);
    return { success: true };
};

// 3. ORDERS
export const createOrder = async (data: any) => {
    await delay(800);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    
    const newOrder = {
        id: `HV-${Date.now()}`,
        orderNumber: `HV-${Date.now()}`,
        customer: `${data.customer.firstName} ${data.customer.lastName}`,
        email: data.customer.email,
        total: data.total,
        status: 'Paid', // Assume paid for demo
        items: data.items.length,
        itemsDetails: data.items, // Store full item details
        itemsSummary: data.items.map((i: any) => `${i.quantity}x ${i.variantName}`).join(', '),
        shippingAddress: data.customer,
        createdAt: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        paymentId: data.paymentId,
        userId: data.userId
    };

    orders.unshift(newOrder);
    saveToLS(DB_KEYS.ORDERS, orders);

    // Update Stock
    const product = getFromLS<Product>(DB_KEYS.PRODUCT, MAIN_PRODUCT);
    // Simple stock decrement logic on master stock
    // Calculate total jars needed
    let jarsNeeded = 0;
    data.items.forEach((item: any) => {
        let multiplier = 1;
        if (item.bundleType === 'DOUBLE') multiplier = 2;
        if (item.bundleType === 'TRIPLE') multiplier = 3;
        jarsNeeded += (item.quantity * multiplier);
    });
    
    if (product.totalStock !== undefined) {
        product.totalStock = Math.max(0, product.totalStock - jarsNeeded);
        // Also update variant virtual stock for display consistency
        product.variants = product.variants.map(v => {
            let m = 1;
            if (v.type === 'DOUBLE') m = 2;
            if (v.type === 'TRIPLE') m = 3;
            return { ...v, stock: Math.floor(product.totalStock! / m) };
        });
        saveToLS(DB_KEYS.PRODUCT, product);
        
        // Log Inventory
        const logs = getFromLS<any[]>(DB_KEYS.LOGS, []);
        logs.unshift({
            id: `l-${Date.now()}`,
            sku: 'himalaya-shilajit-resin',
            action: 'SALE',
            quantity: -jarsNeeded,
            user: 'System (Order)',
            date: new Date().toLocaleString()
        });
        saveToLS(DB_KEYS.LOGS, logs);
    }

    return { success: true, orderId: newOrder.orderNumber };
};

export const fetchUserOrders = async (): Promise<Order[]> => {
    await delay(400);
    // In local mode, we might not have a perfect "current user" session link unless we check email/ID
    // For demo, we return all orders if logged in, or filter by a stored ID if we had one.
    // Let's filter by the current auth context roughly or return all for demo simplicity.
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    // Map to Order type
    return orders.map(o => ({
        id: o.orderNumber || o.id,
        customer: o.customer,
        date: new Date(o.createdAt).toLocaleDateString(),
        total: o.total,
        status: o.status,
        items: o.items,
        itemsDetails: o.itemsDetails,
        trackingNumber: o.trackingNumber,
        carrier: o.carrier
    }));
};

export const trackOrder = async (orderId: string) => {
    await delay(500);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    const order = orders.find(o => (o.orderNumber === orderId || o.id === orderId));
    if (!order) throw new Error('Order not found');
    return {
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier
    };
};

// 4. AUTH
export const loginUser = async (data: any) => {
    await delay(600);
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    const user = users.find(u => u.email === data.email);
    
    // Simple password check (Mock: assume 'password' or skip check for demo users created here)
    if (user) {
        // Mock token
        return { token: `mock-jwt-${user.id}`, user };
    }
    throw new Error('Invalid credentials');
};

export const signupUser = async (data: any) => {
    await delay(600);
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    if (users.find(u => u.email === data.email)) throw new Error('User already exists');
    
    const newUser: User = {
        id: `u-${Date.now()}`,
        email: data.email,
        name: data.name,
        role: 'CUSTOMER',
        isVerified: true // Auto verify for local demo
    };
    
    users.push(newUser);
    saveToLS(DB_KEYS.USERS, users);
    
    return { token: `mock-jwt-${newUser.id}`, user: newUser };
};

export const fetchCurrentUser = async () => {
    await delay(200);
    // Mock: just return the first admin user or stored session user if we had complex session logic
    // For this simple demo, if token exists, we return the admin or last created user
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    const token = localStorage.getItem('hv_token');
    if (!token) throw new Error('No session');
    
    // Find user by ID embedded in mock token
    const userId = token.replace('mock-jwt-', '');
    const user = users.find(u => u.id === userId) || users[0];
    
    return user;
};

export const updateUserProfile = async (data: Partial<User>) => {
    await delay(400);
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    const token = localStorage.getItem('hv_token');
    const userId = token?.replace('mock-jwt-', '');
    
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
        users[index] = { ...users[index], ...data };
        saveToLS(DB_KEYS.USERS, users);
        return users[index];
    }
    throw new Error('User not found');
};

export const verifyEmail = async (email: string, otp: string) => {
    await delay(500);
    // Mock verify
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    const user = users.find(u => u.email === email);
    if (user) return { token: `mock-jwt-${user.id}`, user };
    throw new Error('Verification failed');
};

export const googleAuthenticate = async (token: string) => {
    // Mock Google Auth
    const users = getFromLS<User[]>(DB_KEYS.USERS, []);
    const newUser: User = {
        id: `u-google-${Date.now()}`,
        email: 'google-user@example.com',
        name: 'Google User',
        role: 'CUSTOMER',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        isVerified: true
    };
    users.push(newUser);
    saveToLS(DB_KEYS.USERS, users);
    return { token: `mock-jwt-${newUser.id}`, user: newUser };
};

export const sendForgotPassword = async (email: string) => { await delay(300); return { message: 'Code sent' }; };
export const resetPassword = async (data: any) => { await delay(300); return { success: true }; };


// 5. ADMIN SPECIFIC
export const fetchAdminOrders = async () => {
    await delay(300);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    return orders.map(o => ({
        id: o.orderNumber,
        dbId: o.id,
        customer: o.customer,
        email: o.email,
        date: new Date(o.createdAt).toLocaleDateString(),
        total: o.total,
        status: o.status,
        items: o.items,
        itemsSummary: o.itemsSummary || `${o.items} items`, // Ensure summary exists
        trackingNumber: o.trackingNumber,
        carrier: o.carrier
    }));
};

export const updateOrderStatus = async (id: string, status: string) => {
    await delay(300);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    const idx = orders.findIndex(o => o.orderNumber === id || o.id === id);
    if (idx !== -1) {
        orders[idx].status = status;
        saveToLS(DB_KEYS.ORDERS, orders);
        return { success: true };
    }
    throw new Error('Order not found');
};

export const updateOrderTracking = async (id: string, data: any) => {
    await delay(300);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    const idx = orders.findIndex(o => o.orderNumber === id || o.id === id);
    if (idx !== -1) {
        orders[idx] = { ...orders[idx], ...data, status: 'Fulfilled' };
        saveToLS(DB_KEYS.ORDERS, orders);
        return { success: true };
    }
    throw new Error('Order not found');
};

export const fetchAdminStats = async (startDate?: Date, endDate?: Date) => {
    await delay(300);
    const orders = getFromLS<any[]>(DB_KEYS.ORDERS, []);
    
    // Filter by date if provided
    let filtered = orders;
    if (startDate && endDate) {
        filtered = orders.filter(o => {
            const d = new Date(o.createdAt);
            return d >= startDate && d <= endDate;
        });
    }

    // Revenue Calculation (Include Paid, Fulfilled, Delivered)
    const revenueOrders = filtered.filter(o => ['Paid', 'Fulfilled', 'Delivered'].includes(o.status));
    const totalRevenue = revenueOrders.reduce((acc, o) => acc + o.total, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / revenueOrders.length : 0; // Avg based on revenue generating orders

    // Mock Chart Data
    const chart = [];
    const days = 30; // Default lookback
    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString(); // Simple string match
        // Sum revenue for this day
        const dayRev = revenueOrders
            .filter(o => new Date(o.createdAt).toLocaleDateString() === dateStr)
            .reduce((acc, o) => acc + o.total, 0);
        
        chart.push({ date: d.toISOString(), revenue: dayRev });
    }

    return {
        totalRevenue,
        totalOrders,
        avgOrderValue,
        trends: { revenue: 10, orders: 5, aov: 2 }, // Mock trends
        chart
    };
};

export const fetchInventoryLogs = async () => {
    await delay(300);
    return getFromLS(DB_KEYS.LOGS, []);
};

export const fetchSubscribers = async () => {
    await delay(300);
    return getFromLS(DB_KEYS.SUBS, []);
};

export const subscribeToNewsletter = async (email: string, source: string) => {
    await delay(400);
    const subs = getFromLS<Subscriber[]>(DB_KEYS.SUBS, []);
    if (!subs.find(s => s.email === email)) {
        subs.push({ id: `s-${Date.now()}`, email, source, date: new Date().toLocaleDateString() });
        saveToLS(DB_KEYS.SUBS, subs);
    }
    return { success: true, subscriber: { email } };
};

export const sendAdminNewsletter = async (subject: string, message: string) => { await delay(500); return { success: true, sent: 5 }; };

// 6. SHIPPING & DISCOUNTS
export const fetchShippingRegions = async () => {
    await delay(200);
    return getFromLS(DB_KEYS.REGIONS, DEFAULT_REGIONS);
};
export const createShippingRegion = async (data: any) => {
    await delay(300);
    const regions = getFromLS<any[]>(DB_KEYS.REGIONS, []);
    const newReg = { id: `reg-${Date.now()}`, ...data };
    regions.push(newReg);
    saveToLS(DB_KEYS.REGIONS, regions);
    return newReg;
};
export const updateShippingRegion = async (id: string, data: any) => {
    await delay(300);
    const regions = getFromLS<any[]>(DB_KEYS.REGIONS, []);
    const idx = regions.findIndex(r => r.id === id);
    if (idx !== -1) {
        regions[idx] = { ...regions[idx], ...data };
        saveToLS(DB_KEYS.REGIONS, regions);
    }
    return regions[idx];
};
export const deleteShippingRegion = async (id: string) => {
    await delay(300);
    const regions = getFromLS<any[]>(DB_KEYS.REGIONS, []);
    saveToLS(DB_KEYS.REGIONS, regions.filter(r => r.id !== id));
    return { success: true };
};

export const fetchDiscounts = async () => {
    await delay(200);
    return getFromLS(DB_KEYS.DISCOUNTS, []);
};
export const createDiscount = async (data: any) => {
    await delay(300);
    const discs = getFromLS<any[]>(DB_KEYS.DISCOUNTS, []);
    const newD = { id: `d-${Date.now()}`, ...data };
    discs.push(newD);
    saveToLS(DB_KEYS.DISCOUNTS, discs);
    return newD;
};
export const deleteDiscount = async (id: string) => {
    const discs = getFromLS<any[]>(DB_KEYS.DISCOUNTS, []);
    saveToLS(DB_KEYS.DISCOUNTS, discs.filter(d => d.id !== id));
    return { success: true };
};
export const validateDiscount = async (code: string) => {
    await delay(300);
    const discs = getFromLS<any[]>(DB_KEYS.DISCOUNTS, []);
    const found = discs.find(d => d.code === code && d.active);
    if (found) return found;
    throw new Error('Invalid code');
};

// 7. BLOG & STRIPE
// Blog is static in constants, so just return it
export const fetchBlogPosts = () => Promise.resolve(BLOG_POSTS);

// Stripe: We MUST hit the backend for clientSecret if we want real elements, 
// OR we return a mock one if the user is truly offline/no-backend. 
// Given the prompt "minimize usage of database", we can still use the server for stateless calculation.
// But if the server is down, we can fallback to a dummy. 
// For now, let's try to fetch, and if it fails, throw error (CheckoutPage handles it).
// NOTE: Since the backend exists in the repo, we assume it's running but we don't rely on its DB.
const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const createPaymentIntent = async (items: CartItem[], currency: string, total?: number) => {
    try {
        const res = await fetch(`${API_URL}/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, currency, total })
        });
        if (!res.ok) throw new Error('Payment server unreachable');
        return await res.json();
    } catch (e) {
        console.warn("Backend unavailable, using mock payment intent logic (Simulated)");
        // Simulate a delay and return a fake secret? 
        // Real Stripe Elements WILL FAIL with a fake secret. 
        // User must have backend running for Stripe.
        // We will throw to let the UI know.
        throw e;
    }
};