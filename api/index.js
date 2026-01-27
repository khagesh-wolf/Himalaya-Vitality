
const path = require('path');
// Explicitly load .env from the project root (one level up)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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

const sendEmail = async (to, subject, text, html) => {
    try {
        console.log(`[EMAIL] Attempting send to ${to}...`);
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            // Only throw if in a critical path that catches it, otherwise log
            console.warn('EMAIL_USER or EMAIL_PASS missing in .env');
            return;
        }

        const info = await transporter.sendMail({ 
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
        console.log('[EMAIL] Sent successfully:', info.messageId);
        return info;
    } catch (e) {
        console.error('[EMAIL FAIL]', e.message);
        throw e;
    }
};

// --- ROUTES ---

// Health & Debug
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000); 

        // Send Email FIRST.
        try {
            await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
        } catch (mailError) {
            console.error("Mail error during signup:", mailError);
            return res.status(500).json({ error: 'Failed to send verification email. Check server logs.' });
        }

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires }
        });
        
        res.json({ message: 'Signup successful', requiresVerification: true, email });
    } catch (e) {
        console.error("Signup Error:", e);
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
        // Check verification - skipping for Admin to prevent lockout if manually inserted
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

app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        // Validate token with Google UserInfo Endpoint
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
        
        if(!googleRes.ok) {
            const errText = await googleRes.text();
            console.error('Google Validation Failed:', errText);
            throw new Error('Invalid Google Token');
        }
        
        const googleUser = await googleRes.json();
        
        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email: googleUser.email } });
        
        if (!user) {
            // Create user
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    provider: 'GOOGLE',
                    isVerified: true,
                    avatar: googleUser.picture
                }
            });
        }

        const jwtToken = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        const { password: _, otp: __, ...safeUser } = user;
        res.json({ token: jwtToken, user: safeUser });

    } catch (e) {
        console.error('Google Auth Error:', e);
        res.status(401).json({ message: 'Google Auth Failed: ' + e.message });
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

// Update Profile Route
app.put('/api/auth/profile', authenticate, async (req, res) => {
    const { firstName, lastName, address, city, country, zip, phone } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { 
                firstName, 
                lastName, 
                name: `${firstName} ${lastName}`,
                address, 
                city, 
                country, 
                zip, 
                phone 
            }
        });
        const { password: _, otp: __, ...safeUser } = updatedUser;
        res.json(safeUser);
    } catch (e) {
        console.error("Profile Update Error:", e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// --- ADMIN ROUTES ---

// Get Stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const paidOrders = await prisma.order.findMany({ where: { status: 'PAID' }, select: { total: true } });
        const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.json({
            totalRevenue,
            totalOrders,
            avgOrderValue
        });
    } catch (e) {
        res.status(500).json({ error: 'Stats failed' });
    }
});

// Get All Orders
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            dbId: o.id, // Internal ID for updates
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
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update Order Status
app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    const { status } = req.body;
    try {
        await prisma.order.update({
            where: { orderNumber: req.params.id },
            data: { status }
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// Update Tracking
app.put('/api/admin/orders/:id/tracking', requireAdmin, async (req, res) => {
    const { trackingNumber, carrier, notify } = req.body;
    try {
        const order = await prisma.order.update({
            where: { orderNumber: req.params.id },
            data: { 
                trackingNumber, 
                carrier,
                status: 'Fulfilled' // Auto set to fulfilled
            }
        });

        if (notify) {
            // Attempt to send email
            try {
                await sendEmail(
                    order.customerEmail,
                    `Your Order ${order.orderNumber} has shipped!`,
                    `Good news! Your order is on the way.\n\nCarrier: ${carrier}\nTracking Number: ${trackingNumber}\n\nTrack here: https://www.google.com/search?q=${carrier}+tracking+${trackingNumber}`,
                    `<div style="font-family: sans-serif; color: #333; padding: 20px;">
                        <h2 style="color: #D0202F;">Order Shipped</h2>
                        <p>Good news, <strong>${order.customerName}</strong>!</p>
                        <p>Your order <strong>${order.orderNumber}</strong> has been dispatched.</p>
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>Carrier:</strong> ${carrier}</p>
                            <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
                        </div>
                        <p>Your vitality boost is getting closer.</p>
                    </div>`
                );
            } catch (emailErr) {
                console.warn("Failed to send tracking email:", emailErr);
            }
        }

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Tracking update failed' });
    }
});

// --- PUBLIC ORDER ROUTES ---

app.post('/api/orders', async (req, res) => {
    const { customer, items, total, paymentId, userId } = req.body;
    
    try {
        const orderData = {
            orderNumber: `HV-${Date.now()}`,
            customerEmail: customer.email,
            customerName: `${customer.firstName} ${customer.lastName}`,
            shippingAddress: customer, 
            total,
            status: 'Paid', 
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
        
        try {
            await sendEmail(
                customer.email, 
                `Order Confirmation ${order.orderNumber}`, 
                `Thank you for your purchase, ${customer.firstName}! Your order ${order.orderNumber} has been received.`
            );
        } catch(e) {
            console.warn("Order email failed:", e);
        }

        res.json({ success: true, orderId: order.orderNumber });
    } catch(e) {
        console.error("Order Create Error:", e);
        res.status(500).json({ error: 'Order creation failed' });
    }
});

// Get User Orders (Fixed: Added Logging)
app.get('/api/orders/my-orders', authenticate, async (req, res) => {
    try {
        console.log(`[ORDERS] Fetching orders for User ID: ${req.user.id}`);
        // Ensure these fields exist in schema before selecting or filtering
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
            trackingNumber: o.trackingNumber, // Will be null if column missing in schema, but crashes if missing in DB
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
        // Better error message
        res.status(500).json({ error: 'Failed to fetch orders. DB Sync Required: ' + e.message });
    }
});

// --- MISC ---
// Force return product for now to keep frontend happy
app.get('/api/products/:id', (req, res) => {
    res.json({ id: 'himalaya-shilajit-resin' }); 
});

if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
