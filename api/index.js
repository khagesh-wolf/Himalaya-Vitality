
const path = require('path');
// Explicitly load .env from the project root
try {
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (e) {
    console.warn("Could not load local .env file", e);
}

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); 

const prisma = new PrismaClient();
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
        if (req.user && req.user.role === 'ADMIN') {
            next();
        } else {
            res.status(403).json({ message: 'Admin access required' });
        }
    });
};

// --- Helpers ---
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// --- EMAIL SETUP ---
// Using environment variables explicitly for SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: { rejectUnauthorized: false }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('EMAIL_USER or EMAIL_PASS missing in .env');
            return;
        }

        await transporter.sendMail({ 
            from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, 
            to, 
            subject, 
            text,
            html: html || `<div style="font-family: sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #D0202F;">Himalaya Vitality</h2>
                    <p style="font-size: 16px;">${text}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <small style="color: #888;">This is an automated message.</small>
                   </div>`
        });
    } catch (e) {
        console.error('[EMAIL FAIL]', e.message);
        throw e; // Re-throw to alert the API caller
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 

        // 1. Create User first (Unverified)
        await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires, isVerified: false }
        });

        // 2. Send Email
        try {
            await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
        } catch (mailError) {
            // Return 500 so frontend knows email failed
            return res.status(500).json({ error: 'Failed to send verification email. Please check server SMTP settings.' });
        }
        
        // 3. Respond
        res.json({ message: 'Signup successful. Please verify email.', requiresVerification: true, email });
    } catch (e) {
        res.status(500).json({ error: e.message });
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

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.isVerified && user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Verification required', requiresVerification: true, email });
        }
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token, user: safeUser });
    } catch (e) {
        res.status(500).json({ error: 'Internal server error' });
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

// --- ORDERS (Specific User) ---
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
            status: o.status,
            trackingNumber: o.trackingNumber, 
            carrier: o.carrier,
            itemsDetails: o.items.map(i => ({
                title: 'Himalaya Shilajit', 
                quantity: i.quantity,
                price: i.price,
                productId: 'himalaya-shilajit-resin',
                image: 'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg' 
            }))
        }));
        res.json(formatted);
    } catch(e) {
        console.error("[ORDERS] Fetch Error:", e);
        res.status(500).json({ error: 'Failed to fetch orders.' });
    }
});

// --- ORDER CREATION ---
app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId, userId } = req.body;
    try {
        const order = await prisma.order.create({
            data: {
                orderNumber: `HV-${Date.now()}`,
                customerEmail: customer.email,
                customerName: `${customer.firstName} ${customer.lastName}`,
                shippingAddress: customer, 
                total,
                status: 'Paid', 
                paymentId,
                userId: userId ? userId : undefined,
                items: {
                    create: items.map(i => ({
                        variantId: i.variantId,
                        quantity: i.quantity,
                        price: i.price
                    }))
                }
            }
        });
        
        try {
            await sendEmail(
                customer.email, 
                `Order Confirmation ${order.orderNumber}`, 
                `Thank you for your purchase, ${customer.firstName}! Your order ${order.orderNumber} has been received.`
            );
        } catch(e) { console.warn("Order email failed:", e); }

        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error("Order Create Error:", e);
        res.status(500).json({ error: e.message || 'Order creation failed' });
    }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
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
            items: o.items.length,
            trackingNumber: o.trackingNumber,
            carrier: o.carrier
        }));
        res.json(formatted);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// --- STANDARD SERVER START ---
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
