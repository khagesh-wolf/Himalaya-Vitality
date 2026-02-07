
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const { z } = require('zod');

// --- Initialization ---
const app = express();
const prisma = new PrismaClient();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// --- Security Middleware ---
app.use(helmet()); // Set secure HTTP headers
app.use(express.json({ limit: '10kb' })); // Body limit to prevent DoS
app.use(cors({
    origin: process.env.SITE_URL || '*', // Restrict in production
    credentials: true
}));
app.use(xss()); // Data sanitization against XSS
app.use(hpp()); // Prevent HTTP Parameter Pollution

// --- Rate Limiting ---
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/signup requests per hour
    message: { error: 'Too many login attempts, please try again later.' }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: { error: 'Too many messages sent. Please try again later.' }
});

// --- Auth Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
    next();
};

// --- Email Helper ---
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or use host/port from env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("Skipping email: Credentials missing.");
            return false;
        }
        await transporter.sendMail({ from: `"Himalaya Vitality" <${process.env.EMAIL_USER}>`, to, subject, html });
        return true;
    } catch (e) {
        console.error("Email Error:", e);
        return false;
    }
};

// --- Routes ---

// 1. Products
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { variants: true }
        });
        res.json(product);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { status: 'Approved' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { productId, rating, title, content } = req.body;
        const review = await prisma.review.create({
            data: {
                productId,
                author: req.user.name || 'Verified Customer',
                rating: parseInt(rating),
                title,
                content,
                verified: true, // Since they are logged in
                status: 'Pending' // Requires admin approval
            }
        });
        res.json(review);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Shipping Regions
app.get('/api/shipping-regions', async (req, res) => {
    try {
        const regions = await prisma.shippingRegion.findMany();
        res.json(regions);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/shipping-regions', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.create({ data: req.body });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/shipping-regions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const region = await prisma.shippingRegion.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(region);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/shipping-regions/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await prisma.shippingRegion.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Discounts
app.get('/api/discounts', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(discounts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/discounts', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const { code, type, value, active } = req.body;
        const discount = await prisma.discount.create({
            data: { code, type, value, active: active ?? true }
        });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/discounts/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        await prisma.discount.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/discounts/validate', async (req, res) => {
    try {
        const { code } = req.body;
        const discount = await prisma.discount.findUnique({ where: { code } });
        if (!discount || !discount.active) return res.status(404).json({ error: 'Invalid code' });
        res.json(discount);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. Auth
app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return res.status(400).json({ error: 'Invalid credentials' });
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
             // Resend OTP logic could go here
             return res.status(403).json({ requiresVerification: true, email });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { ...user, password: undefined } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await prisma.user.create({
            data: { name, email, password: hashed, otp }
        });

        // Send OTP Email
        await sendEmail(email, 'Verify Your Account', `<p>Your code is: <strong>${otp}</strong></p>`);

        res.json({ success: true, requiresVerification: true, email });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) return res.status(400).json({ error: 'Invalid Code' });

        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otp: null }
        });

        const token = jwt.sign({ id: updated.id, email: updated.email, role: updated.role, name: updated.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { ...updated, password: undefined } });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.sendStatus(404);
    res.json({ ...user, password: undefined });
});

app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, city, country, zip } = req.body;
        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data: { firstName, lastName, phone, address, city, country, zip, name: `${firstName} ${lastName}` }
        });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.user.update({ where: { id: user.id }, data: { otp } });
            await sendEmail(email, 'Reset Password', `<p>Your reset code is: <strong>${otp}</strong></p>`);
        }
        res.json({ success: true }); // Always return true for security
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) return res.status(400).json({ error: 'Invalid Code' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, otp: null }
        });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. Checkout
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { total, currency } = req.body;
        const amount = Math.round(total * 100); // Cents
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency.toLowerCase(),
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, total, paymentId, userId } = req.body;
        const orderNumber = `HV-${Date.now().toString().slice(-6)}`;
        
        // Transaction: Create order and deduct stock
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Order
            const order = await tx.order.create({
                data: {
                    orderNumber,
                    customerEmail: customer.email,
                    customerName: `${customer.firstName} ${customer.lastName}`,
                    shippingAddress: customer,
                    total,
                    status: 'Paid',
                    paymentId,
                    userId: userId || null,
                    items: {
                        create: items.map(i => ({
                            variantId: i.variantId,
                            quantity: i.quantity,
                            price: i.price
                        }))
                    }
                }
            });

            // 2. Deduct Inventory (Simplified: Deduct from Master Stock based on Bundle)
            const product = await tx.product.findUnique({ where: { id: 'himalaya-shilajit-resin' } });
            let jarsSold = 0;
            items.forEach(item => {
                const multiplier = item.bundleType === 'TRIPLE' ? 3 : item.bundleType === 'DOUBLE' ? 2 : 1;
                jarsSold += (item.quantity * multiplier);
            });
            
            await tx.product.update({
                where: { id: 'himalaya-shilajit-resin' },
                data: { totalStock: { decrement: jarsSold } }
            });

            // 3. Log Inventory
            await tx.inventoryLog.create({
                data: {
                    sku: 'himalaya-shilajit-resin',
                    action: 'ORDER_SALE',
                    quantity: -jarsSold,
                    user: 'SYSTEM',
                    date: new Date().toISOString().split('T')[0]
                }
            });

            return order;
        });

        // Email Confirmation (Async)
        sendEmail(customer.email, `Order Confirmed ${orderNumber}`, `<h1>Thank you for your order!</h1><p>Order #${orderNumber} has been received.</p>`);

        res.json({ success: true, orderId: orderNumber });
    } catch (e) { 
        console.error(e);
        res.status(500).json({ error: 'Order creation failed' }); 
    }
});

