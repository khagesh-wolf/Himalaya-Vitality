
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
            console.log('Email configuration missing, skipping email send.');
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

        await prisma.user.create({
            data: { name, email, password: hashedPassword, otp, otpExpires, isVerified: false }
        });

        await sendEmail(email, 'Verify your email', `Your verification code is: ${otp}`);
        
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

app.put('/api/auth/profile', authenticate, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, city, country, zip, name } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone, address, city, country, zip, name }
        });
        const { password: _, ...safeUser } = updated;
        res.json(safeUser);
    } catch (e) { res.status(500).json({ error: 'Update failed' }); }
});

// --- PRODUCT ROUTES ---
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const { variants, totalStock, ...data } = req.body;
    try {
        // Update product basic info
        await prisma.product.update({
            where: { id: req.params.id },
            data: { ...data, totalStock: totalStock !== undefined ? totalStock : undefined }
        });

        // Update variants if provided
        if (variants && Array.isArray(variants)) {
            for (const v of variants) {
                await prisma.productVariant.update({
                    where: { id: v.id },
                    data: { price: v.price, compareAtPrice: v.compareAtPrice }
                });
            }
        }
        
        // Log inventory change
        if (totalStock !== undefined) {
             await prisma.inventoryLog.create({
                data: { sku: req.params.id, action: 'ADJUSTMENT', quantity: totalStock, user: req.user.email, date: new Date().toLocaleString() }
             });
        }

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- REVIEW ROUTES ---
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) { res.status(500).json({ error: 'Failed to fetch reviews' }); }
});

app.post('/api/reviews', authenticate, async (req, res) => {
    try {
        const { productId, rating, title, content } = req.body;
        const review = await prisma.review.create({
            data: {
                productId,
                author: req.user.email.split('@')[0], // Simple name extraction
                rating,
                title,
                content,
                date: 'Just now',
                verified: true,
                status: 'Pending'
            }
        });
        res.json(review);
    } catch (e) { res.status(500).json({ error: 'Failed to create review' }); }
});

// --- DISCOUNT ROUTES ---
app.get('/api/discounts', authenticate, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany();
        res.json(discounts);
    } catch (e) { res.status(500).json({ error: 'Error fetching discounts' }); }
});

app.post('/api/discounts', requireAdmin, async (req, res) => {
    try {
        const discount = await prisma.discount.create({ data: req.body });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: 'Error creating discount' }); }
});

app.delete('/api/discounts/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Error deleting discount' }); }
});

app.post('/api/discounts/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await prisma.discount.findUnique({ where: { code } });
        if (discount && discount.active) {
            res.json(discount);
        } else {
            res.status(404).json({ error: 'Invalid or expired code' });
        }
    } catch (e) { res.status(500).json({ error: 'Validation error' }); }
});

// --- SHIPPING REGION ROUTES ---
app.get('/api/shipping-regions', async (req, res) => {
    try {
        const regions = await prisma.shippingRegion.findMany();
        res.json(regions);
    } catch (e) { res.status(500).json({ error: 'Error fetching regions' }); }
});

app.post('/api/shipping-regions', requireAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.create({ data: req.body });
        res.json(region);
    } catch (e) { res.status(500).json({ error: 'Error creating region' }); }
});

app.put('/api/shipping-regions/:id', requireAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.update({ where: { id: req.params.id }, data: req.body });
        res.json(region);
    } catch (e) { res.status(500).json({ error: 'Error updating region' }); }
});

app.delete('/api/shipping-regions/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.shippingRegion.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Error deleting region' }); }
});

// --- NEWSLETTER ROUTES ---
app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email, source } = req.body;
        await prisma.subscriber.upsert({
            where: { email },
            update: { source },
            create: { email, source }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Subscription failed' }); }
});

app.get('/api/admin/subscribers', requireAdmin, async (req, res) => {
    try {
        const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
        const formatted = subs.map(s => ({
            ...s,
            date: new Date(s.createdAt).toLocaleDateString()
        }));
        res.json(formatted);
    } catch (e) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.post('/api/admin/newsletter/send', requireAdmin, async (req, res) => {
    try {
        const { subject, message } = req.body;
        const subs = await prisma.subscriber.findMany();
        // In real world, use a queue. Here we loop (simple).
        let sentCount = 0;
        for (const sub of subs) {
            await sendEmail(sub.email, subject, message, message); // HTML assumed same as text for now
            sentCount++;
        }
        res.json({ success: true, sent: sentCount });
    } catch (e) { res.status(500).json({ error: 'Send failed' }); }
});

// --- ORDERS ---
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

// Public Tracking
app.get('/api/orders/:id/track', async (req, res) => {
    try {
        const order = await prisma.order.findFirst({
            where: { OR: [{ id: req.params.id }, { orderNumber: req.params.id }] }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json({
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier
        });
    } catch(e) { res.status(500).json({ error: 'Tracking error' }); }
});

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
        
        // Log sale in inventory
        let quantitySold = items.reduce((acc, i) => acc + i.quantity, 0); // Simplified logic
        await prisma.inventoryLog.create({
            data: { sku: 'himalaya-shilajit-resin', action: 'SALE', quantity: -quantitySold, date: new Date().toLocaleString() }
        });

        // Deduct master stock
        try {
            await prisma.product.update({
                where: { id: 'himalaya-shilajit-resin' },
                data: { totalStock: { decrement: quantitySold } }
            });
        } catch (e) { console.warn("Stock update failed", e); }

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

// --- ADMIN ORDER MGMT ---
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        const formatted = orders.map(o => ({
            id: o.orderNumber,
            dbId: o.id,
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

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        await prisma.order.update({
            where: { orderNumber: req.params.id },
            data: { status: req.body.status }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Update failed' }); }
});

app.put('/api/admin/orders/:id/tracking', requireAdmin, async (req, res) => {
    const { trackingNumber, carrier, notify } = req.body;
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id }, // Uses UUID for editing usually
            data: { trackingNumber, carrier, status: 'Fulfilled' }
        });
        
        if (notify) {
            await sendEmail(order.customerEmail, `Order Shipped: ${order.orderNumber}`, `Great news! Your order has shipped via ${carrier}. Tracking: ${trackingNumber}`);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Update failed' }); }
});

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let where = {};
        if (startDate && endDate) {
            where = { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } };
        }

        const orders = await prisma.order.findMany({ where });
        const paidOrders = orders.filter(o => ['Paid', 'Fulfilled', 'Delivered'].includes(o.status));
        const totalRevenue = paidOrders.reduce((acc, o) => acc + o.total, 0);
        
        // Simple Chart Data (Last 30 days usually)
        const chartData = []; // Simplified
        
        res.json({
            totalRevenue,
            totalOrders: orders.length,
            avgOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
            chart: chartData
        });
    } catch (e) { res.status(500).json({ error: 'Stats failed' }); }
});

app.get('/api/admin/inventory-logs', requireAdmin, async (req, res) => {
    try {
        const logs = await prisma.inventoryLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
        res.json(logs);
    } catch (e) { res.status(500).json({ error: 'Fetch failed' }); }
});

app.post('/api/create-payment-intent', async (req, res) => {
    const { items, currency, total } = req.body;
    if (!stripe) return res.status(500).json({error: 'Stripe not configured'});
    
    try {
        // In a real app, recalculate total from DB prices for security
        // For this demo, we trust the 'total' sent but multiply by 100 for cents
        const amount = Math.round(total * 100); 
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency ? currency.toLowerCase() : 'usd',
            automatic_payment_methods: { enabled: true },
        });

        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- SERVER START ---
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
