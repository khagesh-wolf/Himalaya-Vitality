
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Stripe (Only if key is present)
const stripe = process.env.STRIPE_SECRET_KEY 
    ? require('stripe')(process.env.STRIPE_SECRET_KEY) 
    : null;

const app = express();

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- HELPER MIDDLEWARE ---

// Authenticate Token Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        req.user = user; // Attach decoded user (id, email, role) to request
        next();
    });
};

// --- ROUTES ---

// 1. Health Check
app.get('/api/health', (req, res) => res.send('API is Online'));

// --- AUTH ROUTES ---

// SIGNUP
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Basic Validation
    if (!email || !password || password.length < 6) {
        return res.status(400).json({ message: 'Invalid email or password (min 6 chars).' });
    }

    try {
        // 1. Check if user exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists.' });

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create User
        const user = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role: 'CUSTOMER',
                provider: 'EMAIL'
            }
        });

        // 4. Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return Response (Exclude password)
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                avatar: user.avatar 
            } 
        });

    } catch (error) {
        console.error("Signup Error:", error);
        // Explicitly return the error message for debugging
        res.status(500).json({ 
            message: 'Server error during signup.', 
            error: error.message,
            code: error.code // Prisma error code
        });
    }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check User
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

        // 2. Check Password
        // If user logged in via Social provider before, they might not have a password
        if (!user.password) return res.status(400).json({ message: 'Please login with Google/Social.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                avatar: user.avatar,
                firstName: user.name?.split(' ')[0] || '', // Simple split fallback
                lastName: user.name?.split(' ')[1] || ''
            } 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// GOOGLE AUTH LOGIN/SIGNUP
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body; // Receives Access Token from Frontend

    try {
        // 1. Verify Token with Google
        // We use the UserInfo endpoint to validate the access token and get user details
        const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        
        if (!googleResponse.ok) {
            return res.status(400).json({ message: 'Invalid Google Token' });
        }

        const googleUser = await googleResponse.json();
        const { email, name, picture } = googleUser;

        if (!email) return res.status(400).json({ message: 'Google account missing email' });

        // 2. Check or Create User in DB
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    avatar: picture,
                    role: 'CUSTOMER',
                    provider: 'GOOGLE',
                    password: null // No password for social logins
                }
            });
        } else {
            // Optional: Update avatar if changed
            if (picture && user.avatar !== picture) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { avatar: picture }
                });
            }
        }

        // 3. Generate App JWT
        const appToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            token: appToken, 
            user: {
                id: user.id, 
                name: user.name, 
                email: user.email, 
                role: user.role,
                avatar: user.avatar
            } 
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
});

// GET CURRENT USER (Protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        // req.user.id comes from the middleware decoding the token
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { 
                id: true, 
                name: true, 
                email: true, 
                role: true, 
                avatar: true,
                // Include address fields if they exist in your schema update
                // firstName: true, 
                // lastName: true, 
                // address: true...
            }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);

    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// UPDATE PROFILE (Protected)
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { id, email, password, role, ...updateData } = req.body; 

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                // Add address fields here based on schema
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// GET MY ORDERS (Protected)
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { customerEmail: req.user.email }, // Assuming orders linked by email
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            customer: o.customerName,
            email: o.customerEmail,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status,
            items: o.items.length,
            itemsDetails: o.items 
        }));
        
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// --- STOREFRONT ROUTES (Public) ---

// Get Product
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await prisma.product.findFirst({
            where: { id: id },
            include: { variants: true }
        });
        
        if (!product) {
             const firstProduct = await prisma.product.findFirst({ include: { variants: true }});
             if(firstProduct) return res.json(firstProduct);
             return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// Get Public Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

// Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured' });
    const { items, currency } = req.body;
    try {
        let total = 0;
        for (const item of items) {
             const variant = await prisma.productVariant.findUnique({ where: { id: item.variantId }});
             if (variant) total += Number(variant.price) * item.quantity;
        }
        if (total === 0) throw new Error("Total calculated to 0");

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: currency.toLowerCase() || 'usd',
            automatic_payment_methods: { enabled: true },
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Order (Simulated Webhook)
app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId } = req.body;
    try {
        // Try to find user to link, otherwise null
        const user = await prisma.user.findUnique({ where: { email: customer.email } });

        const order = await prisma.order.create({
            data: {
                orderNumber: `HV-${Date.now().toString().slice(-6)}`,
                customerEmail: customer.email,
                customerName: `${customer.firstName} ${customer.lastName}`,
                shippingAddress: customer,
                total: total,
                status: 'Paid',
                paymentId: paymentId,
                userId: user ? user.id : null, // Link to user if exists
                items: {
                    create: items.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }
            }
        });
        
        // Update Stock
        for (const item of items) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        res.json({ success: true, orderId: order.orderNumber });
    } catch (error) {
        console.error('Order Error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Subscribe (Newsletter)
app.post('/api/subscribe', async (req, res) => {
    const { email, source } = req.body;
    try {
        const sub = await prisma.subscriber.create({
            data: { email, source }
        });
        res.json(sub);
    } catch (error) {
        res.json({ status: 'subscribed' });
    }
});

// --- ADMIN ROUTES (Protected + Role Check ideally) ---

// Get Admin Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    try {
        const orders = await prisma.order.findMany({ select: { total: true } });
        const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        res.json({ totalRevenue, totalOrders, avgOrderValue });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get All Orders
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            customer: o.customerName,
            email: o.customerEmail,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status,
            items: o.items.length
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update Order Status
app.put('/api/admin/orders/:id', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    const { id } = req.params; 
    const { status } = req.body;
    try {
        const order = await prisma.order.update({
            where: { orderNumber: id },
            data: { status }
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Update Product
app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    const { id } = req.params;
    const { variants } = req.body;
    try {
        if (variants && variants.length > 0) {
            for (const v of variants) {
                await prisma.productVariant.update({
                    where: { id: v.id },
                    data: {
                        price: v.price,
                        compareAtPrice: v.compareAtPrice,
                        stock: v.stock
                    }
                });
            }
        }
        res.json({ success: true, message: "Prices and Stock Updated" });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product variants' });
    }
});

// Get Discounts
app.get('/api/admin/discounts', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
});

// Create Discount
app.post('/api/admin/discounts', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    try {
        const discount = await prisma.discount.create({ data: req.body });
        res.json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create discount' });
    }
});

// Delete Discount
app.delete('/api/admin/discounts/:id', authenticateToken, async (req, res) => {
    if(req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
});

// Export app
module.exports = app;