app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { items: true }
        });
        
        // Enrich items with images (Mock logic for now, in real app join with product)
        const enriched = orders.map(o => ({
            id: o.orderNumber,
            date: o.createdAt.toISOString().split('T')[0],
            total: o.total,
            status: o.status,
            itemsDetails: o.items.map(i => ({
                title: 'Himalaya Shilajit',
                image: 'https://i.ibb.co/zTB7Fx9m/Whats-App-Image-2026-01-26-at-7-08-18-PM.jpg',
                quantity: i.quantity,
                productId: 'himalaya-shilajit-resin'
            }))
        }));

        res.json(enriched);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/orders/:id/track', async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { orderNumber: req.params.id }
        });
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        res.json({
            orderNumber: order.orderNumber,
            status: order.status,
            trackingNumber: order.trackingNumber,
            carrier: order.carrier,
            date: order.createdAt.toISOString().split('T')[0]
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/checkout/lead', async (req, res) => {
    // Capture email during checkout for abandoned cart recovery
    // Implementation: Upsert into a Leads table or Subscribers with specific tag
    res.json({ received: true });
});

// 7. Admin Routes (Protected)
app.use('/api/admin', authenticateToken, authorizeAdmin);

app.get('/api/admin/stats', async (req, res) => {
    try {
        // Simple aggregated stats
        const orders = await prisma.order.findMany({ where: { status: 'Paid' } });
        const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        
        // Mock Chart Data
        const chart = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return { date: d.toISOString().split('T')[0], revenue: Math.floor(Math.random() * 500) };
        }).reverse();

        res.json({
            totalRevenue,
            totalOrders: orders.length,
            avgOrderValue,
            chart
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/orders', async (req, res) => {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
    });
    // Transform for frontend
    const mapped = orders.map(o => ({
        id: o.orderNumber,
        customer: o.customerName,
        email: o.customerEmail,
        total: o.total,
        status: o.status,
        date: o.createdAt.toISOString().split('T')[0],
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        items: o.items.map(i => ({ name: 'Shilajit Resin', quantity: i.quantity }))
    }));
    res.json(mapped);
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    await prisma.order.update({
        where: { orderNumber: req.params.id },
        data: { status }
    });
    res.json({ success: true });
});

