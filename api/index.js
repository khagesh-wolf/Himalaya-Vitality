require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
// Initialize Stripe only if key exists to prevent crash in dev
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    authenticate(req, res, () => {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Admin access required' });
        next();
    });
};

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const sendEmail = async (to, subject, text) => {
    // In production, replace with Resend/SendGrid/Postmark
    console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject} | Body: ${text}`);
};

// --- AUTH ENDPOINTS ---

app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires }
        });

        await sendEmail(email, 'Verify your email', `Your verification code is ${otp}`);
        
        // Return flag so frontend knows to redirect to verify page
        res.json({ message: 'Signup successful', requiresVerification: true, email });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            const otp = generateOTP();
            await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpires: new Date(Date.now() + 15*60000) }});
            await sendEmail(email, 'Verify your email', `Your code is ${otp}`);
            return res.status(403).json({ message: 'Verification required', requiresVerification: true, email });
        }

        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        // Sanitize return
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null, otpExpires: null }
        });

        const token = jwt.sign({ id: updated.id, role: updated.role, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = updated;
        
        res.json({ message: 'Verified', token, user: safeUser });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const otp = generateOTP();
            await prisma.user.update({ where: { id: user.id }, data: { otp, otpExpires: new Date(Date.now() + 15*60000) }});
            await sendEmail(email, 'Reset Password', `Your password reset code is ${otp}`);
        }
        // Always return success to prevent email enumeration
        res.json({ message: 'If an account exists, a code has been sent.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp || new Date() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword, otp: null, otpExpires: null, isVerified: true }
        });
        res.json({ message: 'Password reset successful' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if(user) {
        const { password: _, otp: __, ...safeUser } = user;
        res.json(safeUser);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

app.put('/api/auth/profile', authenticate, async (req, res) => {
    try {
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: req.body
        });
        const { password: _, otp: __, ...safeUser } = updated;
        res.json(safeUser);
    } catch(e) {
        res.status(500).json({error: 'Failed to update profile'});
    }
});

// --- DATA ENDPOINTS ---

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ 
            where: { id: req.params.id },
            include: { variants: true }
        });
        res.json(product);
    } catch (e) {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.get('/api/blog', async (req, res) => {
    const posts = await prisma.blogPost.findMany({ 
        where: { published: true },
        orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
});

app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                orderNumber: `HV-${Date.now()}`,
                customerEmail: customer.email,
                customerName: `${customer.firstName} ${customer.lastName}`,
                shippingAddress: customer, // Prisma handles JSON
                total,
                status: 'PAID', // In prod, rely on webhook to set PAID
                paymentId,
                items: {
                    create: items.map(i => ({
                        variantId: i.variantId,
                        quantity: i.quantity,
                        price: i.price
                    }))
                }
            }
        });
        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error(e);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        // Find orders by user link OR email match
        const user = await prisma.user.findUnique({ where: { id: req.user.id }});
        const orders = await prisma.order.findMany({
            where: { 
                OR: [
                    { userId: req.user.id },
                    { customerEmail: user.email }
                ]
            },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        
        // Transform for frontend
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status === 'PAID' ? 'Paid' : o.status,
            items: o.items.length,
            itemsDetails: o.items.map(i => ({
                title: 'Himalayan Shilajit', // Ideally fetch from Variant include
                quantity: i.quantity,
                image: 'https://picsum.photos/200' // Placeholder if not joined
            }))
        }));
        res.json(formatted);
    } catch(e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// --- ADMIN ENDPOINTS (Protected) ---

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    const totalOrders = await prisma.order.count();
    const revenueAgg = await prisma.order.aggregate({ _sum: { total: true } });
    const totalRevenue = revenueAgg._sum.total || 0;
    
    res.json({
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    });
});

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(orders.map(o => ({
        id: o.orderNumber,
        customer: o.customerName,
        email: o.customerEmail,
        date: new Date(o.createdAt).toLocaleDateString(),
        total: o.total,
        status: o.status === 'PAID' ? 'Paid' : o.status
    })));
});

// ... Add other admin endpoints (products, reviews, etc.) similarly ...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));