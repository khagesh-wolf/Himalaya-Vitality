require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 

const prisma = new PrismaClient();
// Initialize Stripe only if key exists
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

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Force Gmail host
    port: 465, // Force SSL Port
    secure: true, // Force Secure
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: { rejectUnauthorized: false }
});

const sendEmail = async (to, subject, text) => {
    try {
        console.log(`[EMAIL] Sending to ${to}...`);
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Missing EMAIL_USER or EMAIL_PASS environment variables');
        }
        const info = await transporter.sendMail({ 
            from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text,
            html: `<div style="font-family: sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #D0202F;">Himalaya Vitality</h2>
                    <p style="font-size: 16px;">${text}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <small style="color: #888;">This is an automated message.</small>
                   </div>`
        });
        console.log('[EMAIL] Sent:', info.messageId);
        return info;
    } catch (e) {
        console.error('[EMAIL FAIL]', e);
        throw e; 
    }
};

// --- ROUTES ---

// Health & Debug
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/api/debug/email', async (req, res) => {
    const targetEmail = req.query.to || process.env.EMAIL_USER;
    try {
        const info = await transporter.sendMail({
            from: `"Debug Test" <${process.env.EMAIL_USER}>`,
            to: targetEmail,
            subject: 'Himalaya Vitality - Debug Test',
            text: 'Email configuration is CORRECT.'
        });
        res.json({ success: true, messageId: info.messageId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires }
        });

        try {
            await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
        } catch (emailError) {
            await prisma.user.delete({ where: { id: newUser.id } });
            return res.status(500).json({ error: 'Failed to send email. Account creation rolled back.' });
        }
        
        res.json({ message: 'Signup successful', requiresVerification: true, email });
    } catch (e) {
        res.status(500).json({ error: e.message });
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
            return res.status(403).json({ message: 'Verification required', requiresVerification: true, email });
        }
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || String(user.otp).trim() !== String(otp).trim()) return res.status(400).json({ message: 'Invalid code' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null, otpExpires: null }
        });
        const token = jwt.sign({ id: updated.id, role: updated.role, email: updated.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...safeUser } = updated;
        res.json({ token, user: safeUser });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Google Authentication Route
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // 1. Verify token with Google via fetch (avoids adding extra libs)
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!googleRes.ok) throw new Error('Invalid Google Token');
        
        const googleUser = await googleRes.json();
        const { email, name, picture } = googleUser;

        // 2. Upsert User
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    avatar: picture,
                    provider: 'GOOGLE',
                    isVerified: true, 
                    password: null 
                }
            });
        } else {
            // Update metadata if they exist
            user = await prisma.user.update({
                where: { id: user.id },
                data: { avatar: picture, provider: 'GOOGLE', isVerified: true } 
            });
        }

        // 3. Issue Token
        const jwtToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        
        res.json({ token: jwtToken, user: safeUser });

    } catch (e) {
        console.error('Google Auth Error:', e);
        res.status(401).json({ message: 'Google authentication failed' });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if(user) {
            const { password: _, otp: __, ...safeUser } = user;
            res.json(safeUser);
        } else { res.status(404).json({ message: 'User not found' }); }
    } catch(e) { res.status(500).json({ error: 'Failed to fetch profile' }); }
});

// --- ORDER & PAYMENT ROUTES ---

// 1. Create Payment Intent
app.post('/api/create-payment-intent', async (req, res) => {
    const { items, currency } = req.body;
    
    // In production: Fetch price from DB to prevent client manipulation
    let totalAmount = 0;
    if (items && Array.isArray(items)) {
        totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }
    
    if (totalAmount < 1) totalAmount = 1; 
    const amountInCents = Math.round(totalAmount * 100);

    try {
        if (!stripe) throw new Error('Stripe not configured');

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: currency ? currency.toLowerCase() : 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
        console.error("Stripe Error:", e);
        res.status(500).json({ error: e.message, mockSecret: "pi_mock_secret_12345" }); 
    }
});

// 2. Create Order
app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId, userId } = req.body;
    
    try {
        const orderData = {
            orderNumber: `HV-${Date.now()}`,
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            shippingAddress: customer, // Prisma handles JSON
            total,
            status: 'PAID',
            paymentId,
            items: {
                create: items.map(i => ({
                    variantId: i.variantId,
                    quantity: i.quantity,
                    price: i.price
                }))
            }
        };

        if (userId) {
            orderData.user = { connect: { id: userId } };
        }

        const order = await prisma.order.create({ data: orderData });
        
        sendEmail(
            customer.email, 
            `Order Confirmation ${order.orderNumber}`, 
            `Thank you for your purchase, ${customer.firstName}! Your order ${order.orderNumber} has been received.`
        ).catch(e => console.error("Order Email Failed", e));

        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error("Order Create Error:", e);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

// Get User Orders
app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.total,
            status: o.status === 'PAID' ? 'Paid' : o.status,
            itemsDetails: o.items.map(i => ({
                title: 'Himalaya Shilajit', 
                quantity: i.quantity,
                price: i.price,
                productId: 'himalaya-shilajit-resin',
                image: 'https://picsum.photos/200' 
            }))
        }));
        res.json(formatted);
    } catch(e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// --- PRODUCTS ---
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({ 
            where: { id: req.params.id },
            include: { variants: true }
        });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- REVIEWS ---
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- ADMIN ROUTES ---

app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const orders = await prisma.order.findMany();
        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        res.json({
            totalOrders,
            totalRevenue,
            avgOrderValue
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/orders', authenticate, isAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/admin/orders/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json(order);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/reviews', authenticate, isAdmin, async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.put('/api/admin/reviews/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const review = await prisma.review.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json(review);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/admin/reviews/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await prisma.review.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/discounts', authenticate, isAdmin, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/discounts', authenticate, isAdmin, async (req, res) => {
    try {
        const discount = await prisma.discount.create({ data: req.body });
        res.json(discount);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/admin/discounts/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