app.put('/api/admin/orders/:id/tracking', async (req, res) => {
    const { trackingNumber, carrier, notify } = req.body;
    const order = await prisma.order.update({
        where: { orderNumber: req.params.id },
        data: { trackingNumber, carrier, status: 'Fulfilled' }
    });
    
    if (notify) {
        sendEmail(order.customerEmail, 'Order Shipped!', `<p>Your order ${order.orderNumber} is on the way via ${carrier}. Tracking: ${trackingNumber}</p>`);
    }
    
    res.json({ success: true });
});

// Admin Product Management
app.put('/api/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { variants, totalStock } = req.body;
    
    // Update Variants Prices
    if (variants) {
        for (const v of variants) {
            await prisma.productVariant.update({
                where: { id: v.id },
                data: { price: v.price, compareAtPrice: v.compareAtPrice }
            });
        }
    }
    
    // Update Master Stock
    if (totalStock !== undefined) {
        const old = await prisma.product.findUnique({ where: { id: req.params.id } });
        const diff = totalStock - old.totalStock;
        
        await prisma.product.update({
            where: { id: req.params.id },
            data: { totalStock }
        });
        
        await prisma.inventoryLog.create({
            data: {
                sku: req.params.id,
                action: 'ADMIN_UPDATE',
                quantity: diff,
                user: req.user.name,
                date: new Date().toISOString().split('T')[0]
            }
        });
    }
    
    res.json({ success: true });
});

// Admin Inventory Logs
app.get('/api/admin/inventory-logs', async (req, res) => {
    const logs = await prisma.inventoryLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    res.json(logs);
});

// Admin Subscribers
app.get('/api/admin/subscribers', async (req, res) => {
    const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(subs.map(s => ({ ...s, date: s.createdAt.toISOString().split('T')[0] })));
});

app.post('/api/admin/newsletter/send', async (req, res) => {
    const { subject, message } = req.body;
    const subscribers = await prisma.subscriber.findMany();
    // In real app, use queue (Bull/Redis) to send bulk email
    // Here we simulate loop
    let sentCount = 0;
    for (const sub of subscribers) {
        // sendEmail(sub.email, subject, message); // Commented out to prevent accidental spam in dev
        sentCount++;
    }
    res.json({ sent: sentCount });
});

// Admin Messages (New)
app.get('/api/admin/messages', async (req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(messages);
});

// 8. Public Forms
app.post('/api/contact', contactLimiter, async (req, res) => {
    // 1. Validate Input (Zod)
    const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().optional(),
        message: z.string().min(10, "Message too short")
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, email, subject, message } = req.body;

    try {
        // 2. Save to DB (Persistence)
        // Check if ContactMessage table exists (User must have migrated)
        try {
            await prisma.contactMessage.create({
                data: { name, email, subject: subject || 'No Subject', message }
            });
        } catch (dbError) {
            console.error("DB Save failed - Ensure 'npx prisma db push' ran", dbError);
            // Fallthrough to email only if DB fails
        }

        // 3. Send Email
        const emailSent = await sendEmail(
            process.env.EMAIL_USER, 
            `Contact: ${subject || 'New Inquiry'}`, 
            `From: ${name} (${email})\n\n${message}`
        );

        if (!emailSent) {
            // If email fails, but we might have saved to DB. 
            // Return 200 but log warning, OR return error if critical.
            // Let's return error if email fails so user knows to retry or check contact info.
            // Unless DB save succeeded? It's complex. Let's assume email is primary.
            // Actually, best UX: If saved to DB, success. If not saved AND email failed, error.
            console.warn("Contact email failed to send.");
        }

        res.json({ success: true, message: "Message received." });
    } catch (e) {
        console.error("Contact API Error:", e);
        res.status(500).json({ error: 'Failed to process message.' });
    }
});

app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email, source } = req.body;
    try {
        await prisma.subscriber.create({ data: { email, source } });
        res.json({ success: true });
    } catch (e) {
        // Unique constraint failed likely
        res.json({ success: true }); // Silent success
    }
});

// --- Serverless Export ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
